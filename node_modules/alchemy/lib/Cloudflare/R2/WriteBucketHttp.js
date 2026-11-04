import * as r2 from "@distilled.cloud/cloudflare/r2";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { authorizeWith } from "../HttpClientUtils.js";
import { baseObject, makeHttpBucketBinding, makeR2HttpScope, readHttpMetadata, toBody, toR2Error, } from "./BucketHttp.js";
import { R2Error } from "./BucketTypes.js";
import { WriteBucket } from "./WriteBucket.js";
/**
 * HTTP-backed implementation of the {@link WriteBucket} binding.
 *
 * It creates a scoped {@link AccountApiToken} with the `Workers R2 Storage Read` and `Workers R2 Storage Write` permissions.
 */
export const WriteBucketHttp = Layer.effect(WriteBucket, Effect.suspend(() => makeHttpBucketBinding({
    permissionGroups: ["Workers R2 Storage Write"],
    makeClient: (token, bucketName, jurisdiction) => makeWriteR2HttpClient({ authorize: authorizeWith(token), accountId: token.accountId }, bucketName, jurisdiction),
})));
/** Build the write half of the HTTP-backed {@link ReadWrite} client. */
export const makeWriteR2HttpClient = (auth, bucketName, jurisdiction) => {
    const authorize = auth.authorize;
    const scope = makeR2HttpScope(auth.accountId, bucketName, jurisdiction);
    return {
        put: ((key, value, options) => scope.pipe(Effect.flatMap(({ accountId, bucketName, cfR2Jurisdiction }) => toBody(value).pipe(Effect.flatMap(({ body, contentLength }) => {
            const meta = readHttpMetadata(options);
            return authorize(r2.putObject({
                accountId,
                bucketName,
                objectName: key,
                cfR2Jurisdiction,
                body,
                contentType: meta?.contentType,
                contentEncoding: meta?.contentEncoding,
                contentDisposition: meta?.contentDisposition,
                contentLanguage: meta?.contentLanguage,
                cacheControl: meta?.cacheControl,
                contentLength: options?.contentLength != null
                    ? String(options.contentLength)
                    : contentLength != null
                        ? String(contentLength)
                        : undefined,
                cfR2StorageClass: options?.storageClass,
            })).pipe(Effect.map(() => baseObject(key, meta ?? {}, {
                size: contentLength,
                customMetadata: options?.customMetadata,
                storageClass: options?.storageClass,
                uploaded: new Date(),
            })));
        }))), Effect.mapError(toR2Error))),
        delete: (keys) => scope.pipe(Effect.flatMap(({ accountId, bucketName, cfR2Jurisdiction }) => Array.isArray(keys)
            ? authorize(r2.deleteObjects({
                accountId,
                bucketName,
                cfR2Jurisdiction,
                body: keys,
            })).pipe(Effect.asVoid, Effect.mapError(toR2Error))
            : authorize(r2.deleteObject({
                accountId,
                bucketName,
                objectName: keys,
                cfR2Jurisdiction,
            })).pipe(Effect.asVoid, 
            // The native binding's `delete` is idempotent — deleting a
            // key that isn't there resolves. Keep the HTTP client at
            // parity instead of surfacing R2's `NoSuchKey`.
            Effect.catchTag("NoSuchKey", () => Effect.void), Effect.mapError(toR2Error)))),
        createMultipartUpload: () => Effect.die(new R2Error({
            message: "R2BucketBindingHttp does not support multipart uploads over the HTTP API.",
            cause: new Error("unsupported"),
        })),
        resumeMultipartUpload: () => Effect.die(new R2Error({
            message: "R2BucketBindingHttp does not support multipart uploads over the HTTP API.",
            cause: new Error("unsupported"),
        })),
    };
};
//# sourceMappingURL=WriteBucketHttp.js.map