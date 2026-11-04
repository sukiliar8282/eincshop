import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type RouteProps = {
    /**
     * UUID of the `cfd_tunnel` this route attaches to.
     *
     * Stable -- changing the tunnel triggers replacement.
     */
    tunnelId: string;
    /**
     * Private IPv4 or IPv6 range exposed through the tunnel, in CIDR notation
     * (e.g. `10.4.0.0/16`).
     *
     * Stable -- changing the CIDR triggers replacement.
     *
     * Declared as a plain `string` (not `string`) so it is statically
     * knowable inside `diff`.
     */
    network: string;
    /**
     * Optional human-readable note attached to the route.
     *
     * Mutable -- changes are applied in place via PATCH.
     */
    comment?: string;
    /**
     * Optional Tunnel Virtual Network UUID. Use to disambiguate overlapping
     * CIDRs that live in separate virtual networks.
     *
     * Stable -- changing the virtual network triggers replacement.
     */
    virtualNetworkId?: string;
    /**
     * Whether to adopt an existing route with the same network (and virtual
     * network, when set) on the same tunnel if one is already present.
     *
     * @default false
     */
    adopt?: boolean;
};
export type Route = Resource<"Cloudflare.Tunnel.Route", RouteProps, {
    /**
     * UUID of the route, assigned by Cloudflare.
     */
    routeId: string;
    /**
     * The CIDR exposed through the tunnel.
     */
    network: string;
    /**
     * UUID of the tunnel this route attaches to.
     */
    tunnelId: string;
    /**
     * Cloudflare account that owns the route.
     */
    accountId: string;
    /**
     * Human-readable note attached to the route, if any.
     */
    comment: string | undefined;
    /**
     * UUID of the Tunnel Virtual Network the route lives in, if any.
     */
    virtualNetworkId: string | undefined;
    /**
     * RFC 3339 timestamp of when the route was created (as reported by
     * Cloudflare), if available.
     */
    createdAt: string | undefined;
}, never, Providers>;
/**
 * A Cloudflare Tunnel Route attaches a private CIDR to a `cfd_tunnel` so that
 * WARP clients (and other Zero Trust egress paths) can reach private IPs
 * through the tunnel.
 * ### Creating a Route
 * **Example:** Basic route
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("MyTunnel");
 * const route = yield* Cloudflare.Tunnel.Route("PrivateNet", {
 *   tunnelId: tunnel.tunnelId,
 *   network: "10.4.0.0/16",
 * });
 * ```
 *
 * **Example:** Route with a comment and explicit virtual network
 * ```typescript
 * const route = yield* Cloudflare.Tunnel.Route("DcRoute", {
 *   tunnelId: tunnel.tunnelId,
 *   network: "10.50.0.0/16",
 *   comment: "Datacenter A private subnet",
 *   virtualNetworkId: vnet.id,
 *   adopt: true,
 * });
 * ```
 *
 * @resource
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export declare const Route: import("../../Resource.ts").ResourceClass<Route>;
export declare const RouteProvider: () => import("effect/Layer").Layer<Provider.Provider<Route>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Route.d.ts.map