import * as eks from "@distilled.cloud/aws/eks";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface NodegroupProps {
    /**
     * Name of the EKS cluster that owns this managed node group.
     */
    clusterName: Input<string>;
    /**
     * Name of the managed node group. If omitted, a unique name is generated.
     */
    nodegroupName?: string;
    /**
     * ARN of the IAM role that provides permissions for the node group's worker
     * nodes (the `NodeInstanceRole`). Changing this replaces the node group.
     */
    nodeRole: Input<string>;
    /**
     * Subnet IDs to launch worker nodes into. Changing this replaces the node
     * group.
     */
    subnets: Input<string>[];
    /**
     * EC2 instance types for the node group. Changing this replaces the node
     * group.
     * @default ["t3.medium"]
     */
    instanceTypes?: string[];
    /**
     * Scaling configuration (min/max/desired node counts). Mutable — updated in
     * place via `updateNodegroupConfig`.
     */
    scalingConfig?: eks.NodegroupScalingConfig;
    /**
     * AMI type for the node group's nodes (e.g. `AL2023_x86_64_STANDARD`,
     * `BOTTLEROCKET_x86_64`). Changing this replaces the node group.
     */
    amiType?: eks.AMITypes;
    /**
     * Capacity type for the node group. Changing this replaces the node group.
     * @default "ON_DEMAND"
     */
    capacityType?: eks.CapacityTypes;
    /**
     * Root device disk size in GiB. Changing this replaces the node group.
     */
    diskSize?: number;
    /**
     * Kubernetes labels applied to the nodes. Mutable — reconciled in place.
     */
    labels?: Record<string, string>;
    /**
     * Kubernetes taints applied to the nodes. Mutable — reconciled in place.
     */
    taints?: eks.Taint[];
    /**
     * Node group update configuration (`maxUnavailable` /
     * `maxUnavailablePercentage`). Mutable — updated in place.
     */
    updateConfig?: eks.NodegroupUpdateConfig;
    /**
     * Remote SSH access configuration. Changing this replaces the node group.
     */
    remoteAccess?: eks.RemoteAccessConfig;
    /**
     * Kubernetes version for the node group. Mutable — upgraded in place via
     * `updateNodegroupVersion`.
     */
    version?: string;
    /**
     * AMI release version for the node group. Mutable — upgraded in place.
     */
    releaseVersion?: string;
    /**
     * User-defined tags to apply to the node group.
     */
    tags?: Record<string, string>;
}
export interface Nodegroup extends Resource<"AWS.EKS.Nodegroup", NodegroupProps, {
    /** The name of the node group. */
    nodegroupName: string;
    /** The ARN of the node group. */
    nodegroupArn: string;
    /** The name of the EKS cluster the node group belongs to. */
    clusterName: string;
    /** The node group status (e.g. `CREATING`, `ACTIVE`, `UPDATING`). */
    status: eks.NodegroupStatus;
    /** The capacity type (`ON_DEMAND`, `SPOT`, or `CAPACITY_BLOCK`). */
    capacityType: eks.CapacityTypes | undefined;
    /** The scaling configuration (min/max/desired size). */
    scalingConfig: eks.NodegroupScalingConfig | undefined;
    /** The EC2 instance types the node group launches. */
    instanceTypes: string[];
    /** The IDs of the subnets nodes are launched into. */
    subnets: string[];
    /** The AMI type of the nodes (e.g. `AL2023_x86_64_STANDARD`). */
    amiType: eks.AMITypes | undefined;
    /** The ARN of the IAM role attached to the nodes. */
    nodeRole: string;
    /** The Kubernetes labels applied to nodes in the group. */
    labels: Record<string, string>;
    /** The Kubernetes taints applied to nodes in the group. */
    taints: eks.Taint[];
    /** The root device disk size in GiB, when not using a launch template. */
    diskSize: number | undefined;
    /** The Kubernetes version of the node group. */
    version: string | undefined;
    /** The AMI release version of the node group. */
    releaseVersion: string | undefined;
    /** The rolling-update configuration (max unavailable). */
    updateConfig: eks.NodegroupUpdateConfig | undefined;
    /** The tags applied to the node group. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon EKS managed node group — an EC2 Auto Scaling group of worker nodes
 * managed by EKS for a cluster.
 *
 * Managed node groups provide the compute capacity a non-Auto-Mode EKS cluster
 * needs to run pods. Creation is asynchronous (`CREATING` → `ACTIVE`, ~2–5 min)
 * and the provider waits for the group to become `ACTIVE` before returning.
 * Scaling, labels, taints, update config, and version are mutable in place;
 * subnets, instance types, AMI type, disk size, node role, capacity type, and
 * remote access are immutable and force a replacement.
 * ### Creating Node Groups
 * **Example:** Managed Node Group
 * ```typescript
 * const nodes = yield* Nodegroup("AppNodes", {
 *   clusterName: cluster.clusterName,
 *   nodeRole: nodeRole.roleArn,
 *   subnets: network.privateSubnetIds,
 *   instanceTypes: ["t3.medium"],
 *   scalingConfig: { minSize: 1, maxSize: 3, desiredSize: 2 },
 * });
 * ```
 *
 * **Example:** Spot Node Group with Labels and Taints
 * ```typescript
 * const spot = yield* Nodegroup("SpotNodes", {
 *   clusterName: cluster.clusterName,
 *   nodeRole: nodeRole.roleArn,
 *   subnets: network.privateSubnetIds,
 *   capacityType: "SPOT",
 *   instanceTypes: ["t3.large", "t3a.large"],
 *   scalingConfig: { minSize: 0, maxSize: 5, desiredSize: 1 },
 *   labels: { workload: "batch" },
 *   taints: [{ key: "spot", value: "true", effect: "NO_SCHEDULE" }],
 * });
 * ```
 *
 * @resource
 */
export declare const Nodegroup: import("../../Resource.ts").ResourceClass<Nodegroup>;
export declare const NodegroupProvider: () => import("effect/Layer").Layer<Provider.Provider<Nodegroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Nodegroup.d.ts.map