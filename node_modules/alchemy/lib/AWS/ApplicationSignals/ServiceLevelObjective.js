import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, } from "../../Tags.js";
/**
 * A CloudWatch Application Signals service level objective (SLO) that tracks
 * an attainment goal against a service level indicator — any CloudWatch
 * metric or metric-math expression, or a service operation discovered by
 * Application Signals.
 * ### Creating Service Level Objectives
 * **Example:** Period-based SLO on a CloudWatch metric
 * ```typescript
 * import * as ApplicationSignals from "alchemy/AWS/ApplicationSignals";
 *
 * const slo = yield* ApplicationSignals.ServiceLevelObjective("ApiLatency", {
 *   description: "p99 latency under 2 seconds",
 *   sliConfig: {
 *     SliMetricConfig: {
 *       MetricDataQueries: [
 *         {
 *           Id: "m1",
 *           MetricStat: {
 *             Metric: {
 *               Namespace: "AWS/Lambda",
 *               MetricName: "Duration",
 *               Dimensions: [{ Name: "FunctionName", Value: "my-api" }],
 *             },
 *             Period: 60,
 *             Stat: "p99",
 *           },
 *           ReturnData: true,
 *         },
 *       ],
 *     },
 *     MetricThreshold: 2000,
 *     ComparisonOperator: "LessThanOrEqualTo",
 *   },
 *   goal: {
 *     Interval: { RollingInterval: { DurationUnit: "DAY", Duration: 7 } },
 *     AttainmentGoal: 99,
 *     WarningThreshold: 50,
 *   },
 * });
 * ```
 *
 * **Example:** Request-based SLO
 * ```typescript
 * const slo = yield* ApplicationSignals.ServiceLevelObjective("Availability", {
 *   requestBasedSliConfig: {
 *     RequestBasedSliMetricConfig: {
 *       TotalRequestCountMetric: [
 *         {
 *           Id: "total",
 *           MetricStat: {
 *             Metric: { Namespace: "AWS/ApplicationELB", MetricName: "RequestCount" },
 *             Period: 60,
 *             Stat: "Sum",
 *           },
 *           ReturnData: true,
 *         },
 *       ],
 *       MonitoredRequestCountMetric: {
 *         BadCountMetric: [
 *           {
 *             Id: "bad",
 *             MetricStat: {
 *               Metric: { Namespace: "AWS/ApplicationELB", MetricName: "HTTPCode_Target_5XX_Count" },
 *               Period: 60,
 *               Stat: "Sum",
 *             },
 *             ReturnData: true,
 *           },
 *         ],
 *       },
 *     },
 *   },
 *   goal: { AttainmentGoal: 99.9 },
 * });
 * ```
 *
 * @resource
 */
export const ServiceLevelObjective = Resource("AWS.ApplicationSignals.ServiceLevelObjective");
/**
 * Rebuild `Date` instances that the engine's state serialization flattened
 * to ISO strings (calendar intervals carry a `StartTime` timestamp).
 */
const normalizeGoal = (goal) => {
    const interval = goal?.Interval;
    if (interval && "CalendarInterval" in interval && interval.CalendarInterval) {
        return {
            ...goal,
            Interval: {
                CalendarInterval: {
                    ...interval.CalendarInterval,
                    StartTime: new Date(interval.CalendarInterval.StartTime),
                },
            },
        };
    }
    return goal;
};
const isPlainObject = (value) => typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date);
const toTime = (value) => value instanceof Date
    ? value.getTime()
    : new Date(value).getTime();
/**
 * Structural subset comparison: every DEFINED field of `desired` must
 * deep-equal the corresponding field of `observed`. Extra observed fields
 * (server-side defaults the API echoes back, e.g. `ReturnData`, resolved
 * account ids) are ignored, so a reconcile whose desired state matches the
 * cloud skips the update call entirely.
 */
const subsetMatches = (desired, observed) => {
    if (desired === undefined)
        return true;
    if (desired instanceof Date || observed instanceof Date) {
        return toTime(desired) === toTime(observed);
    }
    if (Array.isArray(desired)) {
        return (Array.isArray(observed) &&
            observed.length === desired.length &&
            desired.every((item, index) => subsetMatches(item, observed[index])));
    }
    if (isPlainObject(desired)) {
        return (isPlainObject(observed) &&
            Object.entries(desired).every(([key, value]) => subsetMatches(value, observed[key])));
    }
    return desired === observed;
};
/** The mutable aspects of the SLO, in `UpdateServiceLevelObjective` shape. */
const desiredState = (news) => ({
    Description: news.description,
    SliConfig: news.sliConfig,
    RequestBasedSliConfig: news.requestBasedSliConfig,
    Goal: normalizeGoal(news.goal),
    BurnRateConfigurations: news.burnRateConfigurations,
});
/** Project the observed SLO into the same shape as {@link desiredState}. */
const observedState = (slo) => ({
    Description: slo.Description,
    SliConfig: slo.Sli && {
        SliMetricConfig: slo.Sli.SliMetric,
        MetricThreshold: slo.Sli.MetricThreshold,
        ComparisonOperator: slo.Sli.ComparisonOperator,
    },
    RequestBasedSliConfig: slo.RequestBasedSli && {
        RequestBasedSliMetricConfig: slo.RequestBasedSli.RequestBasedSliMetric,
        MetricThreshold: slo.RequestBasedSli.MetricThreshold,
        ComparisonOperator: slo.RequestBasedSli.ComparisonOperator,
    },
    Goal: slo.Goal,
    BurnRateConfigurations: slo.BurnRateConfigurations,
});
export const ServiceLevelObjectiveProvider = () => Provider.effect(ServiceLevelObjective, Effect.gen(function* () {
    const createSloName = Effect.fn(function* (id, props) {
        // SLO names are limited to 127 characters.
        return (props.sloName ?? (yield* createPhysicalName({ id, maxLength: 127 })));
    });
    // `Id` accepts the SLO name or ARN interchangeably.
    const observeSlo = (id) => appsignals.getServiceLevelObjective({ Id: id }).pipe(Effect.map((r) => r.Slo), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const observedTags = (sloArn) => appsignals.listTagsForResource({ ResourceArn: sloArn }).pipe(Effect.map((r) => Object.fromEntries((r.Tags ?? []).map((t) => [t.Key, t.Value]))), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    return ServiceLevelObjective.Provider.of({
        stables: ["sloName", "sloArn"],
        list: () => Effect.gen(function* () {
            const summaries = yield* appsignals.listServiceLevelObjectives
                .items({})
                .pipe(Stream.runCollect);
            return Array.from(summaries).map((slo) => ({
                sloName: slo.Name,
                sloArn: slo.Arn,
                evaluationType: slo.EvaluationType,
            }));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const sloName = output?.sloName ?? (yield* createSloName(id, olds ?? {}));
            const found = yield* observeSlo(sloName);
            if (!found)
                return undefined;
            const attrs = {
                sloName: found.Name,
                sloArn: found.Arn,
                evaluationType: found.EvaluationType,
            };
            const tags = yield* observedTags(found.Arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createSloName(id, olds ?? {});
            const newName = yield* createSloName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // An SLO cannot switch between period-based and request-based
            // evaluation — swapping the SLI config kind replaces the SLO.
            const oldKind = olds?.requestBasedSliConfig
                ? "RequestBased"
                : "PeriodBased";
            const newKind = news?.requestBasedSliConfig
                ? "RequestBased"
                : "PeriodBased";
            if (oldKind !== newKind) {
                return { action: "replace" };
            }
            // fall through: engine default update logic for mutable fields
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const sloName = output?.sloName ?? (yield* createSloName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const desired = desiredState(news);
            // 1. OBSERVE — cloud state is authoritative; `output` is only a
            //    cache for the physical name.
            let live = yield* observeSlo(sloName);
            if (live === undefined) {
                // 2. ENSURE — create when missing; a concurrent create surfaces
                //    as the typed ConflictException, which we treat as a race
                //    and re-observe.
                live = yield* appsignals
                    .createServiceLevelObjective({
                    Name: sloName,
                    ...desired,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.map((r) => r.Slo), Effect.catchTag("ConflictException", () => observeSlo(sloName)));
            }
            else if (!subsetMatches(desired, observedState(live))) {
                // 3. SYNC — converge every mutable aspect with a single PATCH;
                //    skipped entirely when the observed state already satisfies
                //    the desired state (update retains omitted parameters).
                live = yield* appsignals
                    .updateServiceLevelObjective({ Id: sloName, ...desired })
                    .pipe(Effect.map((r) => r.Slo));
            }
            if (live === undefined) {
                return yield* Effect.fail(new Error(`failed to reconcile SLO '${sloName}'`));
            }
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags so adoption
            //     converges (create-time Tags only apply on first create).
            const currentTags = yield* observedTags(live.Arn);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* appsignals.tagResource({
                    ResourceArn: live.Arn,
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* appsignals.untagResource({
                    ResourceArn: live.Arn,
                    TagKeys: removed,
                });
            }
            yield* session.note(sloName);
            return {
                sloName: live.Name,
                sloArn: live.Arn,
                evaluationType: live.EvaluationType,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* appsignals
                .deleteServiceLevelObjective({ Id: output.sloName })
                .pipe(
            // Idempotent delete — already-gone is success.
            Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=ServiceLevelObjective.js.map