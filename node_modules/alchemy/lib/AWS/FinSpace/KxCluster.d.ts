import * as finspace from "@distilled.cloud/aws/finspace";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type KxClusterStatus = finspace.KxClusterStatus;
export type KxClusterType = finspace.KxClusterType;
export type KxAzMode = finspace.KxAzMode;
export type VpcConfiguration = finspace.VpcConfiguration;
export type CapacityConfiguration = finspace.CapacityConfiguration;
export type CodeConfiguration = finspace.CodeConfiguration;
export type KxCommandLineArgument = finspace.KxCommandLineArgument;
export type KxDatabaseConfiguration = finspace.KxDatabaseConfiguration;
export type KxCacheStorageConfiguration = finspace.KxCacheStorageConfiguration;
export type KxSavedownStorageConfiguration = finspace.KxSavedownStorageConfiguration;
export type KxScalingGroupConfiguration = finspace.KxScalingGroupConfiguration;
export type TickerplantLogConfiguration = finspace.TickerplantLogConfiguration;
/**
 * Auto-scaling policy for a dedicated {@link KxCluster}.
 */
export interface AutoScalingConfiguration {
    /** Lowest number of nodes to scale in to. */
    minNodeCount?: number;
    /** Highest number of nodes to scale out to. */
    maxNodeCount?: number;
    /** The metric the auto-scaling policy tracks. */
    autoScalingMetric?: finspace.AutoScalingMetric;
    /** The desired value of the chosen metric. */
    metricTarget?: number;
    /**
     * The cooldown after a scale-in event before another scaling event —
     * e.g. `"5 minutes"`. Sent to AWS as whole seconds.
     */
    scaleInCooldown?: Duration.Input;
    /**
     * The cooldown after a scale-out event before another scaling event —
     * e.g. `"5 minutes"`. Sent to AWS as whole seconds.
     */
    scaleOutCooldown?: Duration.Input;
}
export interface KxClusterProps {
    /**
     * Identifier of the kdb environment the cluster runs in. Changing it
     * replaces the cluster.
     */
    environmentId: string;
    /**
     * Name of the kdb cluster. Changing it replaces the cluster.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    clusterName?: string;
    /**
     * The type of cluster — `HDB`, `RDB`, `GATEWAY`, `GP` or `TICKERPLANT`.
     * Changing it replaces the cluster.
     */
    clusterType: KxClusterType;
    /**
     * The kdb release the cluster runs (e.g. `"1.0"`). Changing it replaces
     * the cluster.
     */
    releaseLabel: string;
    /**
     * VPC the cluster network interfaces are placed in. Changing it replaces
     * the cluster.
     */
    vpcConfiguration: VpcConfiguration;
    /**
     * Availability-zone placement mode — `SINGLE` or `MULTI`. Changing it
     * replaces the cluster.
     */
    azMode: KxAzMode;
    /**
     * The availability zone id to place the cluster in (required when
     * `azMode` is `SINGLE`). Changing it replaces the cluster.
     */
    availabilityZoneId?: string;
    /**
     * Dedicated node capacity for the cluster. Mutually exclusive with
     * `scalingGroupConfiguration`. Changing it replaces the cluster.
     */
    capacityConfiguration?: CapacityConfiguration;
    /**
     * Placement on a shared scaling group instead of dedicated capacity.
     * Changing it replaces the cluster.
     */
    scalingGroupConfiguration?: KxScalingGroupConfiguration;
    /**
     * Auto-scaling policy for a dedicated cluster. Changing it replaces the
     * cluster.
     */
    autoScalingConfiguration?: AutoScalingConfiguration;
    /**
     * Temporary savedown storage for an `RDB` cluster. Changing it replaces
     * the cluster.
     */
    savedownStorageConfiguration?: KxSavedownStorageConfiguration;
    /**
     * Databases to mount on the cluster, with optional cache configuration.
     */
    databases?: KxDatabaseConfiguration[];
    /**
     * Cache storage (e.g. `CACHE_1000`) sized for the mounted databases.
     * Changing it replaces the cluster.
     */
    cacheStorageConfigurations?: KxCacheStorageConfiguration[];
    /**
     * Tickerplant log volumes for a `TICKERPLANT` cluster. Changing it
     * replaces the cluster.
     */
    tickerplantLogConfiguration?: TickerplantLogConfiguration;
    /**
     * A description of the cluster.
     */
    description?: string;
    /**
     * The S3 location of the q code to deploy on the cluster.
     */
    code?: CodeConfiguration;
    /**
     * Path (relative to the code root) of the q script run at cluster start.
     */
    initializationScript?: string;
    /**
     * Command-line arguments passed to the kdb process.
     */
    commandLineArguments?: KxCommandLineArgument[];
    /**
     * ARN of the IAM execution role the cluster assumes to access AWS
     * resources.
     */
    executionRole?: string;
    /**
     * Tags to associate with the cluster (applied at creation).
     */
    tags?: Record<string, string>;
}
export interface KxCluster extends Resource<"AWS.FinSpace.KxCluster", KxClusterProps, {
    /**
     * Identifier of the kdb environment the cluster runs in.
     */
    environmentId: string;
    /**
     * The cluster's name.
     */
    clusterName: string;
    /**
     * Current lifecycle status of the cluster.
     */
    status: KxClusterStatus | undefined;
    /**
     * The cluster's type.
     */
    clusterType: KxClusterType | undefined;
    /**
     * The kdb release the cluster runs.
     */
    releaseLabel: string | undefined;
    /**
     * Availability-zone placement mode.
     */
    azMode: KxAzMode | undefined;
}, never, Providers> {
}
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
export declare const KxCluster: import("../../Resource.ts").ResourceClass<KxCluster>;
declare const KxClusterProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "KxClusterProvisioningFailed";
} & Readonly<A>;
/**
 * A cluster whose asynchronous provisioning converged to a terminal failure
 * status (`CREATE_FAILED` / `DELETE_FAILED`).
 */
export declare class KxClusterProvisioningFailed extends KxClusterProvisioningFailed_base<{
    readonly clusterName: string;
    readonly status: string | undefined;
    readonly statusReason: string | undefined;
}> {
}
export declare const KxClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<KxCluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=KxCluster.d.ts.map