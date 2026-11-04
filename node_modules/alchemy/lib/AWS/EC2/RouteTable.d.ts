import type * as EC2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { VpcId } from "./Vpc.ts";
export type RouteTableId<ID extends string = string> = `rtb-${ID}`;
export declare const RouteTableId: <ID extends string>(id: ID) => ID & RouteTableId<ID>;
export interface RouteTableProps {
    /**
     * The VPC to create the route table in.
     * Required.
     */
    vpcId: VpcId;
    /**
     * Tags to assign to the route table.
     * These will be merged with alchemy auto-tags (alchemy::stack, alchemy::stage, alchemy::id).
     */
    tags?: Record<string, string>;
}
export interface RouteTable extends Resource<"AWS.EC2.RouteTable", RouteTableProps, {
    /**
     * The ID of the VPC the route table is in.
     */
    vpcId: VpcId;
    /**
     * The ID of the route table.
     */
    routeTableId: RouteTableId;
    /**
     * The Amazon Resource Name (ARN) of the route table.
     */
    routeTableArn: `arn:aws:ec2:${RegionID}:${AccountID}:route-table/${string}`;
    /**
     * The ID of the AWS account that owns the route table.
     */
    ownerId?: string;
    /**
     * The associations between the route table and subnets or gateways.
     */
    associations?: Array<{
        /**
         * Whether this is the main route table for the VPC.
         */
        main: boolean;
        /**
         * The ID of the association.
         */
        routeTableAssociationId?: string;
        /**
         * The ID of the route table.
         */
        routeTableId?: string;
        /**
         * The ID of the subnet (if the association is with a subnet).
         */
        subnetId?: string;
        /**
         * The ID of the gateway (if the association is with a gateway).
         */
        gatewayId?: string;
        /**
         * The state of the association.
         */
        associationState?: {
            state: EC2.RouteTableAssociationStateCode;
            statusMessage?: string;
        };
    }>;
    /**
     * The routes in the route table.
     */
    routes?: Array<{
        /**
         * The IPv4 CIDR block used for the destination match.
         */
        destinationCidrBlock?: string;
        /**
         * The IPv6 CIDR block used for the destination match.
         */
        destinationIpv6CidrBlock?: string;
        /**
         * The prefix of the AWS service.
         */
        destinationPrefixListId?: string;
        /**
         * The ID of the egress-only internet gateway.
         */
        egressOnlyInternetGatewayId?: string;
        /**
         * The ID of the gateway (internet gateway or virtual private gateway).
         */
        gatewayId?: string;
        /**
         * The ID of the NAT instance.
         */
        instanceId?: string;
        /**
         * The ID of AWS account that owns the NAT instance.
         */
        instanceOwnerId?: string;
        /**
         * The ID of the NAT gateway.
         */
        natGatewayId?: string;
        /**
         * The ID of the transit gateway.
         */
        transitGatewayId?: string;
        /**
         * The ID of the local gateway.
         */
        localGatewayId?: string;
        /**
         * The ID of the carrier gateway.
         */
        carrierGatewayId?: string;
        /**
         * The ID of the network interface.
         */
        networkInterfaceId?: string;
        /**
         * Describes how the route was created.
         */
        origin: EC2.RouteOrigin;
        /**
         * The state of the route.
         */
        state: EC2.RouteState;
        /**
         * The ID of the VPC peering connection.
         */
        vpcPeeringConnectionId?: string;
        /**
         * The Amazon Resource Name (ARN) of the core network.
         */
        coreNetworkArn?: string;
    }>;
    /**
     * Any virtual private gateway (VGW) propagating routes.
     */
    propagatingVgws?: Array<{
        gatewayId: string;
    }>;
}, never, Providers> {
}
/**
 * A VPC route table holds a set of routes that determine where network
 * traffic from associated subnets (or gateways) is directed. Create one
 * route table per routing domain — typically a "public" table whose default
 * route points at an {@link InternetGateway}, and one or more "private" tables
 * whose default route points at a NAT gateway.
 *
 * A route table is little more than a container: it owns a `vpcId` and tags,
 * while the actual routing behaviour is supplied by separate {@link Route}
 * resources and applied to subnets by {@link RouteTableAssociation} resources.
 *
 * ### Creating a Route Table
 * The only required input is the `vpcId` the table belongs to. Changing
 * `vpcId` later replaces the route table, since a table cannot move between
 * VPCs.
 *
 * **Example:** Basic Route Table
 * ```typescript
 * const routeTable = yield* AWS.EC2.RouteTable("PublicRouteTable", {
 *   vpcId: myVpc.vpcId,
 * });
 * ```
 * Creates an empty route table in the given VPC. It starts with only the
 * implicit `local` route (managed by AWS) until you add your own
 * {@link Route} resources.
 *
 * **Example:** Route Table with Tags
 * ```typescript
 * const routeTable = yield* AWS.EC2.RouteTable("PrivateRouteTable", {
 *   vpcId: myVpc.vpcId,
 *   tags: { Name: "private-rt", Tier: "private" },
 * });
 * ```
 * The `tags` map is merged with the alchemy auto-tags (`alchemy::stack`,
 * `alchemy::stage`, `alchemy::id`) and can be updated in place without
 * replacing the table. Use the `Name` tag to label the table in the AWS
 * console.
 *
 * ### Building a Public Routing Domain
 * A route table only directs traffic once you attach routes to it and
 * associate it with subnets. The pattern below wires a public subnet to the
 * internet: an {@link InternetGateway}, a default {@link Route} pointing at it,
 * and a {@link RouteTableAssociation} binding the subnet to the table.
 *
 * **Example:** Route Table, Internet Route, and Subnet Association
 * ```typescript
 * const internetGateway = yield* AWS.EC2.InternetGateway("InternetGateway", {
 *   vpcId: myVpc.vpcId,
 * });
 *
 * const publicRouteTable = yield* AWS.EC2.RouteTable("PublicRouteTable", {
 *   vpcId: myVpc.vpcId,
 * });
 *
 * const internetRoute = yield* AWS.EC2.Route("InternetRoute", {
 *   routeTableId: publicRouteTable.routeTableId,
 *   destinationCidrBlock: "0.0.0.0/0",
 *   gatewayId: internetGateway.internetGatewayId,
 * });
 *
 * const association = yield* AWS.EC2.RouteTableAssociation("PublicSubnetAssociation", {
 *   routeTableId: publicRouteTable.routeTableId,
 *   subnetId: publicSubnet.subnetId,
 * });
 * ```
 * Any subnet associated with this table now reaches the public internet via
 * the `0.0.0.0/0` route. Multiple subnets can share the same route table by
 * declaring additional associations — a common way to give every public
 * subnet in a VPC identical routing.
 *
 * @resource
 */
export declare const RouteTable: import("../../Resource.ts").ResourceClass<RouteTable>;
export declare const RouteTableProvider: () => import("effect/Layer").Layer<Provider.Provider<RouteTable>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RouteTable.d.ts.map