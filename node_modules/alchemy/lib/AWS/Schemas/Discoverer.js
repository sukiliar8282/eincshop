import * as schemas from "@distilled.cloud/aws/schemas";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { syncSchemasTags } from "./internal.js";
/**
 * An EventBridge schema discoverer — automatically infers schemas from the
 * events flowing through an event bus and publishes them (versioned) to the
 * AWS-managed `discovered-schemas` registry.
 *
 * ### Creating a Discoverer
 * **Example:** Discover Schemas on an Event Bus
 * ```typescript
 * const bus = yield* AWS.EventBridge.EventBus("AppBus", {});
 *
 * const discoverer = yield* AWS.Schemas.Discoverer("AppDiscoverer", {
 *   sourceArn: bus.eventBusArn,
 *   description: "Discovers schemas for application events",
 * });
 * ```
 *
 * **Example:** Stopped Discoverer
 * ```typescript
 * const discoverer = yield* AWS.Schemas.Discoverer("PausedDiscoverer", {
 *   sourceArn: bus.eventBusArn,
 *   state: "STOPPED",
 * });
 * ```
 * The discoverer is provisioned but paused; set `state: "STARTED"` (or omit
 * it) to resume discovery.
 *
 * @resource
 */
export const Discoverer = Resource("AWS.Schemas.Discoverer");
export const DiscovererProvider = () => Provider.effect(Discoverer, Effect.gen(function* () {
    const describe = (discovererId) => schemas
        .describeDiscoverer({ DiscovererId: discovererId })
        .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    const toAttrs = (d) => ({
        discovererId: d.DiscovererId,
        discovererArn: d.DiscovererArn,
        sourceArn: d.SourceArn,
        state: (d.State ?? "STARTED"),
    });
    return Discoverer.Provider.of({
        stables: ["discovererId", "discovererArn", "sourceArn"],
        list: () => schemas.listDiscoverers.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Discoverers ?? [])
            .filter((d) => d.DiscovererId != null &&
            d.DiscovererArn != null &&
            d.SourceArn != null)
            .map(toAttrs)))),
        read: Effect.fn(function* ({ id, output }) {
            if (output?.discovererId) {
                const found = yield* describe(output.discovererId);
                if (!found)
                    return undefined;
                const attrs = toAttrs(found);
                return (yield* hasAlchemyTags(id, found.Tags))
                    ? attrs
                    : Unowned(attrs);
            }
            // No cached id (the discoverer id is auto-assigned) — recover by
            // scanning for a discoverer branded with our ownership tags.
            const all = yield* schemas.listDiscoverers.items({}).pipe(Stream.runCollect, Effect.map((c) => Array.from(c)));
            for (const d of all) {
                if (d.DiscovererId != null &&
                    d.DiscovererArn != null &&
                    d.SourceArn != null &&
                    (yield* hasAlchemyTags(id, d.Tags))) {
                    return toAttrs(d);
                }
            }
            return undefined;
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.sourceArn !== olds.sourceArn) {
                return { action: "replace" };
            }
            return undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            // OBSERVE — output.discovererId is only an id cache.
            let live;
            if (output?.discovererId) {
                live = yield* describe(output.discovererId);
            }
            // ENSURE — create if missing. The id is auto-assigned, so there is
            // no name race to tolerate.
            if (live === undefined) {
                live = yield* schemas.createDiscoverer({
                    SourceArn: news.sourceArn,
                    Description: news.description,
                    CrossAccount: news.crossAccount,
                    Tags: { ...news.tags, ...internalTags },
                });
            }
            const discovererId = live.DiscovererId;
            const discovererArn = live.DiscovererArn;
            // SYNC description / crossAccount — diff observed against desired.
            const desiredCrossAccount = news.crossAccount ?? true;
            if ((news.description ?? "") !== (live.Description ?? "") ||
                desiredCrossAccount !== (live.CrossAccount ?? true)) {
                live = yield* schemas.updateDiscoverer({
                    DiscovererId: discovererId,
                    Description: news.description ?? "",
                    CrossAccount: desiredCrossAccount,
                });
            }
            // SYNC state — start/stop only on delta.
            const desiredState = news.state ?? "STARTED";
            let state = (live.State ?? "STARTED");
            if (state !== desiredState) {
                if (desiredState === "STARTED") {
                    const r = yield* schemas.startDiscoverer({
                        DiscovererId: discovererId,
                    });
                    state = (r.State ?? "STARTED");
                }
                else {
                    const r = yield* schemas.stopDiscoverer({
                        DiscovererId: discovererId,
                    });
                    state = (r.State ?? "STOPPED");
                }
            }
            // SYNC tags — diff against observed cloud tags.
            yield* syncSchemasTags(discovererArn, id, news.tags);
            yield* session.note(discovererId);
            return {
                discovererId,
                discovererArn,
                sourceArn: live.SourceArn ?? news.sourceArn,
                state,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* schemas
                .deleteDiscoverer({ DiscovererId: output.discovererId })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Discoverer.js.map