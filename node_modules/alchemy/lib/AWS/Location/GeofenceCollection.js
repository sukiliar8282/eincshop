import * as location from "@distilled.cloud/aws/location";
import * as Effect from "effect/Effect";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { toTagRecord } from "./internal.js";
/**
 * An Amazon Location Service geofence collection. A geofence collection stores
 * geofences and evaluates device positions against them. The KMS key is
 * immutable; the description can be updated in place.
 *
 * ### Creating Geofence Collections
 * **Example:** Basic Geofence Collection
 * ```typescript
 * import * as Location from "alchemy/AWS/Location";
 *
 * const collection = yield* Location.GeofenceCollection("Fences", {});
 * ```
 *
 * **Example:** Encrypted Geofence Collection
 * ```typescript
 * const collection = yield* Location.GeofenceCollection("SecureFences", {
 *   kmsKeyId: "alias/my-key",
 *   description: "Encrypted geofence collection",
 * });
 * ```
 *
 * @resource
 */
export const GeofenceCollection = Resource("AWS.Location.GeofenceCollection");
const createCollectionName = (id, props) => Effect.gen(function* () {
    if (props.collectionName)
        return props.collectionName;
    return yield* createPhysicalName({ id, maxLength: 100 });
});
const readCollection = Effect.fn(function* (collectionName) {
    const found = yield* location
        .describeGeofenceCollection({ CollectionName: collectionName })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!found)
        return undefined;
    return {
        collectionName: found.CollectionName,
        collectionArn: found.CollectionArn,
        kmsKeyId: found.KmsKeyId,
        description: found.Description ? found.Description : undefined,
        tags: toTagRecord(found.Tags),
    };
});
export const GeofenceCollectionProvider = () => Provider.effect(GeofenceCollection, Effect.gen(function* () {
    return {
        stables: ["collectionName", "collectionArn"],
        list: () => Effect.gen(function* () {
            const names = yield* location.listGeofenceCollections
                .pages({})
                .pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Entries ?? []).map((entry) => entry.CollectionName))));
            const hydrated = yield* Effect.forEach(names, (name) => readCollection(name), { concurrency: 10 });
            return hydrated.filter((attrs) => attrs !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const collectionName = output?.collectionName ??
                (yield* createCollectionName(id, olds ?? {}));
            const state = yield* readCollection(collectionName);
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.tags))
                ? state
                : Unowned(state);
        }),
        diff: Effect.fn(function* ({ id, news = {}, olds = {} }) {
            if (!isResolved(news))
                return;
            const oldName = yield* createCollectionName(id, olds);
            const newName = yield* createCollectionName(id, news);
            if (oldName !== newName || olds.kmsKeyId !== news.kmsKeyId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const collectionName = output?.collectionName ?? (yield* createCollectionName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            let state = yield* readCollection(collectionName);
            if (state === undefined) {
                yield* location
                    .createGeofenceCollection({
                    CollectionName: collectionName,
                    KmsKeyId: news.kmsKeyId,
                    Description: news.description,
                    Tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                state = yield* readCollection(collectionName);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created geofence collection ${collectionName}`));
                }
            }
            if (state.description !== (news.description ?? undefined)) {
                yield* location.updateGeofenceCollection({
                    CollectionName: collectionName,
                    Description: news.description,
                });
            }
            const { removed, upsert } = diffTags(state.tags, desiredTags);
            if (removed.length > 0) {
                yield* location.untagResource({
                    ResourceArn: state.collectionArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* location.tagResource({
                    ResourceArn: state.collectionArn,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            yield* session.note(state.collectionArn);
            const final = yield* readCollection(collectionName);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled geofence collection ${collectionName}`));
            }
            return final;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* location
                .deleteGeofenceCollection({
                CollectionName: output.collectionName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=GeofenceCollection.js.map