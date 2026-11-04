import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { LogGroupEventSource as LogsLogGroupEventSource, type CloudWatchLogsEvent, type LogsSubscriptionPayload } from "../Logs/LogGroupEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * Narrow an arbitrary Lambda invocation payload to a CloudWatch Logs
 * subscription event.
 */
export declare const isCloudWatchLogsEvent: (event: any) => event is CloudWatchLogsEvent;
/**
 * Decode the gzipped, base64-encoded CloudWatch Logs subscription payload.
 */
export declare const decodeCloudWatchLogsEvent: (event: CloudWatchLogsEvent) => Effect.Effect<LogsSubscriptionPayload, Error>;
/**
 * Lambda runtime implementation for `AWS.Logs.consumeLogEvents(...)`.
 *
 * This layer does two things:
 *
 * 1. At deploy time it creates the backing `AWS.Logs.SubscriptionFilter`
 *    targeting the current Lambda function plus the `lambda:InvokeFunction`
 *    permission for `logs.amazonaws.com`.
 * 2. At runtime it decodes the gzipped/base64 `awslogs.data` payload of
 *    incoming invocations and forwards each log event into the supplied
 *    handler as a typed `LogEventRecord` stream.
 * ### Consuming Log Events
 * **Example:** Forward Another Function's Error Logs
 * ```typescript
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
 * @binding
 */
export declare const LogGroupEventSource: Layer.Layer<LogsLogGroupEventSource, never, Lambda.Function>;
//# sourceMappingURL=LogGroupEventSource.d.ts.map