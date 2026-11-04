import * as ec2 from "@distilled.cloud/aws/ec2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * Raised when `createFlowLogs`/`deleteFlowLogs` report an item in the
 * `Unsuccessful` array (these APIs never throw for per-resource failures).
 */
export class FlowLogOperationFailed extends Data.TaggedError("FlowLogOperationFailed") {
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
export const FlowLog = Resource("AWS.EC2.FlowLog");
export const FlowLogProvider = () => Provider.effect(FlowLog, Effect.gen(function* () {
    const createTags = Effect.fn(function* (id, tags) {
        return {
            Name: id,
            ...(yield* createInternalTags(id)),
            ...tags,
        };
    });
    const describeFlowLog = (flowLogId) => ec2.describeFlowLogs({ FlowLogIds: [flowLogId] }).pipe(Effect.map((r) => r.FlowLogs?.[0]), Effect.catchTag("InvalidFlowLogId.NotFound", () => Effect.succeed(undefined)));
    const toAttrs = (fl) => AWSEnvironment.current.pipe(Effect.map((env) => ({
        flowLogId: fl.FlowLogId,
        flowLogArn: `arn:aws:ec2:${env.region}:${env.accountId}:vpc-flow-log/${fl.FlowLogId}`,
        resourceId: fl.ResourceId,
        trafficType: (fl.TrafficType ?? "ALL"),
        logDestinationType: (fl.LogDestinationType ??
            "cloud-watch-logs"),
    })));
    return {
        stables: ["flowLogId", "flowLogArn"],
        list: () => Effect.gen(function* () {
            const env = yield* AWSEnvironment.current;
            const items = yield* ec2.describeFlowLogs.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.FlowLogs ?? [])
                .filter((fl) => fl.FlowLogId != null)
                .map((fl) => ({
                flowLogId: fl.FlowLogId,
                flowLogArn: `arn:aws:ec2:${env.region}:${env.accountId}:vpc-flow-log/${fl.FlowLogId}`,
                resourceId: fl.ResourceId,
                trafficType: (fl.TrafficType ?? "ALL"),
                logDestinationType: (fl.LogDestinationType ??
                    "cloud-watch-logs"),
            })))));
            return items;
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output)
                return undefined;
            const fl = yield* describeFlowLog(output.flowLogId);
            if (!fl)
                return undefined;
            return yield* toAttrs(fl);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            // Flow logs are immutable except for tags — any structural change
            // replaces the resource.
            if (news.resourceType !== olds.resourceType ||
                news.resourceId !== olds.resourceId ||
                (news.trafficType ?? "ALL") !== (olds.trafficType ?? "ALL") ||
                (news.logDestinationType ?? "cloud-watch-logs") !==
                    (olds.logDestinationType ?? "cloud-watch-logs") ||
                news.logGroupName !== olds.logGroupName ||
                news.logDestination !== olds.logDestination ||
                news.deliverLogsPermissionArn !== olds.deliverLogsPermissionArn ||
                (news.maxAggregationInterval ?? 600) !==
                    (olds.maxAggregationInterval ?? 600) ||
                news.logFormat !== olds.logFormat) {
                return { action: "replace" };
            }
            // Only tags are mutable in place.
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const desiredTags = yield* createTags(id, news.tags);
            // Observe — find the flow log via the cached id, else create.
            let fl;
            if (output?.flowLogId) {
                fl = yield* describeFlowLog(output.flowLogId);
            }
            // Ensure — create if missing. createFlowLogs reports per-resource
            // failures in the Unsuccessful array rather than throwing.
            if (fl === undefined) {
                yield* session.note("Creating flow log...");
                // A freshly-created delivery role may not yet be assumable by the
                // flow-logs service (IAM eventual consistency) — createFlowLogs
                // reports that in Unsuccessful. Retry that (but not a genuine
                // "already exists") on a bounded schedule.
                const result = yield* ec2
                    .createFlowLogs({
                    ResourceType: news.resourceType,
                    ResourceIds: [news.resourceId],
                    TrafficType: news.trafficType ?? "ALL",
                    LogDestinationType: news.logDestinationType ?? "cloud-watch-logs",
                    LogGroupName: news.logGroupName,
                    DeliverLogsPermissionArn: news.deliverLogsPermissionArn,
                    LogDestination: news.logDestination,
                    MaxAggregationInterval: news.maxAggregationInterval,
                    LogFormat: news.logFormat,
                    TagSpecifications: [
                        {
                            ResourceType: "vpc-flow-log",
                            Tags: createTagsList(desiredTags),
                        },
                    ],
                })
                    .pipe(Effect.flatMap((r) => {
                    const failure = r.Unsuccessful?.[0];
                    return failure
                        ? Effect.fail(new FlowLogOperationFailed({
                            code: failure.Error?.Code ?? "Unknown",
                            message: failure.Error?.Message ?? "createFlowLogs failed",
                        }))
                        : Effect.succeed(r);
                }), Effect.retry({
                    while: (e) => e._tag === "FlowLogOperationFailed" &&
                        e.code !== "FlowLogAlreadyExists",
                    schedule: Schedule.max([
                        Schedule.fixed(3000),
                        Schedule.recurs(15),
                    ]),
                }));
                const flowLogId = result.FlowLogIds[0];
                yield* session.note(`Flow log created: ${flowLogId}`);
                fl = yield* describeFlowLog(flowLogId);
                if (!fl) {
                    // Freshly-created flow log not yet visible — synthesize attrs.
                    return yield* toAttrs({
                        FlowLogId: flowLogId,
                        ResourceId: news.resourceId,
                        TrafficType: news.trafficType ?? "ALL",
                        LogDestinationType: news.logDestinationType ?? "cloud-watch-logs",
                    });
                }
            }
            const flowLogId = fl.FlowLogId;
            // Sync tags — observed cloud tags vs desired.
            const currentTags = (yield* ec2
                .describeTags({
                Filters: [
                    { Name: "resource-id", Values: [flowLogId] },
                    { Name: "resource-type", Values: ["vpc-flow-log"] },
                ],
            })
                .pipe(Effect.map((r) => Object.fromEntries(r.Tags?.map((t) => [t.Key, t.Value]) ?? [])))) ?? {};
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* ec2.deleteTags({
                    Resources: [flowLogId],
                    Tags: removed.map((key) => ({ Key: key })),
                });
            }
            if (upsert.length > 0) {
                yield* ec2.createTags({ Resources: [flowLogId], Tags: upsert });
            }
            const final = yield* describeFlowLog(flowLogId);
            return yield* toAttrs(final ?? fl);
        }),
        delete: Effect.fn(function* ({ output, session }) {
            const flowLogId = output.flowLogId;
            yield* session.note(`Deleting flow log: ${flowLogId}`);
            // deleteFlowLogs is idempotent — a missing flow log is reported in
            // Unsuccessful, which we ignore.
            yield* ec2.deleteFlowLogs({ FlowLogIds: [flowLogId] });
        }),
    };
}));
//# sourceMappingURL=FlowLog.js.map