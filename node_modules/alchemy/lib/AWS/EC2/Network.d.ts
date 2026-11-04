import { Region } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import * as Output from "../../Output.ts";
import type { EIP as EIPResource } from "./EIP.ts";
import type { InternetGateway as InternetGatewayResource } from "./InternetGateway.ts";
import type { NatGateway as NatGatewayResource } from "./NatGateway.ts";
import type { Route as RouteResource } from "./Route.ts";
import type { RouteTable as RouteTableResource } from "./RouteTable.ts";
import type { RouteTableAssociation as RouteTableAssociationResource } from "./RouteTableAssociation.ts";
import type { Subnet as SubnetResource } from "./Subnet.ts";
import type { Vpc as VpcResource } from "./Vpc.ts";
import type { VpcEndpoint as VpcEndpointResource } from "./VpcEndpoint.ts";
export type NetworkNat = "none" | "single" | "per-az";
export type NetworkGatewayEndpoint = "s3" | "dynamodb";
export interface NetworkProps {
    /**
     * IPv4 CIDR block for the VPC.
     * @example "10.42.0.0/16"
     */
    cidrBlock: string;
    /**
     * Number of Availability Zones to span or an explicit ordered list of zone names.
     * Defaults to 2 available zones.
     */
    availabilityZones?: number | string[];
    /**
     * NAT strategy for private subnets.
     * - `"none"` keeps private subnets isolated
     * - `"single"` creates one shared NAT gateway
     * - `"per-az"` creates one NAT gateway per Availability Zone
     * @default "none"
     */
    nat?: NetworkNat;
    /**
     * Gateway endpoints to attach to the private route tables.
     * Supported in v1: S3 and DynamoDB.
     */
    gatewayEndpoints?: NetworkGatewayEndpoint[];
    /**
     * Whether DNS resolution is supported for the VPC.
     * @default true
     */
    enableDnsSupport?: boolean;
    /**
     * Whether instances launched in the VPC receive DNS hostnames.
     * @default true
     */
    enableDnsHostnames?: boolean;
    /**
     * Tags to apply to all created resources.
     */
    tags?: Record<string, string>;
}
export interface NetworkResources {
    availabilityZones: string[];
    vpc: VpcResource;
    internetGateway?: InternetGatewayResource;
    elasticIps: EIPResource[];
    natGateways: NatGatewayResource[];
    publicSubnets: SubnetResource[];
    privateSubnets: SubnetResource[];
    publicRouteTables: RouteTableResource[];
    privateRouteTables: RouteTableResource[];
    publicRoutes: RouteResource[];
    privateRoutes: RouteResource[];
    publicRouteAssociations: RouteTableAssociationResource[];
    privateRouteAssociations: RouteTableAssociationResource[];
    gatewayEndpoints: VpcEndpointResource[];
    vpcId: VpcResource["vpcId"];
    publicSubnetIds: Array<SubnetResource["subnetId"]>;
    privateSubnetIds: Array<SubnetResource["subnetId"]>;
}
export type Network = Effect.Success<ReturnType<typeof Network>>;
/**
 * Creates a production-shaped VPC network from the low-level EC2 primitives.
 *
 * `Network` is the ergonomic entry point for users who want a ready-to-use VPC
 * layout without manually creating route tables, internet gateways, NAT
 * gateways, and subnet associations by hand.
 *
 * The helper still returns the underlying canonical resources so callers can
 * keep composing with raw `AWS.EC2.*` APIs when they need more control.
 * **Example:** Minimal network
 * ```typescript
 * const network = yield* AWS.EC2.Network("AppNetwork", {
 *   cidrBlock: "10.42.0.0/16",
 * });
 * ```
 *
 * **Example:** ECS-ready network with shared NAT
 * ```typescript
 * const network = yield* AWS.EC2.Network("AppNetwork", {
 *   cidrBlock: "10.42.0.0/16",
 *   availabilityZones: 2,
 *   nat: "single",
 *   gatewayEndpoints: ["s3"],
 * });
 *
 * yield* AWS.ECS.Service("ApiService", {
 *   cluster,
 *   task: apiTask,
 *   vpcId: network.vpcId,
 *   subnets: network.publicSubnetIds,
 *   assignPublicIp: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Network: (id: string, props: NetworkProps) => Effect.Effect<{
    availabilityZones: string[];
    vpc: VpcResource;
    internetGateway: InternetGatewayResource;
    elasticIps: EIPResource[];
    natGateways: NatGatewayResource[];
    publicSubnets: SubnetResource[];
    privateSubnets: SubnetResource[];
    publicRouteTables: RouteTableResource[];
    privateRouteTables: RouteTableResource[];
    publicRoutes: RouteResource[];
    privateRoutes: RouteResource[];
    publicRouteAssociations: RouteTableAssociationResource[];
    privateRouteAssociations: RouteTableAssociationResource[];
    gatewayEndpoints: VpcEndpointResource[];
    vpcId: Output.Output<`vpc-${string}`, never>;
    publicSubnetIds: Output.Output<`subnet-${string}`, never>[];
    privateSubnetIds: Output.Output<`subnet-${string}`, never>[];
}, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../Providers.ts").Providers | Region>;
//# sourceMappingURL=Network.d.ts.map