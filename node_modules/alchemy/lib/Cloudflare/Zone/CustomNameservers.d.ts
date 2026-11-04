import * as zones from "@distilled.cloud/cloudflare/zones";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Zone.CustomNameservers";
type TypeId = typeof TypeId;
export type CustomNameserversProps = {
    /**
     * Zone whose account-level custom nameserver usage is managed. Stable —
     * changing the zone triggers a replacement (the old zone's configuration
     * is restored to the value it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether the zone uses account-level custom nameservers (ACNS) instead
     * of the Cloudflare-assigned nameservers.
     *
     * Enabling requires an account-level custom nameserver set to already be
     * configured (Business/Enterprise) — otherwise Cloudflare rejects the
     * update with the typed `CustomNameserverSetNotFound` error.
     *
     * Mutable — applied in place.
     */
    enabled: boolean;
    /**
     * The number of the account custom nameserver set to assign to the zone.
     * Only meaningful when `enabled` is `true`.
     *
     * Mutable — applied in place.
     *
     * @default 1 (Cloudflare's default nameserver set)
     */
    nsSet?: number;
};
export type CustomNameserversAttributes = {
    /** Zone whose custom nameserver usage is managed. */
    zoneId: string;
    /** Whether the zone currently uses account-level custom nameservers. */
    enabled: boolean;
    /** The nameserver set currently assigned to the zone, if reported. */
    nsSet: number | undefined;
    /**
     * Whether ACNS was enabled before Alchemy first touched the zone.
     * Restored on destroy, so deleting the resource puts the zone back the
     * way it was found.
     */
    initialEnabled: boolean;
    /** The nameserver set assigned before Alchemy first touched the zone. */
    initialNsSet: number | undefined;
};
export type CustomNameservers = Resource<TypeId, CustomNameserversProps, CustomNameserversAttributes, never, Providers>;
/**
 * Controls whether a Cloudflare zone uses **account-level custom
 * nameservers** (ACNS, `/zones/{zone_id}/custom_ns`).
 *
 * This configuration is a zone singleton — it always exists on every zone
 * (disabled by default), so the resource never creates or deletes anything
 * physical. Reconcile applies the desired `enabled`/`nsSet` when the
 * observed configuration differs; destroy restores the configuration the
 * zone had before Alchemy first managed it.
 *
 * Enabling requires an account custom nameserver set to be configured first
 * (Business/Enterprise feature). Without one, Cloudflare rejects the update
 * with the typed `CustomNameserverSetNotFound` error.
 * ### Enabling account custom nameservers
 * **Example:** Use the account's default nameserver set
 * ```typescript
 * yield* Cloudflare.Zone.CustomNameservers("CustomNs", {
 *   zoneId: zone.zoneId,
 *   enabled: true,
 * });
 * ```
 *
 * **Example:** Pin a specific nameserver set
 * ```typescript
 * yield* Cloudflare.Zone.CustomNameservers("CustomNs", {
 *   zoneId: zone.zoneId,
 *   enabled: true,
 *   nsSet: 2,
 * });
 * ```
 *
 * ### Disabling
 * **Example:** Explicitly pin the zone to Cloudflare-assigned nameservers
 * ```typescript
 * yield* Cloudflare.Zone.CustomNameservers("CustomNs", {
 *   zoneId: zone.zoneId,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/zones/subresources/custom_nameservers/
 *
 * @resource
 * @product Zones
 * @category Domains & DNS
 */
export declare const CustomNameservers: import("../../Resource.ts").ResourceClass<CustomNameservers>;
/**
 * Returns true if the given value is a CustomNameservers resource.
 */
export declare const isCustomNameservers: (value: unknown) => value is CustomNameservers;
export declare const CustomNameserversProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomNameservers>, never, CloudflareEnvironment | zones.CloudflareOpContext>;
export {};
//# sourceMappingURL=CustomNameservers.d.ts.map