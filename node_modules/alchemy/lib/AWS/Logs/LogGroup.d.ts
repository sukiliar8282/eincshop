import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type LogGroupName = string;
export type LogGroupArn = `arn:aws:logs:${RegionID}:${AccountID}:log-group:${LogGroupName}`;
export type LogGroupClass = logs.LogGroupClass;
export interface LogGroupProps {
    /**
     * Name of the log group. If omitted, a unique name is generated.
     */
    logGroupName?: string;
    /**
     * How long CloudWatch retains log events. If omitted, logs are kept
     * indefinitely. Accepts any `Duration.Input` (e.g. `"7 days"`,
     * `Duration.days(7)`; a bare number is milliseconds); the wire unit is
     * whole days (`retentionInDays`) and must resolve to one of the retention
     * values CloudWatch accepts (1, 3, 5, 7, 14, 30, ...).
     */
    retention?: Duration.Input;
    /**
     * Optional KMS key identifier used to encrypt the log group.
     */
    kmsKeyId?: string;
    /**
     * Log class for the log group. Changing this value replaces the log group.
     * @default "STANDARD"
     */
    logGroupClass?: LogGroupClass;
    /**
     * Whether deletion protection is enabled for the log group.
     * @default false
     */
    deletionProtectionEnabled?: boolean;
    /**
     * User-defined tags to apply to the log group.
     */
    tags?: Record<string, string>;
}
export interface LogGroup extends Resource<"AWS.Logs.LogGroup", LogGroupProps, {
    logGroupName: LogGroupName;
    logGroupArn: LogGroupArn;
    retentionInDays?: number;
    kmsKeyId?: string;
    logGroupClass: LogGroupClass;
    deletionProtectionEnabled: boolean;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A CloudWatch Logs log group — the container for log streams and the unit
 * that retention, encryption, metric filters, and subscriptions attach to.
 * ### Creating Log Groups
 * **Example:** ECS Task Log Group
 * ```typescript
 * const logs = yield* LogGroup("TaskLogs", {
 *   retention: "7 days",
 * });
 * ```
 *
 * **Example:** Encrypted Log Group with Deletion Protection
 * ```typescript
 * const key = yield* AWS.KMS.Key("LogsKey");
 * const logs = yield* LogGroup("AuditLogs", {
 *   retention: "30 days",
 *   kmsKeyId: key.keyArn,
 *   deletionProtectionEnabled: true,
 * });
 * ```
 *
 * ### Writing Custom Log Events
 * Declare a `LogStream` and use the `PutLogEvents` binding inside a Lambda
 * function (or the batching `LogEventSink` for high-volume streams).
 *
 * **Example:** Custom Audit Trail from a Lambda Function
 * ```typescript
 * // init
 * const logGroup = yield* AWS.Logs.LogGroup("AuditLogs", {
 *   retention: "30 days",
 * });
 * const stream = yield* AWS.Logs.LogStream("AuditStream", {
 *   logGroupName: logGroup.logGroupName,
 *   logStreamName: "audit",
 * });
 * const putLogEvents = yield* AWS.Logs.PutLogEvents(logGroup);
 *
 * // runtime
 * yield* putLogEvents({
 *   logStreamName: "audit",
 *   logEvents: [{ timestamp, message: "user.login id=123" }],
 * });
 * ```
 *
 * ### Consuming Log Events
 * **Example:** React to Error Logs
 * ```typescript
 * // Subscribe a Lambda handler to matching events (creates the
 * // subscription filter + invoke permission automatically).
 * yield* AWS.Logs.consumeLogEvents(
 *   logGroup,
 *   { filterPattern: "?ERROR ?Error" },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`${event.logStream}: ${event.message}`),
 *     ),
 * );
 * ```
 *
 * ### Metrics
 * **Example:** Count Errors with a Metric Filter
 * ```typescript
 * yield* AWS.Logs.MetricFilter("ErrorCount", {
 *   logGroupName: logGroup.logGroupName,
 *   filterPattern: '"ERROR"',
 *   metricTransformations: [{
 *     metricName: "ErrorCount",
 *     metricNamespace: "MyApp",
 *     metricValue: "1",
 *   }],
 * });
 * ```
 *
 * @resource
 */
export declare const LogGroup: import("../../Resource.ts").ResourceClass<LogGroup>;
export declare const LogGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<LogGroup>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LogGroup.d.ts.map