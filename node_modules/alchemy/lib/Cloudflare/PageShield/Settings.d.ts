import * as pageShield from "@distilled.cloud/cloudflare/page-shield";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.PageShield.Settings";
type TypeId = typeof TypeId;
export interface SettingsProps {
    /**
     * Zone whose Page Shield configuration is managed. Stable — changing
     * the zone triggers a replacement (the old zone's configuration is
     * restored to the values it had before Alchemy managed it).
     */
    zoneId: string;
    /**
     * Whether Page Shield (client-side script monitoring) is enabled on
     * the zone. The resource exists to turn the feature on, so this
     * defaults to `true`. Mutable — updated in place.
     * @default true
     */
    enabled?: boolean;
    /**
     * When true, CSP reports are sent to Cloudflare's own reporting
     * endpoint (`https://csp-reporting.cloudflare.com/...`) instead of
     * the zone's `/cdn-cgi/script_monitor/report` path. Mutable.
     *
     * Setting this to `false` requires the dedicated-domain-reporting
     * entitlement — on non-entitled zones the write fails with the typed
     * `NotEntitled` error.
     * @default true
     */
    useCloudflareReportingEndpoint?: boolean;
    /**
     * When true, the paths associated with connection URLs are also
     * analyzed (not just the host). Mutable.
     *
     * Setting this to `true` requires the connection-monitor entitlement
     * (Business/Enterprise) — on non-entitled zones the write fails with
     * the typed `NotEntitled` error.
     * @default false
     */
    useConnectionUrlPath?: boolean;
}
export interface SettingsAttributes {
    /** Zone the configuration belongs to. */
    zoneId: string;
    /** Whether Page Shield is enabled. */
    enabled: boolean;
    /** Whether CSP reports are sent to Cloudflare's reporting endpoint. */
    useCloudflareReportingEndpoint: boolean;
    /** Whether connection URL paths are analyzed. */
    useConnectionUrlPath: boolean;
    /** When the Page Shield configuration was last updated. */
    updatedAt: string;
    /**
     * The `enabled` flag the zone had before Alchemy first touched the
     * configuration. Restored on destroy.
     */
    initialEnabled: boolean;
    /**
     * The `useCloudflareReportingEndpoint` flag the zone had before
     * Alchemy first touched the configuration. Restored on destroy.
     */
    initialUseCloudflareReportingEndpoint: boolean;
    /**
     * The `useConnectionUrlPath` flag the zone had before Alchemy first
     * touched the configuration. Restored on destroy.
     */
    initialUseConnectionUrlPath: boolean;
}
export type Settings = Resource<TypeId, SettingsProps, SettingsAttributes, never, Providers>;
/**
 * The Page Shield configuration of a Cloudflare zone
 * (`/zones/{zone_id}/page_shield`).
 *
 * Page Shield monitors the JavaScript and connections loaded by your
 * visitors' browsers to detect supply-chain attacks (e.g. Magecart). The
 * configuration is a zone **singleton** — it always exists (default
 * disabled), so this resource never creates or deletes anything physical.
 * Reconcile PUTs the configuration when the observed flags differ from the
 * desired ones; destroy restores the flags the zone had before Alchemy
 * first managed them.
 *
 * Script/connection *monitoring data* requires a Business or Enterprise
 * zone plan, but the configuration endpoints themselves accept reads and
 * `enabled` writes on lower plans. Setting `useConnectionUrlPath: true`
 * or `useCloudflareReportingEndpoint: false` on a non-entitled zone fails
 * with the typed `NotEntitled` error.
 *
 * Only one `Settings` resource per zone makes sense — two
 * instances managing the same zone would fight over the singleton.
 * ### Managing Page Shield
 * **Example:** Enable Page Shield on a zone
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.PageShield.Settings("PageShield", {
 *   zoneId: zone.zoneId,
 * });
 * ```
 *
 * **Example:** Analyze connection URL paths too
 * ```typescript
 * yield* Cloudflare.PageShield.Settings("PageShield", {
 *   zoneId: zone.zoneId,
 *   useConnectionUrlPath: true,
 * });
 * ```
 *
 * **Example:** Report CSP violations to the zone instead of Cloudflare
 * ```typescript
 * yield* Cloudflare.PageShield.Settings("PageShield", {
 *   zoneId: zone.zoneId,
 *   useCloudflareReportingEndpoint: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/page-shield/
 *
 * @resource
 * @product Page Shield
 * @category Application Security
 */
export declare const Settings: import("../../Resource.ts").ResourceClass<Settings>;
/**
 * Returns true if the given value is a Settings resource.
 */
export declare const isSettings: (value: unknown) => value is Settings;
export declare const SettingsProvider: () => import("effect/Layer").Layer<Provider.Provider<Settings>, never, CloudflareEnvironment | pageShield.CloudflareOpContext>;
export {};
//# sourceMappingURL=Settings.d.ts.map