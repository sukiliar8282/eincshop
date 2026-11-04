import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { VpcId } from "./Vpc.ts";
export type VpcPeeringConnectionId<ID extends string = string> = `pcx-${ID}`;
export declare const VpcPeeringConnectionId: <ID extends string>(id: ID) => ID & VpcPeeringConnectionId<ID>;
export type VpcPeeringConnectionStatus = "initiating-request" | "pending-acceptance" | "active" | "deleted" | "rejected" | "failed" | "expired" | "provisioning" | "deleting";
export interface VpcPeeringConnectionProps {
    /**
     * The ID of the requester VPC (the VPC you own that initiates the peering).
     * Immutable — changing it replaces the connection.
     */
    vpcId: VpcId;
    /**
     * The ID of the accepter VPC with which to create the connection. May belong
     * to another account (`peerOwnerId`) or Region (`peerRegion`). Immutable.
     */
    peerVpcId: VpcId;
    /**
     * The Region of the accepter VPC for an inter-Region peering. Defaults to the
     * requester's Region (same-Region peering). Immutable.
     */
    peerRegion?: string;
    /**
     * The AWS account ID of the accepter VPC owner. Defaults to the requester's
     * account (same-account peering). Immutable.
     */
    peerOwnerId?: string;
    /**
     * Whether to automatically accept the peering request. Only possible for
     * same-account, same-Region peering (the accepter side must be reachable
     * with the same credentials). Defaults to `true` when the peer is in the same
     * account and Region, `false` otherwise (a cross-account/Region request stays
     * in `pending-acceptance` until the peer accepts it out of band).
     */
    autoAccept?: boolean;
    /**
     * Tags to assign to the peering connection.
     */
    tags?: Record<string, string>;
}
export interface VpcPeeringConnection extends Resource<"AWS.EC2.VpcPeeringConnection", VpcPeeringConnectionProps, {
    /**
     * The ID of the VPC peering connection (prefixed `pcx-`).
     */
    vpcPeeringConnectionId: VpcPeeringConnectionId;
    /**
     * The current status code of the peering connection.
     */
    status: VpcPeeringConnectionStatus;
    /**
     * The ID of the requester VPC.
     */
    requesterVpcId: VpcId;
    /**
     * The ID of the accepter VPC.
     */
    accepterVpcId: VpcId;
    /**
     * The AWS account ID of the accepter VPC owner.
     */
    accepterOwnerId: string;
}, never, Providers> {
}
/**
 * A VPC peering connection links two VPCs so resources in each can communicate
 * using private IP addresses, as if they were on the same network. The two VPCs
 * can be in the same account or different accounts, and the same Region or
 * different Regions. Their CIDR blocks must not overlap.
 *
 * A peering connection is a two-sided handshake: a *requester* VPC creates the
 * request and an *accepter* VPC accepts it. For same-account, same-Region
 * peering alchemy accepts the request for you automatically (`autoAccept`
 * defaults to `true`); for cross-account or cross-Region peering the connection
 * is left in `pending-acceptance` for the peer to accept out of band. Once
 * `active`, add {@link Route}s on both sides pointing the peer CIDR at the
 * connection to actually carry traffic.
 *
 * ### Creating a Peering Connection
 * **Example:** Same-Account Peering (auto-accepted)
 * ```typescript
 * const vpcA = yield* AWS.EC2.Vpc("VpcA", { cidrBlock: "10.0.0.0/16" });
 * const vpcB = yield* AWS.EC2.Vpc("VpcB", { cidrBlock: "10.1.0.0/16" });
 *
 * const peering = yield* AWS.EC2.VpcPeeringConnection("Peering", {
 *   vpcId: vpcA.vpcId,
 *   peerVpcId: vpcB.vpcId,
 * });
 * ```
 * Because both VPCs are in the same account and Region, the request is accepted
 * automatically and the connection reaches the `active` state.
 *
 * **Example:** Cross-Account Peering (accepted out of band)
 * ```typescript
 * const peering = yield* AWS.EC2.VpcPeeringConnection("Peering", {
 *   vpcId: myVpc.vpcId,
 *   peerVpcId: "vpc-0abc123",
 *   peerOwnerId: "123456789012",
 * });
 * ```
 * With a different `peerOwnerId` the connection stays in `pending-acceptance`
 * until the peer account accepts it.
 *
 * ### Routing Traffic Across the Peering
 * **Example:** Route the Peer CIDR at the Connection
 * ```typescript
 * const peering = yield* AWS.EC2.VpcPeeringConnection("Peering", {
 *   vpcId: vpcA.vpcId,
 *   peerVpcId: vpcB.vpcId,
 * });
 *
 * const routeAtoB = yield* AWS.EC2.Route("RouteAtoB", {
 *   routeTableId: vpcARouteTable.routeTableId,
 *   destinationCidrBlock: "10.1.0.0/16",
 *   vpcPeeringConnectionId: peering.vpcPeeringConnectionId,
 * });
 * ```
 * Each side needs a route pointing the other VPC's CIDR at the peering
 * connection; only then can instances reach each other over private IPs.
 *
 * @resource
 */
export declare const VpcPeeringConnection: import("../../Resource.ts").ResourceClass<VpcPeeringConnection>;
export declare const VpcPeeringConnectionProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcPeeringConnection>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VpcPeeringConnection.d.ts.map