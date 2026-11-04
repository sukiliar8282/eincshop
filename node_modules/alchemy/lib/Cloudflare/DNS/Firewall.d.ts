import * as dnsFirewall from "@distilled.cloud/cloudflare/dns-firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.Firewall";
type TypeId = typeof TypeId;
/**
 * Attack mitigation settings for a DNS Firewall cluster.
 */
export type AttackMitigation = {
    /**
     * When enabled, automatically mitigate random-prefix attacks to protect
     * upstream DNS servers.
     * @default false
     */
    enabled?: boolean;
    /**
     * Only mitigate attacks when upstream servers seem unhealthy.
     * @default false
     */
    onlyWhenUpstreamUnhealthy?: boolean;
};
export type FirewallProps = {
    /**
     * DNS Firewall cluster name. Changing the name triggers a replacement —
     * the name is the identity used for cold-state recovery. If omitted, a
     * unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Upstream DNS server IPs the cluster forwards queries to. At least one
     * is required.
     */
    upstreamIps: string[];
    /**
     * Attack mitigation settings.
     * @default disabled
     */
    attackMitigation?: AttackMitigation;
    /**
     * Whether to refuse to answer queries for the ANY type.
     * @default false
     */
    deprecateAnyRequests?: boolean;
    /**
     * Whether to forward the client IP (resolver) subnet if no EDNS Client
     * Subnet is sent.
     * @default false
     */
    ecsFallback?: boolean;
    /**
     * Upper bound (in seconds) on how long responses are cached, regardless
     * of the TTL received from the upstream nameservers.
     * @default 900
     */
    maximumCacheTtl?: number;
    /**
     * Lower bound (in seconds) on how long responses are cached, regardless
     * of the TTL received from the upstream nameservers.
     * @default 60
     */
    minimumCacheTtl?: number;
    /**
     * How long (in seconds) DNS Firewall caches negative responses (e.g.
     * NXDOMAIN) from the upstream servers. `null` uses Cloudflare's default
     * behavior.
     * @default null
     */
    negativeCacheTtl?: number | null;
    /**
     * Ratelimit in queries per second per datacenter, applied to queries
     * sent to the upstream nameservers. `null` disables the limit.
     * @default null
     */
    ratelimit?: number | null;
    /**
     * Number of retries for fetching DNS responses from upstream nameservers
     * (not counting the initial attempt).
     * @default 2
     */
    retries?: number;
    /**
     * Reverse DNS (PTR) mappings for the cluster's assigned IPs — a map of
     * cluster IP address to PTR record content. Only the entries listed here
     * are managed: entries are upserted, and removing an entry from this map
     * leaves the PTR in place (clear it explicitly with an empty string).
     */
    reverseDns?: Record<string, string>;
};
export type FirewallAttributes = {
    /**
     * DNS Firewall cluster identifier (UUID).
     */
    dnsFirewallId: string;
    /**
     * The Cloudflare account the cluster belongs to.
     */
    accountId: string;
    /**
     * DNS Firewall cluster name.
     */
    name: string;
    /**
     * The Cloudflare-assigned anycast IPs of the cluster. Point NS glue
     * records at these.
     */
    dnsFirewallIps: string[];
    /**
     * Upstream DNS server IPs the cluster forwards queries to.
     */
    upstreamIps: string[];
    /**
     * Attack mitigation settings.
     */
    attackMitigation: {
        enabled: boolean;
        onlyWhenUpstreamUnhealthy: boolean;
    };
    /**
     * Whether queries for the ANY type are refused.
     */
    deprecateAnyRequests: boolean;
    /**
     * Whether the client IP (resolver) subnet is forwarded when no EDNS
     * Client Subnet is sent.
     */
    ecsFallback: boolean;
    /**
     * Upper bound (in seconds) on response cache duration.
     */
    maximumCacheTtl: number;
    /**
     * Lower bound (in seconds) on response cache duration.
     */
    minimumCacheTtl: number;
    /**
     * Negative response cache duration (in seconds), or `null` for
     * Cloudflare's default behavior.
     */
    negativeCacheTtl: number | null;
    /**
     * Ratelimit in queries per second per datacenter, or `null` when
     * disabled.
     */
    ratelimit: number | null;
    /**
     * Number of retries for fetching DNS responses from upstream
     * nameservers.
     */
    retries: number;
    /**
     * Reverse DNS (PTR) mappings managed on the cluster, when the
     * `reverseDns` prop is set.
     */
    reverseDns: Record<string, string> | undefined;
    /**
     * Last modification time of the cluster.
     */
    modifiedOn: string;
};
export type Firewall = Resource<TypeId, FirewallProps, FirewallAttributes, never, Providers>;
/**
 * A Cloudflare DNS Firewall cluster.
 *
 * DNS Firewall sits in front of your authoritative DNS infrastructure,
 * caching responses on Cloudflare's anycast network and shielding the
 * upstream nameservers from attack traffic. Creating a cluster assigns a
 * set of Cloudflare anycast IPs (`dnsFirewallIps`) that you point NS glue
 * records at; queries hitting those IPs are answered from cache or
 * forwarded to your `upstreamIps`.
 *
 * DNS Firewall is a paid add-on (typically Enterprise / contract). On
 * accounts without the entitlement, creation fails with the typed
 * `DnsFirewallNotEntitled` error (Cloudflare error code 10101).
 *
 * All settings are mutable in place; only `name` (the cold-state recovery
 * identity) triggers a replacement.
 * ### Creating a Cluster
 * **Example:** Basic cluster
 * ```typescript
 * const cluster = yield* Cloudflare.DNS.Firewall("dns-shield", {
 *   upstreamIps: ["192.0.2.1", "192.0.2.2"],
 * });
 * // Point NS glue records at the assigned anycast IPs:
 * const ips = cluster.dnsFirewallIps;
 * ```
 *
 * **Example:** Tuned caching and attack mitigation
 * ```typescript
 * const cluster = yield* Cloudflare.DNS.Firewall("dns-shield", {
 *   upstreamIps: ["192.0.2.1"],
 *   minimumCacheTtl: 120,
 *   maximumCacheTtl: 3600,
 *   negativeCacheTtl: 300,
 *   ratelimit: 600,
 *   retries: 2,
 *   attackMitigation: {
 *     enabled: true,
 *     onlyWhenUpstreamUnhealthy: true,
 *   },
 * });
 * ```
 *
 * ### Reverse DNS
 * **Example:** Managing PTR records for cluster IPs
 * ```typescript
 * const cluster = yield* Cloudflare.DNS.Firewall("dns-shield", {
 *   upstreamIps: ["192.0.2.1"],
 *   reverseDns: {
 *     "203.0.113.1": "ns1.example.com",
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/dns-firewall/
 *
 * @resource
 * @product DNS Firewall
 * @category Domains & DNS
 */
export declare const Firewall: import("../../Resource.ts").ResourceClass<Firewall>;
/**
 * Returns true if the given value is a DnsFirewall resource.
 */
export declare const isFirewall: (value: unknown) => value is Firewall;
export declare const FirewallProvider: () => import("effect/Layer").Layer<Provider.Provider<Firewall>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | dnsFirewall.CloudflareOpContext>;
export {};
//# sourceMappingURL=Firewall.d.ts.map