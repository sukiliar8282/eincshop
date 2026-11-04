import * as hostnames from "@distilled.cloud/cloudflare/hostnames";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.HostnameTlsSetting.HostnameTlsSetting";
type TypeId = typeof TypeId;
/**
 * Which per-hostname TLS setting to override:
 *
 * - `ciphers` — allowed cipher suites (BoringSSL names) for the hostname
 * - `min_tls_version` — minimum TLS protocol version for the hostname
 * - `http2` — whether HTTP/2 is offered to clients connecting to the hostname
 */
export type Id = "ciphers" | "min_tls_version" | "http2";
/**
 * The value of a per-hostname TLS setting. The shape depends on
 * {@link Id}:
 *
 * - `ciphers` → `string[]` of BoringSSL cipher suite names
 * - `min_tls_version` → `"1.0" | "1.1" | "1.2" | "1.3"`
 * - `http2` → `"on" | "off"`
 */
export type Value = "1.0" | "1.1" | "1.2" | "1.3" | "on" | "off" | string[];
export interface Props {
    /**
     * Zone the hostname belongs to. Stable — moving the override to another
     * zone triggers a replacement.
     */
    zoneId: string;
    /**
     * Which TLS setting to override (`ciphers`, `min_tls_version`, or
     * `http2`). Part of the override's identity — changing it triggers a
     * replacement.
     */
    settingId: Id;
    /**
     * The hostname the override applies to. Part of the override's identity —
     * changing it triggers a replacement.
     *
     * Per-hostname TLS settings require the hostname to be covered by
     * Cloudflare for SaaS custom hostnames or an Advanced Certificate
     * Manager certificate on the zone; without that entitlement the API
     * rejects writes with `AdvancedCertificateManagerRequired`.
     */
    hostname: string;
    /**
     * Desired value of the setting. The shape depends on `settingId`:
     * `ciphers` takes a `string[]` of BoringSSL cipher names,
     * `min_tls_version` takes `"1.0" | "1.1" | "1.2" | "1.3"`, and `http2`
     * takes `"on" | "off"`.
     *
     * Mutable — upserted in place via PUT.
     */
    value: Value;
}
export interface Attributes {
    /** Zone the hostname belongs to. */
    zoneId: string;
    /** The overridden TLS setting's identifier. */
    settingId: string;
    /** The hostname the override applies to. */
    hostname: string;
    /** Current value of the override. */
    value: Value;
    /**
     * Deployment status of the override (e.g. `pending_deployment`,
     * `active`). Propagation to the edge is asynchronous.
     */
    status: string | undefined;
    /** When the override was first created, if Cloudflare reports it. */
    createdAt: string | undefined;
    /** When the override was last updated, if Cloudflare reports it. */
    updatedAt: string | undefined;
}
export type HostnameTlsSetting = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A per-hostname TLS setting override
 * (`/zones/{zone_id}/hostnames/settings/{settingId}/{hostname}`) — pins
 * `ciphers`, `min_tls_version`, or `http2` for a single hostname instead of
 * the whole zone.
 *
 * Each `(settingId, hostname)` pair is an independent override with PUT
 * (upsert) / DELETE semantics; deleting the override reverts the hostname to
 * the zone-wide default. Overrides are mostly useful with Cloudflare for
 * SaaS custom hostnames or Advanced Certificate Manager — on zones without
 * that entitlement, writes fail with the typed
 * `AdvancedCertificateManagerRequired` error (Cloudflare code 1450).
 *
 * Safety: overrides carry no ownership markers. When there is no prior
 * state, `read` scans the setting's hostname list and reports an existing
 * override as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### Minimum TLS version
 * **Example:** Require TLS 1.2 for a single hostname
 * ```typescript
 * yield* Cloudflare.HostnameTlsSetting.HostnameTlsSetting("ApiMinTls", {
 *   zoneId: zone.zoneId,
 *   settingId: "min_tls_version",
 *   hostname: "api.example.com",
 *   value: "1.2",
 * });
 * ```
 *
 * ### HTTP/2
 * **Example:** Disable HTTP/2 for a legacy hostname
 * ```typescript
 * yield* Cloudflare.HostnameTlsSetting.HostnameTlsSetting("LegacyHttp2", {
 *   zoneId: zone.zoneId,
 *   settingId: "http2",
 *   hostname: "legacy.example.com",
 *   value: "off",
 * });
 * ```
 *
 * ### Cipher suites
 * **Example:** Restrict a hostname to modern ciphers
 * ```typescript
 * yield* Cloudflare.HostnameTlsSetting.HostnameTlsSetting("StrictCiphers", {
 *   zoneId: zone.zoneId,
 *   settingId: "ciphers",
 *   hostname: "secure.example.com",
 *   value: ["ECDHE-RSA-AES128-GCM-SHA256", "AES128-GCM-SHA256"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ssl/edge-certificates/additional-options/custom-metadata/
 * @see https://developers.cloudflare.com/api/resources/hostnames/subresources/settings/subresources/tls/
 *
 * @resource
 * @product Hostname TLS Settings
 * @category SSL/TLS & Certificates
 */
export declare const HostnameTlsSetting: import("../../Resource.ts").ResourceClass<HostnameTlsSetting>;
/**
 * Returns true if the given value is a HostnameTlsSetting resource.
 */
export declare const isHostnameTlsSetting: (value: unknown) => value is HostnameTlsSetting;
export declare const HostnameTlsSettingProvider: () => import("effect/Layer").Layer<Provider.Provider<HostnameTlsSetting>, never, CloudflareEnvironment | hostnames.CloudflareOpContext>;
export {};
//# sourceMappingURL=HostnameTlsSetting.d.ts.map