import type * as Duration from "effect/Duration";
import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBClusterProps {
    /**
     * Cluster identifier. If omitted, Alchemy generates one.
     */
    dbClusterIdentifier?: string;
    /**
     * Database engine. DocumentDB only supports `docdb`.
     * Changing it forces replacement.
     * @default "docdb"
     */
    engine?: string;
    /**
     * Optional engine version, e.g. `5.0.0`. Changed in place via
     * `modifyDBCluster` (may require `allowMajorVersionUpgrade`).
     */
    engineVersion?: string;
    /**
     * Subnet group the cluster is placed into. DocumentDB is VPC-only, so this
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
     * @default 27017
     */
    port?: number;
    /**
     * Availability zones for cluster placement. Immutable — forces replacement.
     */
    availabilityZones?: string[];
    /**
     * Backup retention period, e.g. `"7 days"` or `Duration.days(7)`.
     * Rounded to whole days on the wire. In-place modify.
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
     * Log types to export to CloudWatch Logs (`audit`, `profiler`). Diffed
     * against observed state and applied via the delta-shaped
     * `CloudwatchLogsExportConfiguration` on modify.
     */
    enableCloudwatchLogsExports?: string[];
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
     * Storage type, e.g. `standard` | `iopt1`. In-place modify.
     */
    storageType?: string;
    /**
     * Network type: `IPV4` | `DUAL`. In-place modify.
     */
    networkType?: string;
    /**
     * Join this cluster to a DocumentDB global cluster. Immutable on create.
     */
    globalClusterIdentifier?: string;
    /**
     * Master username. Immutable — forces replacement.
     */
    masterUsername?: string;
    /**
     * Master password. In-place modify.
     */
    masterUserPassword?: Redacted.Redacted<string>;
    /**
     * Let DocumentDB manage the master user password in Secrets Manager.
     */
    manageMasterUserPassword?: boolean;
    /**
     * Rotate the managed master user password on the next reconcile.
     */
    rotateMasterUserPassword?: boolean;
    /**
     * KMS key used to encrypt the managed master user secret. In-place modify.
     */
    masterUserSecretKmsKeyId?: string;
    /**
     * Allow a major engine-version upgrade during a modify. Modify-only flag.
     */
    allowMajorVersionUpgrade?: boolean;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBCluster extends Resource<"AWS.DocDB.DBCluster", DBClusterProps, {
    /** The cluster identifier (unique per account/region). */
    dbClusterIdentifier: string;
    /** The ARN of the cluster. */
    dbClusterArn: string;
    /** The DB subnet group the cluster is deployed into. */
    dbSubnetGroupName: string | undefined;
    /** The writer endpoint hostname of the cluster. */
    endpoint: string | undefined;
    /** The load-balanced reader endpoint hostname. */
    readerEndpoint: string | undefined;
    /** The port the cluster accepts connections on. */
    port: number | undefined;
    /** The database engine (`docdb`). */
    engine: string;
    /** The engine version running on the cluster. */
    engineVersion: string | undefined;
    /** The current status of the cluster, e.g. `available`. */
    status: string | undefined;
    /** The master (admin) username. */
    masterUsername: string | undefined;
    /** ARN of the Secrets Manager secret holding the master credentials (when managed). */
    masterUserSecretArn: string | undefined;
    /** The VPC security groups attached to the cluster. */
    vpcSecurityGroupIds: string[];
    /** Number of days automated backups are retained. */
    backupRetentionPeriod: number | undefined;
    /** The daily window during which automated backups run. */
    preferredBackupWindow: string | undefined;
    /** The weekly window during which maintenance can occur. */
    preferredMaintenanceWindow: string | undefined;
    /** Whether cluster storage is encrypted at rest. */
    storageEncrypted: boolean | undefined;
    /** The KMS key used for storage encryption. */
    kmsKeyId: string | undefined;
    /** Whether deletion protection is enabled. */
    deletionProtection: boolean | undefined;
    /** The instances that are members of the cluster. */
    dbClusterMembers: Array<{
        /** The identifier of the member instance. */
        dbInstanceIdentifier: string | undefined;
        /** Whether this member is the cluster writer. */
        isClusterWriter: boolean | undefined;
        /** The failover promotion tier of the member. */
        promotionTier: number | undefined;
    }>;
    /** The immutable region-unique resource ID of the cluster. */
    dbClusterResourceId: string | undefined;
    /** The Route 53 hosted zone ID of the cluster endpoints. */
    hostedZoneId: string | undefined;
    /** Whether the cluster has instances in multiple Availability Zones. */
    multiAZ: boolean | undefined;
    /** The log types exported to CloudWatch Logs, e.g. `audit`, `profiler`. */
    enabledCloudwatchLogsExports: string[];
    /** When the cluster was created (ISO timestamp). */
    clusterCreateTime: string | undefined;
    /** The storage type, e.g. `standard` or `iopt1`. */
    storageType: string | undefined;
    /** The network type, e.g. `IPV4` or `DUAL`. */
    networkType: string | undefined;
    /** The tags attached to the cluster. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon DocumentDB (MongoDB-compatible) cluster.
 *
 * `DBCluster` owns the writer and reader endpoints and cluster-wide
 * networking; instances are added via {@link DBInstance}. It can bootstrap
 * master credentials directly or let DocumentDB manage them in Secrets Manager.
 * Provisioning a cluster (and its first instance) takes several minutes.
 *
 * Mutable fields are reconciled in place against the observed cloud state;
 * immutable fields (`engine`, `dbSubnetGroupName`, `storageEncrypted`,
 * `kmsKeyId`, `globalClusterIdentifier`, `availabilityZones`,
 * `masterUsername`) force a replacement.
 * ### Creating a Cluster
 * **Example:** DocumentDB cluster with a managed master secret
 * ```typescript
 * const cluster = yield* DBCluster("Docs", {
 *   dbSubnetGroupName: subnetGroup.dbSubnetGroupName,
 *   vpcSecurityGroupIds: [sg.groupId],
 *   masterUsername: "alchemy",
 *   manageMasterUserPassword: true,
 *   backupRetentionPeriod: "7 days",
 *   deletionProtection: false,
 * });
 * ```
 *
 * ### Logs & Encryption
 * **Example:** Export audit logs and encrypt storage
 * ```typescript
 * const cluster = yield* DBCluster("Docs", {
 *   dbSubnetGroupName: subnetGroup.dbSubnetGroupName,
 *   masterUsername: "alchemy",
 *   masterUserPassword: Redacted.make("supersecret"),
 *   storageEncrypted: true,
 *   enableCloudwatchLogsExports: ["audit", "profiler"],
 * });
 * ```
 *
 * @resource
 */
export declare const DBCluster: import("../../Resource.ts").ResourceClass<DBCluster>;
export declare const DBClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<DBCluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBCluster.d.ts.map