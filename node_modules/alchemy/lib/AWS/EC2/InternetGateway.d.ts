import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { VpcId } from "./Vpc.ts";
export type InternetGatewayId<ID extends string = string> = `igw-${ID}`;
export declare const InternetGatewayId: <ID extends string>(id: ID) => ID & InternetGatewayId<ID>;
export interface InternetGatewayProps {
    /**
     * The VPC to attach the internet gateway to.
     * If provided, the internet gateway will be automatically attached to the VPC.
     * Optional - you can create an unattached internet gateway and attach it later.
     */
    vpcId?: VpcId;
    /**
     * Tags to assign to the internet gateway.
     * These will be merged with alchemy auto-tags (alchemy::stack, alchemy::stage, alchemy::id).
     */
    tags?: Record<string, string>;
}
export interface InternetGateway extends Resource<"AWS.EC2.InternetGateway", InternetGatewayProps, {
    /**
     * The ID of the internet gateway.
     */
    internetGatewayId: InternetGatewayId;
    /**
     * The Amazon Resource Name (ARN) of the internet gateway.
     */
    internetGatewayArn: `arn:aws:ec2:${RegionID}:${AccountID}:internet-gateway/${string}`;
    /**
     * The ID of the VPC the internet gateway is attached to (if any).
     */
    vpcId?: VpcId;
    /**
     * The ID of the AWS account that owns the internet gateway.
     */
    ownerId?: string;
    /**
     * The attachments for the internet gateway.
     */
    attachments?: Array<{
        state: "attaching" | "available" | "detaching" | "detached";
        vpcId: string;
    }>;
}, never, Providers> {
}
/**
 * An internet gateway provides a target for internet-routable traffic in a
 * VPC, enabling bidirectional IPv4 and IPv6 connectivity between resources in
 * your VPC and the public internet. A VPC can have at most one internet
 * gateway attached at a time.
 *
 * The only inputs are the optional `vpcId` to attach to and `tags`. Attaching a
 * gateway is not enough on its own to make a subnet public — you also need a
 * `0.0.0.0/0` {@link Route} pointing at the gateway and a
 * {@link RouteTableAssociation} binding the subnet to that route table.
 *
 * ### Creating an Internet Gateway
 * Pass `vpcId` to create and attach the gateway in one step, or omit it to
 * create a standalone gateway and attach it later by setting the prop. Updating
 * `vpcId` moves the gateway between VPCs (detach then attach) without
 * recreating it.
 *
 * **Example:** Internet Gateway Attached to a VPC
 * ```typescript
 * const internetGateway = yield* AWS.EC2.InternetGateway("InternetGateway", {
 *   vpcId: myVpc.vpcId,
 * });
 * ```
 * Creates the gateway and attaches it to the VPC immediately. The resulting
 * `internetGatewayId` (prefixed `igw-`) is what you reference from a route's
 * `gatewayId`.
 *
 * **Example:** Detached Internet Gateway
 * ```typescript
 * const internetGateway = yield* AWS.EC2.InternetGateway("InternetGateway", {});
 * ```
 * Omitting `vpcId` creates an unattached gateway. This is occasionally useful
 * when the VPC is provisioned separately; add the `vpcId` prop later to attach
 * it.
 *
 * **Example:** Internet Gateway with Tags
 * ```typescript
 * const internetGateway = yield* AWS.EC2.InternetGateway("InternetGateway", {
 *   vpcId: myVpc.vpcId,
 *   tags: { Name: "production-igw" },
 * });
 * ```
 * The `tags` map is merged with the alchemy auto-tags and can be changed in
 * place. A `Name` tag makes the gateway easy to identify in the AWS console.
 *
 * ### Enabling Public Internet Access
 * An internet gateway only carries traffic once a route table sends traffic to
 * it and a subnet is associated with that table. The full pattern below makes a
 * subnet public.
 *
 * **Example:** Internet Gateway with a Default Route
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
 * ```
 * With the default route in place, any subnet associated with
 * `publicRouteTable` can send and receive internet traffic. Add an analogous
 * route with `destinationIpv6CidrBlock: "::/0"` to enable IPv6.
 *
 * @resource
 */
export declare const InternetGateway: import("../../Resource.ts").ResourceClass<InternetGateway>;
export declare const InternetGatewayProvider: () => import("effect/Layer").Layer<Provider.Provider<InternetGateway>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=InternetGateway.d.ts.map