import * as rds from "@distilled.cloud/aws/rds";
import type * as Duration from "effect/Duration";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DBClusterProps {
    /**
     * Cluster identifier. If omitted, Alchemy generates one.
     */
    dbClusterIdentifier?: string;
    /**
     * Aurora engine, such as `aurora-postgresql`.
     */
    engine: string;
    /**
     * Optional engine version.
     */
    engineVersion?: string;
    /**
     * Optional database name created with the cluster.
     */
    databaseName?: string;
    /**
     * Subnet group used by the cluster.
     */
    dbSubnetGroupName?: string;
    /**
     * Cluster parameter group name.
     */
    dbClusterParameterGroupName?: string;
    /**
     * Security groups attached to the cluster.
     */
    vpcSecurityGroupIds?: string[];
    /**
     * Optional listener port.
     */
    port?: number;
    /**
     * Enable IAM database authentication.
     */
    enableIAMDatabaseAuthentication?: boolean;
    /**
     * Enable Aurora Data API / HTTP endpoint support.
     */
    enableHttpEndpoint?: boolean;
    /**
     * Engine mode, for example `provisioned` or `serverless`.
     * Changing it forces replacement unless `AllowEngineModeChange` applies.
     */
    engineMode?: string;
    /**
     * Serverless v2 scaling configuration.
     */
    serverlessV2ScalingConfiguration?: rds.ServerlessV2ScalingConfiguration;
    /**
     * Serverless v1 scaling configuration. In-place modify.
     */
    scalingConfiguration?: rds.ScalingConfiguration;
    /**
     * Availability zones for cluster placement. Immutable — forces replacement.
     */
    availabilityZones?: string[];
    /**
     * Backup retention period (e.g. `"7 days"` or `Duration.days(7)`).
     * Sent to the API in whole days. In-place modify.
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
     * Backtrack window (Aurora MySQL only), e.g. `"1 hour"`. Sent to the API
     * in whole seconds. In-place modify.
     */
    backtrackWindow?: Duration.Input;
    /**
     * Option group name. In-place modify.
     */
    optionGroupName?: string;
    /**
     * Log types to export to CloudWatch Logs. Diffed against observed state and
     * applied via the delta-shaped `CloudwatchLogsExportConfiguration` on modify.
     */
    enableCloudwatchLogsExports?: string[];
    /**
     * Auto minor version upgrade. In-place modify.
     */
    autoMinorVersionUpgrade?: boolean;
    /**
     * Allow a major engine-version upgrade during a modify. Modify-only flag.
     */
    allowMajorVersionUpgrade?: boolean;
    /**
     * Enhanced-monitoring granularity (e.g. `"60 seconds"`). Sent to the API
     * in whole seconds (valid: 0, 1, 5, 10, 15, 30, 60). In-place modify.
     */
    monitoringInterval?: Duration.Input;
    /**
     * IAM role ARN for enhanced monitoring. In-place modify.
     */
    monitoringRoleArn?: string;
    /**
     * Enable Performance Insights. In-place modify.
     */
    enablePerformanceInsights?: boolean;
    /**
     * KMS key for Performance Insights. In-place modify.
     */
    performanceInsightsKMSKeyId?: string;
    /**
     * Performance Insights retention (e.g. `"7 days"`). Sent to the API in
     * whole days (valid: 7, 731, or month multiples). In-place modify.
     */
    performanceInsightsRetentionPeriod?: Duration.Input;
    /**
     * Network type: `IPV4` | `DUAL`. In-place modify.
     */
    networkType?: string;
    /**
     * CA certificate identifier. In-place modify.
     */
    caCertificateIdentifier?: string;
    /**
     * KMS key used to encrypt the managed master user secret. In-place modify.
     */
    masterUserSecretKmsKeyId?: string;
    /**
     * Rotate the managed master user password on the next reconcile.
     */
    rotateMasterUserPassword?: boolean;
    /**
     * Enable global write forwarding (secondary regions of a global cluster).
     */
    enableGlobalWriteForwarding?: boolean;
    /**
     * Enable local write forwarding (Aurora reader endpoints). In-place modify.
     */
    enableLocalWriteForwarding?: boolean;
    /**
     * Join this cluster to an Aurora global cluster. Immutable on create.
     */
    globalClusterIdentifier?: string;
    /**
     * Instance class for a provisioned multi-AZ cluster. In-place modify.
     */
    dbClusterInstanceClass?: string;
    /**
     * Allocated storage (GiB) for a provisioned multi-AZ cluster. In-place.
     */
    allocatedStorage?: number;
    /**
     * Storage type (provisioned multi-AZ cluster). In-place modify.
     */
    storageType?: string;
    /**
     * Provisioned IOPS (provisioned multi-AZ cluster). In-place modify.
     */
    iops?: number;
    /**
     * Whether a provisioned cluster is publicly reachable. In-place modify.
     */
    publiclyAccessible?: boolean;
    /**
     * Engine lifecycle support setting. Immutable — forces replacement.
     */
    engineLifecycleSupport?: string;
    /**
     * Whether to copy tags to snapshots.
     */
    copyTagsToSnapshot?: boolean;
    /**
     * Whether to block accidental deletion.
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
     * Let RDS manage the master user password in Secrets Manager.
     */
    manageMasterUserPassword?: boolean;
    /**
     * Explicit master username when not deriving credentials from a secret.
     */
    masterUsername?: string;
    /**
     * Explicit master password when not deriving credentials from a secret.
     */
    masterUserPassword?: Redacted.Redacted<string>;
    /**
     * Existing Secrets Manager secret ARN whose JSON payload contains
     * `username` and `password`.
     */
    masterUserSecretArn?: string;
    /**
     * User-defined tags.
     */
    tags?: Record<string, string>;
}
export interface DBCluster extends Resource<"AWS.RDS.DBCluster", DBClusterProps, {
    /**
     * Identifier of the cluster.
     */
    dbClusterIdentifier: string;
    /**
     * ARN of the cluster.
     */
    dbClusterArn: string;
    /**
     * Subnet group the cluster is placed in.
     */
    dbSubnetGroupName: string | undefined;
    /**
     * Writer endpoint DNS address.
     */
    endpoint: string | undefined;
    /**
     * Load-balanced reader endpoint DNS address.
     */
    readerEndpoint: string | undefined;
    /**
     * Port the database listens on.
     */
    port: number | undefined;
    /**
     * Database engine (e.g. `aurora-postgresql`).
     */
    engine: string;
    /**
     * Engine version in use.
     */
    engineVersion: string | undefined;
    /**
     * Status of the cluster (e.g. `available`).
     */
    status: string | undefined;
    /**
     * Name of the initial database.
     */
    databaseName: string | undefined;
    /**
     * Master username.
     */
    masterUsername: string | undefined;
    /**
     * ARN of the Secrets Manager secret holding master credentials.
     */
    masterUserSecretArn: string | undefined;
    /**
     * Security groups attached to the cluster.
     */
    vpcSecurityGroupIds: string[];
    /**
     * Whether the Data API HTTP endpoint is enabled.
     */
    httpEndpointEnabled: boolean | undefined;
    /**
     * Allocated storage in GiB (provisioned engines).
     */
    allocatedStorage: number | undefined;
    /**
     * Backup retention period in days.
     */
    backupRetentionPeriod: number | undefined;
    /**
     * Daily backup window (`hh:mm-hh:mm` UTC).
     */
    preferredBackupWindow: string | undefined;
    /**
     * Weekly maintenance window.
     */
    preferredMaintenanceWindow: string | undefined;
    /**
     * Whether storage is encrypted.
     */
    storageEncrypted: boolean | undefined;
    /**
     * KMS key used for storage encryption.
     */
    kmsKeyId: string | undefined;
    /**
     * Whether deletion protection is enabled.
     */
    deletionProtection: boolean | undefined;
    /**
     * Whether IAM database authentication is enabled.
     */
    iamDatabaseAuthenticationEnabled: boolean | undefined;
    /**
     * Engine mode (e.g. `provisioned`).
     */
    engineMode: string | undefined;
    /**
     * Member instances with their writer flag and promotion tier.
     */
    dbClusterMembers: Array<{
        dbInstanceIdentifier: string | undefined;
        isClusterWriter: boolean | undefined;
        promotionTier: number | undefined;
    }>;
    /**
     * Immutable region-unique cluster resource ID (used in IAM auth ARNs).
     */
    dbClusterResourceId: string | undefined;
    /**
     * Route 53 hosted zone ID of the cluster endpoints.
     */
    hostedZoneId: string | undefined;
    /**
     * Whether the cluster has instances in multiple AZs.
     */
    multiAZ: boolean | undefined;
    /**
     * Log types exported to CloudWatch Logs.
     */
    enabledCloudwatchLogsExports: string[];
    /**
     * Whether cluster tags are copied to snapshots.
     */
    copyTagsToSnapshot: boolean | undefined;
    /**
     * Time the cluster was created (ISO 8601).
     */
    clusterCreateTime: string | undefined;
    /**
     * Serverless v2 platform version.
     */
    serverlessV2PlatformVersion: string | undefined;
    /**
     * Enhanced-monitoring granularity in seconds.
     */
    monitoringInterval: number | undefined;
    /**
     * Whether Performance Insights is enabled.
     */
    performanceInsightsEnabled: boolean | undefined;
    /**
     * Instance class for Multi-AZ DB clusters.
     */
    dbClusterInstanceClass: string | undefined;
    /**
     * Storage type (e.g. `aurora`, `aurora-iopt1`).
     */
    storageType: string | undefined;
    /**
     * Provisioned IOPS (Multi-AZ DB clusters).
     */
    iops: number | undefined;
    /**
     * Network type (`IPV4` or `DUAL`).
     */
    networkType: string | undefined;
    /**
     * Custom endpoint ARNs associated with the cluster.
     */
    customEndpoints: string[];
    /**
     * Tags on the cluster.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Aurora DB cluster.
 *
 * `DBCluster` owns the writer and reader endpoints, cluster-wide networking,
 * and Data API enablement. It can bootstrap master credentials directly or by
 * reading a Secrets Manager secret that contains `username` and `password`.
 *
 * It exposes the full backup, maintenance, monitoring, performance-insights,
 * encryption, scaling, and log-export surface of `createDBCluster` /
 * `modifyDBCluster`. Mutable fields are reconciled in place against the
 * observed cloud state; immutable fields (`engine`, `databaseName`,
 * `dbSubnetGroupName`, `storageEncrypted`, `kmsKeyId`, `engineMode`,
 * `globalClusterIdentifier`, `availabilityZones`, `engineLifecycleSupport`)
 * force a replacement.
 * ### Serverless v2 Cluster
 * **Example:** Aurora Postgres serverless-v2
 * ```typescript
 * const cluster = yield* DBCluster("Cluster", {
 *   engine: "aurora-postgresql",
 *   engineMode: "provisioned",
 *   serverlessV2ScalingConfiguration: { MinCapacity: 0.5, MaxCapacity: 4 },
 *   manageMasterUserPassword: true,
 *   masterUsername: "alchemy",
 *   backupRetentionPeriod: "7 days",
 *   deletionProtection: false,
 * });
 * ```
 *
 * ### Logs & Monitoring
 * **Example:** Export logs and enable Performance Insights
 * ```typescript
 * const cluster = yield* DBCluster("Cluster", {
 *   engine: "aurora-postgresql",
 *   enableCloudwatchLogsExports: ["postgresql"],
 *   enablePerformanceInsights: true,
 *   monitoringInterval: "60 seconds",
 *   monitoringRoleArn: monitoringRole.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const DBCluster: import("../../Resource.ts").ResourceClass<DBCluster>;
export declare const DBClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<DBCluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBCluster.d.ts.map