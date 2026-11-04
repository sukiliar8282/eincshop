import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { AccountID } from "../Environment.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
import type { VpcId } from "./Vpc.ts";
export type EgressOnlyInternetGatewayId<ID extends string = string> = `eigw-${ID}`;
export declare const EgressOnlyInternetGatewayId: <ID extends string>(id: ID) => ID & EgressOnlyInternetGatewayId<ID>;
export type EgressOnlyInternetGatewayArn<ID extends EgressOnlyInternetGatewayId = EgressOnlyInternetGatewayId> = `arn:aws:ec2:${RegionID}:${AccountID}:egress-only-internet-gateway/${ID}`;
export interface EgressOnlyInternetGatewayProps {
    /**
     * The VPC for which to create the egress-only internet gateway.
     */
    vpcId: VpcId;
    /**
     * Tags to assign to the egress-only internet gateway.
     */
    tags?: Record<string, string>;
}
export interface EgressOnlyInternetGateway extends Resource<"AWS.EC2.EgressOnlyInternetGateway", EgressOnlyInternetGatewayProps, {
    /**
     * The ID of the egress-only internet gateway.
     */
    egressOnlyInternetGatewayId: EgressOnlyInternetGatewayId;
    /**
     * The Amazon Resource Name (ARN) of the egress-only internet gateway.
     */
    egressOnlyInternetGatewayArn: EgressOnlyInternetGatewayArn;
    /**
     * Information about the attachment of the egress-only internet gateway.
     */
    attachments?: Array<{
        /**
         * The current state of the attachment.
         */
        state: "attaching" | "attached" | "detaching" | "detached";
        /**
         * The ID of the VPC.
         */
        vpcId: VpcId;
    }>;
}, never, Providers> {
}
/**
 * An egress-only internet gateway is the IPv6 counterpart to a NAT gateway: it
 * lets instances in a VPC initiate outbound IPv6 traffic to the internet while
 * preventing the internet from initiating inbound connections to them. Use it
 * to give private, IPv6-addressed resources outbound-only internet access.
 *
 * Unlike a NAT gateway it is free, has no bandwidth charges, and does not
 * require an Elastic IP — but it works for IPv6 only. It always belongs to a
 * VPC (`vpcId` is required); the gateway must be paired with an IPv6
 * {@link Route} to actually carry traffic.
 *
 * ### Creating an Egress-Only Internet Gateway
 * The gateway is created and attached to `vpcId` in a single step. Because the
 * attachment is intrinsic, changing `vpcId` replaces the gateway rather than
 * moving it.
 *
 * **Example:** Basic Egress-Only Internet Gateway
 * ```typescript
 * const egressOnlyIgw = yield* AWS.EC2.EgressOnlyInternetGateway("EgressOnlyIgw", {
 *   vpcId: myVpc.vpcId,
 * });
 * ```
 * Creates the gateway in the VPC. The resulting
 * `egressOnlyInternetGatewayId` (prefixed `eigw-`) is referenced from a
 * route's `egressOnlyInternetGatewayId` target.
 *
 * **Example:** Egress-Only Internet Gateway with Tags
 * ```typescript
 * const egressOnlyIgw = yield* AWS.EC2.EgressOnlyInternetGateway("EgressOnlyIgw", {
 *   vpcId: myVpc.vpcId,
 *   tags: { Name: "production-eigw" },
 * });
 * ```
 * The `tags` map is merged with the alchemy auto-tags and can be updated in
 * place without replacing the gateway.
 *
 * ### Routing IPv6 Egress Traffic
 * A gateway alone does nothing until a private route table sends IPv6 traffic
 * to it. Pair it with a `::/0` {@link Route} so private, IPv6-addressed
 * instances can reach the internet outbound-only.
 *
 * **Example:** IPv6 Default Route to the Egress-Only Gateway
 * ```typescript
 * const egressOnlyIgw = yield* AWS.EC2.EgressOnlyInternetGateway("EgressOnlyIgw", {
 *   vpcId: myVpc.vpcId,
 * });
 *
 * const ipv6EgressRoute = yield* AWS.EC2.Route("Ipv6EgressRoute", {
 *   routeTableId: privateRouteTable.routeTableId,
 *   destinationIpv6CidrBlock: "::/0",
 *   egressOnlyInternetGatewayId: egressOnlyIgw.egressOnlyInternetGatewayId,
 * });
 * ```
 * Instances in subnets associated with `privateRouteTable` can now make
 * outbound IPv6 connections (updates, API calls) while remaining unreachable
 * from the public internet.
 *
 * @resource
 */
export declare const EgressOnlyInternetGateway: import("../../Resource.ts").ResourceClass<EgressOnlyInternetGateway>;
export declare const EgressOnlyInternetGatewayProvider: () => import("effect/Layer").Layer<Provider.Provider<EgressOnlyInternetGateway>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EgressOnlyInternetGateway.d.ts.map