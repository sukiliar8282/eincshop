import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { Input } from "../../Input.ts";
import type { SecurityGroupId } from "../EC2/SecurityGroup.ts";
import type { SubnetId } from "../EC2/Subnet.ts";
import * as IAM from "../IAM/index.ts";
import { type GenerateSecretStringProps, type SecretProps, type Secret as SecretResource } from "../SecretsManager/Secret.ts";
import { type DBClusterProps, type DBCluster as DBClusterResource } from "./DBCluster.ts";
import { type DBClusterParameterGroupProps, type DBClusterParameterGroup as DBClusterParameterGroupResource } from "./DBClusterParameterGroup.ts";
import { type DBInstanceProps, type DBInstance as DBInstanceResource } from "./DBInstance.ts";
import { type DBParameterGroupProps, type DBParameterGroup as DBParameterGroupResource } from "./DBParameterGroup.ts";
import { type DBProxyProps, type DBProxy as DBProxyResource } from "./DBProxy.ts";
import { type DBProxyEndpointProps, type DBProxyEndpoint as DBProxyEndpointResource } from "./DBProxyEndpoint.ts";
import { type DBProxyTargetGroupProps, type DBProxyTargetGroup as DBProxyTargetGroupResource } from "./DBProxyTargetGroup.ts";
import { type DBSubnetGroupProps, type DBSubnetGroup as DBSubnetGroupResource } from "./DBSubnetGroup.ts";
export interface AuroraSecretProps extends Omit<SecretProps, "secretString" | "secretBinary" | "generateSecretString"> {
    /**
     * Existing secret to reuse instead of creating one.
     */
    resource?: SecretResource;
    /**
     * Master username written into a generated secret payload.
     * @default "app"
     */
    username?: string;
    /**
     * Optional explicit JSON/string secret payload.
     */
    secretString?: Redacted.Redacted<string>;
    /**
     * Optional explicit binary secret payload.
     */
    secretBinary?: Redacted.Redacted<Uint8Array<ArrayBufferLike>>;
    /**
     * Password generation settings for the created secret.
     */
    generateSecretString?: GenerateSecretStringProps;
}
export interface AuroraProxyProps extends Omit<DBProxyProps, "engineFamily" | "auth" | "roleArn" | "vpcSubnetIds"> {
    /**
     * Override the default proxy auth config.
     */
    auth?: DBProxyProps["auth"];
    /**
     * Additional target-group configuration for the default proxy target group.
     */
    targetGroup?: Omit<DBProxyTargetGroupProps, "dbProxyName" | "dbClusterIdentifiers">;
    /**
     * Optional extra endpoint to create for the proxy.
     * Use `true` for sensible defaults.
     */
    endpoint?: true | Omit<DBProxyEndpointProps, "dbProxyName" | "vpcSubnetIds">;
}
export interface AuroraProps {
    /**
     * Database name created in the cluster.
     * @default "app"
     */
    databaseName?: string;
    /**
     * Aurora engine.
     * @default "aurora-postgresql"
     */
    engine?: string;
    /**
     * Optional engine version.
     */
    engineVersion?: string;
    /**
     * Subnets for the cluster and optional proxy.
     */
    subnetIds: Input<SubnetId[]>;
    /**
     * Security groups attached to the cluster and instance.
     */
    securityGroupIds: Input<SecurityGroupId[]>;
    /**
     * Number of read replicas to create alongside the writer.
     * @default 0
     */
    readers?: number;
    /**
     * Cluster-wide tags applied to all created resources by default.
     */
    tags?: Record<string, Input<string>>;
    /**
     * Tune the generated or reused admin secret.
     */
    secret?: AuroraSecretProps;
    /**
     * Override subnet group creation.
     */
    subnetGroup?: Omit<DBSubnetGroupProps, "subnetIds">;
    /**
     * Optional cluster parameter group.
     */
    clusterParameterGroup?: Omit<DBClusterParameterGroupProps, "family"> & {
        family: string;
    };
    /**
     * Optional instance parameter group.
     */
    parameterGroup?: Omit<DBParameterGroupProps, "family"> & {
        family: string;
    };
    /**
     * Tune the Aurora cluster resource.
     */
    cluster?: Omit<DBClusterProps, "engine" | "engineVersion" | "databaseName" | "dbSubnetGroupName" | "dbClusterParameterGroupName" | "vpcSecurityGroupIds" | "masterUserSecretArn" | "masterUsername" | "masterUserPassword" | "tags"> & {
        tags?: Record<string, Input<string>>;
    };
    /**
     * Tune the writer/readers.
     */
    instance?: Omit<DBInstanceProps, "dbClusterIdentifier" | "engine" | "engineVersion" | "dbSubnetGroupName" | "dbParameterGroupName" | "vpcSecurityGroupIds" | "tags"> & {
        tags?: Record<string, Input<string>>;
    };
    /**
     * Whether to enable the Aurora Data API.
     * @default true
     */
    dataApi?: boolean;
    /**
     * Backup retention period (e.g. `"7 days"`), forwarded to the cluster.
     */
    backupRetentionPeriod?: Duration.Input;
    /**
     * Daily backup window (`hh:mm-hh:mm` UTC), forwarded to the cluster.
     */
    preferredBackupWindow?: string;
    /**
     * Weekly maintenance window, forwarded to the cluster.
     */
    preferredMaintenanceWindow?: string;
    /**
     * Encrypt cluster storage. Forwarded to the cluster.
     */
    storageEncrypted?: boolean;
    /**
     * KMS key for storage encryption. Forwarded to the cluster.
     */
    kmsKeyId?: string;
    /**
     * Enable IAM database authentication. Forwarded to the cluster.
     */
    enableIAMDatabaseAuthentication?: boolean;
    /**
     * Log types to export to CloudWatch Logs. Forwarded to the cluster.
     */
    enableCloudwatchLogsExports?: string[];
    /**
     * Block accidental deletion. Forwarded to the cluster and instances.
     * @default false
     */
    deletionProtection?: boolean;
    /**
     * CA certificate identifier. Forwarded to the cluster.
     */
    caCertificateIdentifier?: string;
    /**
     * Listener port. Forwarded to the cluster.
     */
    port?: number;
    /**
     * Aurora MySQL backtrack window (e.g. `"1 hour"`). Forwarded to the
     * cluster.
     */
    backtrackWindow?: Duration.Input;
    /**
     * Enhanced-monitoring + Performance Insights settings. Forwarded to the
     * cluster (and the enhanced-monitoring role to the instances).
     */
    monitoring?: {
        /**
         * Enhanced-monitoring granularity (e.g. `"60 seconds"`). Sent to the
         * API in whole seconds (valid: 0, 1, 5, 10, 15, 30, 60).
         */
        interval?: Duration.Input;
        /**
         * Existing IAM role ARN for enhanced monitoring. When omitted and
         * `interval > 0`, Aurora creates one automatically.
         */
        roleArn?: Input<string>;
        /**
         * Enable Performance Insights on the cluster.
         */
        performanceInsights?: boolean;
    };
    /**
     * Serverless v2 min/max ACUs. Shorthand for
     * `serverlessV2ScalingConfiguration`.
     */
    scaling?: {
        minCapacity?: number;
        maxCapacity?: number;
    };
    /**
     * Provisioned (non-serverless) instance class for the writer/readers, e.g.
     * `db.r6g.large`. Defaults to `db.serverless`.
     */
    instanceClass?: string;
    /**
     * Opt in to an auto-wired RDS Proxy.
     */
    proxy?: boolean | AuroraProxyProps;
}
export interface AuroraDatabase {
    secret: SecretResource;
    subnetGroup: DBSubnetGroupResource;
    clusterParameterGroup?: DBClusterParameterGroupResource;
    parameterGroup?: DBParameterGroupResource;
    cluster: DBClusterResource;
    writer: DBInstanceResource;
    readers: DBInstanceResource[];
    instances: [DBInstanceResource, ...DBInstanceResource[]];
    proxy?: {
        role: IAM.Role;
        proxy: DBProxyResource;
        targetGroup: DBProxyTargetGroupResource;
        endpoint?: DBProxyEndpointResource;
    };
}
/**
 * Opinionated Aurora bring-up helper.
 *
 * `Aurora` is the fast-start L2 for getting a working database online with one
 * call. It creates a generated admin secret, DB subnet group, Aurora cluster,
 * and a single writer instance by default. Optional readers, parameter groups,
 * and an auto-wired RDS Proxy can be enabled as needs grow.
 *
 * The return value intentionally exposes the underlying `DB*` resources so
 * users can expand into the lower-level surface without rewriting the stack.
 * ### Creating a Database
 * **Example:** Start a Small Aurora Cluster
 * ```typescript
 * const db = yield* AWS.RDS.Aurora("AppDb", {
 *   subnetIds: [privateSubnetA.subnetId, privateSubnetB.subnetId],
 *   securityGroupIds: [databaseSecurityGroup.groupId],
 * });
 * ```
 *
 * ### Scaling Out
 * **Example:** Add Readers and a Proxy
 * ```typescript
 * const db = yield* AWS.RDS.Aurora("AppDb", {
 *   subnetIds: [privateSubnetA.subnetId, privateSubnetB.subnetId],
 *   securityGroupIds: [databaseSecurityGroup.groupId],
 *   readers: 2,
 *   proxy: true,
 * });
 * ```
 *
 * ### Querying from a Function
 * **Example:** Query over the Data API
 * ```typescript
 * // the Data API is enabled by default (dataApi: true) — bind
 * // AWS.RDSData.ExecuteStatement to query without a VPC socket
 * const executeStatement = yield* AWS.RDSData.ExecuteStatement(db.cluster, {
 *   secret: db.secret,
 *   database: "app",
 * });
 * const result = yield* executeStatement({ sql: "SELECT 1" });
 * ```
 *
 * @resource
 */
export declare const Aurora: (id: string, props: AuroraProps) => Effect.Effect<AuroraDatabase, never, import("../Providers.ts").Providers>;
//# sourceMappingURL=Aurora.d.ts.map