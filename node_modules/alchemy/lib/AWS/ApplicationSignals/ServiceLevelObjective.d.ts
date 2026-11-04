import * as appsignals from "@distilled.cloud/aws/application-signals";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServiceLevelObjectiveProps {
    /**
     * Name of the SLO (up to 127 characters, pattern
     * `[0-9A-Za-z][-._A-Za-z0-9 ]*`). Changing the name replaces the SLO —
     * the API has no rename operation.
     * @default ${app}-${stage}-${id}
     */
    sloName?: string;
    /**
     * A human-readable description of the SLO. Shown in the CloudWatch
     * console next to the SLO.
     */
    description?: string;
    /**
     * Period-based service level indicator: a CloudWatch metric (via
     * `SliMetricConfig.MetricDataQueries` for any metric or math expression,
     * or the `KeyAttributes`/`OperationName` shorthand for services discovered
     * by Application Signals), a `MetricThreshold`, and a `ComparisonOperator`.
     *
     * Exactly one of `sliConfig` or `requestBasedSliConfig` must be provided.
     * Switching between them replaces the SLO — the evaluation type of an
     * existing SLO cannot be changed.
     */
    sliConfig?: appsignals.ServiceLevelIndicatorConfig;
    /**
     * Request-based service level indicator: `TotalRequestCountMetric` plus a
     * `GoodCountMetric` or `BadCountMetric` under
     * `RequestBasedSliMetricConfig.MonitoredRequestCountMetric`.
     *
     * Exactly one of `sliConfig` or `requestBasedSliConfig` must be provided.
     * Switching between them replaces the SLO.
     */
    requestBasedSliConfig?: appsignals.RequestBasedServiceLevelIndicatorConfig;
    /**
     * The attainment goal for the SLO: the `Interval` (rolling or calendar),
     * the `AttainmentGoal` percentage, and the `WarningThreshold`.
     * @default rolling 7-day interval, 99% attainment, 30% warning threshold
     */
    goal?: appsignals.Goal;
    /**
     * Burn-rate windows to compute for the SLO. Each entry creates a burn-rate
     * metric over the given look-back window.
     */
    burnRateConfigurations?: appsignals.BurnRateConfiguration[];
    /**
     * Tags to apply to the SLO. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ServiceLevelObjective extends Resource<"AWS.ApplicationSignals.ServiceLevelObjective", ServiceLevelObjectiveProps, {
    /**
     * Name of the service level objective.
     */
    sloName: string;
    /**
     * ARN of the service level objective.
     */
    sloArn: string;
    /**
     * How the SLO is evaluated (`PeriodBased` or `RequestBased`).
     */
    evaluationType: appsignals.EvaluationType | undefined;
}, never, Providers> {
}
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
export declare const ServiceLevelObjective: import("../../Resource.ts").ResourceClass<ServiceLevelObjective>;
export declare const ServiceLevelObjectiveProvider: () => import("effect/Layer").Layer<Provider.Provider<ServiceLevelObjective>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ServiceLevelObjective.d.ts.map