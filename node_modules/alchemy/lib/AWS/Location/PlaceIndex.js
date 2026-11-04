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
 * An Amazon Location Service place index. A place index geocodes text and
 * positions against a chosen data provider. The data source is immutable;
 * the intended use and description can be updated in place.
 *
 * ### Creating Place Indexes
 * **Example:** Basic Place Index
 * ```typescript
 * import * as Location from "alchemy/AWS/Location";
 *
 * const index = yield* Location.PlaceIndex("Places", {
 *   dataSource: "Esri",
 * });
 * ```
 *
 * **Example:** Storage-Intent Place Index
 * ```typescript
 * const index = yield* Location.PlaceIndex("Geocoder", {
 *   dataSource: "Here",
 *   intendedUse: "Storage",
 *   description: "Cacheable geocoding index",
 * });
 * ```
 *
 * @resource
 */
export const PlaceIndex = Resource("AWS.Location.PlaceIndex");
const createIndexName = (id, props) => Effect.gen(function* () {
    if (props.indexName)
        return props.indexName;
    return yield* createPhysicalName({ id, maxLength: 100 });
});
const readIndex = Effect.fn(function* (indexName) {
    const found = yield* location
        .describePlaceIndex({ IndexName: indexName })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!found)
        return undefined;
    return {
        indexName: found.IndexName,
        indexArn: found.IndexArn,
        dataSource: found.DataSource,
        intendedUse: found.DataSourceConfiguration?.IntendedUse,
        description: found.Description ? found.Description : undefined,
        tags: toTagRecord(found.Tags),
    };
});
export const PlaceIndexProvider = () => Provider.effect(PlaceIndex, Effect.gen(function* () {
    return {
        stables: ["indexName", "indexArn"],
        list: () => Effect.gen(function* () {
            const names = yield* location.listPlaceIndexes.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Entries ?? []).map((entry) => entry.IndexName))));
            const hydrated = yield* Effect.forEach(names, (name) => readIndex(name), { concurrency: 10 });
            return hydrated.filter((attrs) => attrs !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const indexName = output?.indexName ?? (yield* createIndexName(id, olds ?? {}));
            const state = yield* readIndex(indexName);
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.tags))
                ? state
                : Unowned(state);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return;
            const oldName = yield* createIndexName(id, olds);
            const newName = yield* createIndexName(id, news);
            // Name and data source are immutable — either change forces a replace.
            if (oldName !== newName || olds.dataSource !== news.dataSource) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const indexName = output?.indexName ?? (yield* createIndexName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            let state = yield* readIndex(indexName);
            if (state === undefined) {
                yield* location
                    .createPlaceIndex({
                    IndexName: indexName,
                    DataSource: news.dataSource,
                    Description: news.description,
                    DataSourceConfiguration: news.intendedUse
                        ? { IntendedUse: news.intendedUse }
                        : undefined,
                    Tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                state = yield* readIndex(indexName);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created place index ${indexName}`));
                }
            }
            if (state.description !== (news.description ?? undefined) ||
                (news.intendedUse !== undefined &&
                    state.intendedUse !== news.intendedUse)) {
                yield* location.updatePlaceIndex({
                    IndexName: indexName,
                    Description: news.description,
                    DataSourceConfiguration: news.intendedUse
                        ? { IntendedUse: news.intendedUse }
                        : undefined,
                });
            }
            const { removed, upsert } = diffTags(state.tags, desiredTags);
            if (removed.length > 0) {
                yield* location.untagResource({
                    ResourceArn: state.indexArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* location.tagResource({
                    ResourceArn: state.indexArn,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            yield* session.note(state.indexArn);
            const final = yield* readIndex(indexName);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled place index ${indexName}`));
            }
            return final;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* location
                .deletePlaceIndex({ IndexName: output.indexName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=PlaceIndex.js.map