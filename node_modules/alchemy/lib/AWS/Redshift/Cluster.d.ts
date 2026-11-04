import type * as Duration from "effect/Duration";
import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
declare const RedshiftMasterPasswordRequired_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "RedshiftMasterPasswordRequired";
} & Readonly<A>;
/**
 * Creating a provisioned Redshift cluster requires either a
 * `masterUserPassword` or `manageMasterPassword: true`.
 */
export declare class RedshiftMasterPasswordRequired extends RedshiftMasterPasswordRequired_base<{
    readonly clusterIdentifier: string;
}> {
}
export interface ClusterProps {
    /**
     * Unique identifier of the cluster. Must be 1-63 lowercase alphanumeric
     * characters or hyphens, starting with a letter. If omitted, a
     * deterministic physical name is generated. Changing the identifier
     * replaces the cluster.
     */
    clusterIdentifier?: string;
    /**
     * Node type of the cluster, e.g. `ra3.large`, `ra3.xlplus` or
     * `dc2.large`. Changing the node type triggers an in-place resize.
     * @default "ra3.large"
     */
    nodeType?: string;
    /**
     * Number of compute nodes. `1` provisions a single-node cluster; any
     * larger value provisions a multi-node cluster. Changing the count
     * triggers an in-place resize.
     * @default 1
     */
    numberOfNodes?: number;
    /**
     * Admin username for the cluster database. Changing the username replaces
     * the cluster.
     * @default "awsuser"
     */
    masterUsername?: string;
    /**
     * Admin password. Must be 8-64 characters with at least one uppercase
     * letter, one lowercase letter and one number. Provide this or set
     * `manageMasterPassword`.
     */
    masterUserPassword?: Redacted.Redacted<string>;
    /**
     * Let Amazon Redshift manage the admin password in Secrets Manager
     * instead of supplying `masterUserPassword`. The secret ARN is surfaced
     * as the `masterPasswordSecretArn` attribute.
     * @default false
     */
    manageMasterPassword?: boolean;
    /**
     * Name of the initial database created in the cluster. Changing the
     * database name replaces the cluster.
     * @default "dev"
     */
    dbName?: string;
    /**
     * Name of the {@link ClusterSubnetGroup} the cluster's nodes are placed
     * into. Changing the subnet group replaces the cluster.
     * @default the default cluster subnet group
     */
    clusterSubnetGroupName?: string;
    /**
     * VPC security group IDs that control network access to the cluster
     * endpoint.
     * @default the VPC's default security group
     */
    vpcSecurityGroupIds?: string[];
    /**
     * Name of the {@link ClusterParameterGroup} applied to the cluster.
     * @default the family's default parameter group
     */
    clusterParameterGroupName?: string;
    /**
     * Whether the cluster endpoint is reachable from the public internet.
     * @default false
     */
    publiclyAccessible?: boolean;
    /**
     * Whether data at rest is encrypted. RA3 node types are always encrypted.
     * @default true
     */
    encrypted?: boolean;
    /**
     * Customer-managed KMS key used for encryption at rest.
     * @default AWS-owned Redshift key
     */
    kmsKeyId?: string;
    /**
     * Port the cluster database accepts connections on. Changing the port
     * replaces the cluster.
     * @default 5439
     */
    port?: number;
    /**
     * Availability Zone the cluster is provisioned in. Changing the AZ
     * replaces the cluster.
     * @default chosen by Redshift
     */
    availabilityZone?: string;
    /**
     * Weekly maintenance window, e.g. `sun:05:00-sun:05:30` (UTC).
     */
    preferredMaintenanceWindow?: string;
    /**
     * How long automated snapshots are retained, e.g. `"7 days"` or
     * `Duration.days(7)` (a bare number is milliseconds). Rounded to whole
     * days on the wire; zero disables automated snapshots.
     */
    automatedSnapshotRetentionPeriod?: Duration.Input;
    /**
     * Whether major engine upgrades may be applied during the maintenance
     * window.
     * @default true
     */
    allowVersionUpgrade?: boolean;
    /**
     * Whether enhanced VPC routing forces COPY/UNLOAD traffic through the
     * VPC.
     * @default false
     */
    enhancedVpcRouting?: boolean;
    /**
     * IAM role ARNs the cluster can assume for COPY/UNLOAD and federated
     * queries (max 50).
     */
    iamRoles?: string[];
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.Redshift.Cluster", ClusterProps, {
    /**
     * Unique identifier of the cluster.
     */
    clusterIdentifier: string;
    /**
     * ARN of the cluster.
     */
    clusterArn: string;
    /**
     * ARN of the cluster's namespace (used by datashares and the Data API).
     */
    clusterNamespaceArn: string | undefined;
    /**
     * Current cluster status (e.g. `"available"`).
     */
    clusterStatus: string;
    /**
     * Node type of the cluster (e.g. `"ra3.large"`).
     */
    nodeType: string;
    /**
     * Number of compute nodes in the cluster.
     */
    numberOfNodes: number;
    /**
     * Name of the initial database.
     */
    dbName: string;
    /**
     * Admin (master) user name.
     */
    masterUsername: string | undefined;
    /**
     * DNS address of the cluster endpoint (pgwire host).
     */
    endpointAddress: string | undefined;
    /**
     * Port of the cluster endpoint (5439 by default).
     */
    endpointPort: number | undefined;
    /**
     * ID of the VPC the cluster runs in.
     */
    vpcId: string | undefined;
    /**
     * Availability zone the cluster is placed in.
     */
    availabilityZone: string | undefined;
    /**
     * Name of the cluster subnet group the cluster is placed in, if any.
     */
    clusterSubnetGroupName: string | undefined;
    /**
     * Whether the cluster endpoint is reachable from the public internet.
     */
    publiclyAccessible: boolean | undefined;
    /**
     * Whether the cluster's data is encrypted at rest.
     */
    encrypted: boolean | undefined;
    /**
     * KMS key encrypting the cluster, if any.
     */
    kmsKeyId: string | undefined;
    /**
     * ARN of the Secrets Manager secret holding the admin password when
     * `manageMasterPassword` is enabled.
     */
    masterPasswordSecretArn: string | undefined;
    /**
     * Tags on the cluster (including internal Alchemy tags).
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A provisioned Amazon Redshift data-warehouse cluster.
 *
 * Clusters take roughly 5-10 minutes to provision and are billed hourly per
 * node while they exist (`ra3.large` and `dc2.large` are the smallest node
 * types). For serverless data warehousing see the `RedshiftServerless`
 * namespace instead. Destroy clusters you are not using.
 * ### Creating a Cluster
 * **Example:** Single-Node Cluster
 * ```typescript
 * const cluster = yield* Redshift.Cluster("Warehouse", {
 *   nodeType: "ra3.large",
 *   numberOfNodes: 1,
 *   masterUsername: "admin",
 *   masterUserPassword: warehousePassword,
 *   dbName: "analytics",
 * });
 * ```
 * **Example:** Cluster in a VPC Subnet Group
 * ```typescript
 * const subnetGroup = yield* Redshift.ClusterSubnetGroup("WarehouseSubnets", {
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * const cluster = yield* Redshift.Cluster("Warehouse", {
 *   nodeType: "ra3.large",
 *   numberOfNodes: 2,
 *   masterUsername: "admin",
 *   manageMasterPassword: true,
 *   clusterSubnetGroupName: subnetGroup.clusterSubnetGroupName,
 *   publiclyAccessible: false,
 *   encrypted: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Cluster.d.ts.map