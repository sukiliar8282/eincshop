import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Tunnel.WarpConnector";
type TypeId = typeof TypeId;
export interface WarpConnectorProps {
    /**
     * User-friendly name for the WARP Connector tunnel. Tunnel names are
     * unique per account, which makes the name the resource's identity
     * during adoption and state recovery. Changing it replaces the tunnel.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
}
export interface WarpConnectorAttributes {
    /** UUID of the WARP Connector tunnel, assigned by Cloudflare. */
    tunnelId: string;
    /** Cloudflare account that owns the tunnel. */
    accountId: string;
    /** User-friendly name of the tunnel. */
    name: string;
    /**
     * Status of the tunnel: `inactive` (never run), `degraded`, `healthy`,
     * or `down`.
     */
    status: string | undefined;
    /** RFC 3339 timestamp of when the tunnel was created. */
    createdAt: string | undefined;
    /**
     * Connector token used to run the WARP Connector on a host
     * (`warp-cli connector new <token>`). Sensitive — stored redacted.
     */
    token: Redacted.Redacted<string>;
}
export type WarpConnector = Resource<TypeId, WarpConnectorProps, WarpConnectorAttributes, never, Providers>;
/**
 * A Cloudflare WARP Connector tunnel — a software site-to-site connector
 * that extends a private network into Cloudflare Zero Trust without
 * running `cloudflared`.
 *
 * The resource manages the tunnel record itself (CRUD); a WARP Connector
 * host joins it at runtime using the `token` attribute. Pair with
 * {@link Route} to route private CIDRs through the connector and
 * {@link VirtualNetwork} to isolate overlapping address space.
 * ### Creating a WARP Connector
 * **Example:** Basic WARP Connector tunnel
 * ```typescript
 * const connector = yield* Cloudflare.Tunnel.WarpConnector("SiteA", {
 *   name: "site-a-connector",
 * });
 * // Provision the host with: warp-cli connector new <Redacted.value(connector.token)>
 * ```
 *
 * **Example:** Route a private network through the connector
 * ```typescript
 * yield* Cloudflare.Tunnel.Route("SiteANet", {
 *   tunnelId: connector.tunnelId,
 *   network: "10.8.0.0/16",
 * });
 * ```
 *
 * ### Renaming
 * **Example:** Replace with a new name
 * ```typescript
 * // Renaming creates a new tunnel with a new tunnelId.
 * const connector = yield* Cloudflare.Tunnel.WarpConnector("SiteA", {
 *   name: "site-a-connector-v2",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/private-net/warp-connector/
 *
 * @resource
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export declare const WarpConnector: import("../../Resource.ts").ResourceClass<WarpConnector>;
/**
 * Returns true if the given value is a WarpConnector resource.
 */
export declare const isWarpConnector: (value: unknown) => value is WarpConnector;
export declare const WarpConnectorProvider: () => import("effect/Layer").Layer<Provider.Provider<WarpConnector>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=WarpConnector.d.ts.map