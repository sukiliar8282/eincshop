import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ApplicationCloudWatchLoggingOptionProps {
    /**
     * Name of the Managed Service for Apache Flink application to attach the
     * logging option to. Changing the application replaces the option.
     */
    applicationName: string;
    /**
     * ARN of the CloudWatch Logs log stream that receives application
     * messages. Changing the log stream replaces the option.
     */
    logStreamArn: string;
}
export interface ApplicationCloudWatchLoggingOption extends Resource<"AWS.KinesisAnalyticsV2.ApplicationCloudWatchLoggingOption", ApplicationCloudWatchLoggingOptionProps, {
    /**
     * Name of the application the option is attached to.
     */
    applicationName: string;
    /**
     * ARN of the CloudWatch Logs log stream receiving application messages.
     */
    logStreamArn: string;
    /**
     * Service-assigned ID of the logging option within the application.
     */
    cloudWatchLoggingOptionId: string | undefined;
}, never, Providers> {
}
/**
 * Attaches an Amazon CloudWatch Logs log stream to a Managed Service for
 * Apache Flink application so application messages (errors, job lifecycle
 * events) are delivered to CloudWatch.
 *
 * The option is identified by the log stream it delivers to — changing
 * either the application or the log stream replaces the option. The
 * application's service execution role must be allowed to call
 * `logs:PutLogEvents` / `logs:DescribeLogStreams` (the role auto-created by
 * `Application` already is).
 * ### Attaching Logging
 * **Example:** Deliver application messages to a log stream
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const logGroup = yield* AWS.Logs.LogGroup("FlinkLogs");
 * const logStream = yield* AWS.Logs.LogStream("FlinkLogStream", {
 *   logGroupName: logGroup.logGroupName,
 * });
 * const logging = yield* AWS.KinesisAnalyticsV2.ApplicationCloudWatchLoggingOption(
 *   "AppLogging",
 *   {
 *     applicationName: app.applicationName,
 *     logStreamArn: logStream.logStreamArn.as<string>(),
 *   },
 * );
 * ```
 *
 * @resource
 */
export declare const ApplicationCloudWatchLoggingOption: import("../../Resource.ts").ResourceClass<ApplicationCloudWatchLoggingOption>;
declare const LoggingOptionNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "LoggingOptionNotFound";
} & Readonly<A>;
/**
 * The logging option could not be observed on the application after it was
 * added — the add call succeeded but the option never appeared.
 */
export declare class LoggingOptionNotFound extends LoggingOptionNotFound_base<{
    readonly applicationName: string;
    readonly logStreamArn: string;
}> {
}
export declare const ApplicationCloudWatchLoggingOptionProvider: () => import("effect/Layer").Layer<Provider.Provider<ApplicationCloudWatchLoggingOption>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=ApplicationCloudWatchLoggingOption.d.ts.map