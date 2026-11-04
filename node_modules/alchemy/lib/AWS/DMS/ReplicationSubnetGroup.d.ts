import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ReplicationSubnetGroupProps {
    /**
     * Subnet-group identifier. Must be lowercase, 1-255 characters, and cannot
     * be the reserved value `default`. If omitted, a deterministic physical
     * name is generated. Changing it replaces the subnet group.
     */
    replicationSubnetGroupIdentifier?: string;
    /**
     * Human-readable description of the subnet group.
     */
    description?: string;
    /**
     * VPC subnet IDs the replication instance can be placed in. Must span at
     * least two Availability Zones.
     */
    subnetIds: string[];
    /**
     * User-defined tags for the subnet group.
     */
    tags?: Record<string, string>;
}
export interface ReplicationSubnetGroup extends Resource<"AWS.DMS.ReplicationSubnetGroup", ReplicationSubnetGroupProps, {
    /** The subnet group identifier (unique per account/region). */
    replicationSubnetGroupIdentifier: string;
    /** The ARN of the replication subnet group. */
    replicationSubnetGroupArn: string;
    /** The VPC the subnets belong to. */
    vpcId: string | undefined;
    /** The IDs of the subnets in the group. */
    subnetIds: string[];
    /** The current status of the subnet group, e.g. `Complete`. */
    status: string | undefined;
    /** The tags attached to the subnet group. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A DMS replication subnet group — the set of VPC subnets a replication
 * instance can be launched into. Must cover at least two Availability Zones.
 * Free and fast to create.
 * ### Creating a Subnet Group
 * **Example:** Two-AZ Subnet Group
 * ```typescript
 * const subnetGroup = yield* ReplicationSubnetGroup("Migration", {
 *   description: "DMS replication subnets",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 * });
 * ```
 *
 * @resource
 */
export declare const ReplicationSubnetGroup: import("../../Resource.ts").ResourceClass<ReplicationSubnetGroup>;
export declare const ReplicationSubnetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<ReplicationSubnetGroup>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ReplicationSubnetGroup.d.ts.map