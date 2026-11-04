import * as cni from "@distilled.cloud/cloudflare/network-interconnects";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.NetworkInterconnects.Settings";
type TypeId = typeof TypeId;
export interface NetworkInterconnectSettingsProps {
    /**
     * The default ASN (Autonomous System Number) used for new CNI BGP
     * sessions on this account when a CNI does not specify its own
     * `customerAsn`.
     *
     * Mutable — updated in place via `PUT /accounts/{account_id}/cni/settings`.
     */
    defaultAsn: number;
}
export interface NetworkInterconnectSettingsAttributes {
    /** Account the CNI settings belong to. */
    accountId: string;
    /** The currently configured default ASN. */
    defaultAsn: number;
    /**
     * The default ASN observed before Alchemy first managed this
     * singleton. Restored on destroy, so deleting the resource puts the
     * account back the way it was found.
     */
    initialDefaultAsn: number;
}
export type NetworkInterconnectSettings = Resource<TypeId, NetworkInterconnectSettingsProps, NetworkInterconnectSettingsAttributes, never, Providers>;
/**
 * Account-level settings for Cloudflare Network Interconnect (CNI v2) —
 * currently the default ASN applied to new CNI BGP configurations
 * (`/accounts/{account_id}/cni/settings`).
 *
 * The settings object is an **account singleton** — it always exists and
 * can never be created or deleted. Reconcile PUTs the desired value when
 * the observed value differs; destroy restores the value the setting had
 * before Alchemy first managed it (captured as `initialDefaultAsn`).
 *
 * CNI is an enterprise feature — on accounts without the Network
 * Interconnect entitlement the endpoint fails with the typed `Forbidden`
 * error.
 * ### Managing the default ASN
 * **Example:** Pin the account's default ASN
 * ```typescript
 * yield* Cloudflare.NetworkInterconnects.NetworkInterconnectSettings("CniSettings", {
 *   defaultAsn: 65000,
 * });
 * ```
 *
 * **Example:** Use a private 32-bit ASN
 * ```typescript
 * yield* Cloudflare.NetworkInterconnects.NetworkInterconnectSettings("CniSettings", {
 *   defaultAsn: 4200000001,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/network-interconnect/
 *
 * @resource
 * @product Network Interconnects
 * @category Network
 */
export declare const NetworkInterconnectSettings: import("../../Resource.ts").ResourceClass<NetworkInterconnectSettings>;
/**
 * Returns true if the given value is a NetworkInterconnectSettings resource.
 */
export declare const isNetworkInterconnectSettings: (value: unknown) => value is NetworkInterconnectSettings;
export declare const NetworkInterconnectSettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<NetworkInterconnectSettings>, never, CloudflareEnvironment | cni.CloudflareOpContext>;
export {};
//# sourceMappingURL=Settings.d.ts.map