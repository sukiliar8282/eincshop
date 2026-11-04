import * as stream from "@distilled.cloud/cloudflare/stream";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Stream.Watermark";
type TypeId = typeof TypeId;
/**
 * Location of the watermark image on the video.
 */
export type WatermarkPosition = "upperRight" | "upperLeft" | "lowerLeft" | "lowerRight" | "center";
export type WatermarkProps = {
    /**
     * A short description of the watermark profile. If omitted, a unique
     * name is generated from the app, stage, and logical ID. Watermark
     * profiles have no update endpoint — changing the name triggers a
     * replacement.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * URL of the watermark image (a PNG up to 2 MiB) for Cloudflare to
     * download. Changing the URL triggers a replacement.
     */
    url: string;
    /**
     * The translucency of the image. `0.0` is completely transparent and
     * `1.0` is completely opaque. Changing the opacity triggers a
     * replacement.
     * @default 1.0
     */
    opacity?: number;
    /**
     * The whitespace between the adjacent edges (determined by position)
     * of the video and the image. `0.0` is no padding, `1.0` is a fully
     * padded video width or length. Changing the padding triggers a
     * replacement.
     * @default 0.05
     */
    padding?: number;
    /**
     * The location of the image. Note that `center` ignores the `padding`
     * parameter. Changing the position triggers a replacement.
     * @default "upperRight"
     */
    position?: WatermarkPosition;
    /**
     * The size of the image relative to the overall size of the video.
     * `0.0` means no scaling, `1.0` fills the entire video. Changing the
     * scale triggers a replacement.
     * @default 0.15
     */
    scale?: number;
};
export type WatermarkAttributes = {
    /**
     * The unique identifier for the watermark profile (Cloudflare `uid`).
     */
    watermarkId: string;
    /**
     * The Cloudflare account the watermark profile belongs to.
     */
    accountId: string;
    /**
     * A short description of the watermark profile.
     */
    name: string;
    /**
     * The date and time the watermark profile was created.
     */
    created: string | undefined;
    /**
     * The source URL the watermark image was downloaded from.
     */
    downloadedFrom: string | undefined;
    /**
     * The translucency of the image.
     */
    opacity: number;
    /**
     * The whitespace between the video edges and the image.
     */
    padding: number;
    /**
     * The location of the image.
     */
    position: WatermarkPosition;
    /**
     * The size of the image relative to the overall size of the video.
     */
    scale: number;
    /**
     * The size of the image in bytes.
     */
    size: number | undefined;
    /**
     * The height of the image in pixels.
     */
    height: number | undefined;
    /**
     * The width of the image in pixels.
     */
    width: number | undefined;
};
export type Watermark = Resource<TypeId, WatermarkProps, WatermarkAttributes, never, Providers>;
/**
 * A Cloudflare Stream watermark profile — a PNG image stamped onto
 * videos at upload time.
 *
 * Watermark profiles are create-only: Cloudflare exposes no update
 * endpoint, so **every** prop change triggers a replacement (a new
 * profile is created and the old one deleted). The image is downloaded
 * by Cloudflare from the given URL at creation time.
 *
 * Requires the Stream subscription to be enabled on the account.
 * ### Creating a watermark
 * **Example:** Default watermark from an image URL
 * ```typescript
 * const watermark = yield* Cloudflare.Stream.Watermark("Logo", {
 *   url: "https://example.com/logo.png",
 * });
 * ```
 *
 * **Example:** Centered semi-transparent watermark
 * ```typescript
 * const watermark = yield* Cloudflare.Stream.Watermark("Logo", {
 *   url: "https://example.com/logo.png",
 *   position: "center",
 *   opacity: 0.5,
 *   scale: 0.3,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/stream/edit-videos/applying-watermarks/
 *
 * @resource
 * @product Stream
 * @category Media
 */
export declare const Watermark: import("../../Resource.ts").ResourceClass<Watermark>;
/**
 * Returns true if the given value is a Watermark resource.
 */
export declare const isWatermark: (value: unknown) => value is Watermark;
export declare const WatermarkProvider: () => import("effect/Layer").Layer<Provider.Provider<Watermark>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | stream.CloudflareOpContext>;
export {};
//# sourceMappingURL=Watermark.d.ts.map