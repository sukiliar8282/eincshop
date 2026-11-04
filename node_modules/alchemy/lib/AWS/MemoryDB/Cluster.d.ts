import * as memorydb from "@distilled.cloud/aws/memorydb";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ClusterProps {
    /**
     * Name of the cluster. Must be 1-40 alphanumeric characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * cluster.
     */
    clusterName?: string;
    /**
     * Compute and memory capacity of the nodes, e.g. `"db.t4g.small"` (the
     * cheapest supported node type) or `"db.r7g.large"`.
     * @default "db.t4g.small"
     */
    nodeType?: string;
    /**
     * Name of the {@link ACL} that authenticates connections to the cluster.
     * Required by MemoryDB. The ACL must include a user named `default`.
     */
    aclName: string;
    /**
     * Name of the {@link SubnetGroup} the cluster's nodes are placed into.
     * Changing the subnet group replaces the cluster.
     * @default the default subnet group
     */
    subnetGroupName?: string;
    /**
     * VPC security groups that control network access to the cluster endpoint.
     * @default the VPC's default security group
     */
    securityGroupIds?: string[];
    /**
     * Number of shards (partitions) in the cluster.
     * @default 1
     */
    numShards?: number;
    /**
     * Number of read replicas per shard (0-5).
     * @default 1
     */
    numReplicasPerShard?: number;
    /**
     * Name of the parameter group applied to the cluster.
     * @default the engine's default parameter group
     */
    parameterGroupName?: string;
    /**
     * Human-readable description of the cluster.
     */
    description?: string;
    /**
     * Engine — `"redis"` or `"valkey"`.
     * @default "valkey"
     */
    engine?: string;
    /**
     * Engine version, e.g. `"7.1"` (redis) or `"7.2"` (valkey).
     * @default latest for the engine
     */
    engineVersion?: string;
    /**
     * Port the cluster accepts connections on. Changing the port replaces the
     * cluster.
     * @default 6379
     */
    port?: number;
    /**
     * Whether in-transit encryption (TLS) is enabled. Changing this replaces the
     * cluster.
     * @default true
     */
    tlsEnabled?: boolean;
    /**
     * Customer-managed KMS key for encryption at rest. Changing the key replaces
     * the cluster.
     * @default AWS-owned key
     */
    kmsKeyId?: string;
    /**
     * Weekly maintenance window, e.g. `"sun:23:00-mon:01:30"` (UTC).
     */
    maintenanceWindow?: string;
    /**
     * How long automatic snapshots are retained (e.g. `"7 days"` or
     * `Duration.days(7)`). Sent to the API in whole days; `Duration.zero`
     * disables automatic snapshots.
     */
    snapshotRetentionLimit?: Duration.Input;
    /**
     * Daily window (UTC, `HH:MM-HH:MM`) when automatic snapshots are taken.
     */
    snapshotWindow?: string;
    /**
     * SNS topic ARN to publish cluster events to.
     */
    snsTopicArn?: string;
    /**
     * Whether minor engine version upgrades are applied automatically.
     * @default true
     */
    autoMinorVersionUpgrade?: boolean;
    /**
     * Whether data tiering (SSD) is enabled. Only supported on r6gd node types.
     * Changing this replaces the cluster.
     */
    dataTiering?: boolean;
    /**
     * IP address type. Changing this replaces the cluster.
     * @default "ipv4"
     */
    networkType?: memorydb.NetworkType;
    /**
     * IP discovery protocol.
     */
    ipDiscovery?: memorydb.IpDiscovery;
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.MemoryDB.Cluster", ClusterProps, {
    /** Name of the cluster. */
    clusterName: string;
    /** ARN of the cluster. */
    clusterArn: string;
    /** Current lifecycle status (e.g. `creating`, `available`). */
    status: string;
    /** Node instance type (e.g. `db.t4g.small`). */
    nodeType: string;
    /** Engine (`redis` or `valkey`). */
    engine: string;
    /** Running engine version. */
    engineVersion: string | undefined;
    /** DNS address of the cluster endpoint. */
    endpointAddress: string | undefined;
    /** Port of the cluster endpoint. */
    endpointPort: number | undefined;
    /** Name of the ACL attached to the cluster. */
    aclName: string | undefined;
    /** Name of the parameter group in use. */
    parameterGroupName: string | undefined;
    /** Name of the subnet group the cluster's nodes are placed in. */
    subnetGroupName: string | undefined;
    /** Whether in-transit encryption (TLS) is enabled. */
    tlsEnabled: boolean | undefined;
    /** Number of shards in the cluster. */
    numberOfShards: number | undefined;
    /** Tags on the cluster (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon MemoryDB cluster — a durable, Redis/Valkey-compatible in-memory
 * database.
 *
 * Clusters take roughly 10-15 minutes to provision and are billed per node
 * while they exist. They are reachable only from inside a VPC and require an
 * {@link ACL}; place them in a {@link SubnetGroup} spanning multiple AZs for
 * high availability. Destroy clusters you are not using.
 * ### Creating a Cluster
 * **Example:** Single-Shard Cluster
 * ```typescript
 * const user = yield* User("CacheUser", {
 *   authenticationMode: { type: "password", passwords: [cachePassword] },
 *   accessString: "on ~* +@all",
 * });
 * const acl = yield* ACL("CacheAcl", { userNames: [user.userName] });
 * const subnetGroup = yield* SubnetGroup("CacheSubnets", {
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * const cluster = yield* Cluster("Cache", {
 *   nodeType: "db.t4g.small",
 *   aclName: acl.aclName,
 *   subnetGroupName: subnetGroup.subnetGroupName,
 *   numShards: 1,
 *   numReplicasPerShard: 1,
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map