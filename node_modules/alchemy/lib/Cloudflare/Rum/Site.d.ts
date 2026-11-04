import * as rum from "@distilled.cloud/cloudflare/rum";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Rum.Site";
type TypeId = typeof TypeId;
export type SiteProps = {
    /**
     * The hostname to measure, for gray-clouded sites (sites that are not
     * proxied through Cloudflare). Embed the produced `snippet` (or the
     * `siteToken`) in the page yourself.
     *
     * Exactly one of `host` or `zoneTag` must be provided. Switching between
     * the two identity models triggers a replacement; changing the hostname
     * itself is an in-place update.
     */
    host?: string;
    /**
     * The zone identifier, for orange-clouded sites (zones proxied through
     * Cloudflare). Web Analytics attaches to the zone, and `autoInstall` can
     * inject the measurement snippet at the edge. Changing this property
     * triggers a replacement.
     */
    zoneTag?: string;
    /**
     * If enabled, the JavaScript measurement snippet is automatically
     * injected for orange-clouded sites — no manual embed needed.
     * @default false
     */
    autoInstall?: boolean;
    /**
     * Enables or disables RUM measurement. Only valid when `autoInstall` is
     * `true`.
     * @default true
     */
    enabled?: boolean;
    /**
     * If enabled, the JavaScript snippet will not be injected for visitors
     * from the EU.
     * @default false
     */
    lite?: boolean;
};
export type SiteAttributes = {
    /**
     * The Web Analytics site identifier. Stable for the lifetime of the site.
     */
    siteTag: string;
    /**
     * The Web Analytics site token used by the JavaScript beacon.
     */
    siteToken: string;
    /**
     * Encoded JavaScript snippet to embed in pages of gray-clouded sites.
     */
    snippet: string | undefined;
    /**
     * The identifier of the site's implicit ruleset. Rules that include or
     * exclude traffic from measurement live under this ruleset.
     */
    rulesetId: string | undefined;
    /**
     * The Cloudflare account the site belongs to.
     */
    accountId: string;
    /**
     * The measured hostname (gray-clouded sites only).
     */
    host: string | undefined;
    /**
     * The zone identifier (orange-clouded sites only).
     */
    zoneTag: string | undefined;
    /**
     * Whether the JavaScript snippet is automatically injected for
     * orange-clouded sites.
     */
    autoInstall: boolean;
    /**
     * When the site was created.
     */
    created: string | undefined;
};
export type Site = Resource<TypeId, SiteProps, SiteAttributes, never, Providers>;
/**
 * A Cloudflare Web Analytics (RUM) site.
 *
 * A site measures real-user performance for either a plain hostname
 * (gray-clouded — embed the produced `snippet` yourself) or a Cloudflare
 * zone (orange-clouded — set `autoInstall` to inject the snippet at the
 * edge). The site is identified by its auto-assigned `siteTag`; `host` and
 * `autoInstall` are mutable in place, while switching between `host` and
 * `zoneTag` identity models (or changing `zoneTag`) triggers a replacement.
 *
 * Web Analytics is available on free accounts.
 * ### Measuring a hostname
 * **Example:** Gray-clouded site (manual snippet embed)
 * ```typescript
 * const site = yield* Cloudflare.Rum.Site("Analytics", {
 *   host: "example.com",
 * });
 *
 * // Embed in your HTML — contains the site token:
 * const snippet = site.snippet;
 * ```
 *
 * ### Measuring a zone
 * **Example:** Orange-clouded site with automatic snippet injection
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Zone", { name: "example.com" });
 *
 * yield* Cloudflare.Rum.Site("ZoneAnalytics", {
 *   zoneTag: zone.zoneId,
 *   autoInstall: true,
 * });
 * ```
 *
 * **Example:** Skip injection for EU visitors
 * ```typescript
 * yield* Cloudflare.Rum.Site("ZoneAnalytics", {
 *   zoneTag: zone.zoneId,
 *   autoInstall: true,
 *   lite: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/web-analytics/
 *
 * @resource
 * @product RUM
 * @category Observability & Analytics
 */
export declare const Site: import("../../Resource.ts").ResourceClass<Site>;
/**
 * Returns true if the given value is a Site resource.
 */
export declare const isSite: (value: unknown) => value is Site;
export declare const SiteProvider: () => import("effect/Layer").Layer<Provider.Provider<Site>, never, CloudflareEnvironment | rum.CloudflareOpContext>;
export {};
//# sourceMappingURL=Site.d.ts.map