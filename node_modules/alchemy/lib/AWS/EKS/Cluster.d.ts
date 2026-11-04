import * as eks from "@distilled.cloud/aws/eks";
import { type KubernetesObjectBinding, type KubernetesObjectRef } from "../../Kubernetes/internal/objects.ts";
import type { Connection } from "../../Kubernetes/Connection.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AccountID } from "../Environment.ts";
import type { RegionID } from "../Region.ts";
export type ClusterName = string;
export type ClusterArn = `arn:aws:eks:${RegionID}:${AccountID}:cluster/${ClusterName}`;
export interface ClusterProps {
    /**
     * Cluster name. If omitted, a unique name is generated.
     */
    clusterName?: string;
    /**
     * `"auto"` turns on EKS Auto Mode with sensible defaults: managed compute
     * (`system` + `general-purpose` node pools), block storage, elastic load
     * balancing, and `API` authentication with bootstrap admin permissions.
     * When `roleArn` (or `computeConfig.nodeRoleArn`) is omitted, the cluster
     * provisions and owns the required IAM roles with the standard Auto Mode
     * managed policies. Explicit `accessConfig` / `computeConfig` /
     * `storageConfig` / `kubernetesNetworkConfig` props override the defaults.
     */
    compute?: "auto";
    /**
     * IAM role ARN assumed by the EKS control plane. Required unless
     * `compute: "auto"`, in which case an Auto Mode cluster role is created
     * and managed automatically when omitted.
     */
    roleArn?: string;
    /**
     * VPC configuration for the cluster control plane.
     */
    resourcesVpcConfig: eks.VpcConfigRequest;
    /**
     * Desired Kubernetes version.
     */
    version?: string;
    /**
     * Cluster access configuration.
     */
    accessConfig?: eks.CreateAccessConfigRequest;
    /**
     * Auto Mode compute configuration.
     */
    computeConfig?: eks.ComputeConfigRequest;
    /**
     * Auto Mode storage configuration.
     */
    storageConfig?: eks.StorageConfigRequest;
    /**
     * Kubernetes network configuration.
     */
    kubernetesNetworkConfig?: eks.KubernetesNetworkConfigRequest;
    /**
     * Control plane logging configuration.
     */
    logging?: eks.Logging;
    /**
     * Upgrade support policy for the cluster.
     */
    upgradePolicy?: eks.UpgradePolicyRequest;
    /**
     * Whether deletion protection is enabled.
     * @default false
     */
    deletionProtection?: boolean;
    /**
     * User-defined tags to apply to the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.EKS.Cluster", ClusterProps, {
    /** The ARN of the cluster. */
    clusterArn: ClusterArn;
    /** The name of the cluster. */
    clusterName: ClusterName;
    /** The cluster status (e.g. `CREATING`, `ACTIVE`, `UPDATING`). */
    status: string;
    /** The Kubernetes API server endpoint URL. */
    endpoint: string | undefined;
    /** The base64-encoded certificate authority data for the cluster. */
    certificateAuthorityData: string | undefined;
    /** The Kubernetes version the cluster is running (e.g. `1.31`). */
    version: string | undefined;
    /** The EKS platform version of the cluster. */
    platformVersion: string | undefined;
    /** The ARN of the IAM role the EKS control plane assumes. */
    roleArn: string;
    /** The VPC configuration of the cluster (subnets, security groups, endpoint access). */
    resourcesVpcConfig: eks.VpcConfigResponse;
    /** The access configuration (authentication mode, bootstrap admin). */
    accessConfig: eks.AccessConfigResponse | undefined;
    /** The EKS Auto Mode compute configuration, if enabled. */
    computeConfig: eks.ComputeConfigResponse | undefined;
    /** The EKS Auto Mode block storage configuration, if enabled. */
    storageConfig: eks.StorageConfigResponse | undefined;
    /** The Kubernetes network configuration (service CIDR, IP family, elastic load balancing). */
    kubernetesNetworkConfig: eks.KubernetesNetworkConfigResponse | undefined;
    /** The control-plane log types shipped to CloudWatch. */
    logging: eks.Logging | undefined;
    /** The cluster's upgrade policy (support type). */
    upgradePolicy: eks.UpgradePolicyResponse | undefined;
    /** Whether deletion protection is enabled on the cluster. */
    deletionProtection: boolean;
    /** The OIDC identity provider issuer URL for the cluster. */
    oidcIssuer: string | undefined;
    /** The tags applied to the cluster. */
    tags: Record<string, string>;
    /** References to Kubernetes objects applied via `kubernetes` props. */
    kubernetesObjects: KubernetesObjectRef[];
    /**
     * The cluster-agnostic `Kubernetes.Connection` for this cluster.
     * Passing the whole cluster resource as a `Kubernetes.*` workload's
     * `cluster` prop resolves through this — auth uses SigV4 tokens
     * minted from the ambient AWS credentials.
     */
    connection: Connection;
    /** The name of the cluster IAM role created for `compute: "auto"`, if managed by alchemy. */
    managedClusterRoleName: string | undefined;
    /** The name of the node IAM role created for `compute: "auto"`, if managed by alchemy. */
    managedNodeRoleName: string | undefined;
}, KubernetesObjectBinding, Providers> {
}
/**
 * An Amazon EKS cluster with support for EKS Auto Mode settings.
 * ### Creating Clusters
 * **Example:** Auto Mode Cluster (managed roles)
 * ```typescript
 * const cluster = yield* Cluster("AppCluster", {
 *   compute: "auto",
 *   resourcesVpcConfig: {
 *     subnetIds: network.privateSubnetIds,
 *   },
 * });
 * ```
 *
 * **Example:** Auto Mode Cluster from Existing Roles and Subnets
 * ```typescript
 * const cluster = yield* Cluster("AppCluster", {
 *   roleArn: clusterRole.roleArn,
 *   resourcesVpcConfig: {
 *     subnetIds: network.privateSubnetIds,
 *     endpointPublicAccess: true,
 *     endpointPrivateAccess: true,
 *   },
 *   accessConfig: {
 *     authenticationMode: "API",
 *   },
 *   computeConfig: {
 *     enabled: true,
 *     nodeRoleArn: nodeRole.roleArn,
 *     nodePools: ["system", "general-purpose"],
 *   },
 *   kubernetesNetworkConfig: {
 *     elasticLoadBalancing: { enabled: true },
 *   },
 *   storageConfig: {
 *     blockStorage: { enabled: true },
 *   },
 * });
 * ```
 *
 * ### Running Workloads
 * **Example:** Cluster with a Managed Node Group and an Add-on
 * ```typescript
 * const cluster = yield* AWS.EKS.Cluster("AppCluster", {
 *   roleArn: clusterRole.roleArn,
 *   resourcesVpcConfig: { subnetIds: network.privateSubnetIds },
 *   accessConfig: { authenticationMode: "API" },
 * });
 *
 * const nodes = yield* AWS.EKS.Nodegroup("AppNodes", {
 *   clusterName: cluster.clusterName,
 *   nodeRole: nodeRole.roleArn,
 *   subnets: network.privateSubnetIds,
 *   instanceTypes: ["t3.medium"],
 *   scalingConfig: { minSize: 1, maxSize: 2, desiredSize: 1 },
 * });
 *
 * const metricsServer = yield* AWS.EKS.Addon("MetricsServer", {
 *   clusterName: cluster.clusterName,
 *   addonName: "metrics-server",
 * });
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map