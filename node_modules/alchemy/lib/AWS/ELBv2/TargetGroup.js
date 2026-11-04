import * as elbv2 from "@distilled.cloud/aws/elastic-load-balancing-v2";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { toSeconds } from "../../Util/Duration.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags } from "../../Tags.js";
/**
 * An ELBv2 target group. A target group routes requests to one or more
 * registered targets (instances, IPs, Lambda functions, or another ALB) using
 * the configured protocol and port, and runs health checks against them.
 * ### Creating a Target Group
 * **Example:** HTTP target group
 * ```typescript
 * const tg = yield* TargetGroup("web", {
 *   vpcId: vpc.vpcId,
 *   port: 80,
 *   protocol: "HTTP",
 *   targetType: "ip",
 * });
 * ```
 *
 * **Example:** Lambda target group
 * ```typescript
 * // No vpc/port/protocol — the target is a Lambda function.
 * const tg = yield* TargetGroup("fn", {
 *   targetType: "lambda",
 * });
 * ```
 *
 * **Example:** gRPC target group
 * ```typescript
 * const tg = yield* TargetGroup("grpc", {
 *   vpcId: vpc.vpcId,
 *   port: 50051,
 *   protocol: "HTTP",
 *   protocolVersion: "GRPC",
 *   matcher: { GrpcCode: "0" },
 * });
 * ```
 *
 * ### Health Checks
 * **Example:** Custom health-check thresholds
 * ```typescript
 * const tg = yield* TargetGroup("api", {
 *   vpcId: vpc.vpcId,
 *   port: 8080,
 *   protocol: "HTTP",
 *   healthCheckPath: "/healthz",
 *   healthCheckInterval: "15 seconds",
 *   healthyThresholdCount: 3,
 *   unhealthyThresholdCount: 3,
 * });
 * ```
 *
 * @resource
 */
export const TargetGroup = Resource("AWS.ELBv2.TargetGroup");
export const TargetGroupProvider = () => Provider.effect(TargetGroup, Effect.gen(function* () {
    const toName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 32, lowercase: true });
    return {
        stables: ["targetGroupArn", "targetGroupName", "vpcId"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            if (!deepEqual({
                vpcId: olds.vpcId,
                protocol: olds.protocol ?? "HTTP",
                protocolVersion: olds.protocolVersion,
                port: olds.port,
                targetType: olds.targetType ?? "ip",
                ipAddressType: olds.ipAddressType,
            }, {
                vpcId: news.vpcId,
                protocol: news.protocol ?? "HTTP",
                protocolVersion: news.protocolVersion,
                port: news.port,
                targetType: news.targetType ?? "ip",
                ipAddressType: news.ipAddressType,
            })) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output) {
                return undefined;
            }
            const described = yield* elbv2
                .describeTargetGroups({
                TargetGroupArns: [output.targetGroupArn],
            })
                .pipe(Effect.catchTag("TargetGroupNotFoundException", () => Effect.succeed(undefined)));
            const targetGroup = described?.TargetGroups?.[0];
            if (!targetGroup?.TargetGroupArn) {
                return undefined;
            }
            return {
                ...output,
                port: targetGroup.Port,
                protocol: targetGroup.Protocol,
                targetType: targetGroup.TargetType,
                vpcId: targetGroup.VpcId,
            };
        }),
        // Target groups are account/region-scoped. Exhaustively paginate
        // describeTargetGroups, then fetch tags per group (Attributes carry
        // them) to produce the same shape `read` returns.
        list: () => Effect.gen(function* () {
            const targetGroups = yield* elbv2.describeTargetGroups
                .pages({})
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.TargetGroups ?? []).filter((tg) => tg.TargetGroupArn != null))));
            return yield* Effect.forEach(targetGroups, (tg) => Effect.gen(function* () {
                const tagDescriptions = yield* elbv2
                    .describeTags({ ResourceArns: [tg.TargetGroupArn] })
                    .pipe(Effect.catchTag("TargetGroupNotFoundException", () => Effect.succeed(undefined)));
                const tags = Object.fromEntries((tagDescriptions?.TagDescriptions?.[0]?.Tags ?? [])
                    .filter((t) => typeof t.Key === "string" &&
                    typeof t.Value === "string")
                    .map((t) => [t.Key, t.Value]));
                return {
                    targetGroupArn: tg.TargetGroupArn,
                    targetGroupName: tg.TargetGroupName,
                    port: tg.Port,
                    protocol: tg.Protocol,
                    targetType: tg.TargetType,
                    vpcId: tg.VpcId,
                    tags,
                };
            }), { concurrency: 10 });
        }),
        reconcile: Effect.fn(function* ({ id, news, session }) {
            const name = yield* toName(id, news);
            const desiredTags = {
                ...(yield* createInternalTags(id)),
                ...news.tags,
            };
            // Observe — look up by deterministic name.
            let described = yield* elbv2
                .describeTargetGroups({
                Names: [name],
            })
                .pipe(Effect.catchTag("TargetGroupNotFoundException", () => Effect.succeed(undefined)));
            let targetGroup = described?.TargetGroups?.[0];
            // Ensure — create if missing. Stable axes (vpcId, port, protocol,
            // targetType) are handled by diff so we don't deal with mismatch.
            // Lambda target groups have no port/protocol/VPC — the API rejects
            // those members, so omit them entirely.
            const isLambdaTarget = news.targetType === "lambda";
            if (!targetGroup?.TargetGroupArn) {
                const created = yield* elbv2.createTargetGroup({
                    Name: name,
                    Port: isLambdaTarget ? undefined : news.port,
                    Protocol: isLambdaTarget ? undefined : (news.protocol ?? "HTTP"),
                    ProtocolVersion: isLambdaTarget
                        ? undefined
                        : news.protocolVersion,
                    VpcId: isLambdaTarget ? undefined : news.vpcId,
                    TargetType: news.targetType ?? "ip",
                    IpAddressType: isLambdaTarget ? undefined : news.ipAddressType,
                    HealthCheckPath: news.healthCheckPath,
                    HealthCheckPort: news.healthCheckPort,
                    HealthCheckProtocol: news.healthCheckProtocol,
                    HealthCheckEnabled: news.healthCheckEnabled,
                    HealthCheckIntervalSeconds: toSeconds(news.healthCheckInterval),
                    HealthCheckTimeoutSeconds: toSeconds(news.healthCheckTimeout),
                    HealthyThresholdCount: news.healthyThresholdCount,
                    UnhealthyThresholdCount: news.unhealthyThresholdCount,
                    Matcher: news.matcher,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                });
                targetGroup = created.TargetGroups?.[0];
                if (!targetGroup?.TargetGroupArn) {
                    return yield* Effect.die(new Error("createTargetGroup returned no target group"));
                }
            }
            const targetGroupArn = targetGroup.TargetGroupArn;
            // Sync health check — diff observed against desired; only call
            // modifyTargetGroup when a health-check field actually changed.
            const observedHc = {
                HealthCheckPath: targetGroup.HealthCheckPath,
                HealthCheckPort: targetGroup.HealthCheckPort,
                HealthCheckProtocol: targetGroup.HealthCheckProtocol,
                HealthCheckEnabled: targetGroup.HealthCheckEnabled,
                HealthCheckIntervalSeconds: targetGroup.HealthCheckIntervalSeconds,
                HealthCheckTimeoutSeconds: targetGroup.HealthCheckTimeoutSeconds,
                HealthyThresholdCount: targetGroup.HealthyThresholdCount,
                UnhealthyThresholdCount: targetGroup.UnhealthyThresholdCount,
                Matcher: targetGroup.Matcher,
            };
            const desiredHc = {
                HealthCheckPath: news.healthCheckPath ?? observedHc.HealthCheckPath,
                HealthCheckPort: news.healthCheckPort ?? observedHc.HealthCheckPort,
                HealthCheckProtocol: news.healthCheckProtocol ?? observedHc.HealthCheckProtocol,
                HealthCheckEnabled: news.healthCheckEnabled ?? observedHc.HealthCheckEnabled,
                HealthCheckIntervalSeconds: toSeconds(news.healthCheckInterval) ??
                    observedHc.HealthCheckIntervalSeconds,
                HealthCheckTimeoutSeconds: toSeconds(news.healthCheckTimeout) ??
                    observedHc.HealthCheckTimeoutSeconds,
                HealthyThresholdCount: news.healthyThresholdCount ?? observedHc.HealthyThresholdCount,
                UnhealthyThresholdCount: news.unhealthyThresholdCount ??
                    observedHc.UnhealthyThresholdCount,
                Matcher: news.matcher ?? observedHc.Matcher,
            };
            if (!deepEqual(observedHc, desiredHc)) {
                yield* elbv2.modifyTargetGroup({
                    TargetGroupArn: targetGroupArn,
                    ...desiredHc,
                });
            }
            // Sync attributes — observed ↔ desired. Always apply when desired
            // attrs are non-empty.
            if (news.attributes && Object.keys(news.attributes).length > 0) {
                yield* elbv2.modifyTargetGroupAttributes({
                    TargetGroupArn: targetGroupArn,
                    Attributes: Object.entries(news.attributes).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                });
            }
            // Sync tags — diff observed cloud tags against desired.
            const tagDescriptions = yield* elbv2.describeTags({
                ResourceArns: [targetGroupArn],
            });
            const observedTags = Object.fromEntries((tagDescriptions.TagDescriptions?.[0]?.Tags ?? [])
                .filter((t) => typeof t.Key === "string" && typeof t.Value === "string")
                .map((t) => [t.Key, t.Value]));
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (upsert.length > 0) {
                yield* elbv2.addTags({
                    ResourceArns: [targetGroupArn],
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* elbv2.removeTags({
                    ResourceArns: [targetGroupArn],
                    TagKeys: removed,
                });
            }
            yield* session.note(targetGroupArn);
            return {
                targetGroupArn,
                targetGroupName: targetGroup.TargetGroupName,
                port: targetGroup.Port,
                protocol: targetGroup.Protocol,
                targetType: targetGroup.TargetType,
                vpcId: targetGroup.VpcId,
                tags: desiredTags,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteTargetGroup is idempotent on a missing target group (returns
            // success). It only fails with ResourceInUseException while a
            // listener/rule still references it — retry briefly for the
            // eventual-consistency window after the dependents are removed.
            yield* elbv2
                .deleteTargetGroup({
                TargetGroupArn: output.targetGroupArn,
            })
                .pipe(Effect.retry({
                while: (e) => e._tag === "ResourceInUseException",
                schedule: Schedule.max([
                    Schedule.spaced("3 seconds"),
                    Schedule.recurs(8),
                ]),
            }), Effect.catchTag("ResourceInUseException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=TargetGroup.js.map