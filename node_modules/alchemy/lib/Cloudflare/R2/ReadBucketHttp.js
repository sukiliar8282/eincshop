import * as r2 from "@distilled.cloud/cloudflare/r2";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { authorizeWith } from "../HttpClientUtils.js";
import { baseObject, makeHttpBucketBinding, makeR2HttpScope, toR2Error, } from "./BucketHttp.js";
import { ReadBucket } from "./ReadBucket.js";
import { R2Error, } from "./BucketTypes.js";
/**
 * HTTP-backed implementation of the {@link ReadBucket} binding.
 *
 * It creates a scoped {@link AccountApiToken} with the `Workers R2 Storage Read` and `Workers R2 Storage Write` permissions.
 */
export const ReadBucketHttp = Layer.effect(ReadBucket, Effect.suspend(() => makeHttpBucketBinding({
    permissionGroups: ["Workers R2 Storage Read"],
    makeClient: (token, bucketName, jurisdiction) => makeReadR2HttpClient({ authorize: authorizeWith(token), accountId: token.accountId }, bucketName, jurisdiction),
})));
export const makeReadR2HttpClient = (auth, bucketName, jurisdiction) => {
    const authorize = auth.authorize;
    const scope = makeR2HttpScope(auth.accountId, bucketName, jurisdiction);
    return {
        raw: Effect.die(new R2Error({
            message: "R2BucketBindingHttp does not expose a native `raw` Bucket; use the binary HTTP methods instead.",
            cause: new Error("unsupported"),
        })),
        head: (key) => scope.pipe(Effect.flatMap(({ accountId, bucketName, cfR2Jurisdiction }) => authorize(r2.getObject({
            accountId,
            bucketName,
            objectName: key,
            cfR2Jurisdiction,
        }))), 
        // The HTTP body is lazy, so reading headers does not download it.
        Effect.map((res) => baseObject(key, httpMetadataOf(res), {
            size: res.contentLength,
            etag: res.etag,
            uploaded: res.lastModified ? new Date(res.lastModified) : undefined,
            storageClass: res.cfR2StorageClass,
        })), 
        // Native R2 `head` resolves to `null` for a missing object rather
        // than failing — mirror that for the HTTP-backed client.
        Effect.catchTag("NoSuchKey", () => Effect.succeed(null)), Effect.mapError(toR2Error)),
        get: ((key, _options) => scope.pipe(Effect.flatMap(({ accountId, bucketName, cfR2Jurisdiction }) => authorize(r2.getObject({
            accountId,
            bucketName,
            objectName: key,
            cfR2Jurisdiction,
        }))), Effect.map((res) => objectBodyFromResponse(key, res)), 
        // Native R2 `get` resolves to `null` for a missing object.
        Effect.catchTag("NoSuchKey", () => Effect.succeed(null)), Effect.mapError(toR2Error))),
        list: (options) => scope.pipe(Effect.flatMap(({ accountId, bucketName, cfR2Jurisdiction }) => authorize(r2.listObjects({
            accountId,
            bucketName,
            cfR2Jurisdiction,
            prefix: options?.prefix,
            delimiter: options?.delimiter,
            cursor: options?.cursor,
            startAfter: options?.startAfter,
            perPage: options?.limit,
        }))), Effect.mapError(toR2Error), Effect.map((res) => {
            const objects = res.result.map((o) => baseObject(o.key ?? "", {}, {
                size: o.size ?? undefined,
                etag: o.etag ?? undefined,
                uploaded: o.lastModified ? new Date(o.lastModified) : undefined,
                storageClass: o.storageClass ?? undefined,
                customMetadata: o.customMetadata ??
                    undefined,
            }));
            const cursor = res.resultInfo?.cursor ?? undefined;
            return (cursor
                ? { objects, delimitedPrefixes: [], truncated: true, cursor }
                : { objects, delimitedPrefixes: [], truncated: false });
        })),
    };
};
const objectBodyFromResponse = (key, res) => {
    const meta = httpMetadataOf(res);
    // The HTTP body is a single-consumption stream — expose it both as a Stream
    // and via the buffering accessors, but the caller may only read it once.
    let response;
    const getResponse = () => (response ??= new Response(Stream.toReadableStream(res.body)));
    const consume = (fn) => Effect.tryPromise({ try: () => fn(getResponse()), catch: toR2Error });
    return {
        ...baseObject(key, meta, {
            size: res.contentLength,
            etag: res.etag,
            uploaded: res.lastModified ? new Date(res.lastModified) : undefined,
            storageClass: res.cfR2StorageClass,
        }),
        body: Stream.fromReadableStream({
            evaluate: () => getResponse().body,
            onError: toR2Error,
        }),
        bodyUsed: false,
        arrayBuffer: () => consume((r) => r.arrayBuffer()),
        bytes: () => consume((r) => r.arrayBuffer().then((b) => new Uint8Array(b))),
        text: () => consume((r) => r.text()),
        json: () => consume((r) => r.json()),
        blob: () => consume((r) => r.blob()),
    };
};
const httpMetadataOf = (res) => ({
    contentType: res.contentType,
    contentEncoding: res.contentEncoding,
    contentDisposition: res.contentDisposition,
    contentLanguage: res.contentLanguage,
    cacheControl: res.cacheControl,
    cacheExpiry: res.expires ? new Date(res.expires) : undefined,
});
//# sourceMappingURL=ReadBucketHttp.js.map