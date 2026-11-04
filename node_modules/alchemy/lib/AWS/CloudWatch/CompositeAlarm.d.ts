import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { AlarmArn } from "./Alarm.ts";
export type CompositeAlarmName = string;
export interface CompositeAlarmProps extends Omit<cloudwatch.PutCompositeAlarmInput, "AlarmName" | "Tags"> {
    /**
     * Name of the composite alarm. If omitted, a unique name is generated.
     */
    name?: CompositeAlarmName;
    /**
     * Optional tags to apply to the composite alarm.
     */
    tags?: Record<string, string>;
}
export interface CompositeAlarm extends Resource<"AWS.CloudWatch.CompositeAlarm", CompositeAlarmProps, {
    /** Physical name of the composite alarm. */
    alarmName: CompositeAlarmName;
    /** ARN of the composite alarm. */
    alarmArn: AlarmArn;
    /** Current state of the composite alarm (`OK`, `ALARM`, or `INSUFFICIENT_DATA`). */
    stateValue: cloudwatch.StateValue | undefined;
    /** Human-readable reason for the current state. */
    stateReason: string | undefined;
    /** The full CompositeAlarm description as last read from CloudWatch. */
    compositeAlarm: cloudwatch.CompositeAlarm;
    /** Tags on the composite alarm, including the internal Alchemy ownership tags. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A CloudWatch composite alarm — combines the states of other alarms with
 * a boolean `AlarmRule` expression so a single alarm (and its actions)
 * reflects overall health.
 * ### Creating Composite Alarms
 * **Example:** Composite Rule
 * ```typescript
 * const composite = yield* CompositeAlarm("HighSeverity", {
 *   AlarmRule: 'ALARM("HighErrors") OR ALARM("HighLatency")',
 * });
 * ```
 *
 * **Example:** Compose Alarm Resources with Output.interpolate
 * ```typescript
 * const errors = yield* Alarm("HighErrors", {
 *   MetricName: "Errors",
 *   Namespace: "AWS/Lambda",
 *   Statistic: "Sum",
 *   Period: 60,
 *   EvaluationPeriods: 1,
 *   Threshold: 1,
 *   ComparisonOperator: "GreaterThanOrEqualToThreshold",
 * });
 *
 * const composite = yield* CompositeAlarm("HighSeverity", {
 *   AlarmRule: Output.interpolate`ALARM("${errors.alarmName}")`,
 * });
 * ```
 *
 * @resource
 */
export declare const CompositeAlarm: import("../../Resource.ts").ResourceClass<CompositeAlarm>;
export declare const CompositeAlarmProvider: () => import("effect/Layer").Layer<Provider.Provider<CompositeAlarm>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CompositeAlarm.d.ts.map