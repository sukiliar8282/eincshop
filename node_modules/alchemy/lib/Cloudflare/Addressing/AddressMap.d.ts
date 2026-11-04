import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Addressing.AddressMap";
type TypeId = typeof TypeId;
/**
 * A zone or account membership on an Address Map. Zones (or whole accounts)
 * listed here are assigned the IPs on the map. A zone membership takes
 * priority over an account membership.
 */
export interface AddressMapMembership {
    /**
     * The zone id (for `kind: "zone"`) or account id (for `kind: "account"`)
     * to assign the map's IPs to.
     *
     * Note: due to the shape of the Cloudflare API, account memberships can
     * only target the account that owns the Address Map.
     */
    identifier: string;
    /**
     * Whether the membership targets a zone or a whole account.
     */
    kind: "zone" | "account";
}
export interface AddressMapProps {
    /**
     * An optional description used to describe the types of IPs or zones on
     * the map. Mutable — patched in place.
     */
    description?: string;
    /**
     * Whether the Address Map is enabled. Cloudflare's DNS will not respond
     * with the map's IP addresses until the map is enabled. Mutable.
     * @default false
     */
    enabled?: boolean;
    /**
     * Default SNI to present to legacy TLS clients that do not send the TLS
     * server name indicator. Mutable — patch-only (set in a post-create sync
     * step).
     */
    defaultSni?: string;
    /**
     * The set of IPs on the Address Map. Mutable — synced per-IP via
     * PUT/DELETE against observed cloud state.
     * @default []
     */
    ips?: string[];
    /**
     * Zones and accounts assigned IPs on this Address Map. Mutable — synced
     * per-membership via PUT/DELETE against observed cloud state.
     * @default []
     */
    memberships?: AddressMapMembership[];
}
export interface AddressMapAttributes {
    /** Cloudflare-assigned identifier of the Address Map. */
    addressMapId: string;
    /** The Cloudflare account the Address Map belongs to. */
    accountId: string;
    /**
     * If `false`, the Address Map cannot be deleted via the API (true for
     * Cloudflare-managed maps).
     */
    canDelete: boolean;
    /**
     * If `false`, the IPs on the Address Map cannot be modified via the API
     * (true for Cloudflare-managed maps).
     */
    canModifyIps: boolean;
    /** The map's description, if set. */
    description: string | undefined;
    /** Whether the Address Map is enabled. */
    enabled: boolean;
    /** Default SNI presented to legacy TLS clients, if set. */
    defaultSni: string | undefined;
    /** The set of IPs currently on the Address Map. */
    ips: string[];
    /** Zone/account memberships currently on the Address Map. */
    memberships: {
        identifier: string;
        kind: "zone" | "account";
    }[];
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedAt: string | undefined;
}
export type AddressMap = Resource<TypeId, AddressMapProps, AddressMapAttributes, never, Providers>;
/**
 * A Cloudflare Address Map — assigns account-owned or Cloudflare-assigned
 * static IPs to zones (BYOIP / Enterprise static IPs).
 *
 * Requires the BYOIP add-on or Cloudflare-assigned static IPs on the
 * account; without the entitlement every mutating call fails with the typed
 * `FeatureNotEnabled` error (`address_maps_not_enabled_on_account`).
 * ### Creating an Address Map
 * **Example:** Disabled map with a description
 * ```typescript
 * const map = yield* Cloudflare.Addressing.AddressMap("static-ips", {
 *   description: "static ingress IPs",
 *   enabled: false,
 * });
 * ```
 *
 * **Example:** Map with IPs and zone memberships
 * ```typescript
 * const map = yield* Cloudflare.Addressing.AddressMap("ingress", {
 *   description: "ingress",
 *   enabled: true,
 *   ips: ["192.0.2.1"],
 *   memberships: [{ identifier: zone.zoneId, kind: "zone" }],
 * });
 * ```
 *
 * ### Legacy TLS clients
 * **Example:** Default SNI for clients without SNI
 * ```typescript
 * const map = yield* Cloudflare.Addressing.AddressMap("legacy", {
 *   enabled: true,
 *   defaultSni: "example.com",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/byoip/address-maps/
 *
 * @resource
 * @product Addressing
 * @category Network
 */
export declare const AddressMap: import("../../Resource.ts").ResourceClass<AddressMap>;
/**
 * Returns true if the given value is an AddressMap resource.
 */
export declare const isAddressMap: (value: unknown) => value is AddressMap;
export declare const AddressMapProvider: () => import("effect/Layer").Layer<Provider.Provider<AddressMap>, never, CloudflareEnvironment | addressing.CloudflareOpContext>;
export {};
//# sourceMappingURL=AddressMap.d.ts.map