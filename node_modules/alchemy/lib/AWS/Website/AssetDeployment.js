import * as s3 from "@distilled.cloud/aws/s3";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { createHash } from "node:crypto";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { initialCwd } from "../../Util/Node.js";
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
export const AssetDeployment = Resource("AWS.Website.AssetDeployment");
const defaultHtmlCacheControl = "max-age=0,no-cache,no-store,must-revalidate";
const defaultAssetCacheControl = "max-age=31536000,public,immutable";
export const AssetDeploymentProvider = () => Provider.effect(AssetDeployment, Effect.gen(function* () {
    const reconcileSync = Effect.fn(function* (news) {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const bucketName = news.bucket.bucketName;
        const prefix = normalizePrefix(news.prefix);
        // Resolve against the process's INITIAL cwd, never the live cwd:
        // Server persists build dirs relative to initialCwd, and a sibling
        // framework build may transiently chdir this shared process while
        // the upload walks the tree.
        const root = path.resolve(initialCwd, news.sourcePath);
        const files = yield* walkFiles(root);
        const observed = yield* listObjects(bucketName, prefix ? `${prefix}/` : prefix);
        const prepared = yield* Effect.all(files.map((relativePath) => Effect.gen(function* () {
            const body = yield* fs.readFile(path.join(root, relativePath));
            const normalizedRelativePath = toPosix(relativePath);
            const key = prefix
                ? `${prefix}/${normalizedRelativePath}`
                : normalizedRelativePath;
            const options = getFileOptions(normalizedRelativePath, news.fileOptions, news.textEncoding);
            return {
                relative: normalizedRelativePath,
                key,
                body,
                contentType: options.contentType,
                cacheControl: options.cacheControl,
            };
        })), { concurrency: "unbounded" });
        const version = yield* Effect.sync(() => {
            const hash = createHash("sha256");
            for (const file of prepared) {
                hash.update(file.relative);
                hash.update(file.body);
                hash.update(file.contentType);
                hash.update(file.cacheControl);
            }
            return hash.digest("hex");
        });
        const desiredKeys = new Set(prepared.map((file) => file.key));
        yield* Effect.all(prepared.flatMap((file) => {
            const expectedETag = createHash("md5")
                .update(file.body)
                .digest("hex");
            const observedETag = observed.get(file.key)?.replace(/^"|"$/g, "");
            if (observedETag === expectedETag)
                return [];
            return [
                s3.putObject({
                    Bucket: bucketName,
                    Key: file.key,
                    Body: file.body,
                    ContentType: file.contentType,
                    CacheControl: file.cacheControl,
                }),
            ];
        }), { concurrency: 16 });
        if (news.purge ?? false) {
            yield* deleteKeys(bucketName, [...observed.keys()].filter((key) => !desiredKeys.has(key)));
        }
        return {
            bucketName,
            prefix,
            version,
            fileCount: files.length,
            files: prepared.map((file) => file.relative),
        };
    });
    return {
        // Non-listable: an AssetDeployment is an action (uploading a local
        // directory into a bucket under a prefix), keyed by {bucketName,
        // prefix}, not a standalone cloud resource. There is no AWS API that
        // enumerates "asset deployments" — the uploaded objects are plain S3
        // objects owned by their bucket — so there is nothing to enumerate.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ output }) {
            return output;
        }),
        reconcile: Effect.fn(function* ({ news, session }) {
            const output = yield* retryForBucketReadiness(reconcileSync(news));
            yield* session.note(`Uploaded ${output.fileCount} file(s) to s3://${output.bucketName}/${output.prefix}`);
            return output;
        }),
        delete: Effect.fn(function* ({ olds, output }) {
            if (!(olds.purge ?? false)) {
                return;
            }
            const prefix = output.prefix ? `${output.prefix}/` : output.prefix;
            yield* retryForBucketReadiness(Effect.gen(function* () {
                const existingKeys = yield* listKeys(output.bucketName, prefix);
                yield* deleteKeys(output.bucketName, existingKeys);
            })).pipe(Effect.catchTag("NoSuchBucket", () => Effect.void));
        }),
    };
}));
const normalizePrefix = (prefix) => prefix ? prefix.replace(/^\/+|\/+$/g, "") : "";
const toPosix = (value) => value.replaceAll("\\", "/");
const extname = (file) => {
    const base = toPosix(file).split("/").pop() ?? file;
    const dot = base.lastIndexOf(".");
    return dot > 0 ? base.slice(dot).toLowerCase() : "";
};
const withCharset = (mimeType, textEncoding) => textEncoding === "none" ? mimeType : `${mimeType}; charset=${textEncoding}`;
const inferContentType = (file, textEncoding = "utf-8") => {
    const ext = extname(file);
    switch (ext) {
        case ".html":
            return withCharset("text/html", textEncoding);
        case ".css":
            return withCharset("text/css", textEncoding);
        case ".js":
        case ".mjs":
            return withCharset("application/javascript", textEncoding);
        case ".json":
            return withCharset("application/json", textEncoding);
        case ".svg":
            return "image/svg+xml";
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".gif":
            return "image/gif";
        case ".webp":
            return "image/webp";
        case ".ico":
            return "image/x-icon";
        case ".txt":
            return withCharset("text/plain", textEncoding);
        case ".xml":
            return withCharset("application/xml", textEncoding);
        case ".woff":
            return "font/woff";
        case ".woff2":
            return "font/woff2";
        default:
            return "application/octet-stream";
    }
};
const defaultCacheControlFor = (file) => extname(file) === ".html"
    ? defaultHtmlCacheControl
    : defaultAssetCacheControl;
const escapeRegex = (value) => value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
const globToRegExp = (glob) => new RegExp(`^${escapeRegex(toPosix(glob))
    .replace(/\\\*\\\*/g, ".*")
    .replace(/\\\*/g, "[^/]*")
    .replace(/\\\?/g, ".")}$`);
const matchesAny = (file, globs) => (Array.isArray(globs) ? globs : [globs]).some((glob) => globToRegExp(glob).test(file));
const getFileOptions = (file, options, textEncoding) => {
    const matched = [...(options ?? [])]
        .reverse()
        .find((option) => matchesAny(file, option.files) &&
        !(option.ignore && matchesAny(file, option.ignore)));
    return {
        contentType: matched?.contentType ?? inferContentType(file, textEncoding ?? "utf-8"),
        cacheControl: matched?.cacheControl ?? defaultCacheControlFor(file),
    };
};
const walkFiles = Effect.fn(function* (root) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    if (!(yield* fs.exists(root)))
        return [];
    const names = yield* fs.readDirectory(root, { recursive: true });
    const files = yield* Effect.all(names.map((name) => Effect.gen(function* () {
        const full = path.join(root, name);
        const stat = yield* fs.stat(full);
        return stat.type === "File" ? toPosix(name) : undefined;
    })), { concurrency: "unbounded" });
    return files
        .filter((name) => name !== undefined)
        .sort((a, b) => a.localeCompare(b));
});
const listObjectPages = (bucketName, prefix) => s3.listObjectsV2
    .pages({
    Bucket: bucketName,
    Prefix: prefix || undefined,
})
    .pipe(Stream.flatMap((page) => Stream.fromIterable(page.Contents ?? [])));
const listKeys = (bucketName, prefix) => listObjectPages(bucketName, prefix).pipe(Stream.map((object) => object.Key), Stream.filter((key) => key !== undefined), Stream.runCollect, Effect.map((keys) => Array.from(keys)));
/** List `{key -> ETag}` pairs under `prefix`. ETag from S3 is wrapped in
 * quotes; for non-multipart uploads it is the hex MD5 of the object body. */
const listObjects = (bucketName, prefix) => listObjectPages(bucketName, prefix).pipe(Stream.runFold(() => new Map(), (out, item) => {
    if (item.Key && item.ETag) {
        out.set(item.Key, item.ETag);
    }
    return out;
}));
const deleteKeys = Effect.fn(function* (bucketName, keys) {
    for (let i = 0; i < keys.length; i += 1000) {
        const batch = keys.slice(i, i + 1000);
        if (batch.length === 0) {
            continue;
        }
        yield* s3.deleteObjects({
            Bucket: bucketName,
            Delete: {
                Objects: batch.map((Key) => ({ Key })),
                Quiet: true,
            },
        });
    }
});
const isMissingBucket = (error) => error._tag === "NoSuchBucket";
const retryForBucketReadiness = (effect) => effect.pipe(Effect.retry({
    while: isMissingBucket,
    schedule: Schedule.max([
        Schedule.exponential("100 millis"),
        Schedule.recurs(30),
    ]).pipe(Schedule.modifyDelay(({ duration }) => Effect.succeed(Duration.isGreaterThan(duration, Duration.seconds(2))
        ? Duration.seconds(2)
        : duration))),
}));
//# sourceMappingURL=AssetDeployment.js.map