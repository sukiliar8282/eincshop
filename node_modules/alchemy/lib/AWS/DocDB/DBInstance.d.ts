import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBInstanceProps {
    /**
     * Instance identifier. If omitted, Alchemy generates one.
     */
    dbInstanceIdentifier?: string;
    /**
     * DocumentDB cluster the instance belongs to. Required — every DocumentDB
     * instance is a cluster member. Immutable — forces replacement.
     */
    dbClusterIdentifier: string;
    /**
     * Instance class such as `db.r6g.large` or `db.t3.medium`. In-place modify.
     */
    dbInstanceClass: string;
    /**
     * Database engine. DocumentDB only supports `docdb`.
     * Changing the engine forces replacement.
     * @default "docdb"
     */
    engine?: string;
    /**
     * Availability zone. Immutable — forces replacement.
     */
    availabilityZone?: string;
    /**
     * Weekly maintenance window, e.g. `Mon:00:00-Mon:03:00`. In-place modify.
     */
    preferredMaintenanceWindow?: string;
    /**
     * Auto minor version upgrades. In-place modify.
     */
    autoMinorVersionUpgrade?: boolean;
    /**
     * Promotion tier inside the cluster (0-15). In-place modify.
     */
    promotionTier?: number;
    /**
     * Enable Performance Insights. In-place modify.
     */
    enablePerformanceInsights?: boolean;
    /**
     * KMS key for Performance Insights. In-place modify.
     */
    performanceInsightsKMSKeyId?: string;
    /**
     * CA certificate identifier. In-place modify.
     */
    caCertificateIdentifier?: string;
    /**
     * Copy tags to snapshots. In-place modify.
     */
    copyTagsToSnapshot?: boolean;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBInstance extends Resource<"AWS.DocDB.DBInstance", DBInstanceProps, {
    /** The instance identifier (unique per account/region). */
    dbInstanceIdentifier: string;
    /** The ARN of the instance. */
    dbInstanceArn: string;
    /** The cluster this instance belongs to. */
    dbClusterIdentifier: string | undefined;
    /** The instance endpoint hostname. */
    endpointAddress: string | undefined;
    /** The port the instance accepts connections on. */
    endpointPort: number | undefined;
    /** The compute class of the instance, e.g. `db.t3.medium`. */
    dbInstanceClass: string | undefined;
    /** The database engine (`docdb`). */
    engine: string | undefined;
    /** The engine version running on the instance. */
    engineVersion: string | undefined;
    /** The current status of the instance, e.g. `available`. */
    status: string | undefined;
    /** The failover promotion tier of the instance. */
    promotionTier: number | undefined;
    /** Whether the instance is publicly accessible. */
    publiclyAccessible: boolean | undefined;
    /** The DB subnet group the instance is deployed into. */
    dbSubnetGroupName: string | undefined;
    /** The Availability Zone the instance runs in. */
    availabilityZone: string | undefined;
    /** The weekly window during which maintenance can occur. */
    preferredMaintenanceWindow: string | undefined;
    /** Number of days automated backups are retained (cluster-managed). */
    backupRetentionPeriod: number | undefined;
    /** The KMS key used for storage encryption. */
    kmsKeyId: string | undefined;
    /** Whether storage is encrypted at rest. */
    storageEncrypted: boolean | undefined;
    /** The CA certificate identifier used by the instance. */
    caCertificateIdentifier: string | undefined;
    /** Whether Performance Insights is enabled. */
    performanceInsightsEnabled: boolean | undefined;
    /** The log types exported to CloudWatch Logs. */
    enabledCloudwatchLogsExports: string[];
    /** The immutable region-unique resource ID of the instance. */
    dbiResourceId: string | undefined;
    /** Whether minor engine upgrades apply automatically. */
    autoMinorVersionUpgrade: boolean | undefined;
    /** Whether instance tags are copied to snapshots. */
    copyTagsToSnapshot: boolean | undefined;
    /** The tags attached to the instance. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon DocumentDB instance — a compute member of a DocumentDB
 * {@link DBCluster}. Storage, backup, and endpoints are managed at the cluster
 * level; the instance contributes CPU/RAM and can serve as a writer or reader.
 * Provisioning takes several minutes.
 *
 * Mutable fields (`dbInstanceClass`, `promotionTier`, maintenance window,
 * monitoring) are reconciled in place; immutable fields (`engine`,
 * `dbClusterIdentifier`, `availabilityZone`) force a replacement.
 * ### Adding an Instance
 * **Example:** A DocumentDB writer instance
 * ```typescript
 * const writer = yield* DBInstance("Writer", {
 *   dbClusterIdentifier: cluster.dbClusterIdentifier,
 *   dbInstanceClass: "db.t3.medium",
 * });
 * ```
 *
 * @resource
 */
export declare const DBInstance: import("../../Resource.ts").ResourceClass<DBInstance>;
export declare const DBInstanceProvider: () => import("effect/Layer").Layer<Provider.Provider<DBInstance>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBInstance.d.ts.map