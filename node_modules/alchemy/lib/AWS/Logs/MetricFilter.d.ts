import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type MetricTransformation = logs.MetricTransformation;
export interface MetricFilterProps {
    /**
     * Name of the log group the metric filter is attached to.
     * Changing this value replaces the metric filter.
     */
    logGroupName: string;
    /**
     * Name of the metric filter. The filter name is the identity of the filter
     * within the log group (put semantics upsert by name). If omitted, a unique
     * name is generated. Changing this value replaces the filter.
     */
    filterName?: string;
    /**
     * Filter pattern that selects and parses matching log events.
     * An empty string matches every log event.
     * @default ""
     */
    filterPattern?: string;
    /**
     * CloudWatch metrics emitted when the pattern matches
     * (metric name, namespace, value expression, optional dimensions and unit).
     */
    metricTransformations: MetricTransformation[];
    /**
     * Whether the metric filter applies to transformed logs when a log
     * transformer is configured on the log group.
     * @default false
     */
    applyOnTransformedLogs?: boolean;
}
export interface MetricFilter extends Resource<"AWS.Logs.MetricFilter", MetricFilterProps, {
    filterName: string;
    logGroupName: string;
    filterPattern: string;
    metricTransformations: MetricTransformation[];
}, never, Providers> {
}
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
export declare const MetricFilter: import("../../Resource.ts").ResourceClass<MetricFilter>;
export declare const MetricFilterProvider: () => import("effect/Layer").Layer<Provider.Provider<MetricFilter>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=MetricFilter.d.ts.map