import * as cache from "@distilled.cloud/cloudflare/cache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Cache.RegionalTieredCache";
type TypeId = typeof TypeId;
export interface RegionalTieredCacheProps {
    /**
     * Zone whose Regional Tiered Cache setting is managed. Stable —
     * changing the zone triggers a replacement (the old zone's setting is
     * restored to the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Regional Tiered Cache is enabled on the zone (`value: "on"`)
     * or disabled (`value: "off"`). Mutable — patched in place.
     * @default true
     */
    enabled?: boolean;
}
export interface RegionalTieredCacheAttributes {
    /** Zone the setting belongs to. */
    zoneId: string;
    /** Resolved current value of the setting (`"on"` or `"off"`). */
    value: string;
    /**
     * Whether the setting can be modified on the zone's current plan
     * (`false` means the setting is plan-gated).
     */
    editable: boolean;
    /** When the setting was last modified, if Cloudflare reports it. */
    modifiedOn: string | undefined;
    /**
     * The value the setting had before Alchemy first patched it. Restored
     * on destroy, so deleting the resource puts the zone back the way it
     * was found.
     */
    initialValue: string;
}
export type RegionalTieredCache = Resource<TypeId, RegionalTieredCacheProps, RegionalTieredCacheAttributes, never, Providers>;
/**
 * The Regional Tiered Cache setting of a Cloudflare zone
 * (`/zones/{zone_id}/cache/regional_tiered_cache`).
 *
 * Regional Tiered Cache adds a regional layer between Cloudflare's lower
 * tiers and the upper-tier data center, so cache misses in a region only
 * travel to the regional hub instead of crossing the globe. The setting is
 * a zone **singleton** — it always exists on entitled zones (default
 * `off`), so this resource never creates or deletes anything physical.
 * Reconcile patches the setting when the observed value differs from the
 * desired one; destroy restores the value the setting had before Alchemy
 * first managed it (captured as `initialValue`).
 *
 * **Plan-gated**: Regional Tiered Cache requires an Enterprise zone. On
 * lower plans both reads and writes fail with Cloudflare error code 1135
 * ("this zone setting is not available for your plan type"), surfaced as
 * the typed `SettingUnavailableForPlan` error.
 *
 * Only one `RegionalTieredCache` resource per zone makes sense — two
 * instances managing the same zone would fight over the singleton.
 * ### Managing Regional Tiered Cache
 * **Example:** Enable Regional Tiered Cache on an Enterprise zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Cache.RegionalTieredCache("RegionalCache", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Explicitly disable Regional Tiered Cache
 * ```typescript
 * yield* Cloudflare.Cache.RegionalTieredCache("RegionalCache", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cache/how-to/tiered-cache/#regional-tiered-cache
 *
 * @resource
 * @product Cache
 * @category Performance & Reliability
 */
export declare const RegionalTieredCache: import("../../Resource.ts").ResourceClass<RegionalTieredCache>;
/**
 * Returns true if the given value is a RegionalTieredCache resource.
 */
export declare const isRegionalTieredCache: (value: unknown) => value is RegionalTieredCache;
export declare const RegionalTieredCacheProvider: () => import("effect/Layer").Layer<Provider.Provider<RegionalTieredCache>, never, CloudflareEnvironment | cache.CloudflareOpContext>;
export {};
//# sourceMappingURL=RegionalTieredCache.d.ts.map