import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SubnetGroupProps {
    /**
     * Name of the subnet group. Must be 1-255 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * subnet group.
     */
    subnetGroupName?: string;
    /**
     * Human-readable description of the subnet group.
     */
    description?: string;
    /**
     * VPC subnet IDs the subnet group spans. DAX places cluster nodes into
     * these subnets; cover at least two Availability Zones for a multi-node
     * cluster.
     */
    subnetIds: string[];
}
export interface SubnetGroup extends Resource<"AWS.DAX.SubnetGroup", SubnetGroupProps, {
    /** Name of the subnet group. */
    subnetGroupName: string;
    /** Description of the subnet group. */
    description: string | undefined;
    /** ID of the VPC the subnets belong to. */
    vpcId: string | undefined;
    /** IDs of the subnets in the group. */
    subnetIds: string[];
}, never, Providers> {
}
/**
 * A DAX subnet group — the set of VPC subnets a DAX cluster's nodes are
 * placed into.
 *
 * Subnet groups are free and provision instantly. A {@link Cluster}
 * references one by name via `subnetGroupName`. DAX does not support tags on
 * subnet groups.
 * ### Creating a Subnet Group
 * **Example:** Subnet Group Spanning Two Subnets
 * ```typescript
 * const subnetGroup = yield* SubnetGroup("DaxSubnets", {
 *   description: "DAX cluster subnets",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * ### Placing a Cluster
 * **Example:** Cluster in the Subnet Group
 * ```typescript
 * const cluster = yield* Cluster("Cache", {
 *   nodeType: "dax.t3.small",
 *   replicationFactor: 1,
 *   iamRoleArn: role.roleArn,
 *   subnetGroupName: subnetGroup.subnetGroupName,
 * });
 * ```
 *
 * @resource
 */
export declare const SubnetGroup: import("../../Resource.ts").ResourceClass<SubnetGroup>;
export declare const SubnetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<SubnetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SubnetGroup.d.ts.map