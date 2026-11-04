import * as zones from "@distilled.cloud/cloudflare/zones";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Zone.Setting";
type TypeId = typeof TypeId;
/**
 * Identifier of a Cloudflare zone setting — every value Cloudflare
 * recognises on `/zones/{zone_id}/settings/{settingId}`. The open
 * `(string & {})` tail keeps the type forward-compatible with settings
 * Cloudflare adds later.
 */
export type SettingId = "0rtt" | "advanced_ddos" | "aegis" | "always_online" | "always_use_https" | "automatic_https_rewrites" | "automatic_platform_optimization" | "brotli" | "browser_cache_ttl" | "browser_check" | "cache_level" | "challenge_ttl" | "china_network_enabled" | "ciphers" | "cname_flattening" | "content_converter" | "development_mode" | "early_hints" | "edge_cache_ttl" | "email_obfuscation" | "h2_prioritization" | "hotlink_protection" | "http2" | "http3" | "image_resizing" | "ip_geolocation" | "ipv6" | "max_upload" | "min_tls_version" | "mirage" | "nel" | "opportunistic_encryption" | "opportunistic_onion" | "orange_to_orange" | "origin_error_page_pass_thru" | "origin_h2_max_streams" | "origin_max_http_version" | "polish" | "prefetch_preload" | "privacy_pass" | "proxy_read_timeout" | "pseudo_ipv4" | "redirects_for_ai_training" | "replace_insecure_js" | "response_buffering" | "rocket_loader" | "search_for_agents" | "security_header" | "security_level" | "server_side_exclude" | "sha1_support" | "sort_query_string_for_cache" | "ssl" | "tls_1_2_only" | "tls_1_3" | "tls_client_auth" | "transformations" | "transformations_allowed_origins" | "true_client_ip_header" | "waf" | "webp" | "websockets" | (string & {});
export type SettingProps = {
    /**
     * Zone the setting belongs to. Stable — changing the zone triggers a
     * replacement (the old zone's setting is restored to the value it had
     * before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Which zone setting to manage (e.g. `always_online`,
     * `browser_cache_ttl`, `min_tls_version`). Stable — the setting id is
     * the resource's identity, so changing it triggers a replacement.
     *
     * Declared as plain `string` (narrowed to {@link SettingId}) so
     * `diff` can compare without resolving an `Input`.
     */
    settingId: SettingId;
    /**
     * Desired value of the setting. The shape depends on `settingId` —
     * on/off toggles take `"on"`/`"off"`, `browser_cache_ttl` takes a
     * number of seconds, structured settings (e.g. `ciphers`,
     * `security_header`) take arrays/objects.
     *
     * Mutable — patched in place.
     */
    value: unknown;
};
export type SettingAttributes = {
    /** Zone the setting belongs to. */
    zoneId: string;
    /** The managed setting's identifier. */
    settingId: string;
    /** Resolved current value of the setting. */
    value: unknown;
    /**
     * Whether the setting can be modified on the zone's current plan
     * (`false` means the setting is plan-gated).
     */
    editable: boolean | undefined;
    /** When the setting was last modified, if Cloudflare reports it. */
    modifiedOn: string | undefined;
    /**
     * The value the setting had before Alchemy first patched it. Restored
     * on destroy, so deleting the resource puts the zone back the way it
     * was found.
     */
    initialValue: unknown;
};
export type Setting = Resource<TypeId, SettingProps, SettingAttributes, never, Providers>;
/**
 * A single Cloudflare zone setting (`/zones/{zone_id}/settings/{settingId}`)
 * pinned to a desired value.
 *
 * Zone settings are singletons — every setting always exists on every zone
 * (with a Cloudflare default), so this resource never creates or deletes
 * anything physical. Reconcile patches the setting when the observed value
 * differs from the desired one; destroy restores the value the setting had
 * before Alchemy first managed it (captured as `initialValue`).
 *
 * Many settings are plan-gated (`editable: false` on lower plans — e.g.
 * `image_resizing`, `polish` need Pro+; `advanced_ddos` is Enterprise).
 * Patching a non-editable setting fails with Cloudflare's "setting not
 * editable" error.
 * ### Toggle settings
 * **Example:** Force HTTPS on the whole zone
 * ```typescript
 * yield* Cloudflare.Zone.Setting("AlwaysUseHttps", {
 *   zoneId: zone.zoneId,
 *   settingId: "always_use_https",
 *   value: "on",
 * });
 * ```
 *
 * **Example:** Disable Always Online
 * ```typescript
 * yield* Cloudflare.Zone.Setting("AlwaysOnline", {
 *   zoneId: zone.zoneId,
 *   settingId: "always_online",
 *   value: "off",
 * });
 * ```
 *
 * ### Numeric settings
 * **Example:** Browser cache TTL of one hour
 * ```typescript
 * yield* Cloudflare.Zone.Setting("BrowserCacheTtl", {
 *   zoneId: zone.zoneId,
 *   settingId: "browser_cache_ttl",
 *   value: 3600,
 * });
 * ```
 *
 * ### TLS settings
 * **Example:** Require at least TLS 1.2
 * ```typescript
 * yield* Cloudflare.Zone.Setting("MinTls", {
 *   zoneId: zone.zoneId,
 *   settingId: "min_tls_version",
 *   value: "1.2",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/api/resources/zones/subresources/settings/
 *
 * @resource
 * @product Zones
 * @category Domains & DNS
 */
export declare const Setting: import("../../Resource.ts").ResourceClass<Setting>;
/**
 * Returns true if the given value is a Setting resource.
 */
export declare const isSetting: (value: unknown) => value is Setting;
export declare const SettingProvider: () => import("effect/Layer").Layer<Provider.Provider<Setting>, never, CloudflareEnvironment | zones.CloudflareOpContext>;
export {};
//# sourceMappingURL=Setting.d.ts.map