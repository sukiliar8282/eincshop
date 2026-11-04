/**
 * Static-asset behavior shared across website hosts.
 *
 * Origin routing (`notFoundHandling`, `htmlHandling`) is host-agnostic.
 * `Content-Type` / `Cache-Control` used when uploading a client directory
 * (Fly Tigris today) are also host-agnostic HTTP policy: HTML is never
 * cached so a deploy is visible immediately; content-hashed files are
 * immutable. CDN topology (CloudFront vs Tigris vs none) stays host-specific.
 *
 * AWS.Website.AssetDeployment has its own table: it takes `fileOptions` /
 * `textEncoding` overrides and historically used `application/javascript`.
 * Do not force that API onto this module until those knobs are needed here.
 *
 * Keep {@link contentTypeOf} in sync with the MIME table inlined by
 * `makeNodeServeEntrySource` (`frontend-frameworks` NodeServe) — that
 * generated origin cannot import this file.
 */
/**
 * How unmatched GET paths are answered. Same names as Cloudflare
 * Workers `assets.notFoundHandling`.
 */
export type WebsiteNotFoundHandling = "none" | "single-page-application" | "404-page";
/**
 * Static-asset routing on the origin (`notFoundHandling`, `htmlHandling`).
 */
export interface WebsiteAssetsProps {
    notFoundHandling?: WebsiteNotFoundHandling;
    htmlHandling?: "none" | "drop-trailing-slash";
}
/** Map {@link WebsiteAssetsProps} onto the generated Node serve entry. */
export declare const staticConfigFromAssets: (assets: WebsiteAssetsProps | undefined, defaults?: {
    notFoundHandling?: WebsiteNotFoundHandling;
}) => {
    spa?: boolean;
    errorPage?: string;
};
/** HTML documents: never cached so a new deploy is visible immediately. */
export declare const htmlCacheControl = "max-age=0,no-cache,no-store,must-revalidate";
/** Content-hashed static files (JS/CSS/images): cache forever. */
export declare const assetCacheControl = "max-age=31536000,public,immutable";
/**
 * `Content-Type` for a static website file, from its extension.
 *
 * JS is `text/javascript` (the HTML-spec JavaScript MIME type) so
 * `<script type="module">` loads. Unknown extensions are
 * `application/octet-stream`.
 */
export declare const contentTypeOf: (relative: string) => string;
/**
 * `Cache-Control` for a static website file. HTML (and `.htm`) is never
 * cached; everything else is immutable. Frameworks content-hash JS/CSS
 * into `/assets/...`, so a new deploy changes the URL instead of mutating
 * a cached object.
 */
export declare const cacheControlOf: (relative: string) => string;
//# sourceMappingURL=assets.d.ts.map