import * as argo from "@distilled.cloud/cloudflare/argo";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Argo.TieredCaching";
type TypeId = typeof TypeId;
export type TieredCachingProps = {
    /**
     * Zone the Tiered Caching setting belongs to. Stable — changing the
     * zone triggers a replacement (the old zone's setting is restored to
     * the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Tiered Caching is enabled on the zone. Mutable — patched in
     * place.
     *
     * @default true
     */
    enabled?: boolean;
};
export type TieredCachingAttributes = {
    /** Zone the Tiered Caching setting belongs to. */
    zoneId: string;
    /** Resolved current value of the setting (`"on"` or `"off"`). */
    value: "on" | "off";
    /**
     * Whether the setting can be modified on the zone's current plan.
     */
    editable: boolean;
    /** When the setting was last modified, if Cloudflare reports it. */
    modifiedOn: string | undefined;
    /**
     * The value the setting had before Alchemy first patched it. Restored
     * on destroy, so deleting the resource puts the zone back the way it
     * was found.
     */
    initialValue: "on" | "off";
};
export type TieredCaching = Resource<TypeId, TieredCachingProps, TieredCachingAttributes, never, Providers>;
/**
 * Tiered Caching for a Cloudflare zone
 * (`/zones/{zone_id}/argo/tiered_caching`).
 *
 * Tiered Caching routes cache misses through upper-tier Cloudflare data
 * centers instead of every edge location contacting the origin directly,
 * reducing origin load and improving cache hit ratios. It is available on
 * all plans, free included.
 *
 * The setting is a singleton — it always exists on every zone with a
 * Cloudflare default, so this resource never creates or deletes anything
 * physical. Reconcile patches the setting when the observed value differs
 * from the desired one; destroy restores the value the setting had before
 * Alchemy first managed it (captured as `initialValue`).
 *
 * This is the generic Tiered Cache toggle (the dashboard "Tiered Cache"
 * switch). Smart Tiered Cache (the smart-topology variant managed under
 * `/cache/tiered_cache_smart_topology_enable`) requires Tiered Caching to
 * be enabled — deploy this resource first when combining the two.
 * ### Enabling Tiered Caching
 * **Example:** Enable Tiered Caching on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Argo.TieredCaching("TieredCaching", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Explicitly disable Tiered Caching
 * ```typescript
 * yield* Cloudflare.Argo.TieredCaching("TieredCaching", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cache/how-to/tiered-cache/
 *
 * @resource
 * @product Argo
 * @category Performance & Reliability
 */
export declare const TieredCaching: import("../../Resource.ts").ResourceClass<TieredCaching>;
/**
 * Returns true if the given value is a TieredCaching resource.
 */
export declare const isTieredCaching: (value: unknown) => value is TieredCaching;
export declare const TieredCachingProvider: () => import("effect/Layer").Layer<Provider.Provider<TieredCaching>, never, CloudflareEnvironment | argo.CloudflareOpContext>;
export {};
//# sourceMappingURL=TieredCaching.d.ts.map