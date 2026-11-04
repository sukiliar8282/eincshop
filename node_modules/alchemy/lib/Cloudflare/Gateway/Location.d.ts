import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Gateway.Location";
type TypeId = typeof TypeId;
/**
 * A source network range (CIDR) requests at a Gateway location may
 * originate from.
 */
export interface LocationNetwork {
    /**
     * IPv4 CIDR, e.g. `203.0.113.0/24`.
     */
    network: string;
}
/**
 * Destination endpoint configuration for a Gateway location. Re-exports
 * distilled's request shape so every server-recognised knob (DoH networks
 * and token requirement, DoT, IPv4/IPv6 toggles) is available without
 * re-declaring the structure.
 */
export type LocationEndpoints = NonNullable<zeroTrust.UpdateGatewayLocationRequest["endpoints"]>;
export interface LocationProps {
    /**
     * Display name for the location. Used as a stable identifier so the
     * provider can locate it by name during adoption / state recovery. If
     * omitted, a unique name is generated from the app, stage, and logical ID.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Whether this location is the default for the account. Cloudflare
     * rejects demoting the current default directly — promote another
     * location instead. Mutable.
     *
     * @default false
     */
    clientDefault?: boolean;
    /**
     * Whether the location must resolve EDNS (EDNS Client Subnet) queries.
     * Mutable.
     *
     * @default false
     */
    ecsSupport?: boolean;
    /**
     * Identifier of the pair of DNS destination IPv4 addresses assigned to
     * this location. When absent, Cloudflare's shared IPv4 pair is used.
     * Mutable.
     */
    dnsDestinationIpsId?: string;
    /**
     * Destination endpoint configuration (DoH / DoT / IPv4 / IPv6 toggles
     * and source networks). Mutable.
     */
    endpoints?: LocationEndpoints;
    /**
     * Source network ranges (IPv4 CIDRs) requests at this location originate
     * from. Only takes effect when non-empty and the IPv4 endpoint is
     * enabled. Mutable.
     *
     * @default []
     */
    networks?: LocationNetwork[];
}
export interface LocationAttributes {
    /** UUID of the location, assigned by Cloudflare. */
    locationId: string;
    /** Cloudflare account that owns the location. */
    accountId: string;
    /** Display name of the location. */
    name: string;
    /** Whether this location is the account default. */
    clientDefault: boolean;
    /** Whether the location resolves EDNS queries. */
    ecsSupport: boolean;
    /**
     * Server-generated DNS-over-HTTPS subdomain that receives this
     * location's DNS requests (`https://<dohSubdomain>.cloudflare-gateway.com/dns-query`).
     */
    dohSubdomain: string | undefined;
    /** Auto-generated IPv6 destination IP assigned to this location. */
    ip: string | undefined;
    /** Primary DNS destination IPv4 address (read-only, server-assigned). */
    ipv4Destination: string | undefined;
    /** Identifier of the DNS destination IPv4 pair, if a dedicated pair is assigned. */
    dnsDestinationIpsId: string | undefined;
    /** Source network ranges configured for this location. */
    networks: LocationNetwork[];
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-update timestamp. */
    updatedAt: string | undefined;
}
export type Location = Resource<TypeId, LocationProps, LocationAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust Gateway DNS location — a configured source of
 * DNS traffic (an office, a home network, a device fleet) with its own
 * DNS-over-HTTPS endpoint and optional dedicated destination IPs.
 *
 * Cloudflare assigns each location a stable `dohSubdomain`; point your
 * network's DoH resolver at
 * `https://<dohSubdomain>.cloudflare-gateway.com/dns-query` and Gateway
 * DNS policies apply to its traffic. All declared properties converge in
 * place — nothing on a location forces a replacement.
 * ### Creating a Location
 * **Example:** DoH-only location
 * ```typescript
 * const office = yield* Cloudflare.Gateway.Location("Office", {
 *   ecsSupport: false,
 * });
 * // Point your resolver at the assigned DoH endpoint:
 * const doh = office.dohSubdomain;
 * ```
 *
 * **Example:** Location with IPv4 source networks
 * ```typescript
 * const office = yield* Cloudflare.Gateway.Location("Office", {
 *   networks: [{ network: "203.0.113.0/24" }],
 *   endpoints: {
 *     doh: { enabled: true },
 *     dot: { enabled: false },
 *     ipv4: { enabled: true },
 *     ipv6: { enabled: false },
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/agentless/dns/locations/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export declare const Location: import("../../Resource.ts").ResourceClass<Location>;
/**
 * Returns true if the given value is a Location resource.
 */
export declare const isLocation: (value: unknown) => value is Location;
export declare const LocationProvider: () => import("effect/Layer").Layer<Provider.Provider<Location>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=Location.d.ts.map