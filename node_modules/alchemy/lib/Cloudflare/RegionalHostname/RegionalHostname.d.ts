import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.RegionalHostname.RegionalHostname";
type TypeId = typeof TypeId;
export interface Props {
    /**
     * The zone the regional hostname belongs to. Changing it forces a
     * replacement.
     */
    zoneId: string;
    /**
     * DNS hostname to be regionalized. Must be a subdomain of the zone;
     * wildcards are supported for one level (e.g. `*.example.com`). The
     * hostname is the API path identifier — changing it forces a replacement.
     */
    hostname: string;
    /**
     * Identifying key for the region (e.g. `"eu"`, `"us"` — discoverable via
     * `addressing.listRegionalHostnameRegions`). Mutable — patched in place.
     */
    regionKey: string;
    /**
     * Which routing method to use for the regional hostname. Create-only —
     * the PATCH endpoint only accepts `regionKey`, so changing it forces a
     * replacement.
     */
    routing?: string;
}
export interface Attributes {
    /** The zone the regional hostname belongs to. */
    zoneId: string;
    /** The regionalized DNS hostname. */
    hostname: string;
    /** Identifying key for the region. */
    regionKey: string;
    /** Routing method used for the regional hostname, if set. */
    routing: string | undefined;
    /** When the regional hostname was created. */
    createdOn: string;
}
export type RegionalHostname = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A Regional Hostname restricts which Cloudflare data centers decrypt and
 * service HTTPS traffic for a hostname (Data Localization Suite / Regional
 * Services).
 *
 * A DNS record for the hostname must exist in the zone for regionalization
 * to take effect (soft dependency on `Cloudflare.DNS.Record`). Only
 * `regionKey` is mutable; `hostname` is the path identifier and `routing`
 * is create-only, so both force a replacement.
 *
 * Requires the Data Localization Suite (or Enterprise) entitlement on the
 * zone.
 * ### Regionalizing a Hostname
 * **Example:** Pin a hostname to the EU
 * ```typescript
 * const regional = yield* Cloudflare.RegionalHostname.RegionalHostname("eu-only", {
 *   zoneId: zone.zoneId,
 *   hostname: "app.example.com",
 *   regionKey: "eu",
 * });
 * ```
 *
 * **Example:** Move it to the US in place
 * ```typescript
 * const regional = yield* Cloudflare.RegionalHostname.RegionalHostname("eu-only", {
 *   zoneId: zone.zoneId,
 *   hostname: "app.example.com",
 *   regionKey: "us",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/data-localization/regional-services/
 *
 * @resource
 * @product Regional Hostnames
 * @category Domains & DNS
 */
export declare const RegionalHostname: import("../../Resource.ts").ResourceClass<RegionalHostname>;
/**
 * Returns true if the given value is a RegionalHostname resource.
 */
export declare const isRegionalHostname: (value: unknown) => value is RegionalHostname;
export declare const RegionalHostnameProvider: () => import("effect/Layer").Layer<Provider.Provider<RegionalHostname>, never, CloudflareEnvironment | addressing.CloudflareOpContext>;
export {};
//# sourceMappingURL=RegionalHostname.d.ts.map