import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface LogStreamProps {
    /**
     * Name of the log group the stream belongs to.
     * Changing this value replaces the log stream.
     */
    logGroupName: string;
    /**
     * Name of the log stream. If omitted, a unique name is generated.
     * Changing this value replaces the log stream.
     */
    logStreamName?: string;
}
export interface LogStream extends Resource<"AWS.Logs.LogStream", LogStreamProps, {
    logStreamName: string;
    logGroupName: string;
    logStreamArn?: string;
}, never, Providers> {
}
/**
 * A CloudWatch Logs log stream — a sequence of log events within a log group.
 *
 * Most log streams are created automatically by the emitting service (Lambda
 * creates its own streams under `/aws/lambda/...`); declare one explicitly
 * only when writing custom log events via `putLogEvents`.
 * ### Creating Log Streams
 * **Example:** Custom Audit Stream
 * ```typescript
 * const stream = yield* LogStream("AuditStream", {
 *   logGroupName: logGroup.logGroupName,
 * });
 * ```
 *
 * @resource
 */
export declare const LogStream: import("../../Resource.ts").ResourceClass<LogStream>;
export declare const LogStreamProvider: () => import("effect/Layer").Layer<Provider.Provider<LogStream>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LogStream.d.ts.map