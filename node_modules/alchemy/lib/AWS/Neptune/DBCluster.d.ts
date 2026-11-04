import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServerlessV2ScalingConfiguration {
    /**
     * Minimum Neptune Capacity Units (NCUs), e.g. `1`.
     */
    minCapacity?: number;
    /**
     * Maximum Neptune Capacity Units (NCUs), e.g. `2.5`.
     */
    maxCapacity?: number;
}
export interface DBClusterProps {
    /**
     * Cluster identifier. If omitted, Alchemy generates one.
     */
    dbClusterIdentifier?: string;
    /**
     * Database engine. Neptune only supports `neptune`.
     * Changing it forces replacement.
     * @default "neptune"
     */
    engine?: string;
    /**
     * Optional engine version, e.g. `1.4.5.0`. Changed in place via
     * `modifyDBCluster` (may require `allowMajorVersionUpgrade`).
     */
    engineVersion?: string;
    /**
     * Subnet group the cluster is placed into. Neptune is VPC-only, so this
     * is effectively required. Immutable — forces replacement.
     */
    dbSubnetGroupName?: string;
    /**
     * Cluster parameter group name. In-place modify.
     */
    dbClusterParameterGroupName?: string;
    /**
     * Security groups attached to the cluster. In-place modify.
     */
    vpcSecurityGroupIds?: string[];
    /**
     * Listener port.
     * @default 8182
     */
    port?: number;
    /**
     * Availability zones for cluster placement. Immutable — forces replacement.
     */
    availabilityZones?: string[];
    /**
     * Backup retention period (1-35 days, e.g. `"7 days"` or
     * `Duration.days(7)`). Sent to the API in whole days. In-place modify.
     */
    backupRetentionPeriod?: Duration.Input;
    /**
     * Daily backup window, e.g. `07:00-09:00`. In-place modify.
     */
    preferredBackupWindow?: string;
    /**
     * Weekly maintenance window, e.g. `Mon:00:00-Mon:03:00`. In-place modify.
     */
    preferredMaintenanceWindow?: string;
    /**
     * Log types to export to CloudWatch Logs (`audit`, `slowquery`). Diffed
     * against observed state and applied via the delta-shaped
     * `CloudwatchLogsExportConfiguration` on modify.
     */
    enableCloudwatchLogsExports?: string[];
    /**
     * Enable IAM database authentication (SigV4-signed data-plane requests).
     * In-place modify.
     */
    enableIAMDatabaseAuthentication?: boolean;
    /**
     * Serverless v2 (NCU-based) scaling configuration. Required when using
     * `db.serverless` instances. In-place modify.
     */
    serverlessV2ScalingConfiguration?: ServerlessV2ScalingConfiguration;
    /**
     * Block accidental deletion. In-place modify.
     */
    deletionProtection?: boolean;
    /**
     * Whether the storage is encrypted. Immutable — forces replacement.
     */
    storageEncrypted?: boolean;
    /**
     * Optional KMS key used for storage encryption. Immutable — forces replace.
     */
    kmsKeyId?: string;
    /**
     * Storage type, `standard` | `iopt1`. In-place modify.
     */
    storageType?: string;
    /**
     * Copy tags to snapshots. In-place modify.
     */
    copyTagsToSnapshot?: boolean;
    /**
     * Join this cluster to a Neptune global database. Immutable on create.
     */
    globalClusterIdentifier?: string;
    /**
     * Allow a major engine-version upgrade during a modify. Modify-only flag.
     */
    allowMajorVersionUpgrade?: boolean;
    /**
     * IAM roles to associate with the cluster — e.g. an S3 read role for the
     * Neptune bulk loader, or a SageMaker role for Neptune ML (set
     * `featureName` where the feature requires it). Reconciled in place by
     * diffing the observed cloud associations against this list via
     * `addRoleToDBCluster`/`removeRoleFromDBCluster`.
     */
    associatedRoles?: Array<{
        /** ARN of the IAM role to associate. */
        roleArn: string;
        /** Neptune feature the role is scoped to (omit for the default). */
        featureName?: string;
    }>;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBCluster extends Resource<"AWS.Neptune.DBCluster", DBClusterProps, {
    /** Identifier of the cluster. */
    dbClusterIdentifier: string;
    /** ARN of the cluster. */
    dbClusterArn: string;
    /** Name of the subnet group the cluster is placed in. */
    dbSubnetGroupName: string | undefined;
    /** Name of the attached cluster parameter group. */
    dbClusterParameterGroupName: string | undefined;
    /** Writer (cluster) endpoint host name. */
    endpoint: string | undefined;
    /** Load-balanced reader endpoint host name. */
    readerEndpoint: string | undefined;
    /** Port the cluster listens on (default 8182). */
    port: number | undefined;
    /** Database engine (`neptune`). */
    engine: string;
    /** Running engine version. */
    engineVersion: string | undefined;
    /** Current lifecycle status (e.g. `creating`, `available`). */
    status: string | undefined;
    /** IDs of the VPC security groups attached to the cluster. */
    vpcSecurityGroupIds: string[];
    /** Automated backup retention period, in days. */
    backupRetentionPeriod: number | undefined;
    /** Daily window during which automated backups are taken. */
    preferredBackupWindow: string | undefined;
    /** Weekly window during which maintenance may occur. */
    preferredMaintenanceWindow: string | undefined;
    /** Whether storage is encrypted at rest. */
    storageEncrypted: boolean | undefined;
    /** KMS key encrypting the cluster's storage. */
    kmsKeyId: string | undefined;
    /** Whether deletion protection is enabled. */
    deletionProtection: boolean | undefined;
    /** Whether IAM database authentication is enabled. */
    iamDatabaseAuthenticationEnabled: boolean | undefined;
    /** IAM roles associated with the cluster (bulk loader, Neptune ML). */
    associatedRoles: Array<{
        /** ARN of the associated IAM role. */
        roleArn: string | undefined;
        /** Neptune feature the role is scoped to. */
        featureName: string | undefined;
        /** Association status (`ACTIVE`, `PENDING`, `INVALID`). */
        status: string | undefined;
    }>;
    /** Serverless v2 (NCU) scaling range, if configured. */
    serverlessV2ScalingConfiguration: {
        minCapacity: number | undefined;
        maxCapacity: number | undefined;
    } | undefined;
    /** Instances that are members of the cluster. */
    dbClusterMembers: Array<{
        /** Identifier of the member instance. */
        dbInstanceIdentifier: string | undefined;
        /** Whether the member is the cluster's writer. */
        isClusterWriter: boolean | undefined;
        /** Failover promotion priority of the member. */
        promotionTier: number | undefined;
    }>;
    /** Immutable, region-unique identifier of the cluster. */
    dbClusterResourceId: string | undefined;
    /** Route 53 hosted zone id of the cluster endpoints. */
    hostedZoneId: string | undefined;
    /** Whether the cluster has instances in multiple Availability Zones. */
    multiAZ: boolean | undefined;
    /** Log types exported to CloudWatch Logs (e.g. `audit`). */
    enabledCloudwatchLogsExports: string[];
    /** Creation time of the cluster (ISO 8601). */
    clusterCreateTime: string | undefined;
    /** Storage type (`standard` or `iopt1`). */
    storageType: string | undefined;
    /** Whether cluster tags are copied to snapshots. */
    copyTagsToSnapshot: boolean | undefined;
    /** Tags on the cluster (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Neptune graph database cluster.
 *
 * `DBCluster` owns the writer and reader endpoints and cluster-wide
 * networking; compute is added via {@link DBInstance}. Neptune serves
 * Gremlin, openCypher, and SPARQL over the cluster endpoint (default port
 * 8182) and is reachable only from inside the VPC. Provisioning a cluster
 * plus its first instance takes ~10 minutes.
 *
 * Mutable fields are reconciled in place against the observed cloud state;
 * immutable fields (`engine`, `dbSubnetGroupName`, `storageEncrypted`,
 * `kmsKeyId`, `globalClusterIdentifier`, `availabilityZones`) force a
 * replacement.
 * ### Creating a Cluster
 * **Example:** Neptune cluster with IAM auth
 * ```typescript
 * const cluster = yield* DBCluster("Graph", {
 *   dbSubnetGroupName: subnetGroup.dbSubnetGroupName,
 *   vpcSecurityGroupIds: [sg.groupId],
 *   enableIAMDatabaseAuthentication: true,
 *   backupRetentionPeriod: "1 day",
 *   deletionProtection: false,
 * });
 * ```
 *
 * ### Serverless
 * **Example:** Serverless v2 cluster (pair with a `db.serverless` instance)
 * ```typescript
 * const cluster = yield* DBCluster("Graph", {
 *   dbSubnetGroupName: subnetGroup.dbSubnetGroupName,
 *   serverlessV2ScalingConfiguration: {
 *     minCapacity: 1,
 *     maxCapacity: 2.5,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const DBCluster: import("../../Resource.ts").ResourceClass<DBCluster>;
export declare const DBClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<DBCluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBCluster.d.ts.map