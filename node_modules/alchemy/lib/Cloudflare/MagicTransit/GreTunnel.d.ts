import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicTransit.GreTunnel";
type TypeId = typeof TypeId;
/**
 * Health-check configuration for a Magic Transit tunnel.
 */
export interface MagicTunnelHealthCheck {
    /**
     * Whether tunnel health checks are enabled.
     * @default true
     */
    enabled?: boolean;
    /**
     * Direction of the health check: `unidirectional` (default for Magic
     * Transit) probes only Cloudflare-to-customer, `bidirectional` probes
     * both directions.
     */
    direction?: "unidirectional" | "bidirectional";
    /**
     * Rate at which health checks are sent.
     * @default "mid"
     */
    rate?: "low" | "mid" | "high";
    /**
     * Health-check type: `reply` (default) expects ICMP replies, `request`
     * sends ICMP requests only.
     */
    type?: "reply" | "request";
    /**
     * The customer IP the health check targets. Defaults to
     * `customer_gre_endpoint` when omitted.
     */
    target?: string;
}
/**
 * BGP configuration for a Magic Transit tunnel.
 */
export interface MagicTunnelBgp {
    /**
     * ASN used on the customer end of the BGP session.
     */
    customerAsn: number;
    /**
     * Prefixes advertised in addition to the account's Magic prefixes.
     */
    extraPrefixes?: string[];
    /**
     * MD5 key to use for session authentication. Write-only.
     */
    md5Key?: Redacted.Redacted<string>;
}
export interface GreTunnelProps {
    /**
     * The name of the tunnel. Cannot contain spaces or special characters,
     * must be 15 characters or less, and cannot share a name with another GRE
     * tunnel. Immutable in practice — changing it triggers a replacement.
     */
    name: string;
    /**
     * The IP address assigned to the Cloudflare side of the GRE tunnel (a
     * Cloudflare anycast IP allocated to the account).
     */
    cloudflareGreEndpoint: string;
    /**
     * The IP address assigned to the customer side of the GRE tunnel.
     */
    customerGreEndpoint: string;
    /**
     * A 31-bit prefix (/31 in CIDR notation) from RFC1918 private space; one
     * host for each side of the tunnel.
     */
    interfaceAddress: string;
    /**
     * A /127 IPv6 prefix from within the account's `virtual_subnet6` space.
     */
    interfaceAddress6?: string;
    /**
     * An optional description of the GRE tunnel.
     */
    description?: string;
    /**
     * Time To Live (TTL) in number of hops of the GRE tunnel.
     * @default 64
     */
    ttl?: number;
    /**
     * Maximum Transmission Unit (MTU) in bytes for the GRE tunnel. Minimum
     * value is 576.
     * @default 1476
     */
    mtu?: number;
    /**
     * Tunnel health-check configuration.
     */
    healthCheck?: MagicTunnelHealthCheck;
    /**
     * BGP configuration. The update API cannot change BGP settings —
     * changing this triggers a replacement.
     */
    bgp?: MagicTunnelBgp;
    /**
     * True if automatic stateful return routing should be enabled. Requires
     * the `coupler_integration` account flag.
     * @default false
     */
    automaticReturnRouting?: boolean;
}
export interface GreTunnelAttributes {
    /** Cloudflare-assigned identifier of the GRE tunnel. */
    tunnelId: string;
    /** The Cloudflare account the tunnel belongs to. */
    accountId: string;
    /** The name of the tunnel. */
    name: string;
    /** The IP address on the Cloudflare side of the tunnel. */
    cloudflareGreEndpoint: string;
    /** The IP address on the customer side of the tunnel. */
    customerGreEndpoint: string;
    /** The /31 interface address of the tunnel. */
    interfaceAddress: string;
    /** The /127 IPv6 interface address, if configured. */
    interfaceAddress6: string | undefined;
    /** The tunnel description, if set. */
    description: string | undefined;
    /** Time To Live (TTL) in number of hops. */
    ttl: number | undefined;
    /** Maximum Transmission Unit (MTU) in bytes. */
    mtu: number | undefined;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type GreTunnel = Resource<TypeId, GreTunnelProps, GreTunnelAttributes, never, Providers>;
/**
 * A Magic Transit / Magic WAN GRE tunnel between Cloudflare and a customer
 * router.
 *
 * Requires a Magic Transit or Magic WAN subscription on the account —
 * accounts that are not onboarded receive a typed
 * `MagicTransitNotOnboarded` error (Cloudflare code 1012).
 *
 * The tunnel `name` is its routing identity (unique, ≤15 chars) — changing
 * it triggers a replacement, as does changing `bgp` (the update API cannot
 * modify BGP settings). Everything else is updated in place via PUT.
 * ### Creating a GRE tunnel
 * **Example:** Basic tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.MagicTransit.GreTunnel("office", {
 *   name: "office-gre-1",
 *   cloudflareGreEndpoint: "203.0.113.1",
 *   customerGreEndpoint: "198.51.100.1",
 *   interfaceAddress: "10.213.0.8/31",
 * });
 * ```
 *
 * **Example:** Tunnel with health checks and MTU
 * ```typescript
 * const tunnel = yield* Cloudflare.MagicTransit.GreTunnel("office", {
 *   name: "office-gre-1",
 *   cloudflareGreEndpoint: "203.0.113.1",
 *   customerGreEndpoint: "198.51.100.1",
 *   interfaceAddress: "10.213.0.8/31",
 *   mtu: 1476,
 *   ttl: 64,
 *   healthCheck: { enabled: true, rate: "mid", type: "reply" },
 * });
 * ```
 *
 * ### Routing traffic over the tunnel
 * **Example:** Static route via the tunnel interface
 * ```typescript
 * yield* Cloudflare.MagicTransit.MagicStaticRoute("office-route", {
 *   prefix: "10.100.0.0/24",
 *   nexthop: "10.213.0.9",
 *   priority: 100,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-transit/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export declare const GreTunnel: import("../../Resource.ts").ResourceClass<GreTunnel>;
/**
 * Returns true if the given value is a GreTunnel resource.
 */
export declare const isGreTunnel: (value: unknown) => value is GreTunnel;
export declare const GreTunnelProvider: () => import("effect/Layer").Layer<Provider.Provider<GreTunnel>, never, CloudflareEnvironment | magicTransit.CloudflareOpContext>;
export {};
//# sourceMappingURL=GreTunnel.d.ts.map