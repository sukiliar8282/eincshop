import * as cache from "@distilled.cloud/cloudflare/cache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Cache.Reserve";
type TypeId = typeof TypeId;
export interface ReserveProps {
    /**
     * Zone whose Cache Reserve setting is managed. Stable — changing the
     * zone triggers a replacement (the old zone's setting is restored to
     * the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Cache Reserve is enabled on the zone (`value: "on"`) or
     * disabled (`value: "off"`). Mutable — patched in place.
     * @default true
     */
    enabled?: boolean;
    /**
     * When true, destroying the resource also clears any data already
     * stored in Cache Reserve (after restoring the setting), waiting for
     * the asynchronous clear operation to complete. Disabling Cache
     * Reserve does NOT purge stored data by itself — storage continues to
     * bill until it expires or is cleared.
     * @default false
     */
    clearOnDelete?: boolean;
}
export interface ReserveAttributes {
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
export type Reserve = Resource<TypeId, ReserveProps, ReserveAttributes, never, Providers>;
/**
 * The Cache Reserve setting of a Cloudflare zone
 * (`/zones/{zone_id}/cache/cache_reserve`).
 *
 * Cache Reserve is a large, persistent data store backed by R2 that serves
 * as the ultimate upper-tier cache, dramatically reducing origin egress for
 * cacheable content. The setting is a zone **singleton** — it always exists
 * on entitled zones (default `off`), so this resource never creates or
 * deletes anything physical. Reconcile patches the setting when the
 * observed value differs from the desired one; destroy restores the value
 * the setting had before Alchemy first managed it (captured as
 * `initialValue`).
 *
 * **Entitlement-gated**: Cache Reserve is a usage-billed add-on that must
 * be purchased/enabled on the account. On zones without the subscription
 * both reads and writes fail with the typed `SettingUnavailableForPlan`
 * error ("this zone setting is not available for your plan type").
 *
 * Disabling Cache Reserve does not purge data already in reserve — set
 * `clearOnDelete: true` to run the asynchronous Cache Reserve Clear
 * operation on destroy (the provider polls until the clear completes).
 *
 * Only one `Reserve` resource per zone makes sense — two instances
 * managing the same zone would fight over the singleton.
 * ### Managing Cache Reserve
 * **Example:** Enable Cache Reserve on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Cache.Reserve("Reserve", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Clear stored data when the resource is destroyed
 * ```typescript
 * yield* Cloudflare.Cache.Reserve("Reserve", {
 *   zoneId: zone.zoneId,
 *   clearOnDelete: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cache/advanced-configuration/cache-reserve/
 *
 * @resource
 * @product Cache
 * @category Performance & Reliability
 */
export declare const Reserve: import("../../Resource.ts").ResourceClass<Reserve>;
/**
 * Returns true if the given value is a Reserve resource.
 */
export declare const isReserve: (value: unknown) => value is Reserve;
export declare const ReserveProvider: () => import("effect/Layer").Layer<Provider.Provider<Reserve>, never, CloudflareEnvironment | cache.CloudflareOpContext>;
export {};
//# sourceMappingURL=Reserve.d.ts.map