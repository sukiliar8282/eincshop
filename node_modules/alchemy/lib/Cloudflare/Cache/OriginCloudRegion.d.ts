import * as cache from "@distilled.cloud/cloudflare/cache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Cache.OriginCloudRegion";
type TypeId = typeof TypeId;
/**
 * The cloud vendor hosting an origin. Region identifiers are
 * vendor-specific — the valid set for each vendor is returned by the
 * `supported_regions` endpoint
 * (`/zones/{zone_id}/cache/origin_cloud_regions/supported_regions`).
 */
export type OriginCloudRegionVendor = "aws" | "azure" | "gcp" | "oci";
export interface OriginCloudRegionProps {
    /**
     * Zone the mapping belongs to. Stable — moving the mapping to a
     * different zone triggers a replacement.
     */
    zoneId: string;
    /**
     * Origin IP address (IPv4 or IPv6) the mapping applies to. The IP is the
     * mapping's identity within the zone, so changing it triggers a
     * replacement.
     *
     * Cloudflare normalizes the IP to canonical form before storage
     * (RFC 5952 for IPv6) — supply IPv6 addresses in canonical form so the
     * stored identity matches the prop.
     */
    ip: string;
    /**
     * Cloud vendor hosting the origin. Mutable — patched in place.
     */
    vendor: OriginCloudRegionVendor;
    /**
     * Cloud vendor region identifier, e.g. `us-east-1` for `aws`. Must be a
     * valid region for the specified vendor (see the vendor's entry in the
     * `supported_regions` endpoint). Mutable — patched in place.
     */
    region: string;
}
export interface OriginCloudRegionAttributes {
    /** Zone the mapping belongs to. */
    zoneId: string;
    /** Canonicalized origin IP the mapping applies to. */
    originIp: string;
    /** Cloud vendor hosting the origin. */
    vendor: string;
    /** Cloud vendor region identifier. */
    region: string;
    /** When the mapping was last modified, if Cloudflare reports it. */
    modifiedOn: string | undefined;
}
export type OriginCloudRegion = Resource<TypeId, OriginCloudRegionProps, OriginCloudRegionAttributes, never, Providers>;
/**
 * An origin cloud-region mapping of a Cloudflare zone
 * (`/zones/{zone_id}/cache/origin_cloud_regions`).
 *
 * The mapping tells Cloudflare which public-cloud vendor region hosts a
 * given origin IP, letting Tiered Cache pick an upper-tier data center
 * close to the origin for better cache-fill performance.
 *
 * A mapping's identity is its origin IP within the zone — changing `ip`
 * (or `zoneId`) triggers a replacement, while `vendor` and `region` are
 * patched in place. Mappings carry no ownership markers: when there is no
 * prior state, `read` reports an existing mapping for the same IP as
 * `Unowned`, so the engine refuses to take it over unless `--adopt`
 * (or `adopt(true)`) is set.
 * ### Mapping origins to cloud regions
 * **Example:** Map an origin IP to an AWS region
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Cache.OriginCloudRegion("ApiOrigin", {
 *   zoneId: zone.zoneId,
 *   ip: "192.0.2.10",
 *   vendor: "aws",
 *   region: "us-east-1",
 * });
 * ```
 *
 * **Example:** Map several origins of the same zone
 * ```typescript
 * // One resource per origin IP — the IP is the mapping's identity.
 * yield* Cloudflare.Cache.OriginCloudRegion("UsOrigin", {
 *   zoneId: zone.zoneId,
 *   ip: "192.0.2.10",
 *   vendor: "gcp",
 *   region: "us-central1",
 * });
 * yield* Cloudflare.Cache.OriginCloudRegion("EuOrigin", {
 *   zoneId: zone.zoneId,
 *   ip: "192.0.2.20",
 *   vendor: "gcp",
 *   region: "europe-west1",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cache/how-to/tiered-cache/
 *
 * @resource
 * @product Cache
 * @category Performance & Reliability
 */
export declare const OriginCloudRegion: import("../../Resource.ts").ResourceClass<OriginCloudRegion>;
/**
 * Returns true if the given value is an OriginCloudRegion resource.
 */
export declare const isOriginCloudRegion: (value: unknown) => value is OriginCloudRegion;
export declare const OriginCloudRegionProvider: () => import("effect/Layer").Layer<Provider.Provider<OriginCloudRegion>, never, CloudflareEnvironment | cache.CloudflareOpContext>;
export {};
//# sourceMappingURL=OriginCloudRegion.d.ts.map