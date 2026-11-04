import * as schemas from "@distilled.cloud/aws/schemas";
import * as Effect from "effect/Effect";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { canonicalJson, syncSchemasTags } from "./internal.js";
/**
 * An event schema in an EventBridge Schema Registry — a versioned OpenAPI 3
 * or JSONSchema Draft 4 document describing the structure of an event.
 * Updating the content publishes a new schema version; previous versions are
 * retained by the registry.
 *
 * ### Creating a Schema
 * **Example:** OpenAPI 3 Schema
 * ```typescript
 * const registry = yield* AWS.Schemas.Registry("app-events", {});
 *
 * const schema = yield* AWS.Schemas.Schema("OrderCreated", {
 *   registryName: registry.registryName,
 *   type: "OpenApi3",
 *   content: JSON.stringify({
 *     openapi: "3.0.0",
 *     info: { version: "1.0.0", title: "OrderCreated" },
 *     paths: {},
 *     components: {
 *       schemas: {
 *         OrderCreated: {
 *           type: "object",
 *           properties: { orderId: { type: "string" } },
 *         },
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * **Example:** JSONSchema Draft 4 Schema
 * ```typescript
 * const schema = yield* AWS.Schemas.Schema("UserSignedUp", {
 *   registryName: registry.registryName,
 *   type: "JSONSchemaDraft4",
 *   content: JSON.stringify({
 *     $schema: "http://json-schema.org/draft-04/schema#",
 *     type: "object",
 *     properties: { userId: { type: "string" } },
 *   }),
 *   description: "Emitted when a user completes sign-up",
 * });
 * ```
 *
 * @resource
 */
export const Schema = Resource("AWS.Schemas.Schema");
export const SchemaProvider = () => Provider.effect(Schema, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.schemaName ??
            (yield* createPhysicalName({ id, maxLength: 385 })));
    });
    const describe = (registryName, schemaName) => schemas
        .describeSchema({
        RegistryName: registryName,
        SchemaName: schemaName,
    })
        .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    return Schema.Provider.of({
        stables: ["registryName", "schemaName", "schemaArn"],
        // Sub-resource keyed by its parent registry — listSchemas requires a
        // RegistryName, so there is no account-wide enumeration.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const registryName = output?.registryName ?? olds?.registryName;
            if (registryName === undefined)
                return undefined;
            const schemaName = output?.schemaName ??
                (yield* createName(id, olds ?? { registryName, content: "" }));
            const found = yield* describe(registryName, schemaName);
            if (!found)
                return undefined;
            const attrs = {
                registryName,
                schemaName,
                schemaArn: found.SchemaArn,
                schemaVersion: found.SchemaVersion,
                type: found.Type ?? "OpenApi3",
            };
            return (yield* hasAlchemyTags(id, found.Tags))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.registryName !== olds.registryName) {
                return { action: "replace" };
            }
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            if ((news.type ?? "OpenApi3") !== (olds.type ?? "OpenApi3")) {
                return { action: "replace" };
            }
            return undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const registryName = news.registryName;
            const schemaName = output?.schemaName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredType = news.type ?? "OpenApi3";
            // OBSERVE
            let live = yield* describe(registryName, schemaName);
            // ENSURE
            if (live === undefined) {
                yield* schemas.createSchema({
                    RegistryName: registryName,
                    SchemaName: schemaName,
                    Type: desiredType,
                    Content: news.content,
                    Description: news.description,
                    Tags: { ...news.tags, ...internalTags },
                });
                live = yield* schemas.describeSchema({
                    RegistryName: registryName,
                    SchemaName: schemaName,
                });
            }
            // SYNC content / type / description — diff observed against desired.
            // Content is compared canonically (sorted keys, no whitespace) so a
            // reformatted-but-equal document does not publish a new version.
            const contentChanged = canonicalJson(news.content) !== canonicalJson(live.Content ?? "") ||
                desiredType !== (live.Type ?? "OpenApi3");
            const descriptionChanged = (news.description ?? "") !== (live.Description ?? "");
            if (contentChanged || descriptionChanged) {
                yield* schemas.updateSchema({
                    RegistryName: registryName,
                    SchemaName: schemaName,
                    ...(contentChanged
                        ? { Content: news.content, Type: desiredType }
                        : {}),
                    ...(descriptionChanged
                        ? { Description: news.description ?? "" }
                        : {}),
                });
                live = yield* schemas.describeSchema({
                    RegistryName: registryName,
                    SchemaName: schemaName,
                });
            }
            // SYNC tags — diff against observed cloud tags.
            yield* syncSchemasTags(live.SchemaArn, id, news.tags);
            yield* session.note(`${registryName}/${schemaName}`);
            return {
                registryName,
                schemaName,
                schemaArn: live.SchemaArn,
                schemaVersion: live.SchemaVersion,
                type: live.Type ?? desiredType,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* schemas
                .deleteSchema({
                RegistryName: output.registryName,
                SchemaName: output.schemaName,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Schema.js.map