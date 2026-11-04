import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { SubnetId } from "../EC2/Subnet.ts";
export interface DBSubnetGroupProps {
    /**
     * Name of the DB subnet group. If omitted, a deterministic name is generated.
     */
    dbSubnetGroupName?: string;
    /**
     * Description for the subnet group.
     * @default "Managed by Alchemy"
     */
    description?: string;
    /**
     * Subnets that the database resources may use.
     */
    subnetIds: SubnetId[];
    /**
     * User-defined tags for the subnet group.
     */
    tags?: Record<string, string>;
}
export interface DBSubnetGroup extends Resource<"AWS.RDS.DBSubnetGroup", DBSubnetGroupProps, {
    /**
     * Name of the subnet group.
     */
    dbSubnetGroupName: string;
    /**
     * ARN of the subnet group.
     */
    dbSubnetGroupArn: string | undefined;
    /**
     * VPC the subnets belong to.
     */
    vpcId: string | undefined;
    /**
     * Subnet IDs registered in the group.
     */
    subnetIds: string[];
    /**
     * Status of the subnet group (e.g. `Complete`).
     */
    status: string | undefined;
    /**
     * Network types the group supports (`IPV4`, `DUAL`).
     */
    supportedNetworkTypes: string[] | undefined;
    /**
     * Tags on the subnet group.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An RDS DB subnet group for Aurora clusters, instances, and proxies.
 *
 * RDS requires a subnet group spanning at least two Availability Zones
 * before a cluster or instance can be placed in a VPC. Changing the name
 * replaces the group; the subnet list updates in place.
 * ### Creating a Subnet Group
 * **Example:** Subnet Group Across Two AZs
 * ```typescript
 * const subnetGroup = yield* DBSubnetGroup("SubnetGroup", {
 *   subnetIds: [privateSubnetA.subnetId, privateSubnetB.subnetId],
 * });
 * ```
 *
 * **Example:** Place an Aurora Cluster in the Group
 * ```typescript
 * const cluster = yield* DBCluster("Cluster", {
 *   engine: "aurora-postgresql",
 *   dbSubnetGroupName: subnetGroup.dbSubnetGroupName,
 *   vpcSecurityGroupIds: [dbSecurityGroup.groupId],
 * });
 * ```
 *
 * @resource
 */
export declare const DBSubnetGroup: import("../../Resource.ts").ResourceClass<DBSubnetGroup>;
export declare const DBSubnetGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<DBSubnetGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DBSubnetGroup.d.ts.map