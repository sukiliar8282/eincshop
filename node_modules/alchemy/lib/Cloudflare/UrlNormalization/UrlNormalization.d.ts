import * as urlNormalization from "@distilled.cloud/cloudflare/url-normalization";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.UrlNormalization.UrlNormalization";
type TypeId = typeof TypeId;
/**
 * Which URLs Cloudflare normalizes.
 *
 * - `"incoming"` — normalize the URLs used for rule matching only
 *   (Cloudflare's zone default).
 * - `"both"` — additionally normalize the URLs forwarded to the origin.
 * - `"none"` — disable URL normalization entirely.
 */
export type UrlNormalizationScope = "incoming" | "both" | "none";
/**
 * Which normalization algorithm Cloudflare applies.
 *
 * - `"cloudflare"` — RFC 3986 normalization plus Cloudflare's extra
 *   normalizations (e.g. collapsing `//` sequences). The zone default.
 * - `"rfc3986"` — strict RFC 3986 normalization only.
 */
export type Type = "cloudflare" | "rfc3986";
export interface Props {
    /**
     * Zone whose URL normalization is managed. Stable — changing the zone
     * triggers a replacement (the old zone's URL normalization is reset to
     * Cloudflare defaults as the old instance deletes).
     */
    zoneId: string;
    /**
     * The scope of the URL normalization: `"incoming"` normalizes URLs used
     * for rule matching only, `"both"` also normalizes URLs sent to the
     * origin, `"none"` disables normalization.
     *
     * Mutable — updated in place.
     *
     * @default "incoming"
     */
    scope?: UrlNormalizationScope;
    /**
     * The type of URL normalization performed by Cloudflare:
     * `"cloudflare"` is RFC 3986 plus extra normalizations (e.g. `//`
     * collapsing), `"rfc3986"` is strict RFC 3986 only.
     *
     * Mutable — updated in place.
     *
     * @default "cloudflare"
     */
    type?: Type;
}
export interface Attributes {
    /** Zone whose URL normalization is managed. */
    zoneId: string;
    /** Observed scope of the URL normalization. */
    scope: string;
    /** Observed type of URL normalization performed by Cloudflare. */
    type: string;
}
export type UrlNormalization = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * The URL normalization configuration of a Cloudflare zone
 * (`/zones/{zone_id}/url_normalization`) — a zone-scoped **singleton**
 * controlling how Cloudflare normalizes incoming URLs before rule matching
 * and before forwarding to the origin.
 *
 * The setting always exists on every zone (with Cloudflare defaults
 * `scope: "incoming"`, `type: "cloudflare"`), so reconcile adopts the
 * singleton and PUTs the desired `{ scope, type }` only when the observed
 * configuration differs. Destroy issues the API's true reset operation
 * (DELETE), returning the zone to Cloudflare defaults.
 * ### Managing URL normalization
 * **Example:** Normalize URLs sent to the origin too
 * ```typescript
 * yield* Cloudflare.UrlNormalization.UrlNormalization("UrlNormalization", {
 *   zoneId: zone.zoneId,
 *   scope: "both",
 * });
 * ```
 *
 * **Example:** Strict RFC 3986 normalization
 * ```typescript
 * yield* Cloudflare.UrlNormalization.UrlNormalization("UrlNormalization", {
 *   zoneId: zone.zoneId,
 *   scope: "incoming",
 *   type: "rfc3986",
 * });
 * ```
 *
 * **Example:** Disable URL normalization
 * ```typescript
 * yield* Cloudflare.UrlNormalization.UrlNormalization("UrlNormalization", {
 *   zoneId: zone.zoneId,
 *   scope: "none",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/rules/normalization/
 *
 * @resource
 * @product URL Normalization
 * @category Rules & Configuration
 */
export declare const UrlNormalization: import("../../Resource.ts").ResourceClass<UrlNormalization>;
/**
 * Returns true if the given value is a UrlNormalization resource.
 */
export declare const isUrlNormalization: (value: unknown) => value is UrlNormalization;
export declare const UrlNormalizationProvider: () => import("effect/Layer").Layer<Provider.Provider<UrlNormalization>, never, CloudflareEnvironment | urlNormalization.CloudflareOpContext>;
export {};
//# sourceMappingURL=UrlNormalization.d.ts.map