import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Tunnel.HostnameRoute";
type TypeId = typeof TypeId;
export interface HostnameRouteProps {
    /**
     * The hostname to route through the tunnel (e.g.
     * `app.internal.example.com`). Unique per account. Mutable — updated
     * in place via PATCH.
     */
    hostname: string;
    /**
     * UUID of the `cfd_tunnel` that traffic for the hostname egresses
     * through. Mutable — updated in place via PATCH.
     */
    tunnelId: string;
    /**
     * Optional human-readable note attached to the route. Mutable.
     */
    comment?: string;
}
export type HostnameRouteAttributes = {
    /** API UUID of the hostname route. */
    hostnameRouteId: string;
    /** Account that owns the route. */
    accountId: string;
    /** The hostname routed through the tunnel. */
    hostname: string;
    /** UUID of the tunnel the hostname routes to. */
    tunnelId: string;
    /** Human-readable note attached to the route, if any. */
    comment: string | undefined;
    /** RFC 3339 timestamp of when the route was created, if reported. */
    createdAt: string | undefined;
};
export type HostnameRoute = Resource<TypeId, HostnameRouteProps, HostnameRouteAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust **hostname route** — routes traffic for a
 * private hostname through a `cfd_tunnel`, so WARP clients can reach
 * internal apps by name without publishing a public DNS record.
 *
 * All fields (hostname, tunnel, comment) are mutable in place via PATCH.
 * ### Creating a hostname route
 * **Example:** Route an internal hostname through a tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("MyTunnel");
 * const route = yield* Cloudflare.Tunnel.HostnameRoute("AppRoute", {
 *   hostname: "app.internal.example.com",
 *   tunnelId: tunnel.tunnelId,
 * });
 * ```
 *
 * **Example:** Add a comment
 * ```typescript
 * const route = yield* Cloudflare.Tunnel.HostnameRoute("AppRoute", {
 *   hostname: "app.internal.example.com",
 *   tunnelId: tunnel.tunnelId,
 *   comment: "Internal wiki behind the datacenter tunnel",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/private-net/cloudflared/
 *
 * @resource
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export declare const HostnameRoute: import("../../Resource.ts").ResourceClass<HostnameRoute>;
/**
 * Returns true if the given value is a HostnameRoute resource.
 */
export declare const isHostnameRoute: (value: unknown) => value is HostnameRoute;
export declare const HostnameRouteProvider: () => import("effect/Layer").Layer<Provider.Provider<HostnameRoute>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=HostnameRoute.d.ts.map