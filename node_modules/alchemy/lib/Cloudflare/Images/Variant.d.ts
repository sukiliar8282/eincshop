import * as images from "@distilled.cloud/cloudflare/images";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Images.Variant";
type TypeId = typeof TypeId;
/**
 * How an image is resized to fit a variant's `width`x`height` box.
 */
export type VariantFit = "scale-down" | "contain" | "cover" | "crop" | "pad";
/**
 * What happens to the image's EXIF metadata when the variant is served.
 */
export type VariantMetadata = "keep" | "copyright" | "none";
export interface VariantProps {
    /**
     * Account the variant is created in. Defaults to the ambient Cloudflare
     * account. Changing it triggers a replacement.
     */
    accountId?: string;
    /**
     * Variant name — the URL segment used to request the variant (e.g.
     * `https://imagedelivery.net/<hash>/<image>/<name>`). Alphanumeric only;
     * Cloudflare rejects hyphens and underscores.
     *
     * Defaults to the logical ID verbatim (variant names are user-facing URL
     * segments, so no uniqueness suffix is appended). Changing the name
     * triggers a replacement — the API cannot rename a variant.
     *
     * @default the logical ID
     */
    name?: string;
    /**
     * How the image is resized to fit the `width`x`height` box. Mutable.
     */
    fit: VariantFit;
    /**
     * Maximum width in pixels (1-9999). Mutable.
     */
    width: number;
    /**
     * Maximum height in pixels (1-9999). Mutable.
     */
    height: number;
    /**
     * What EXIF metadata is preserved on the served image. Mutable.
     * @default "none"
     */
    metadata?: VariantMetadata;
    /**
     * If `true`, this variant can serve an image without a signed URL even
     * when the image itself requires signed URLs. Mutable.
     * @default false
     */
    neverRequireSignedURLs?: boolean;
}
export interface VariantAttributes {
    /** The variant's name (its API path identifier and URL segment). */
    variantName: string;
    /** Account the variant belongs to. */
    accountId: string;
    /** How the image is resized. */
    fit: VariantFit;
    /** Maximum width in pixels. */
    width: number;
    /** Maximum height in pixels. */
    height: number;
    /** EXIF metadata handling. */
    metadata: VariantMetadata;
    /** Whether the variant bypasses signed-URL requirements. */
    neverRequireSignedURLs: boolean;
}
export type Variant = Resource<TypeId, VariantProps, VariantAttributes, never, Providers>;
/**
 * A Cloudflare Images variant — a named resizing preset (e.g. `thumbnail`,
 * `hero`) applied when serving images from Cloudflare Images.
 *
 * A variant is identified by its name within an account (up to 100 variants
 * per account). The name is the URL segment used to request the variant, so
 * it is immutable — changing it triggers a replacement. All resizing options
 * (`fit`, `width`, `height`, `metadata`, `neverRequireSignedURLs`) are
 * mutable in place.
 *
 * Note: every Images-enabled account has a built-in `public` variant. Do not
 * manage `public` with this resource — Cloudflare silently ignores deletes
 * of the built-in variant, so destroy would not actually remove it.
 * ### Creating a Variant
 * **Example:** Thumbnail variant
 * ```typescript
 * // Variant names are alphanumeric only (no hyphens/underscores).
 * const thumbnail = yield* Cloudflare.Images.Variant("thumbnail", {
 *   fit: "cover",
 *   width: 100,
 *   height: 100,
 * });
 * ```
 *
 * **Example:** Hero variant with explicit name and metadata
 * ```typescript
 * const hero = yield* Cloudflare.Images.Variant("HeroImage", {
 *   name: "hero",
 *   fit: "scale-down",
 *   width: 1920,
 *   height: 1080,
 *   metadata: "copyright",
 * });
 * ```
 *
 * ### Signed URLs
 * **Example:** Public variant for protected images
 * ```typescript
 * // Serve this variant without a signature even when the image itself
 * // requires signed URLs (e.g. for public thumbnails of private images).
 * const preview = yield* Cloudflare.Images.Variant("preview", {
 *   fit: "contain",
 *   width: 320,
 *   height: 240,
 *   neverRequireSignedURLs: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/images/manage-images/create-variants/
 *
 * @resource
 * @product Images
 * @category Media
 */
export declare const Variant: import("../../Resource.ts").ResourceClass<Variant>;
/**
 * Returns true if the given value is an Variant resource.
 */
export declare const isVariant: (value: unknown) => value is Variant;
export declare const VariantProvider: () => import("effect/Layer").Layer<Provider.Provider<Variant>, never, CloudflareEnvironment | images.CloudflareOpContext>;
export {};
//# sourceMappingURL=Variant.d.ts.map