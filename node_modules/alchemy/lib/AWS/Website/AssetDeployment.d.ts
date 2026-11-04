import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { WebsiteTextEncoding } from "./shared.ts";
export interface AssetFileOption {
    /**
     * Glob or globs of files to match.
     */
    files: string | string[];
    /**
     * Override `Content-Type` for matched files.
     */
    contentType?: string;
    /**
     * Override `Cache-Control` for matched files.
     */
    cacheControl?: string;
    /**
     * Optional glob or globs excluded from this rule.
     */
    ignore?: string | string[];
}
export interface AssetDeploymentProps {
    /**
     * Destination bucket.
     */
    bucket: {
        bucketName: string;
    };
    /**
     * Local directory to upload.
     */
    sourcePath: string;
    /**
     * Optional key prefix within the bucket.
     */
    prefix?: string;
    /**
     * Remove old files under the prefix that are not part of the current deploy.
     * @default false
     */
    purge?: boolean;
    /**
     * Optional per-file overrides.
     */
    fileOptions?: AssetFileOption[];
    /**
     * Character encoding applied to inferred text-based asset content types.
     * @default "utf-8"
     */
    textEncoding?: WebsiteTextEncoding;
}
export interface AssetDeployment extends Resource<"AWS.Website.AssetDeployment", AssetDeploymentProps, {
    /**
     * Name of the destination bucket.
     */
    bucketName: string;
    /**
     * Normalized key prefix the files were uploaded under (empty string when
     * no prefix was configured).
     */
    prefix: string;
    /**
     * Content hash of the uploaded file set — changes whenever any file body,
     * content type, or cache-control changes. Useful as an invalidation token.
     */
    version: string;
    /**
     * Number of files uploaded in this deployment.
     */
    fileCount: number;
    /**
     * POSIX-relative paths of every uploaded file (before the `prefix` is
     * applied), sorted. Downstream consumers derive routing manifests from
     * this list (e.g. `StaticSite`'s CloudFront KV file manifest), so the
     * manifest always reflects exactly what was uploaded.
     */
    files: string[];
}, never, Providers> {
}
/**
 * Upload a local directory into S3 with website-friendly defaults.
 *
 * `AssetDeployment` is a helper resource for website hosting. It uploads all
 * files in a directory, infers content types, applies cache-control defaults
 * (HTML is never cached; everything else is immutable), and can optionally
 * purge stale files under a prefix. `StaticSite` and `SsrSite` use it
 * internally — reach for it directly when you manage the bucket and CDN
 * yourself.
 * ### Deploying Files
 * **Example:** Upload A Build Directory
 * ```typescript
 * const bucket = yield* AWS.S3.Bucket("SiteBucket", {});
 *
 * const files = yield* AssetDeployment("WebsiteFiles", {
 *   bucket,
 *   sourcePath: "./dist",
 *   prefix: "_assets",
 * });
 * ```
 *
 * **Example:** Purge Stale Files And Override Caching
 * ```typescript
 * const files = yield* AssetDeployment("WebsiteFiles", {
 *   bucket,
 *   sourcePath: "./dist",
 *   purge: true,
 *   fileOptions: [
 *     {
 *       files: "**\/*.json",
 *       cacheControl: "max-age=300,public",
 *     },
 *   ],
 * });
 * ```
 *
 * ### Invalidation
 * **Example:** Invalidate CloudFront On Content Change
 * ```typescript
 * const files = yield* AssetDeployment("WebsiteFiles", {
 *   bucket,
 *   sourcePath: "./dist",
 * });
 *
 * // `version` only changes when file contents change, so the
 * // invalidation re-runs exactly when a new deploy ships new bytes.
 * yield* AWS.CloudFront.Invalidation("Invalidation", {
 *   distributionId: distribution.distributionId,
 *   version: files.version,
 *   paths: ["/*"],
 * });
 * ```
 *
 * @resource
 */
export declare const AssetDeployment: import("../../Resource.ts").ResourceClass<AssetDeployment>;
export declare const AssetDeploymentProvider: () => import("effect/Layer").Layer<Provider.Provider<AssetDeployment>, never, import("@distilled.cloud/aws/Credentials").Credentials | FileSystem.FileSystem | import("effect/unstable/http/HttpClient").HttpClient | Path.Path>;
//# sourceMappingURL=AssetDeployment.d.ts.map