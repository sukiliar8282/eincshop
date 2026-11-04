import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * One extended or custom metric a RUM app monitor derives from its telemetry
 * events and sends to the destination.
 */
export interface MetricDefinition {
    /**
     * Name of the metric. For extended metrics this must be one of the valid
     * extended metric names (e.g. `SessionCount`, `JsErrorCount`); for custom
     * metrics (CloudWatch destinations with a `namespace`) any name is
     * allowed.
     */
    name: string;
    /**
     * Field within the event to use as the metric value. Omit to count
     * matching events (value 1 per event).
     */
    valueKey?: string;
    /**
     * CloudWatch metric unit label (e.g. `Count`, `Milliseconds`).
     */
    unitLabel?: string;
    /**
     * Extra dimensions derived from event fields — maps the event field path
     * (e.g. `metadata.browserName`) to the dimension name (e.g.
     * `BrowserName`).
     */
    dimensionKeys?: Record<string, string>;
    /**
     * JSON event-pattern filter — only events matching the pattern contribute
     * to the metric. Required for extended metrics, where it must match the
     * metric's event type (e.g.
     * `{"event_type":["com.amazon.rum.session_start_event"]}` for
     * `SessionCount`).
     */
    eventPattern?: string;
    /**
     * Custom-metric namespace (CloudWatch destinations only). RUM prepends
     * `RUM/CustomMetrics/`; it must not start with `AWS/`. Omit for extended
     * metrics.
     */
    namespace?: string;
}
export interface MetricsDestinationProps {
    /**
     * Name of the CloudWatch RUM app monitor that sends metrics to this
     * destination. Changing it replaces the destination.
     */
    appMonitorName: string;
    /**
     * Where the extended/custom metrics are sent. Changing it replaces the
     * destination.
     */
    destination: "CloudWatch" | "Evidently";
    /**
     * ARN of the CloudWatch Evidently experiment receiving the metrics.
     * Required when `destination` is `"Evidently"`; changing it replaces the
     * destination.
     */
    destinationArn?: string;
    /**
     * ARN of the IAM role RUM assumes to write to the Evidently experiment.
     * Required when `destination` is `"Evidently"`.
     */
    iamRoleArn?: string;
    /**
     * The extended/custom metric definitions the app monitor sends to this
     * destination. Synced in place: added, updated, and removed definitions
     * converge to this list.
     */
    metricDefinitions?: MetricDefinition[];
}
export interface MetricsDestination extends Resource<"AWS.RUM.MetricsDestination", MetricsDestinationProps, {
    /**
     * Name of the app monitor sending metrics.
     */
    appMonitorName: string;
    /**
     * The destination kind (`CloudWatch` or `Evidently`).
     */
    destination: "CloudWatch" | "Evidently";
    /**
     * ARN of the Evidently experiment, when `destination` is `Evidently`.
     */
    destinationArn: string | undefined;
    /**
     * IAM role RUM assumes to write to the destination, when set.
     */
    iamRoleArn: string | undefined;
}, never, Providers> {
}
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
export declare const MetricsDestination: import("../../Resource.ts").ResourceClass<MetricsDestination>;
declare const RumMetricDefinitionsError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "RumMetricDefinitionsError";
} & Readonly<A>;
/**
 * Raised when a `BatchCreateRumMetricDefinitions` /
 * `BatchDeleteRumMetricDefinitions` call reports per-definition errors.
 */
export declare class RumMetricDefinitionsError extends RumMetricDefinitionsError_base<{
    message: string;
}> {
}
export declare const MetricsDestinationProvider: () => import("effect/Layer").Layer<Provider.Provider<MetricsDestination>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=MetricsDestination.d.ts.map