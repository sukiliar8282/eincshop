import * as location from "@distilled.cloud/aws/location";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { toTagRecord } from "./internal.js";
/**
 * An Amazon Location Service map resource. A map exposes vector/raster tiles,
 * glyphs, and sprites for a chosen base style. The map style is immutable;
 * the political view and description can be updated in place.
 *
 * ### Creating Maps
 * **Example:** Basic Map
 * ```typescript
 * import * as Location from "alchemy/AWS/Location";
 *
 * const map = yield* Location.Map("AppMap", {
 *   configuration: { style: "VectorEsriNavigation" },
 * });
 * ```
 *
 * **Example:** Map with Political View
 * ```typescript
 * const map = yield* Location.Map("RegionMap", {
 *   configuration: { style: "VectorHereExplore", politicalView: "IND" },
 *   description: "Map with India political view",
 * });
 * ```
 *
 * @resource
 */
export const Map = Resource("AWS.Location.Map");
const createMapName = (id, props) => Effect.gen(function* () {
    if (props.mapName)
        return props.mapName;
    return yield* createPhysicalName({ id, maxLength: 100 });
});
const readMap = Effect.fn(function* (mapName) {
    const found = yield* location
        .describeMap({ MapName: mapName })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!found)
        return undefined;
    return {
        mapName: found.MapName,
        mapArn: found.MapArn,
        style: found.Configuration.Style,
        politicalView: Redacted.isRedacted(found.Configuration.PoliticalView)
            ? Redacted.value(found.Configuration.PoliticalView)
            : found.Configuration.PoliticalView,
        dataSource: found.DataSource,
        description: found.Description ? found.Description : undefined,
        tags: toTagRecord(found.Tags),
    };
});
export const MapProvider = () => Provider.effect(Map, Effect.gen(function* () {
    return {
        stables: ["mapName", "mapArn"],
        list: () => Effect.gen(function* () {
            const names = yield* location.listMaps.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Entries ?? []).map((entry) => entry.MapName))));
            const hydrated = yield* Effect.forEach(names, (name) => readMap(name), {
                concurrency: 10,
            });
            return hydrated.filter((attrs) => attrs !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const mapName = output?.mapName ?? (yield* createMapName(id, olds ?? {}));
            const state = yield* readMap(mapName);
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.tags))
                ? state
                : Unowned(state);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return;
            const oldName = yield* createMapName(id, olds);
            const newName = yield* createMapName(id, news);
            // Name and base style are immutable — either change forces a replace.
            if (oldName !== newName ||
                olds.configuration?.style !== news.configuration?.style) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const mapName = output?.mapName ?? (yield* createMapName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — cloud state is authoritative; output is only a name cache.
            let state = yield* readMap(mapName);
            // Ensure — create if missing; tolerate a concurrent create.
            if (state === undefined) {
                yield* location
                    .createMap({
                    MapName: mapName,
                    Configuration: {
                        Style: news.configuration.style,
                        PoliticalView: news.configuration.politicalView,
                    },
                    Description: news.description,
                    Tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.void));
                state = yield* readMap(mapName);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created map ${mapName}`));
                }
            }
            // Sync description + political view.
            if (state.description !== (news.description ?? undefined) ||
                state.politicalView !==
                    (news.configuration.politicalView ?? undefined)) {
                yield* location.updateMap({
                    MapName: mapName,
                    Description: news.description,
                    ConfigurationUpdate: {
                        PoliticalView: news.configuration.politicalView,
                    },
                });
            }
            // Sync tags — diff against observed cloud tags.
            const { removed, upsert } = diffTags(state.tags, desiredTags);
            if (removed.length > 0) {
                yield* location.untagResource({
                    ResourceArn: state.mapArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* location.tagResource({
                    ResourceArn: state.mapArn,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            yield* session.note(state.mapArn);
            const final = yield* readMap(mapName);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled map ${mapName}`));
            }
            return final;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* location
                .deleteMap({ MapName: output.mapName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Map.js.map