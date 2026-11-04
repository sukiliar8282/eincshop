import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface LoggingConfigurationDestination {
    /**
     * Deliver chat logs to an S3 bucket. Exactly one destination must be
     * specified.
     */
    s3?: {
        bucketName: string;
    };
    /**
     * Deliver chat logs to a CloudWatch Logs log group. Exactly one
     * destination must be specified.
     */
    cloudWatchLogs?: {
        logGroupName: string;
    };
    /**
     * Deliver chat logs to a Kinesis Data Firehose delivery stream.
     * Exactly one destination must be specified.
     */
    firehose?: {
        deliveryStreamName: string;
    };
}
export interface LoggingConfigurationProps {
    /**
     * Where chat messages are delivered: exactly one of `s3`,
     * `cloudWatchLogs`, or `firehose`.
     */
    destinationConfiguration: LoggingConfigurationDestination;
    /**
     * Name of the logging configuration (not unique). If omitted, a
     * deterministic physical name is generated. Mutable — changing the
     * name updates the configuration in place.
     */
    loggingConfigurationName?: string;
    /**
     * Tags to apply to the logging configuration. Merged with internal
     * Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface LoggingConfiguration extends Resource<"AWS.IVSChat.LoggingConfiguration", LoggingConfigurationProps, {
    /**
     * The logging configuration's physical name.
     */
    loggingConfigurationName: string;
    /**
     * ARN of the logging configuration.
     */
    loggingConfigurationArn: string;
    /**
     * Unique ID of the logging configuration.
     */
    loggingConfigurationId: string;
    /**
     * Lifecycle state reported by IVS Chat (e.g. `ACTIVE`).
     */
    state: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon IVS Chat logging configuration — records the chat messages of
 * the rooms it is attached to into S3, CloudWatch Logs, or a Kinesis
 * Data Firehose delivery stream.
 * ### Creating Logging Configurations
 * **Example:** CloudWatch Logs Destination
 * ```typescript
 * import * as IVSChat from "alchemy/AWS/IVSChat";
 * import * as Logs from "alchemy/AWS/Logs";
 *
 * const logGroup = yield* Logs.LogGroup("ChatLogGroup");
 * const logging = yield* IVSChat.LoggingConfiguration("ChatLogs", {
 *   destinationConfiguration: {
 *     cloudWatchLogs: { logGroupName: logGroup.logGroupName },
 *   },
 * });
 * ```
 *
 * **Example:** S3 Destination
 * ```typescript
 * const logging = yield* IVSChat.LoggingConfiguration("ChatLogs", {
 *   destinationConfiguration: {
 *     s3: { bucketName: bucket.bucketName },
 *   },
 * });
 * ```
 *
 * ### Attaching to Rooms
 * **Example:** Log a Room's Messages
 * ```typescript
 * const room = yield* IVSChat.Room("LiveChat", {
 *   loggingConfigurationIdentifiers: [logging.loggingConfigurationArn],
 * });
 * ```
 *
 * @resource
 */
export declare const LoggingConfiguration: import("../../Resource.ts").ResourceClass<LoggingConfiguration>;
declare const IvsChatLoggingConfigurationInvalid_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsChatLoggingConfigurationInvalid";
} & Readonly<A>;
/**
 * Raised when a `LoggingConfiguration` does not specify exactly one of
 * `s3`, `cloudWatchLogs`, or `firehose`, or when the API returns a
 * configuration missing its identifiers.
 */
export declare class IvsChatLoggingConfigurationInvalid extends IvsChatLoggingConfigurationInvalid_base<{
    message: string;
}> {
}
export declare const LoggingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<LoggingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=LoggingConfiguration.d.ts.map