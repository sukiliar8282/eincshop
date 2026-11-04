import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A CloudWatch Logs metric filter — extracts CloudWatch metrics from log
 * events matching a filter pattern.
 * ### Extracting Metrics
 * **Example:** Count Error Log Lines
 * ```typescript
 * const errors = yield* MetricFilter("ErrorCount", {
 *   logGroupName: logGroup.logGroupName,
 *   filterPattern: "?ERROR ?Error",
 *   metricTransformations: [
 *     {
 *       metricName: "ErrorCount",
 *       metricNamespace: "MyApp",
 *       metricValue: "1",
 *       defaultValue: 0,
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Extract a Latency Value from JSON Logs
 * ```typescript
 * const latency = yield* MetricFilter("RequestLatency", {
 *   logGroupName: logGroup.logGroupName,
 *   filterPattern: "{ $.latencyMs = * }",
 *   metricTransformations: [
 *     {
 *       metricName: "LatencyMs",
 *       metricNamespace: "MyApp",
 *       metricValue: "$.latencyMs",
 *       unit: "Milliseconds",
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const MetricFilter = Resource("AWS.Logs.MetricFilter");
export const MetricFilterProvider = () => Provider.effect(MetricFilter, Effect.gen(function* () {
    const toFilterName = (id, props = {}) => props.filterName
        ? Effect.succeed(props.filterName)
        : createPhysicalName({ id, maxLength: 512 });
    const toAttributes = (logGroupName, filter) => ({
        filterName: filter.filterName,
        logGroupName,
        filterPattern: filter.filterPattern ?? "",
        metricTransformations: (filter.metricTransformations ??
            []),
    });
    const observe = Effect.fn(function* (logGroupName, filterName) {
        const described = yield* logs
            .describeMetricFilters({
            logGroupName,
            filterNamePrefix: filterName,
        })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({ metricFilters: [] })));
        return (described.metricFilters ?? []).find((filter) => filter.filterName === filterName);
    });
    return {
        stables: ["filterName", "logGroupName"],
        // describeMetricFilters supports account-wide enumeration when no
        // logGroupName is given.
        list: () => logs.describeMetricFilters.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.metricFilters ?? [])
            .filter((filter) => filter.filterName != null && filter.logGroupName != null)
            .map((filter) => toAttributes(filter.logGroupName, filter)))),
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if (olds.logGroupName !== news.logGroupName) {
                return { action: "replace" };
            }
            if ((yield* toFilterName(id, olds)) !== (yield* toFilterName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const logGroupName = output?.logGroupName ?? olds?.logGroupName;
            if (logGroupName === undefined)
                return undefined;
            const filterName = output?.filterName ?? (yield* toFilterName(id, olds ?? {}));
            const observed = yield* observe(logGroupName, filterName);
            if (!observed)
                return undefined;
            return toAttributes(logGroupName, observed);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const logGroupName = news.logGroupName;
            const filterName = output?.filterName ?? (yield* toFilterName(id, news));
            const desiredPattern = news.filterPattern ?? "";
            // Observe — putMetricFilter has natural upsert semantics keyed by
            // filter name; observation only decides whether to skip the put.
            const observed = yield* observe(logGroupName, filterName);
            const upToDate = observed !== undefined &&
                (observed.filterPattern ?? "") === desiredPattern &&
                JSON.stringify(observed.metricTransformations ?? []) ===
                    JSON.stringify(news.metricTransformations) &&
                (news.applyOnTransformedLogs === undefined ||
                    observed.applyOnTransformedLogs === news.applyOnTransformedLogs);
            if (!upToDate) {
                yield* logs
                    .putMetricFilter({
                    logGroupName,
                    filterName,
                    filterPattern: desiredPattern,
                    metricTransformations: news.metricTransformations,
                    applyOnTransformedLogs: news.applyOnTransformedLogs,
                })
                    .pipe(Effect.retry({
                    while: (error) => error._tag === "OperationAbortedException" ||
                        error._tag === "ServiceUnavailableException",
                    schedule: Schedule.exponential(100),
                    times: 8,
                }));
            }
            yield* session.note(`${logGroupName}:${filterName}`);
            return {
                filterName,
                logGroupName,
                filterPattern: desiredPattern,
                metricTransformations: news.metricTransformations,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* logs
                .deleteMetricFilter({
                logGroupName: output.logGroupName,
                filterName: output.filterName,
            })
                .pipe(Effect.retry({
                while: (error) => error._tag === "OperationAbortedException" ||
                    error._tag === "ServiceUnavailableException",
                schedule: Schedule.exponential(100),
                times: 8,
            }), Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=MetricFilter.js.map