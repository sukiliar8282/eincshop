import * as avp from "@distilled.cloud/aws/verifiedpermissions";
import * as Effect from "effect/Effect";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * The Cedar schema for a Verified Permissions policy store. The schema
 * declares the entity types and actions your policies reference; with
 * `validationMode: "STRICT"` on the store, policies and templates are
 * validated against it at submission time.
 *
 * A policy store has at most one schema — `PutSchema` is an upsert that fully
 * replaces the previous schema.
 * ### Defining a Schema
 * **Example:** Photo App Schema
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const store = yield* AWS.VerifiedPermissions.PolicyStore("Store", {
 *   validationMode: "STRICT",
 * });
 *
 * yield* AWS.VerifiedPermissions.Schema("Schema", {
 *   policyStoreId: store.policyStoreId,
 *   cedarJson: JSON.stringify({
 *     PhotoApp: {
 *       entityTypes: {
 *         User: {},
 *         Photo: {},
 *       },
 *       actions: {
 *         viewPhoto: {
 *           appliesTo: {
 *             principalTypes: ["User"],
 *             resourceTypes: ["Photo"],
 *           },
 *         },
 *       },
 *     },
 *   }),
 * });
 * ```
 *
 * @resource
 */
export const Schema = Resource("AWS.VerifiedPermissions.Schema");
export const SchemaProvider = () => Provider.effect(Schema, Effect.gen(function* () {
    return Schema.Provider.of({
        stables: ["policyStoreId"],
        // singleton child of a policy store — not enumerable account-wide
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const policyStoreId = output?.policyStoreId ?? olds?.policyStoreId;
            if (policyStoreId === undefined)
                return undefined;
            const schema = yield* avp
                .getSchema({ policyStoreId })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (schema === undefined)
                return undefined;
            return { policyStoreId };
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds.policyStoreId !== news.policyStoreId) {
                return { action: "replace" };
            }
            // cedarJson is mutable → default update path
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            // PutSchema is a full upsert — idempotent for both create and update
            yield* avp.putSchema({
                policyStoreId: news.policyStoreId,
                definition: { cedarJson: news.cedarJson },
            });
            yield* session.note(news.policyStoreId);
            return { policyStoreId: news.policyStoreId };
        }),
        delete: Effect.fn(function* () {
            // Verified Permissions has no DeleteSchema API — the schema is
            // removed when the policy store is deleted. Nothing to do.
            yield* Effect.void;
        }),
    });
}));
//# sourceMappingURL=Schema.js.map