import * as vpclattice from "@distilled.cloud/aws/vpc-lattice";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { retryOnConflict, waitUntilAbsent, waitUntilStable, } from "./internal.js";
/**
 * An Amazon VPC Lattice target group — the collection of compute targets
 * (IPs, EC2 instances, ALBs, or Lambda functions) that a lattice service's
 * listeners and rules forward traffic to.
 *
 * ### Creating Target Groups
 * **Example:** Lambda Target Group
 * ```typescript
 * const targets = yield* TargetGroup("ApiTargets", {
 *   type: "LAMBDA",
 *   targets: [{ id: fn.functionArn }],
 * });
 * ```
 *
 * **Example:** IP Target Group with Health Check
 * ```typescript
 * const targets = yield* TargetGroup("BackendTargets", {
 *   type: "IP",
 *   port: 80,
 *   protocol: "HTTP",
 *   vpcIdentifier: vpc.vpcId,
 *   healthCheck: {
 *     enabled: true,
 *     path: "/health",
 *     healthCheckInterval: "30 seconds",
 *     healthCheckTimeout: "5 seconds",
 *   },
 *   targets: [{ id: "10.0.1.10", port: 80 }],
 * });
 * ```
 *
 * @resource
 */
export const TargetGroup = Resource("AWS.VpcLattice.TargetGroup");
const toWireHealthCheck = (healthCheck) => ({
    enabled: healthCheck.enabled,
    protocol: healthCheck.protocol,
    protocolVersion: healthCheck.protocolVersion,
    port: healthCheck.port,
    path: healthCheck.path,
    healthCheckIntervalSeconds: toWireSeconds(healthCheck.healthCheckInterval),
    healthCheckTimeoutSeconds: toWireSeconds(healthCheck.healthCheckTimeout),
    healthyThresholdCount: healthCheck.healthyThresholdCount,
    unhealthyThresholdCount: healthCheck.unhealthyThresholdCount,
    matcher: healthCheck.matcher,
});
const targetKey = (t) => `${t.id ?? ""}#${t.port ?? ""}`;
/**
 * RegisterTargets reports per-target failures in `unsuccessful` instead of
 * throwing. Tagged so callers (e.g. `delete`'s not-found tolerance) can keep
 * using `Effect.catchTag` on the fully typed error union.
 */
class TargetRegistrationFailed extends Data.TaggedError("AWS.VpcLattice.TargetRegistrationFailed") {
    get message() {
        return `Failed to register targets with target group ${this.targetGroupId}: ${JSON.stringify(this.unsuccessful)}`;
    }
}
export const TargetGroupProvider = () => Provider.effect(TargetGroup, Effect.gen(function* () {
    const toName = (id, props = {}) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 63, lowercase: true });
    const observe = (targetGroupIdentifier) => vpclattice
        .getTargetGroup({ targetGroupIdentifier })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const findByName = (name) => vpclattice.listTargetGroups.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
        .flatMap((page) => page.items ?? [])
        .find((t) => t.name === name)), Effect.flatMap((summary) => summary?.id ? observe(summary.id) : Effect.succeed(undefined)));
    const syncTags = Effect.fn(function* (arn, desiredTags) {
        const listed = yield* vpclattice.listTagsForResource({
            resourceArn: arn,
        });
        const { removed, upsert } = diffTags(tagRecord(listed.tags), desiredTags);
        if (upsert.length > 0) {
            yield* vpclattice.tagResource({
                resourceArn: arn,
                tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
            });
        }
        if (removed.length > 0) {
            yield* vpclattice.untagResource({
                resourceArn: arn,
                tagKeys: removed,
            });
        }
    });
    const syncTargets = Effect.fn(function* (targetGroupId, desired) {
        const observed = yield* vpclattice.listTargets
            .pages({ targetGroupIdentifier: targetGroupId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.items ?? [])));
        const desiredKeys = new Set(desired.map(targetKey));
        const observedKeys = new Set(observed.map(targetKey));
        // DRAINING targets are already being deregistered — leave them alone.
        const toRemove = observed.filter((t) => t.id != null &&
            !desiredKeys.has(targetKey(t)) &&
            t.status !== "DRAINING");
        const toAdd = desired.filter((t) => !observedKeys.has(targetKey(t)));
        if (toRemove.length > 0) {
            yield* vpclattice.deregisterTargets({
                targetGroupIdentifier: targetGroupId,
                targets: toRemove.map((t) => ({ id: t.id, port: t.port })),
            });
        }
        if (toAdd.length > 0) {
            // Partial failures are reported in `unsuccessful`, not thrown.
            const result = yield* retryOnConflict(vpclattice.registerTargets({
                targetGroupIdentifier: targetGroupId,
                targets: toAdd,
            }));
            const unsuccessful = result.unsuccessful ?? [];
            if (unsuccessful.length > 0) {
                return yield* Effect.fail(new TargetRegistrationFailed({ targetGroupId, unsuccessful }));
            }
        }
    });
    return {
        stables: ["targetGroupId", "targetGroupArn", "name", "type"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
            // Everything except healthCheck, targets, and tags is fixed at
            // creation time.
            if (olds?.type !== news.type ||
                (olds?.port ?? undefined) !== news.port ||
                (olds?.protocol ?? undefined) !== news.protocol ||
                (olds?.protocolVersion ?? undefined) !== news.protocolVersion ||
                (olds?.ipAddressType ?? undefined) !== news.ipAddressType ||
                (olds?.vpcIdentifier ?? undefined) !== news.vpcIdentifier ||
                (olds?.lambdaEventStructureVersion ?? undefined) !==
                    news.lambdaEventStructureVersion) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const group = output?.targetGroupId
                ? yield* observe(output.targetGroupId)
                : yield* findByName(yield* toName(id, olds ?? {}));
            if (!group?.arn || !group.id)
                return undefined;
            const listed = yield* vpclattice.listTagsForResource({
                resourceArn: group.arn,
            });
            const attrs = {
                targetGroupId: group.id,
                targetGroupArn: group.arn,
                name: group.name,
                type: group.type ?? "IP",
                status: group.status ?? "UNKNOWN",
                tags: tagRecord(listed.tags),
            };
            return (yield* hasAlchemyTags(id, listed.tags))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* toName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the stable id cache, fall back to name lookup.
            let group = output?.targetGroupId
                ? yield* observe(output.targetGroupId)
                : yield* findByName(name);
            // Ensure — create if missing.
            if (!group?.arn || !group.id) {
                const created = yield* vpclattice
                    .createTargetGroup({
                    name,
                    type: news.type,
                    config: news.type === "LAMBDA" &&
                        news.lambdaEventStructureVersion === undefined
                        ? undefined
                        : {
                            port: news.port,
                            protocol: news.protocol,
                            protocolVersion: news.protocolVersion,
                            ipAddressType: news.ipAddressType,
                            vpcIdentifier: news.vpcIdentifier,
                            lambdaEventStructureVersion: news.lambdaEventStructureVersion,
                            healthCheck: news.healthCheck
                                ? toWireHealthCheck(news.healthCheck)
                                : undefined,
                        },
                })
                    .pipe(Effect.catchTag("ConflictException", () => findByName(name)));
                if (!created?.arn || !created.id) {
                    return yield* Effect.fail(new Error(`Failed to create target group ${name}`));
                }
                group = yield* observe(created.id);
                if (!group?.arn || !group.id) {
                    group = { id: created.id, arn: created.arn };
                }
            }
            const targetGroupId = group.id;
            const targetGroupArn = group.arn;
            if (!targetGroupId || !targetGroupArn) {
                return yield* Effect.fail(new Error(`Target group ${name} is missing its id/arn`));
            }
            // Target groups reject updates while CREATE_IN_PROGRESS.
            const stable = yield* waitUntilStable(observe(targetGroupId));
            // Sync health check — the only mutable setting (IP/INSTANCE only).
            if (news.healthCheck !== undefined) {
                const desired = toWireHealthCheck(news.healthCheck);
                const observedHealthCheck = stable?.config?.healthCheck ?? {};
                const drifted = Object.entries(desired).some(([key, value]) => value !== undefined &&
                    JSON.stringify(observedHealthCheck[key]) !==
                        JSON.stringify(value));
                if (drifted) {
                    yield* retryOnConflict(vpclattice.updateTargetGroup({
                        targetGroupIdentifier: targetGroupId,
                        healthCheck: desired,
                    }));
                }
            }
            // Sync targets — register missing, deregister extras.
            yield* syncTargets(targetGroupId, news.targets ?? []);
            yield* syncTags(targetGroupArn, desiredTags);
            const final = yield* observe(targetGroupId);
            yield* session.note(targetGroupArn);
            return {
                targetGroupId,
                targetGroupArn,
                name,
                type: news.type,
                status: final?.status ?? stable?.status ?? "ACTIVE",
                tags: desiredTags,
            };
        }),
        list: () => Effect.gen(function* () {
            const summaries = yield* vpclattice.listTargetGroups.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.items ?? [])));
            return yield* Effect.forEach(summaries.filter((s) => s.id != null && s.arn != null), (summary) => Effect.gen(function* () {
                const listed = yield* vpclattice.listTagsForResource({
                    resourceArn: summary.arn,
                });
                return {
                    targetGroupId: summary.id,
                    targetGroupArn: summary.arn,
                    name: summary.name,
                    type: summary.type ?? "IP",
                    status: summary.status ?? "UNKNOWN",
                    tags: tagRecord(listed.tags),
                };
            }), { concurrency: 10 });
        }),
        delete: Effect.fn(function* ({ output }) {
            // Deregister any remaining targets first so the group doesn't sit
            // in a draining conflict while deleting.
            yield* syncTargets(output.targetGroupId, []).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Deregistered targets sit in DRAINING for a while and
            // DeleteTargetGroup rejects with `ConflictException: TargetGroup
            // has targets registered with it` until they are gone. Wait
            // (bounded) for the drain to complete.
            yield* Effect.repeat(vpclattice
                .listTargets({ targetGroupIdentifier: output.targetGroupId })
                .pipe(Effect.map((r) => r.items.length), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(0))), {
                schedule: Schedule.max([
                    Schedule.spaced("3 seconds"),
                    Schedule.recurs(15),
                ]),
                until: (remaining) => remaining === 0,
            });
            yield* retryOnConflict(vpclattice.deleteTargetGroup({
                targetGroupIdentifier: output.targetGroupId,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Deletion is asynchronous while targets drain; wait until the
            // group is actually gone so dependent VPC deletes don't conflict.
            yield* waitUntilAbsent(observe(output.targetGroupId));
        }),
    };
}));
//# sourceMappingURL=TargetGroup.js.map