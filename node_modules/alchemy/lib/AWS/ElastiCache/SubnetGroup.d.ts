import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SubnetGroupProps {
    /** Name of the subnet group. Generated deterministically when omitted. */
    subnetGroupName?: string;
    /** Human-readable description. */
    description: string;
    /** VPC subnet IDs. Use at least two AZs for a highly-available cache. */
    subnetIds: string[];
    /** User-defined tags. */
    tags?: Record<string, string>;
}
export interface SubnetGroup extends Resource<"AWS.ElastiCache.SubnetGroup", SubnetGroupProps, {
    subnetGroupName: string;
    subnetGroupArn: string;
    description: string | undefined;
    vpcId: string | undefined;
    subnetIds: string[];
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A VPC subnet group for provisioned ElastiCache resources.
 *
 * ### Creating a Subnet Group
 * **Example:** Two Availability Zones
 * ```typescript
 * const subnets = yield* SubnetGroup("CacheSubnets", {
 *   description: "cache subnets",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * @resource
 */
export declare const SubnetGroup: import("../../Resource.ts").ResourceClass<SubnetGroup>;
export declare const SubnetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<SubnetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SubnetGroup.d.ts.map