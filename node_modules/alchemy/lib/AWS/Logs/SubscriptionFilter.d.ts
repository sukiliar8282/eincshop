import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type SubscriptionDistribution = logs.Distribution;
export interface SubscriptionFilterProps {
    /**
     * Name of the log group the subscription filter is attached to.
     * Changing this value replaces the subscription filter.
     */
    logGroupName: string;
    /**
     * Name of the subscription filter. The filter name is the identity of the
     * filter within the log group (put semantics upsert by name). If omitted, a
     * unique name is generated. Changing this value replaces the filter.
     */
    filterName?: string;
    /**
     * Filter pattern selecting which log events are delivered to the
     * destination. An empty string matches every log event.
     * @default ""
     */
    filterPattern?: string;
    /**
     * ARN of the destination that receives matching log events: a Lambda
     * function, a Kinesis stream, a Firehose delivery stream, or a cross-account
     * logs destination.
     */
    destinationArn: string;
    /**
     * ARN of an IAM role that CloudWatch Logs assumes to write to the
     * destination. Required for Kinesis / Firehose destinations; not used for
     * Lambda destinations (which authorize via a Lambda resource policy).
     */
    roleArn?: string;
    /**
     * How log data is distributed to a Kinesis stream destination.
     * @default "ByLogStream"
     */
    distribution?: SubscriptionDistribution;
    /**
     * Whether the subscription filter applies to transformed logs when a log
     * transformer is configured on the log group.
     * @default false
     */
    applyOnTransformedLogs?: boolean;
}
export interface SubscriptionFilter extends Resource<"AWS.Logs.SubscriptionFilter", SubscriptionFilterProps, {
    filterName: string;
    logGroupName: string;
    filterPattern: string;
    destinationArn: string;
    roleArn?: string;
    distribution?: SubscriptionDistribution;
}, never, Providers> {
}
/**
 * A CloudWatch Logs subscription filter — fans matching log events out of a
 * log group to a Lambda function, Kinesis stream, Firehose delivery stream, or
 * cross-account logs destination. A log group supports at most two
 * subscription filters.
 *
 * For the Lambda-consumer DX (subscribe a Lambda to a log group with automatic
 * permission wiring and payload decoding), prefer
 * {@link import("./LogGroupEventSource.ts").consumeLogEvents}.
 * ### Subscribing a Lambda Function
 * **Example:** Deliver Error Logs to a Lambda Function
 * ```typescript
 * const filter = yield* SubscriptionFilter("ErrorFanout", {
 *   logGroupName: logGroup.logGroupName,
 *   filterPattern: "?ERROR ?Error",
 *   destinationArn: fn.functionArn,
 * });
 * ```
 *
 * ### Subscribing a Kinesis Stream
 * **Example:** Deliver All Logs to Kinesis
 * ```typescript
 * const filter = yield* SubscriptionFilter("StreamFanout", {
 *   logGroupName: logGroup.logGroupName,
 *   filterPattern: "",
 *   destinationArn: stream.streamArn,
 *   roleArn: role.roleArn,
 *   distribution: "ByLogStream",
 * });
 * ```
 *
 * @resource
 */
export declare const SubscriptionFilter: import("../../Resource.ts").ResourceClass<SubscriptionFilter>;
export declare const SubscriptionFilterProvider: () => import("effect/Layer").Layer<Provider.Provider<SubscriptionFilter>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SubscriptionFilter.d.ts.map