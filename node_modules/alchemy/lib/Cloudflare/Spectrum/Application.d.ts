import * as spectrum from "@distilled.cloud/cloudflare/spectrum";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Spectrum.Application";
type TypeId = typeof TypeId;
/**
 * How data travels from Cloudflare's edge to the origin. `direct` sends
 * traffic straight to the origin; `http`/`https` apply HTTP(S) processing
 * (Enterprise only).
 */
export type TrafficType = "direct" | "http" | "https";
/**
 * The type of TLS termination at the edge for a Spectrum application.
 */
export type Tls = "off" | "flexible" | "full" | "strict";
/**
 * PROXY Protocol mode for origin connections.
 */
export type ProxyProtocol = "off" | "v1" | "v2" | "simple";
/**
 * The edge DNS record Spectrum creates for the application — the hostname
 * clients connect to. Must live inside the application's zone.
 */
export interface Dns {
    /**
     * The fully-qualified edge hostname, e.g. `ssh.example.com`. Together
     * with `protocol`, this is the user-visible identity of the application
     * within a zone.
     */
    name: string;
    /**
     * The kind of edge DNS record Spectrum manages: `CNAME` (dynamic edge
     * IPs) or `ADDRESS` (static BYOIP edge IPs, Enterprise only).
     */
    type: "CNAME" | "ADDRESS";
}
/**
 * Origin lookup via DNS instead of fixed addresses. Requires `originPort`.
 */
export interface OriginDns {
    /**
     * The hostname of the origin server.
     */
    name?: string;
    /**
     * TTL of the origin DNS lookup, in seconds.
     */
    ttl?: number;
    /**
     * The DNS record type to resolve: `A`, `AAAA`, `SRV`, or `""` to let
     * Cloudflare pick.
     */
    type?: "" | "A" | "AAAA" | "SRV";
}
/**
 * The anycast edge IP configuration for the application's hostname.
 */
export interface EdgeIps {
    /**
     * `dynamic` (default) lets Cloudflare assign edge IPs; `static` pins the
     * application to BYOIP addresses listed in `ips` (Enterprise only).
     * @default "dynamic"
     */
    type?: "dynamic" | "static";
    /**
     * IP-version reachability of the dynamic edge IPs.
     * @default "all"
     */
    connectivity?: "all" | "ipv4" | "ipv6";
    /**
     * Static BYOIP edge addresses (only with `type: "static"`).
     */
    ips?: string[];
}
export interface ApplicationProps {
    /**
     * Zone the application is created in. Stable — moving an application to
     * a different zone triggers a replacement.
     */
    zoneId: string;
    /**
     * The edge DNS record (hostname + record type) for the application.
     * Mutable — the PUT update accepts a new `dns`, but note `dns.name` +
     * `protocol` is the identity used for cold-state recovery.
     */
    dns: Dns;
    /**
     * The edge port configuration, e.g. `"tcp/22"`, `"udp/53"`, or a range
     * `"tcp/1000-2000"`. Arbitrary ports, ranges, and UDP require an
     * Enterprise plan with Spectrum; Pro zones get `tcp/22` and `tcp/25565`.
     */
    protocol: string;
    /**
     * How traffic travels to the origin. `http`/`https` are Enterprise only.
     * @default "direct"
     */
    trafficType?: TrafficType;
    /**
     * Fixed origin addresses, e.g. `["tcp://203.0.113.1:22"]`. Provide
     * either `originDirect` or `originDns` + `originPort`.
     */
    originDirect?: string[];
    /**
     * Origin lookup via DNS. Must be combined with `originPort`.
     */
    originDns?: OriginDns;
    /**
     * The destination port at the origin (only with `originDns`). A range
     * string (e.g. `"1000-2000"`) is Enterprise only.
     */
    originPort?: number | string;
    /**
     * TLS termination at the edge. Only meaningful for `http`/`https`
     * traffic types — Cloudflare rejects the field on `direct` TCP apps, so
     * leave it unset for those.
     */
    tls?: Tls;
    /**
     * Enables Argo Smart Routing (TCP + `direct` traffic type only).
     * @default false
     */
    argoSmartRouting?: boolean;
    /**
     * Enables IP Access rules for this application (TCP only).
     * @default false
     */
    ipFirewall?: boolean;
    /**
     * Enables PROXY Protocol to the origin.
     * @default "off"
     */
    proxyProtocol?: ProxyProtocol;
    /**
     * The anycast edge IP configuration. Static BYOIP addresses are
     * Enterprise only.
     * @default { type: "dynamic", connectivity: "all" }
     */
    edgeIps?: EdgeIps;
    /**
     * UUID of a tunnel virtual network to route origin traffic through.
     */
    virtualNetworkId?: string;
}
export interface ApplicationAttributes {
    /** Cloudflare-assigned identifier of the Spectrum application. */
    appId: string;
    /** Zone the application belongs to. */
    zoneId: string;
    /** The edge hostname clients connect to. */
    dnsName: string;
    /** The kind of edge DNS record (`CNAME` or `ADDRESS`). */
    dnsType: "CNAME" | "ADDRESS";
    /** The edge port configuration, e.g. `tcp/22`. */
    protocol: string;
    /** How traffic travels to the origin. */
    trafficType: TrafficType;
    /** Fixed origin addresses, if configured. */
    originDirect: string[] | undefined;
    /** Origin DNS lookup configuration, if configured. */
    originDns: OriginDns | undefined;
    /** The destination port at the origin, if configured. */
    originPort: number | string | undefined;
    /** TLS termination at the edge, if reported. */
    tls: Tls | undefined;
    /** Whether Argo Smart Routing is enabled. */
    argoSmartRouting: boolean;
    /** Whether IP Access rules are enabled. */
    ipFirewall: boolean;
    /** PROXY Protocol mode to the origin. */
    proxyProtocol: ProxyProtocol;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type Application = Resource<TypeId, ApplicationProps, ApplicationAttributes, never, Providers>;
/**
 * A Cloudflare Spectrum application — DDoS protection and proxying for
 * arbitrary TCP/UDP services (SSH, Minecraft, RDP, custom protocols), not
 * just HTTP.
 *
 * An application is identified by its auto-assigned `appId`; its
 * user-visible identity within a zone is the edge hostname (`dns.name`) +
 * `protocol` pair. All configuration is mutable in place via PUT — only
 * `zoneId` forces a replacement.
 *
 * Spectrum is plan-gated: Pro zones get SSH (`tcp/22`) and Minecraft
 * (`tcp/25565`), Business adds RDP, and Enterprise unlocks arbitrary
 * ports/ranges, UDP, static edge IPs, and PROXY Protocol. On unentitled
 * zones every create fails with the typed `SpectrumProtocolNotAvailable`
 * error.
 *
 * Safety: Spectrum applications carry no ownership markers. When there is
 * no prior state, `read` scans the zone for an application with the same
 * `dns.name` + `protocol` and reports it as `Unowned`, so the engine
 * refuses to take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Proxying SSH
 * **Example:** SSH on a fixed origin address
 * ```typescript
 * const ssh = yield* Cloudflare.Spectrum.Application("Ssh", {
 *   zoneId: zone.zoneId,
 *   dns: { type: "CNAME", name: "ssh.example.com" },
 *   protocol: "tcp/22",
 *   originDirect: ["tcp://203.0.113.1:22"],
 * });
 * ```
 *
 * ### Origin via DNS
 * **Example:** Resolve the origin by hostname
 * ```typescript
 * yield* Cloudflare.Spectrum.Application("Minecraft", {
 *   zoneId: zone.zoneId,
 *   dns: { type: "CNAME", name: "mc.example.com" },
 *   protocol: "tcp/25565",
 *   originDns: { name: "origin.example.com" },
 *   originPort: 25565,
 * });
 * ```
 *
 * ### Enterprise features
 * **Example:** UDP with IP firewall and PROXY protocol
 * ```typescript
 * // Arbitrary ports/protocols, UDP, and proxyProtocol require an
 * // Enterprise plan with Spectrum.
 * yield* Cloudflare.Spectrum.Application("Dns", {
 *   zoneId: zone.zoneId,
 *   dns: { type: "CNAME", name: "dns.example.com" },
 *   protocol: "udp/53",
 *   originDirect: ["udp://203.0.113.1:53"],
 *   ipFirewall: true,
 *   proxyProtocol: "simple",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/spectrum/
 *
 * @resource
 * @product Spectrum
 * @category Network
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
/**
 * Returns true if the given value is a Application resource.
 */
export declare const isApplication: (value: unknown) => value is Application;
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, CloudflareEnvironment | spectrum.CloudflareOpContext>;
export {};
//# sourceMappingURL=Application.d.ts.map