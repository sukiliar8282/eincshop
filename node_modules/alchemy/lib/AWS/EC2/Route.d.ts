import type * as EC2 from "@distilled.cloud/aws/ec2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { RouteTableId } from "./RouteTable.ts";
export interface RouteProps {
    /**
     * The ID of the route table where the route will be added.
     * Required.
     */
    routeTableId: RouteTableId;
    /**
     * The IPv4 CIDR block used for the destination match.
     * Either destinationCidrBlock, destinationIpv6CidrBlock, or destinationPrefixListId is required.
     * @example "0.0.0.0/0"
     */
    destinationCidrBlock?: string;
    /**
     * The IPv6 CIDR block used for the destination match.
     * Either destinationCidrBlock, destinationIpv6CidrBlock, or destinationPrefixListId is required.
     * @example "::/0"
     */
    destinationIpv6CidrBlock?: string;
    /**
     * The ID of a prefix list used for the destination match.
     * Either destinationCidrBlock, destinationIpv6CidrBlock, or destinationPrefixListId is required.
     */
    destinationPrefixListId?: string;
    /**
     * The ID of an internet gateway or virtual private gateway.
     */
    gatewayId?: string;
    /**
     * The ID of a NAT gateway.
     */
    natGatewayId?: string;
    /**
     * The ID of a NAT instance in your VPC.
     * This operation fails unless exactly one network interface is attached.
     */
    instanceId?: string;
    /**
     * The ID of a network interface.
     */
    networkInterfaceId?: string;
    /**
     * The ID of a VPC peering connection.
     */
    vpcPeeringConnectionId?: string;
    /**
     * The ID of a transit gateway.
     */
    transitGatewayId?: string;
    /**
     * The ID of a local gateway.
     */
    localGatewayId?: string;
    /**
     * The ID of a carrier gateway.
     * Use for Wavelength Zones only.
     */
    carrierGatewayId?: string;
    /**
     * The ID of an egress-only internet gateway.
     * IPv6 traffic only.
     */
    egressOnlyInternetGatewayId?: string;
    /**
     * The Amazon Resource Name (ARN) of the core network.
     */
    coreNetworkArn?: string;
    /**
     * The ID of a VPC endpoint for Gateway Load Balancer.
     */
    vpcEndpointId?: string;
}
export interface Route extends Resource<"AWS.EC2.Route", RouteProps, {
    /**
     * The ID of the route table that contains this route.
     */
    routeTableId: RouteTableId;
    /**
     * The IPv4 CIDR block used for the destination match.
     */
    destinationCidrBlock?: string | undefined;
    /**
     * The IPv6 CIDR block used for the destination match.
     */
    destinationIpv6CidrBlock?: string | undefined;
    /**
     * The ID of the prefix list used for the destination match.
     */
    destinationPrefixListId?: string | undefined;
    /**
     * Describes how the route was created (e.g. `CreateRoute`).
     */
    origin: EC2.RouteOrigin;
    /**
     * The state of the route (e.g. `active` or `blackhole`).
     */
    state: EC2.RouteState;
    /**
     * The ID of the internet gateway or virtual private gateway the route targets.
     */
    gatewayId?: string;
    /**
     * The ID of the NAT gateway the route targets.
     */
    natGatewayId?: string;
    /**
     * The ID of the NAT instance the route targets.
     */
    instanceId?: string;
    /**
     * The ID of the network interface the route targets.
     */
    networkInterfaceId?: string;
    /**
     * The ID of the VPC peering connection the route targets.
     */
    vpcPeeringConnectionId?: string;
    /**
     * The ID of the transit gateway the route targets.
     */
    transitGatewayId?: string;
    /**
     * The ID of the local gateway the route targets.
     */
    localGatewayId?: string;
    /**
     * The ID of the carrier gateway the route targets.
     */
    carrierGatewayId?: string;
    /**
     * The ID of the egress-only internet gateway the route targets (IPv6 only).
     */
    egressOnlyInternetGatewayId?: string;
    /**
     * The Amazon Resource Name (ARN) of the core network the route targets.
     */
    coreNetworkArn?: string;
}, never, Providers> {
}
/**
 * A single route entry inside a {@link RouteTable}. A route maps a destination
 * to exactly one target, telling the VPC where to send packets whose address
 * falls within the destination range.
 *
 * Every route has two halves:
 * - **Destination** — exactly one of `destinationCidrBlock` (IPv4),
 *   `destinationIpv6CidrBlock` (IPv6), or `destinationPrefixListId` (a managed
 *   prefix list, e.g. for an AWS service).
 * - **Target** — exactly one of `gatewayId` (internet/virtual private
 *   gateway), `natGatewayId`, `instanceId` (NAT instance), `networkInterfaceId`,
 *   `vpcPeeringConnectionId`, `transitGatewayId`, `localGatewayId` (Outposts),
 *   `carrierGatewayId` (Wavelength), `egressOnlyInternetGatewayId` (IPv6),
 *   `coreNetworkArn` (Cloud WAN), or `vpcEndpointId` (Gateway Load Balancer).
 *
 * Changing the `routeTableId` or the destination replaces the route, whereas
 * changing only the target is applied in place via `ReplaceRoute`.
 *
 * ### IPv4 Routing
 * Use an IPv4 `destinationCidrBlock` — most commonly `0.0.0.0/0` for the
 * default route, or a narrower CIDR to route specific traffic.
 *
 * **Example:** Default Route to an Internet Gateway
 * ```typescript
 * const internetRoute = yield* AWS.EC2.Route("InternetRoute", {
 *   routeTableId: publicRouteTable.routeTableId,
 *   destinationCidrBlock: "0.0.0.0/0",
 *   gatewayId: internetGateway.internetGatewayId,
 * });
 * ```
 * Sends all outbound IPv4 traffic to the internet gateway, which is what makes
 * a subnet "public". Attach this route table to any subnet that needs inbound
 * and outbound internet connectivity.
 *
 * **Example:** Default Route to a NAT Gateway
 * ```typescript
 * const natRoute = yield* AWS.EC2.Route("NatRoute", {
 *   routeTableId: privateRouteTable.routeTableId,
 *   destinationCidrBlock: "0.0.0.0/0",
 *   natGatewayId: natGateway.natGatewayId,
 * });
 * ```
 * Lets private subnets reach the internet for outbound traffic (package
 * updates, API calls) while blocking unsolicited inbound connections. The NAT
 * gateway itself lives in a public subnet.
 *
 * **Example:** Route to a VPC Peering Connection
 * ```typescript
 * const peeringRoute = yield* AWS.EC2.Route("PeeringRoute", {
 *   routeTableId: routeTable.routeTableId,
 *   destinationCidrBlock: "10.1.0.0/16",
 *   vpcPeeringConnectionId: "pcx-0abc1234",
 * });
 * ```
 * Routes traffic destined for the peer VPC's CIDR across a VPC peering
 * connection. Use a narrow destination matching the remote VPC rather than
 * `0.0.0.0/0` so only cross-VPC traffic is affected.
 *
 * **Example:** Route to a Transit Gateway
 * ```typescript
 * const transitRoute = yield* AWS.EC2.Route("TransitRoute", {
 *   routeTableId: routeTable.routeTableId,
 *   destinationCidrBlock: "172.16.0.0/12",
 *   transitGatewayId: "tgw-0abc1234",
 * });
 * ```
 * Hands traffic to a transit gateway, the hub used to connect many VPCs and
 * on-premises networks. The destination CIDR should cover the address space
 * reachable through the transit gateway.
 *
 * **Example:** Route to a Network Interface or NAT Instance
 * ```typescript
 * const applianceRoute = yield* AWS.EC2.Route("ApplianceRoute", {
 *   routeTableId: routeTable.routeTableId,
 *   destinationCidrBlock: "0.0.0.0/0",
 *   networkInterfaceId: "eni-0abc1234",
 * });
 * ```
 * Forwards traffic to a specific elastic network interface — for example a
 * firewall or NAT instance appliance. Use `instanceId` instead when targeting
 * a NAT instance that has exactly one network interface attached.
 *
 * ### IPv6 Routing
 * IPv6 routes use `destinationIpv6CidrBlock` (e.g. `::/0` for the IPv6 default
 * route). For outbound-only IPv6 access from private subnets, target an
 * {@link EgressOnlyInternetGateway}.
 *
 * **Example:** IPv6 Egress Route to an Egress-Only Internet Gateway
 * ```typescript
 * const ipv6EgressRoute = yield* AWS.EC2.Route("Ipv6EgressRoute", {
 *   routeTableId: privateRouteTable.routeTableId,
 *   destinationIpv6CidrBlock: "::/0",
 *   egressOnlyInternetGatewayId: egressOnlyIgw.egressOnlyInternetGatewayId,
 * });
 * ```
 * Gives IPv6-addressed instances outbound internet access while blocking
 * inbound connections — the IPv6 equivalent of routing IPv4 through a NAT
 * gateway.
 *
 * **Example:** IPv6 Internet Route to an Internet Gateway
 * ```typescript
 * const ipv6InternetRoute = yield* AWS.EC2.Route("Ipv6InternetRoute", {
 *   routeTableId: publicRouteTable.routeTableId,
 *   destinationIpv6CidrBlock: "::/0",
 *   gatewayId: internetGateway.internetGatewayId,
 * });
 * ```
 * Provides full bidirectional IPv6 connectivity for a public subnet, since an
 * internet gateway (unlike an egress-only gateway) allows inbound IPv6 traffic.
 *
 * ### Routing to AWS Services via Prefix Lists
 * Instead of a raw CIDR, a route can match a managed prefix list — useful for
 * AWS service ranges (e.g. an S3 gateway endpoint) where the underlying CIDRs
 * change over time.
 *
 * **Example:** Prefix List Route to a Gateway VPC Endpoint
 * ```typescript
 * const prefixListRoute = yield* AWS.EC2.Route("S3PrefixRoute", {
 *   routeTableId: privateRouteTable.routeTableId,
 *   destinationPrefixListId: "pl-0abc1234",
 *   vpcEndpointId: "vpce-0abc1234",
 * });
 * ```
 * Routes traffic for every CIDR in the prefix list to a Gateway Load Balancer
 * VPC endpoint. AWS keeps the prefix list current, so you don't have to update
 * the route when the service's address ranges change.
 *
 * @resource
 */
export declare const Route: import("../../Resource.ts").ResourceClass<Route>;
export declare const RouteProvider: () => import("effect/Layer").Layer<Provider.Provider<Route>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Route.d.ts.map