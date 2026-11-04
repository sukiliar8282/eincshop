import type * as EC2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { RouteTableId } from "./RouteTable.ts";
import type { SubnetId } from "./Subnet.ts";
export type RouteTableAssociationId<ID extends string = string> = `rtbassoc-${ID}`;
export declare const RouteTableAssociationId: <ID extends string>(id: ID) => ID & RouteTableAssociationId<ID>;
export interface RouteTableAssociationProps {
    /**
     * The ID of the route table.
     * Required.
     */
    routeTableId: RouteTableId;
    /**
     * The ID of the subnet to associate with the route table.
     * Either subnetId or gatewayId is required, but not both.
     */
    subnetId?: SubnetId;
    /**
     * The ID of the gateway (internet gateway or virtual private gateway) to associate with the route table.
     * Either subnetId or gatewayId is required, but not both.
     */
    gatewayId?: string;
}
export interface RouteTableAssociation extends Resource<"AWS.EC2.RouteTableAssociation", RouteTableAssociationProps, {
    /**
     * The ID of the association.
     */
    associationId: RouteTableAssociationId;
    /**
     * The ID of the route table.
     */
    routeTableId: RouteTableId;
    /**
     * The ID of the subnet (if the association is with a subnet).
     */
    subnetId?: SubnetId | undefined;
    /**
     * The ID of the gateway (if the association is with a gateway).
     */
    gatewayId?: string | undefined;
    /**
     * The state of the association.
     */
    associationState: {
        state: EC2.RouteTableAssociationStateCode;
        statusMessage?: string;
    };
}, never, Providers> {
}
/**
 * Associates a {@link RouteTable} with a subnet (or a gateway), making that
 * route table govern traffic for the associated resource. A subnet can be
 * associated with exactly one route table at a time; multiple subnets may share
 * the same route table.
 *
 * Provide exactly one of `subnetId` or `gatewayId`. Changing the subnet or
 * gateway replaces the association, whereas pointing an existing association at
 * a different route table is applied in place via
 * `ReplaceRouteTableAssociation`.
 *
 * ### Associating Subnets
 * Associating a subnet overrides the VPC's main route table for that subnet.
 * This is how you make a subnet "public" (associate it with a table that has an
 * internet-gateway route) or "private" (associate it with a NAT-gateway table).
 *
 * **Example:** Associate a Subnet with a Route Table
 * ```typescript
 * const association = yield* AWS.EC2.RouteTableAssociation("PublicSubnetAssociation", {
 *   routeTableId: publicRouteTable.routeTableId,
 *   subnetId: publicSubnet.subnetId,
 * });
 * ```
 * Binds a single subnet to the route table so its instances follow that
 * table's routes. The returned `associationId` (prefixed `rtbassoc-`) can be
 * used to track or replace the association.
 *
 * **Example:** Share One Route Table Across Multiple Subnets
 * ```typescript
 * const subnet1Association = yield* AWS.EC2.RouteTableAssociation("PublicSubnet1Association", {
 *   routeTableId: publicRouteTable.routeTableId,
 *   subnetId: publicSubnet1.subnetId,
 * });
 *
 * const subnet2Association = yield* AWS.EC2.RouteTableAssociation("PublicSubnet2Association", {
 *   routeTableId: publicRouteTable.routeTableId,
 *   subnetId: publicSubnet2.subnetId,
 * });
 * ```
 * Declaring multiple associations against the same `routeTableId` gives every
 * listed subnet identical routing — a concise way to apply one public (or
 * private) routing policy across all subnets in a tier.
 *
 * ### Associating Gateways (Edge Routing)
 * Instead of a subnet, an association can target an internet gateway or
 * virtual private gateway via `gatewayId`. This "gateway route table
 * association" enables edge routing, where inbound traffic is inspected or
 * redirected (e.g. to a firewall appliance) as it enters the VPC.
 *
 * **Example:** Associate a Route Table with an Internet Gateway
 * ```typescript
 * const edgeAssociation = yield* AWS.EC2.RouteTableAssociation("EdgeAssociation", {
 *   routeTableId: ingressRouteTable.routeTableId,
 *   gatewayId: internetGateway.internetGatewayId,
 * });
 * ```
 * Attaches the route table at the gateway rather than at a subnet, so traffic
 * arriving from the internet is steered by this table — typically toward an
 * inspection appliance before reaching its destination subnet.
 *
 * @resource
 */
export declare const RouteTableAssociation: import("../../Resource.ts").ResourceClass<RouteTableAssociation>;
export declare const RouteTableAssociationProvider: () => import("effect/Layer").Layer<Provider.Provider<RouteTableAssociation>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=RouteTableAssociation.d.ts.map