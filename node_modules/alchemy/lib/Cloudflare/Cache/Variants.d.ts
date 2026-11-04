import * as cache from "@distilled.cloud/cloudflare/cache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Cache.Variants";
type TypeId = typeof TypeId;
/**
 * The file extensions the Variants setting can configure. Each key maps to
 * the list of additional content types Cloudflare may serve (and cache) for
 * URLs ending in that extension, e.g. `jpeg: ["image/webp", "image/avif"]`.
 */
export interface VariantsValue {
    /** Additional content types to allow for `.avif` URLs. */
    avif?: string[];
    /** Additional content types to allow for `.bmp` URLs. */
    bmp?: string[];
    /** Additional content types to allow for `.gif` URLs. */
    gif?: string[];
    /** Additional content types to allow for `.jp2` URLs. */
    jp2?: string[];
    /** Additional content types to allow for `.jpeg` URLs. */
    jpeg?: string[];
    /** Additional content types to allow for `.jpg` URLs. */
    jpg?: string[];
    /** Additional content types to allow for `.jpg2` URLs. */
    jpg2?: string[];
    /** Additional content types to allow for `.png` URLs. */
    png?: string[];
    /** Additional content types to allow for `.tif` URLs. */
    tif?: string[];
    /** Additional content types to allow for `.tiff` URLs. */
    tiff?: string[];
    /** Additional content types to allow for `.webp` URLs. */
    webp?: string[];
}
export interface VariantsProps extends VariantsValue {
    /**
     * Zone whose Variants cache setting is managed. Stable — changing the
     * zone triggers a replacement (the old zone's setting is deleted, the
     * new zone's setting is created).
     */
    zoneId: string;
}
export interface VariantsAttributes {
    /** Zone the setting belongs to. */
    zoneId: string;
    /** Resolved current value of the setting (per-extension content types). */
    value: VariantsValue;
    /**
     * Whether the setting can be modified on the zone's current plan
     * (`false` means the setting is plan-gated).
     */
    editable: boolean;
    /** When the setting was last modified, if Cloudflare reports it. */
    modifiedOn: string | undefined;
}
export type Variants = Resource<TypeId, VariantsProps, VariantsAttributes, never, Providers>;
/**
 * The Variants cache setting of a Cloudflare zone
 * (`/zones/{zone_id}/cache/variants`).
 *
 * Variants lets a zone cache and serve multiple content types for the same
 * URL — e.g. serve `image/webp` to browsers that accept it for a `.jpeg`
 * URL — which is the setting behind "Serve WebP/AVIF to supported clients"
 * workflows (typically combined with an image-resizing origin or worker).
 *
 * Unlike most zone cache settings, Variants has true create/delete
 * semantics: the setting does not exist until it is first written
 * (reads return a typed `VariantsNotConfigured` error), and `DELETE`
 * removes it entirely, restoring the zone's default behavior. This
 * resource therefore creates the setting on first deploy and deletes it
 * on destroy.
 *
 * Only one `Variants` resource per zone makes sense — the setting is a
 * zone singleton, and two instances managing the same zone would fight
 * over it.
 * ### Managing Variants
 * **Example:** Serve WebP for JPEG URLs
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Site", { name: "example.com" });
 *
 * yield* Cloudflare.Cache.Variants("ImageVariants", {
 *   zoneId: zone.zoneId,
 *   jpeg: ["image/webp"],
 *   jpg: ["image/webp"],
 * });
 * ```
 *
 * **Example:** Allow WebP and AVIF for all common image extensions
 * ```typescript
 * yield* Cloudflare.Cache.Variants("ImageVariants", {
 *   zoneId: zone.zoneId,
 *   jpeg: ["image/webp", "image/avif"],
 *   jpg: ["image/webp", "image/avif"],
 *   png: ["image/webp", "image/avif"],
 *   gif: ["image/webp", "image/avif"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cache/advanced-configuration/variants/
 *
 * @resource
 * @product Cache
 * @category Performance & Reliability
 */
export declare const Variants: import("../../Resource.ts").ResourceClass<Variants>;
/**
 * Returns true if the given value is a Variants resource.
 */
export declare const isVariants: (value: unknown) => value is Variants;
export declare const VariantsProvider: () => import("effect/Layer").Layer<Provider.Provider<Variants>, never, CloudflareEnvironment | cache.CloudflareOpContext>;
export {};
//# sourceMappingURL=Variants.d.ts.map