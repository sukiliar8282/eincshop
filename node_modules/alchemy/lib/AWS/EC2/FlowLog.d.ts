import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type FlowLogId<ID extends string = string> = `fl-${ID}`;
export type FlowLogArn<ID extends FlowLogId = FlowLogId> = `arn:aws:ec2:${RegionID}:${AccountID}:vpc-flow-log/${ID}`;
declare const FlowLogOperationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FlowLogOperationFailed";
} & Readonly<A>;
/**
 * Raised when `createFlowLogs`/`deleteFlowLogs` report an item in the
 * `Unsuccessful` array (these APIs never throw for per-resource failures).
 */
export declare class FlowLogOperationFailed extends FlowLogOperationFailed_base<{
    readonly code: string;
    readonly message: string;
}> {
}
export interface FlowLogProps {
    /**
     * The type of resource to monitor.
     */
    resourceType: "VPC" | "Subnet" | "NetworkInterface";
    /**
     * The ID of the VPC, subnet, or network interface to capture flow logs for.
     * Immutable — changing it replaces the flow log.
     */
    resourceId: string;
    /**
     * The type of traffic to capture.
     * @default "ALL"
     */
    trafficType?: "ACCEPT" | "REJECT" | "ALL";
    /**
     * Where to deliver the flow logs.
     * @default "cloud-watch-logs"
     */
    logDestinationType?: "cloud-watch-logs" | "s3" | "kinesis-data-firehose";
    /**
     * The name of the CloudWatch Logs log group. Required (and only valid) when
     * `logDestinationType` is `cloud-watch-logs`.
     */
    logGroupName?: string;
    /**
     * The ARN of the IAM role that permits EC2 to publish flow logs to the
     * CloudWatch Logs group. Required when `logDestinationType` is
     * `cloud-watch-logs`.
     */
    deliverLogsPermissionArn?: string;
    /**
     * The ARN of the destination for the flow logs when `logDestinationType` is
     * `s3` (a bucket ARN, optionally with a key prefix) or
     * `kinesis-data-firehose` (a delivery stream ARN).
     */
    logDestination?: string;
    /**
     * The maximum interval, in seconds, during which a flow of packets is
     * captured and aggregated into a flow log record. Either `60` or `600`.
     * @default 600
     */
    maxAggregationInterval?: 60 | 600;
    /**
     * A custom format string for the flow log records. If omitted, the default
     * format is used.
     */
    logFormat?: string;
    /**
     * Tags to assign to the flow log.
     */
    tags?: Record<string, string>;
}
export interface FlowLog extends Resource<"AWS.EC2.FlowLog", FlowLogProps, {
    /**
     * The ID of the flow log (prefixed `fl-`).
     */
    flowLogId: FlowLogId;
    /**
     * The Amazon Resource Name (ARN) of the flow log.
     */
    flowLogArn: FlowLogArn;
    /**
     * The ID of the monitored resource.
     */
    resourceId: string;
    /**
     * The type of traffic captured.
     */
    trafficType: "ACCEPT" | "REJECT" | "ALL";
    /**
     * Where the flow logs are delivered.
     */
    logDestinationType: "cloud-watch-logs" | "s3" | "kinesis-data-firehose";
}, never, Providers> {
}
/**
 * A flow log captures information about the IP traffic going to and from a VPC,
 * subnet, or network interface, and publishes it to CloudWatch Logs, S3, or a
 * Kinesis Data Firehose delivery stream. Use it for network monitoring, traffic
 * analysis, and troubleshooting security-group / NACL rules.
 *
 * A flow log is immutable: every property except `tags` is fixed at creation,
 * so changing the monitored resource, destination, or traffic type replaces the
 * flow log. For CloudWatch Logs delivery you must supply a `logGroupName` and a
 * `deliverLogsPermissionArn` — an IAM role that EC2's `vpc-flow-logs` service
 * principal can assume to write to the group.
 *
 * ### Creating a Flow Log
 * **Example:** VPC Flow Log to CloudWatch Logs
 * ```typescript
 * const logGroup = yield* AWS.Logs.LogGroup("FlowLogs", {});
 *
 * const role = yield* AWS.IAM.Role("FlowLogRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "vpc-flow-logs.amazonaws.com" },
 *       Action: "sts:AssumeRole",
 *     }],
 *   },
 *   inlinePolicies: {
 *     deliver: {
 *       Version: "2012-10-17",
 *       Statement: [{
 *         Effect: "Allow",
 *         Action: [
 *           "logs:CreateLogStream",
 *           "logs:PutLogEvents",
 *           "logs:DescribeLogStreams",
 *         ],
 *         Resource: "*",
 *       }],
 *     },
 *   },
 * });
 *
 * const flowLog = yield* AWS.EC2.FlowLog("VpcFlowLog", {
 *   resourceType: "VPC",
 *   resourceId: myVpc.vpcId,
 *   logGroupName: logGroup.logGroupName,
 *   deliverLogsPermissionArn: role.roleArn,
 * });
 * ```
 * Captures all traffic for the VPC and delivers it to the CloudWatch Logs
 * group via the delivery role.
 *
 * **Example:** S3 Flow Log for Rejected Traffic
 * ```typescript
 * const flowLog = yield* AWS.EC2.FlowLog("RejectedTraffic", {
 *   resourceType: "Subnet",
 *   resourceId: mySubnet.subnetId,
 *   trafficType: "REJECT",
 *   logDestinationType: "s3",
 *   logDestination: bucket.bucketArn,
 * });
 * ```
 * Delivers only rejected-traffic records for a subnet directly to an S3 bucket
 * (no IAM role required for S3 delivery).
 *
 * @resource
 */
export declare const FlowLog: import("../../Resource.ts").ResourceClass<FlowLog>;
export declare const FlowLogProvider: () => import("effect/Layer").Layer<Provider.Provider<FlowLog>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=FlowLog.d.ts.map