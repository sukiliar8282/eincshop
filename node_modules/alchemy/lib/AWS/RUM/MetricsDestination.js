import * as rum from "@distilled.cloud/aws/rum";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A destination for CloudWatch RUM extended and custom metrics — sends
 * metrics that a RUM app monitor derives from its telemetry events to
 * CloudWatch or to a CloudWatch Evidently experiment, including the metric
 * definitions themselves.
 *
 * ### Creating a Metrics Destination
 * **Example:** Send Extended Metrics to CloudWatch
 * ```typescript
 * const monitor = yield* RUM.AppMonitor("SiteMonitor", {
 *   domain: "example.com",
 * });
 * const metrics = yield* RUM.MetricsDestination("SiteMetrics", {
 *   appMonitorName: monitor.appMonitorName,
 *   destination: "CloudWatch",
 *   // extended metrics require the event pattern matching the metric
 *   metricDefinitions: [
 *     {
 *       name: "SessionCount",
 *       eventPattern: JSON.stringify({
 *         event_type: ["com.amazon.rum.session_start_event"],
 *       }),
 *     },
 *   ],
 * });
 * ```
 *
 * ### Custom Metrics
 * **Example:** Derive a Custom Metric from Events
 * ```typescript
 * const metrics = yield* RUM.MetricsDestination("CustomMetrics", {
 *   appMonitorName: monitor.appMonitorName,
 *   destination: "CloudWatch",
 *   metricDefinitions: [
 *     {
 *       name: "Checkouts",
 *       namespace: "MyApp",
 *       unitLabel: "Count",
 *       eventPattern: JSON.stringify({
 *         event_type: ["com.example.checkout"],
 *       }),
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const MetricsDestination = Resource("AWS.RUM.MetricsDestination");
/**
 * Raised when a `BatchCreateRumMetricDefinitions` /
 * `BatchDeleteRumMetricDefinitions` call reports per-definition errors.
 */
export class RumMetricDefinitionsError extends Data.TaggedError("RumMetricDefinitionsError") {
}
const toWireDefinition = (def) => ({
    Name: def.name,
    ValueKey: def.valueKey,
    UnitLabel: def.unitLabel,
    DimensionKeys: def.dimensionKeys,
    EventPattern: def.eventPattern,
    Namespace: def.namespace,
});
const sameRecord = (a, b) => {
    const left = Object.entries(a ?? {}).filter(([, v]) => v !== undefined);
    const right = Object.entries(b ?? {}).filter(([, v]) => v !== undefined);
    return (left.length === right.length && left.every(([k, v]) => (b ?? {})[k] === v));
};
const definitionInSync = (observed, desired) => observed.ValueKey === desired.valueKey &&
    observed.UnitLabel === desired.unitLabel &&
    observed.EventPattern === desired.eventPattern &&
    observed.Namespace === desired.namespace &&
    sameRecord(observed.DimensionKeys, desired.dimensionKeys);
export const MetricsDestinationProvider = () => Provider.effect(MetricsDestination, Effect.gen(function* () {
    /**
     * Observe the live destination on the monitor; typed not-found (the
     * monitor itself is gone) → undefined.
     */
    const observeDestination = Effect.fn(function* (props) {
        const destinations = yield* rum.listRumMetricsDestinations
            .items({ AppMonitorName: props.appMonitorName })
            .pipe(Stream.runCollect, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
        return Array.from(destinations).find((d) => d.Destination === props.destination &&
            (props.destination !== "Evidently" ||
                d.DestinationArn === props.destinationArn));
    });
    const toAttrs = (props, observed) => ({
        appMonitorName: props.appMonitorName,
        destination: props.destination,
        destinationArn: props.destinationArn,
        iamRoleArn: observed?.IamRoleArn ?? props.iamRoleArn,
    });
    return {
        stables: ["appMonitorName", "destination", "destinationArn"],
        diff: Effect.fn(function* ({ olds, news }) {
            if (!isResolved(news))
                return undefined;
            if (olds?.appMonitorName !== news.appMonitorName ||
                olds?.destination !== news.destination ||
                olds?.destinationArn !== news.destinationArn) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ olds, output }) {
            const identity = output ?? olds;
            if (!identity)
                return undefined;
            const observed = yield* observeDestination(identity);
            if (observed === undefined)
                return undefined;
            // Metrics destinations are not taggable — ownership is implied by
            // the owned parent app monitor.
            return {
                appMonitorName: identity.appMonitorName,
                destination: identity.destination,
                destinationArn: identity.destinationArn,
                iamRoleArn: observed.IamRoleArn,
            };
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const props = news;
            const key = {
                AppMonitorName: props.appMonitorName,
                Destination: props.destination,
                ...(props.destination === "Evidently"
                    ? { DestinationArn: props.destinationArn }
                    : {}),
            };
            // 1. OBSERVE — the live destination list is authoritative.
            const observed = yield* observeDestination(props);
            // 2. ENSURE + SYNC destination — `putRumMetricsDestination` is a
            //    true upsert; call it when missing or when the role drifts. A
            //    concurrent put surfaces as the typed ConflictException — a
            //    race, not a failure.
            if (observed === undefined ||
                (props.iamRoleArn !== undefined &&
                    observed.IamRoleArn !== props.iamRoleArn)) {
                yield* rum
                    .putRumMetricsDestination({
                    ...key,
                    IamRoleArn: props.iamRoleArn,
                })
                    .pipe(Effect.asVoid, Effect.catchTag("ConflictException", () => Effect.void));
            }
            // 3. SYNC metric definitions — diff the OBSERVED definitions
            //    (keyed by name) against the desired list and apply only the
            //    delta: batch-create missing, update drifted, batch-delete
            //    extraneous.
            const live = yield* rum.batchGetRumMetricDefinitions.items(key).pipe(Stream.runCollect, Effect.map((c) => Array.from(c)));
            const desired = props.metricDefinitions ?? [];
            const liveByName = new Map(live.map((d) => [d.Name, d]));
            const desiredNames = new Set(desired.map((d) => d.name));
            const toCreate = desired.filter((d) => !liveByName.has(d.name));
            if (toCreate.length > 0) {
                const { Errors } = yield* rum.batchCreateRumMetricDefinitions({
                    ...key,
                    MetricDefinitions: toCreate.map(toWireDefinition),
                });
                if (Errors.length > 0) {
                    yield* Effect.fail(new RumMetricDefinitionsError({
                        message: `failed to create ${Errors.length} metric definition(s): ${Errors.map((e) => `${e.MetricDefinition.Name}: ${e.ErrorMessage}`).join("; ")}`,
                    }));
                }
            }
            yield* Effect.forEach(desired.flatMap((d) => {
                const current = liveByName.get(d.name);
                return current !== undefined && !definitionInSync(current, d)
                    ? [{ id: current.MetricDefinitionId, definition: d }]
                    : [];
            }), ({ id, definition }) => rum.updateRumMetricDefinition({
                ...key,
                MetricDefinitionId: id,
                MetricDefinition: toWireDefinition(definition),
            }));
            const toDelete = live.filter((d) => !desiredNames.has(d.Name));
            if (toDelete.length > 0) {
                const { Errors } = yield* rum.batchDeleteRumMetricDefinitions({
                    ...key,
                    MetricDefinitionIds: toDelete.map((d) => d.MetricDefinitionId),
                });
                if (Errors.length > 0) {
                    yield* Effect.fail(new RumMetricDefinitionsError({
                        message: `failed to delete ${Errors.length} metric definition(s): ${Errors.map((e) => `${e.MetricDefinitionId}: ${e.ErrorMessage}`).join("; ")}`,
                    }));
                }
            }
            yield* session.note(`${props.appMonitorName}/${props.destination}`);
            const final = yield* observeDestination(props);
            return toAttrs(props, final);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* rum
                .deleteRumMetricsDestination({
                AppMonitorName: output.appMonitorName,
                Destination: output.destination,
                ...(output.destination === "Evidently"
                    ? { DestinationArn: output.destinationArn }
                    : {}),
            })
                .pipe(
            // idempotent — the destination (or its whole monitor) may be gone
            Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.retry({
                while: (e) => e._tag === "ConflictException",
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(8),
                ]),
            }));
        }),
        // Sub-resource keyed by its parent app monitor — enumerating it
        // would require listing every monitor's destinations.
        list: () => Effect.succeed([]),
    };
}));
//# sourceMappingURL=MetricsDestination.js.map