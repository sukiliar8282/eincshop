import * as cache from "@distilled.cloud/cloudflare/cache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Cache.SmartTieredCache";
type TypeId = typeof TypeId;
export interface SmartTieredCacheProps {
    /**
     * Zone whose Smart Tiered Cache setting is managed. Stable — changing
     * the zone triggers a replacement (the old zone's setting is restored
     * to the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Smart Tiered Cache is enabled on the zone (`value: "on"`)
     * or disabled (`value: "off"`). Mutable — patched in place.
     * @default true
     */
    enabled?: boolean;
}
export interface SmartTieredCacheAttributes {
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
export type SmartTieredCache = Resource<TypeId, SmartTieredCacheProps, SmartTieredCacheAttributes, never, Providers>;
/**
 * The Smart Tiered Cache setting of a Cloudflare zone
 * (`/zones/{zone_id}/cache/tiered_cache_smart_topology_enable`).
 *
 * Smart Tiered Cache dynamically selects the single best upper-tier data
 * center for each origin, reducing requests that reach the origin. The
 * setting is a zone **singleton** — it always exists on every zone (default
 * `off`), so this resource never creates or deletes anything physical.
 * Reconcile patches the setting when the observed value differs from the
 * desired one; destroy restores the value the setting had before Alchemy
 * first managed it (captured as `initialValue`).
 *
 * Only one `SmartTieredCache` resource per zone makes sense — two instances
 * managing the same zone would fight over the singleton.
 * ### Managing Smart Tiered Cache
 * **Example:** Enable Smart Tiered Cache on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Cache.SmartTieredCache("SmartCache", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Explicitly disable Smart Tiered Cache
 * ```typescript
 * yield* Cloudflare.Cache.SmartTieredCache("SmartCache", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cache/how-to/tiered-cache/
 *
 * @resource
 * @product Cache
 * @category Performance & Reliability
 */
export declare const SmartTieredCache: import("../../Resource.ts").ResourceClass<SmartTieredCache>;
/**
 * Returns true if the given value is a SmartTieredCache resource.
 */
export declare const isSmartTieredCache: (value: unknown) => value is SmartTieredCache;
export declare const SmartTieredCacheProvider: () => import("effect/Layer").Layer<Provider.Provider<SmartTieredCache>, never, CloudflareEnvironment | cache.CloudflareOpContext>;
export {};
//# sourceMappingURL=SmartTieredCache.d.ts.map