import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Tunnel.VirtualNetwork";
type TypeId = typeof TypeId;
export interface VirtualNetworkProps {
    /**
     * User-friendly name for the virtual network. Names are unique per
     * account, which makes the name the resource's identity during adoption
     * and state recovery. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Optional remark describing the virtual network. Mutable — patched
     * in place.
     *
     * @default ""
     */
    comment?: string;
    /**
     * If `true`, this virtual network is the default for the account. Only
     * one default exists per account — promoting a network demotes the
     * previous default. Mutable — patched in place.
     *
     * @default false
     */
    isDefaultNetwork?: boolean;
}
export interface VirtualNetworkAttributes {
    /** UUID of the virtual network, assigned by Cloudflare. */
    virtualNetworkId: string;
    /** Cloudflare account that owns the virtual network. */
    accountId: string;
    /** User-friendly name of the virtual network. */
    name: string;
    /** Remark describing the virtual network. */
    comment: string;
    /** Whether this virtual network is the account default. */
    isDefaultNetwork: boolean;
    /** RFC 3339 timestamp of when the virtual network was created. */
    createdAt: string;
}
export type VirtualNetwork = Resource<TypeId, VirtualNetworkProps, VirtualNetworkAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust Virtual Network — an isolated routing namespace
 * for Cloudflare Tunnel private networks.
 *
 * Virtual networks let you run overlapping CIDR ranges side by side: each
 * {@link Route} can target a `virtualNetworkId`, and WARP clients
 * switch between virtual networks to choose which copy of `10.0.0.0/8`
 * they see. Every account starts with a single `default` virtual network.
 *
 * Name and comment are mutable in place. Deleting a virtual network
 * requires that no routes reference it — express that relationship by
 * passing `vnet.virtualNetworkId` into your `Route`s so destroy
 * ordering is correct.
 * ### Creating a Virtual Network
 * **Example:** Basic virtual network
 * ```typescript
 * const vnet = yield* Cloudflare.Tunnel.VirtualNetwork("Staging", {
 *   comment: "staging private network",
 * });
 * ```
 *
 * **Example:** Route a tunnel CIDR through the virtual network
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("MyTunnel");
 * yield* Cloudflare.Tunnel.Route("StagingNet", {
 *   tunnelId: tunnel.tunnelId,
 *   network: "10.4.0.0/16",
 *   virtualNetworkId: vnet.virtualNetworkId,
 * });
 * ```
 *
 * ### Default network
 * **Example:** Promote a virtual network to the account default
 * ```typescript
 * // Only one default per account — promoting demotes the previous one.
 * const vnet = yield* Cloudflare.Tunnel.VirtualNetwork("Primary", {
 *   isDefaultNetwork: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/private-net/cloudflared/tunnel-virtual-networks/
 *
 * @resource
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export declare const VirtualNetwork: import("../../Resource.ts").ResourceClass<VirtualNetwork>;
/**
 * Returns true if the given value is a VirtualNetwork resource.
 */
export declare const isVirtualNetwork: (value: unknown) => value is VirtualNetwork;
export declare const VirtualNetworkProvider: () => import("effect/Layer").Layer<Provider.Provider<VirtualNetwork>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=VirtualNetwork.d.ts.map