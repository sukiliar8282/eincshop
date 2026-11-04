import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RealtimeLogEndpoint {
    /**
     * ARN of the Kinesis data stream that receives the real-time log records.
     */
    streamArn: string;
    /**
     * ARN of an IAM role that CloudFront can assume to write to the stream.
     * The role's trust policy must allow the `cloudfront.amazonaws.com`
     * service principal, and it needs `kinesis:DescribeStreamSummary`,
     * `kinesis:DescribeStream`, `kinesis:PutRecord` and `kinesis:PutRecords`
     * on the stream.
     */
    roleArn: string;
}
export interface RealtimeLogConfigProps {
    /**
     * Name of the real-time log configuration. If omitted, a deterministic
     * name is generated. Changing this forces replacement.
     */
    name?: string;
    /**
     * Percentage of viewer requests sampled into the log stream, between 1 and
     * 100. Updated in place.
     */
    samplingRate: number;
    /**
     * Real-time log record fields to include (e.g. `timestamp`, `c-ip`,
     * `cs-uri-stem`, `sc-status`). Updated in place.
     */
    fields: string[];
    /**
     * Kinesis endpoints that receive the log records. Updated in place.
     */
    endpoints: RealtimeLogEndpoint[];
}
export interface RealtimeLogConfig extends Resource<"AWS.CloudFront.RealtimeLogConfig", RealtimeLogConfigProps, {
    /**
     * ARN of the real-time log configuration.
     */
    arn: string;
    /**
     * Name of the configuration.
     */
    name: string;
    /**
     * Current sampling rate.
     */
    samplingRate: number;
    /**
     * Current log record fields.
     */
    fields: string[];
    /**
     * Current Kinesis endpoints.
     */
    endpoints: RealtimeLogEndpoint[];
}, never, Providers> {
}
/**
 * A CloudFront real-time log configuration.
 *
 * Real-time logs deliver per-request records to a Kinesis data stream within
 * seconds. Attach the configuration to a distribution's cache behavior via
 * `Distribution` (`realtimeLogConfigArn`).
 * ### Creating Real-Time Log Configs
 * **Example:** Stream Viewer Requests to Kinesis
 * ```typescript
 * const stream = yield* Kinesis.Stream("EdgeLogs", {});
 *
 * const role = yield* IAM.Role("EdgeLogsRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "cloudfront.amazonaws.com" },
 *         Action: "sts:AssumeRole",
 *       },
 *     ],
 *   },
 *   inlinePolicies: {
 *     kinesis: {
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Action: [
 *             "kinesis:DescribeStreamSummary",
 *             "kinesis:DescribeStream",
 *             "kinesis:PutRecord",
 *             "kinesis:PutRecords",
 *           ],
 *           Resource: stream.streamArn,
 *         },
 *       ],
 *     },
 *   },
 * });
 *
 * const logConfig = yield* RealtimeLogConfig("EdgeLogConfig", {
 *   samplingRate: 100,
 *   fields: ["timestamp", "c-ip", "cs-uri-stem", "sc-status"],
 *   endpoints: [{ streamArn: stream.streamArn, roleArn: role.roleArn }],
 * });
 * ```
 *
 * @resource
 */
export declare const RealtimeLogConfig: import("../../Resource.ts").ResourceClass<RealtimeLogConfig>;
export declare const RealtimeLogConfigProvider: () => import("effect/Layer").Layer<Provider.Provider<RealtimeLogConfig>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RealtimeLogConfig.d.ts.map