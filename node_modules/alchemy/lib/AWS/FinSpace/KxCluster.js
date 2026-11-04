import * as finspace from "@distilled.cloud/aws/finspace";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
/** Convert the alchemy-facing auto-scaling config to the wire shape (seconds). */
const toWireAutoScaling = (config) => ({
    minNodeCount: config.minNodeCount,
    maxNodeCount: config.maxNodeCount,
    autoScalingMetric: config.autoScalingMetric,
    metricTarget: config.metricTarget,
    scaleInCooldownSeconds: toWireSeconds(config.scaleInCooldown),
    scaleOutCooldownSeconds: toWireSeconds(config.scaleOutCooldown),
});
/**
 * A kdb cluster inside an Amazon FinSpace Managed kdb environment — the
 * compute that mounts kdb databases and serves q queries.
 *
 * :::caution
 * Cluster provisioning is slow (tens of minutes) and bills per node-hour
 * while it exists. Live lifecycle tests are gated behind
 * `AWS_TEST_FINSPACE=1`.
 * :::
 * ### Creating kdb Clusters
 * **Example:** HDB Cluster on Dedicated Capacity
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const cluster = yield* AWS.FinSpace.KxCluster("Hdb", {
 *   environmentId: env.environmentId,
 *   clusterType: "HDB",
 *   releaseLabel: "1.0",
 *   azMode: "SINGLE",
 *   availabilityZoneId: "use1-az1",
 *   capacityConfiguration: { nodeType: "kx.s.large", nodeCount: 1 },
 *   vpcConfiguration: {
 *     vpcId: vpc.vpcId,
 *     securityGroupIds: [sg.securityGroupId],
 *     subnetIds: [subnet.subnetId],
 *     ipAddressType: "IP_V4",
 *   },
 *   databases: [{ databaseName: db.databaseName }],
 * });
 * ```
 *
 * @resource
 */
export const KxCluster = Resource("AWS.FinSpace.KxCluster");
const createClusterName = (id, props) => props.clusterName
    ? Effect.succeed(props.clusterName)
    : createPhysicalName({ id, maxLength: 63 });
const isGone = (status) => status === "DELETED" || status === "DELETING";
const readCluster = Effect.fn(function* (environmentId, clusterName) {
    const response = yield* finspace
        .getKxCluster({ environmentId, clusterName })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!response || isGone(response.status))
        return undefined;
    return response;
});
const toAttributes = (cluster, environmentId, clusterName) => ({
    environmentId,
    clusterName: cluster.clusterName ?? clusterName,
    status: cluster.status,
    clusterType: cluster.clusterType,
    releaseLabel: cluster.releaseLabel,
    azMode: cluster.azMode,
});
/**
 * A cluster still transitioning toward the awaited status — retried by the
 * bounded schedule in {@link waitForClusterStatus}.
 */
class KxClusterNotReady extends Data.TaggedError("KxClusterNotReady") {
}
/**
 * A cluster whose asynchronous provisioning converged to a terminal failure
 * status (`CREATE_FAILED` / `DELETE_FAILED`).
 */
export class KxClusterProvisioningFailed extends Data.TaggedError("KxClusterProvisioningFailed") {
}
// Explicitly-typed retry wrapper — an inline `Effect.retry` in provider
// lifecycle code leaks `Retry.Return`'s conditional type into declaration
// emit and widens the provider layer to `unknown` for every consumer of
// `AWS.providers()`.
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "KxClusterNotReady",
    // Cluster provisioning is slow (tens of minutes); poll every 20s up to
    // ~40 min.
    schedule: Schedule.max([
        Schedule.spaced("20 seconds"),
        Schedule.recurs(120),
    ]),
});
const waitForClusterStatus = (environmentId, clusterName, target) => retryWhileNotReady(Effect.gen(function* () {
    const response = yield* finspace
        .getKxCluster({ environmentId, clusterName })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const status = response?.status;
    if (target === "DELETED") {
        if (response === undefined || status === "DELETED")
            return;
        if (status === "DELETE_FAILED") {
            return yield* Effect.fail(new KxClusterProvisioningFailed({
                clusterName,
                status,
                statusReason: response.statusReason,
            }));
        }
        return yield* Effect.fail(new KxClusterNotReady({ clusterName, status }));
    }
    if (status === "RUNNING")
        return;
    if (status === "CREATE_FAILED") {
        return yield* Effect.fail(new KxClusterProvisioningFailed({
            clusterName,
            status,
            statusReason: response?.statusReason,
        }));
    }
    // response === undefined right after create is eventual consistency —
    // keep polling on the bounded schedule.
    return yield* Effect.fail(new KxClusterNotReady({ clusterName, status }));
}));
const sameJson = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
export const KxClusterProvider = () => Provider.effect(KxCluster, Effect.gen(function* () {
    return {
        stables: ["environmentId", "clusterName"],
        // Clusters are keyed by their parent kdb environment — there is no
        // account-wide enumeration without an environment id.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const environmentId = output?.environmentId ?? olds?.environmentId;
            if (environmentId === undefined)
                return undefined;
            const clusterName = output?.clusterName ?? (yield* createClusterName(id, olds ?? {}));
            const cluster = yield* readCluster(environmentId, clusterName);
            if (!cluster)
                return undefined;
            // Clusters have no tag-read surface (no ARN in Get/List responses)
            // — ownership cannot be verified, so a name match is owned.
            return toAttributes(cluster, environmentId, clusterName);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            const oldName = yield* createClusterName(id, olds);
            const newName = yield* createClusterName(id, news);
            // Everything except code/databases/description is fixed at
            // creation.
            if (olds.environmentId !== news.environmentId ||
                oldName !== newName ||
                olds.clusterType !== news.clusterType ||
                olds.releaseLabel !== news.releaseLabel ||
                olds.azMode !== news.azMode ||
                olds.availabilityZoneId !== news.availabilityZoneId ||
                !sameJson(olds.vpcConfiguration, news.vpcConfiguration) ||
                !sameJson(olds.capacityConfiguration, news.capacityConfiguration) ||
                !sameJson(olds.scalingGroupConfiguration, news.scalingGroupConfiguration) ||
                !sameJson(olds.autoScalingConfiguration &&
                    toWireAutoScaling(olds.autoScalingConfiguration), news.autoScalingConfiguration &&
                    toWireAutoScaling(news.autoScalingConfiguration)) ||
                !sameJson(olds.savedownStorageConfiguration, news.savedownStorageConfiguration) ||
                !sameJson(olds.cacheStorageConfigurations, news.cacheStorageConfigurations) ||
                !sameJson(olds.tickerplantLogConfiguration, news.tickerplantLogConfiguration) ||
                olds.executionRole !== news.executionRole) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("FinSpace KxCluster requires props"));
            }
            const environmentId = news.environmentId;
            const clusterName = output?.clusterName ?? (yield* createClusterName(id, news));
            const internalTags = yield* createInternalTags(id);
            // One idempotency token per reconcile.
            const clientToken = yield* Effect.sync(() => crypto.randomUUID());
            // Observe — cloud state is authoritative.
            let cluster = yield* readCluster(environmentId, clusterName);
            // Ensure — create if missing (tolerating a Conflict race), then
            // wait for RUNNING.
            if (cluster === undefined) {
                yield* finspace
                    .createKxCluster({
                    clientToken,
                    environmentId,
                    clusterName,
                    clusterType: news.clusterType,
                    releaseLabel: news.releaseLabel,
                    vpcConfiguration: news.vpcConfiguration,
                    azMode: news.azMode,
                    availabilityZoneId: news.availabilityZoneId,
                    capacityConfiguration: news.capacityConfiguration,
                    scalingGroupConfiguration: news.scalingGroupConfiguration,
                    autoScalingConfiguration: news.autoScalingConfiguration &&
                        toWireAutoScaling(news.autoScalingConfiguration),
                    savedownStorageConfiguration: news.savedownStorageConfiguration,
                    databases: news.databases,
                    cacheStorageConfigurations: news.cacheStorageConfigurations,
                    tickerplantLogConfiguration: news.tickerplantLogConfiguration,
                    clusterDescription: news.description,
                    code: news.code,
                    initializationScript: news.initializationScript,
                    commandLineArguments: news.commandLineArguments,
                    executionRole: news.executionRole,
                    tags: { ...internalTags, ...news.tags },
                })
                    .pipe(Effect.catchTag("ConflictException", () => Effect.succeed(undefined)));
                yield* session.note(`Creating kdb cluster ${clusterName}...`);
                yield* waitForClusterStatus(environmentId, clusterName, "RUNNING");
                cluster = yield* readCluster(environmentId, clusterName);
                if (cluster === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created kdb cluster ${clusterName}`));
                }
            }
            // Sync code configuration — only when the caller manages code and
            // the observed deployment drifted.
            if (news.code !== undefined &&
                (!sameJson(news.code, cluster.code) ||
                    (news.initializationScript ?? "") !==
                        (cluster.initializationScript ?? "") ||
                    !sameJson(news.commandLineArguments, cluster.commandLineArguments))) {
                yield* finspace.updateKxClusterCodeConfiguration({
                    environmentId,
                    clusterName,
                    clientToken,
                    code: news.code,
                    initializationScript: news.initializationScript,
                    commandLineArguments: news.commandLineArguments,
                });
                yield* session.note(`Updated code on kdb cluster ${clusterName}`);
                yield* waitForClusterStatus(environmentId, clusterName, "RUNNING");
            }
            // Sync mounted databases — only when the caller manages them and
            // the observed set drifted.
            if (news.databases !== undefined &&
                !sameJson(news.databases, cluster.databases)) {
                yield* finspace.updateKxClusterDatabases({
                    environmentId,
                    clusterName,
                    clientToken,
                    databases: news.databases,
                });
                yield* session.note(`Updated databases on kdb cluster ${clusterName}`);
                yield* waitForClusterStatus(environmentId, clusterName, "RUNNING");
            }
            yield* session.note(clusterName);
            const final = yield* readCluster(environmentId, clusterName);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled kdb cluster ${clusterName}`));
            }
            return toAttributes(final, environmentId, clusterName);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* finspace
                .deleteKxCluster({
                environmentId: output.environmentId,
                clusterName: output.clusterName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitForClusterStatus(output.environmentId, output.clusterName, "DELETED");
        }),
    };
}));
//# sourceMappingURL=KxCluster.js.map