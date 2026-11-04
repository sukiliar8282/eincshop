import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { inFleetWiseRegion, readFleetWiseTags, retryObservation, syncFleetWiseTags, toFleetWiseTagList, } from "./internal.js";
/**
 * An AWS IoT FleetWise fleet — a group of vehicles that campaigns can
 * target collectively.
 *
 * Fleets are free, provisioned near-instantly, and only carry a
 * description besides their signal-catalog association. AWS IoT FleetWise
 * is allowlist-gated and offered in `us-east-1`/`eu-central-1` only.
 * ### Creating a Fleet
 * **Example:** Basic Fleet
 * ```typescript
 * const fleet = yield* Fleet("TestFleet", {
 *   signalCatalogArn: catalog.signalCatalogArn,
 *   description: "west-coast pilot vehicles",
 * });
 * ```
 *
 * @resource
 */
export const Fleet = Resource("AWS.IoTFleetWise.Fleet");
export const FleetProvider = () => Provider.effect(Fleet, Effect.gen(function* () {
    const toId = (id, props) => props.fleetId
        ? Effect.succeed(props.fleetId)
        : createPhysicalName({ id, maxLength: 100 });
    const readFleet = Effect.fn(function* (fleetId) {
        return yield* iotfleetwise.getFleet({ fleetId }).pipe(inFleetWiseRegion, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttrs = (fleet) => ({
        fleetId: fleet.id,
        fleetArn: fleet.arn,
        signalCatalogArn: fleet.signalCatalogArn,
    });
    return {
        stables: ["fleetId", "fleetArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toId(id, olds)) !== (yield* toId(id, news))) {
                return { action: "replace" };
            }
            // The update API can only change the description.
            if (news.signalCatalogArn !== olds.signalCatalogArn) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const fleetId = output?.fleetId ?? (yield* toId(id, olds ?? {}));
            const found = yield* readFleet(fleetId);
            if (found === undefined)
                return undefined;
            const attrs = toAttrs(found);
            const tags = yield* readFleetWiseTags(found.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const fleetId = output?.fleetId ?? (yield* toId(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readFleet(fleetId);
            // 2. Ensure — create if missing; tolerate the AlreadyExists race.
            if (observed === undefined) {
                yield* iotfleetwise
                    .createFleet({
                    fleetId,
                    signalCatalogArn: news.signalCatalogArn,
                    description: news.description,
                    tags: toFleetWiseTagList(desiredTags),
                })
                    .pipe(inFleetWiseRegion, Effect.catchTag("ConflictException", () => Effect.void));
                observed = yield* readFleet(fleetId).pipe(Effect.flatMap((fleet) => fleet === undefined
                    ? Effect.fail(new Error(`Fleet '${fleetId}' not found`))
                    : Effect.succeed(fleet)), retryObservation);
            }
            // 3. Sync description — the only mutable aspect.
            if (news.description !== undefined &&
                news.description !== observed.description) {
                yield* iotfleetwise
                    .updateFleet({ fleetId, description: news.description })
                    .pipe(inFleetWiseRegion);
            }
            // 3b. Sync tags against OBSERVED cloud tags.
            yield* syncFleetWiseTags(observed.arn, desiredTags);
            yield* session.note(fleetId);
            return toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Idempotent: deleting a missing fleet succeeds (vehicles are
            // detached automatically before deletion).
            yield* iotfleetwise
                .deleteFleet({ fleetId: output.fleetId })
                .pipe(inFleetWiseRegion);
        }),
        list: () => iotfleetwise.listFleets.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).map((summary) => ({
            fleetId: summary.id,
            fleetArn: summary.arn,
            signalCatalogArn: summary.signalCatalogArn,
        }))), inFleetWiseRegion),
    };
}));
//# sourceMappingURL=Fleet.js.map