import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SubnetGroupProps {
    /**
     * Name of the subnet group. Must be 1-40 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * subnet group.
     */
    subnetGroupName?: string;
    /**
     * Human-readable description of the subnet group.
     */
    description?: string;
    /**
     * VPC subnet IDs the subnet group spans. MemoryDB places cluster nodes into
     * these subnets, so they should cover at least two Availability Zones for a
     * multi-AZ cluster.
     */
    subnetIds: string[];
    /**
     * User-defined tags for the subnet group.
     */
    tags?: Record<string, string>;
}
export interface SubnetGroup extends Resource<"AWS.MemoryDB.SubnetGroup", SubnetGroupProps, {
    /** Name of the subnet group. */
    subnetGroupName: string;
    /** ARN of the subnet group. */
    subnetGroupArn: string;
    /** Description of the subnet group. */
    description: string | undefined;
    /** ID of the VPC the subnets belong to. */
    vpcId: string | undefined;
    /** IDs of the subnets in the group. */
    subnetIds: string[];
    /** Tags on the subnet group (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A MemoryDB subnet group — the set of VPC subnets a MemoryDB cluster's nodes
 * are placed into.
 *
 * Subnet groups are free and provision instantly. A cluster references one by
 * name via `subnetGroupName`.
 * ### Creating a Subnet Group
 * **Example:** Subnet Group Spanning Two Subnets
 * ```typescript
 * const subnetGroup = yield* SubnetGroup("CacheSubnets", {
 *   description: "MemoryDB cluster subnets",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * @resource
 */
export declare const SubnetGroup: import("../../Resource.ts").ResourceClass<SubnetGroup>;
export declare const SubnetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<SubnetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SubnetGroup.d.ts.map