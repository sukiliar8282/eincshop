import * as dax from "@distilled.cloud/aws/dax";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ClusterProps {
    /**
     * Name of the cluster. Must be 1-20 alphanumeric characters or hyphens.
     * If omitted, a deterministic physical name is generated. Changing the
     * name replaces the cluster.
     */
    clusterName?: string;
    /**
     * Compute and memory capacity of the nodes, e.g. `"dax.t3.small"` (the
     * cheapest supported node type) or `"dax.r5.large"`. Changing the node
     * type replaces the cluster.
     * @default "dax.t3.small"
     */
    nodeType?: string;
    /**
     * Number of nodes in the cluster (1 = a single node; 2+ = one primary
     * plus read replicas). AWS recommends at least 3 nodes (spanning multiple
     * Availability Zones) for production. Updated in place via
     * IncreaseReplicationFactor / DecreaseReplicationFactor.
     * @default 1
     */
    replicationFactor?: number;
    /**
     * ARN of the IAM role that DAX assumes to access DynamoDB tables on your
     * behalf. The role's trust policy must allow `dax.amazonaws.com` to assume
     * it. Changing the role replaces the cluster.
     */
    iamRoleArn: string;
    /**
     * Human-readable description of the cluster.
     */
    description?: string;
    /**
     * Availability Zones the nodes are placed into. Must be a subset of the
     * AZs covered by the subnet group and match `replicationFactor` in length
     * when provided. Changing the AZs replaces the cluster.
     * @default DAX spreads nodes across the subnet group's AZs
     */
    availabilityZones?: string[];
    /**
     * Name of the {@link SubnetGroup} the cluster's nodes are placed into.
     * Changing the subnet group replaces the cluster.
     * @default the default DAX subnet group
     */
    subnetGroupName?: string;
    /**
     * VPC security groups that control network access to the cluster
     * endpoint.
     * @default the VPC's default security group
     */
    securityGroupIds?: string[];
    /**
     * Weekly maintenance window, e.g. `"sun:23:00-mon:01:30"` (UTC).
     */
    preferredMaintenanceWindow?: string;
    /**
     * SNS topic ARN to publish cluster events to.
     */
    notificationTopicArn?: string;
    /**
     * Name of the {@link ParameterGroup} applied to the cluster.
     * @default the default DAX parameter group
     */
    parameterGroupName?: string;
    /**
     * Whether server-side encryption (encryption at rest) is enabled.
     * Changing this replaces the cluster.
     * @default false
     */
    sseEnabled?: boolean;
    /**
     * Encryption in transit for the cluster endpoint — `"NONE"` or `"TLS"`.
     * Changing this replaces the cluster.
     * @default "NONE"
     */
    clusterEndpointEncryptionType?: dax.ClusterEndpointEncryptionType;
    /**
     * IP address type — `"ipv4"`, `"ipv6"` or `"dual_stack"`. Changing this
     * replaces the cluster.
     * @default "ipv4"
     */
    networkType?: dax.NetworkType;
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.DAX.Cluster", ClusterProps, {
    /** Name of the DAX cluster. */
    clusterName: string;
    /** ARN of the DAX cluster. */
    clusterArn: string;
    /** Current cluster status (e.g. `available`, `creating`). */
    status: string;
    /** Compute/memory node type of the cluster's nodes. */
    nodeType: string;
    /** Total number of nodes in the cluster. */
    totalNodes: number | undefined;
    /** Number of nodes currently in `available` status. */
    activeNodes: number | undefined;
    /** Hostname of the cluster discovery endpoint. */
    discoveryEndpointAddress: string | undefined;
    /** Port of the cluster discovery endpoint. */
    discoveryEndpointPort: number | undefined;
    /** Full `dax://` (or `daxs://` for TLS) discovery endpoint URL clients connect to. */
    discoveryEndpointUrl: string | undefined;
    /** Name of the subnet group the cluster's nodes are placed into. */
    subnetGroupName: string | undefined;
    /** ARN of the IAM role DAX assumes to reach DynamoDB. */
    iamRoleArn: string | undefined;
    /** Name of the parameter group attached to the cluster. */
    parameterGroupName: string | undefined;
    /** Security group IDs attached to the cluster's nodes. */
    securityGroupIds: string[];
    /** Endpoint encryption in transit (`NONE` or `TLS`). */
    clusterEndpointEncryptionType: string | undefined;
    /** Current tags on the cluster. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon DAX cluster — a fully managed, in-memory write-through cache for
 * DynamoDB.
 *
 * Clusters are VPC-only and take roughly 5-10 minutes to provision; they are
 * billed per node-hour while they exist. Place them in a {@link SubnetGroup}
 * and give them an IAM role that DAX assumes to reach DynamoDB. Destroy
 * clusters you are not using.
 * ### Creating a Cluster
 * **Example:** Single-Node Development Cluster
 * ```typescript
 * const role = yield* IAM.Role("DaxRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "dax.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: ["arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess"],
 * });
 * const subnetGroup = yield* SubnetGroup("DaxSubnets", {
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * const cluster = yield* Cluster("Cache", {
 *   nodeType: "dax.t3.small",
 *   replicationFactor: 1,
 *   iamRoleArn: role.roleArn,
 *   subnetGroupName: subnetGroup.subnetGroupName,
 * });
 * ```
 *
 * ### Encryption
 * **Example:** Cluster with Encryption At Rest and In Transit
 * ```typescript
 * const cluster = yield* Cluster("SecureCache", {
 *   nodeType: "dax.t3.small",
 *   replicationFactor: 3,
 *   iamRoleArn: role.roleArn,
 *   subnetGroupName: subnetGroup.subnetGroupName,
 *   sseEnabled: true,
 *   clusterEndpointEncryptionType: "TLS",
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map