import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readFraudDetectorTags, syncFraudDetectorTags } from "./internal.js";
/**
 * An Amazon Fraud Detector entity type — the classification of who or what an
 * event is about (e.g. `customer`, `merchant`). Event types reference entity
 * types; they are cheap metadata objects.
 *
 * ### Creating an Entity Type
 * **Example:** Basic Entity Type
 * ```typescript
 * const customer = yield* FraudDetector.EntityType("customer", {
 *   description: "the buyer placing an order",
 * });
 * ```
 *
 * @resource
 */
export const EntityType = Resource("AWS.FraudDetector.EntityType");
export const EntityTypeProvider = () => Provider.effect(EntityType, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ??
            (yield* createPhysicalName({ id, maxLength: 64, lowercase: true })));
    });
    /** Look an entity type up by name; typed not-found → undefined. */
    const get = Effect.fn(function* (name) {
        const response = yield* frauddetector
            .getEntityTypes({ name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.entityTypes?.[0];
    });
    const toAttrs = (entityType) => ({
        name: entityType.name,
        arn: entityType.arn,
    });
    return {
        stables: ["name", "arn"],
        diff: Effect.fn(function* ({ id, olds = {}, news }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const entityType = yield* get(name);
            if (entityType === undefined)
                return undefined;
            const attrs = toAttrs(entityType);
            const tags = yield* readFraudDetectorTags(entityType.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, session }) {
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // putEntityType is an idempotent upsert — call it to converge whether
            // creating or updating the description.
            yield* frauddetector.putEntityType({
                name,
                description: news.description,
            });
            const entityType = yield* get(name);
            // Sync tags — diff against OBSERVED cloud tags.
            yield* syncFraudDetectorTags(entityType.arn, desiredTags);
            yield* session.note(name);
            return toAttrs(entityType);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* frauddetector.deleteEntityType({ name: output.name }).pipe(
            // Deleting an already-removed entity type is a no-op for us; Fraud
            // Detector surfaces a missing entity type as a validation error.
            Effect.catchTag("ValidationException", () => Effect.void));
        }),
        list: () => frauddetector.getEntityTypes.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.entityTypes ?? []).map(toAttrs)))),
    };
}));
//# sourceMappingURL=EntityType.js.map