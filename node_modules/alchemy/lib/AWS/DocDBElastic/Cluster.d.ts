import type * as Duration from "effect/Duration";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ClusterProps {
    /**
     * Name of the elastic cluster. If omitted, a deterministic physical name
     * is generated. Changing the name replaces the cluster.
     */
    clusterName?: string;
    /**
     * Name of the administrator account for the elastic cluster. Changing the
     * admin user name replaces the cluster.
     */
    adminUserName: string;
    /**
     * Password for the administrator account. Must be 8-100 printable ASCII
     * characters (no `/`, `"` or `@`). The cloud never reports the current
     * password, so password rotation is detected by comparing against the
     * previously deployed value.
     */
    adminUserPassword: Redacted.Redacted<string>;
    /**
     * Authentication type — `"PLAIN_TEXT"` (the password is the literal
     * credential) or `"SECRET_ARN"` (the password is a Secrets Manager ARN).
     * @default "PLAIN_TEXT"
     */
    authType?: string;
    /**
     * Capacity of each shard in vCPUs. Valid values: 2, 4, 8, 16, 32, 64.
     * Updated in place.
     * @default 2
     */
    shardCapacity?: number;
    /**
     * Number of shards in the cluster (1-32). Updated in place.
     * @default 1
     */
    shardCount?: number;
    /**
     * Number of replica instances per shard (1-16).
     * @default 1
     */
    shardInstanceCount?: number;
    /**
     * VPC security groups that control network access to the cluster
     * endpoint.
     * @default the VPC's default security group
     */
    vpcSecurityGroupIds?: string[];
    /**
     * VPC subnet IDs the cluster spans. Must cover at least two Availability
     * Zones (three for production workloads).
     * @default the default VPC's subnets
     */
    subnetIds?: string[];
    /**
     * Customer-managed KMS key for encryption at rest. Changing the key
     * replaces the cluster.
     * @default AWS-owned key
     */
    kmsKeyId?: string;
    /**
     * Weekly maintenance window, e.g. `"sun:23:00-mon:01:30"` (UTC).
     */
    preferredMaintenanceWindow?: string;
    /**
     * How long automatic snapshots are retained, e.g. `"7 days"` or
     * `Duration.days(7)`. Rounded to whole days (1-35) on the wire.
     */
    backupRetentionPeriod?: Duration.Input;
    /**
     * Daily window (UTC, `HH:MM-HH:MM`) when automatic snapshots are taken.
     */
    preferredBackupWindow?: string;
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.DocDBElastic.Cluster", ClusterProps, {
    /** The name of the elastic cluster. */
    clusterName: string;
    /** The ARN of the elastic cluster. */
    clusterArn: string;
    /** The current status of the cluster, e.g. `ACTIVE`. */
    status: string;
    /** The MongoDB-compatible connection endpoint. */
    clusterEndpoint: string | undefined;
    /** The administrator username. */
    adminUserName: string;
    /** The authentication type (`PLAIN_TEXT` or `SECRET_ARN`). */
    authType: string;
    /** vCPU capacity of each shard (2, 4, 8, 16, 32, or 64). */
    shardCapacity: number;
    /** Number of shards in the cluster. */
    shardCount: number;
    /** Number of replica instances per shard. */
    shardInstanceCount: number | undefined;
    /** The VPC security groups attached to the cluster. */
    vpcSecurityGroupIds: string[];
    /** The subnets the cluster is deployed into. */
    subnetIds: string[];
    /** The KMS key used for encryption at rest. */
    kmsKeyId: string;
    /** The weekly window during which maintenance can occur. */
    preferredMaintenanceWindow: string;
    /** Number of days automated backups are retained. */
    backupRetentionPeriod: number | undefined;
    /** The daily window during which automated backups run. */
    preferredBackupWindow: string | undefined;
    /** The tags attached to the cluster. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon DocumentDB elastic cluster — a MongoDB-compatible, sharded
 * document database that scales workloads to millions of reads/writes per
 * second without managing instances.
 *
 * Elastic clusters take roughly 8-10 minutes to provision and bill per
 * shard-vCPU-hour while they exist. They are reachable only from inside a
 * VPC. Destroy clusters you are not using.
 * ### Creating a Cluster
 * **Example:** Minimal Elastic Cluster
 * ```typescript
 * const cluster = yield* Cluster("Documents", {
 *   adminUserName: "admin",
 *   adminUserPassword: Redacted.make("super-secret-password"),
 *   shardCapacity: 2,
 *   shardCount: 1,
 * });
 * ```
 *
 * **Example:** Cluster Pinned to Specific Subnets
 * ```typescript
 * const cluster = yield* Cluster("Documents", {
 *   adminUserName: "admin",
 *   adminUserPassword: Redacted.make("super-secret-password"),
 *   shardCapacity: 2,
 *   shardCount: 1,
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   vpcSecurityGroupIds: [securityGroup.securityGroupId],
 *   backupRetentionPeriod: "1 day",
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map