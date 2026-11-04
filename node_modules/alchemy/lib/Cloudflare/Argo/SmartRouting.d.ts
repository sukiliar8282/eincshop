import * as argo from "@distilled.cloud/cloudflare/argo";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Argo.SmartRouting";
type TypeId = typeof TypeId;
export type SmartRoutingProps = {
    /**
     * Zone the Argo Smart Routing setting belongs to. Stable — changing the
     * zone triggers a replacement (the old zone's setting is restored to
     * the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Argo Smart Routing is enabled on the zone. Mutable — patched
     * in place.
     *
     * @default true
     */
    enabled?: boolean;
};
export type SmartRoutingAttributes = {
    /** Zone the Argo Smart Routing setting belongs to. */
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
export type SmartRouting = Resource<TypeId, SmartRoutingProps, SmartRoutingAttributes, never, Providers>;
/**
 * Argo Smart Routing for a Cloudflare zone
 * (`/zones/{zone_id}/argo/smart_routing`).
 *
 * Argo Smart Routing routes traffic across Cloudflare's network over the
 * least-congested, most-reliable paths instead of standard BGP routes,
 * reducing time to first byte for origin-bound requests.
 *
 * The setting is a singleton — it always exists on every zone with a
 * Cloudflare default, so this resource never creates or deletes anything
 * physical. Reconcile patches the setting when the observed value differs
 * from the desired one; destroy restores the value the setting had before
 * Alchemy first managed it (captured as `initialValue`).
 *
 * Argo Smart Routing is a paid, usage-billed add-on. On a zone without
 * the Argo subscription every read or patch of this setting fails with
 * the typed `NotAuthorized` error (Cloudflare code 1015) — purchase the
 * add-on on the zone before managing this resource.
 * ### Enabling Smart Routing
 * **Example:** Enable Argo Smart Routing on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Argo.SmartRouting("SmartRouting", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Explicitly disable Argo Smart Routing
 * ```typescript
 * yield* Cloudflare.Argo.SmartRouting("SmartRouting", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/argo-smart-routing/
 *
 * @resource
 * @product Argo
 * @category Performance & Reliability
 */
export declare const SmartRouting: import("../../Resource.ts").ResourceClass<SmartRouting>;
/**
 * Returns true if the given value is a SmartRouting resource.
 */
export declare const isSmartRouting: (value: unknown) => value is SmartRouting;
export declare const SmartRoutingProvider: () => import("effect/Layer").Layer<Provider.Provider<SmartRouting>, never, CloudflareEnvironment | argo.CloudflareOpContext>;
export {};
//# sourceMappingURL=SmartRouting.d.ts.map