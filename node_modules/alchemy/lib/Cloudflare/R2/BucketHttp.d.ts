import * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import * as Stream from "effect/Stream";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { Self } from "../../Self.ts";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import type { PermissionGroupRef } from "../ApiToken/Common.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import type { Bucket } from "./Bucket.ts";
import { R2Error, type R2Object } from "./BucketTypes.ts";
/**
 * Injectable auth used by the R2 HTTP client builders. Both the token-scoped
 * `*Http` layers and the current-credentials `*Local` layers build one of
 * these so they can share the exact same client implementation.
 */
export interface R2Auth {
    /** Provide credentials + HTTP client to a raw distilled R2 op. */
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
    /** Resolve the Cloudflare account id. */
    accountId: Effect.Effect<string>;
}
export declare const makeHttpBucketBinding: <Client>(options: {
    permissionGroups: PermissionGroup[];
    makeClient: (token: HttpToken, bucketName: Effect.Effect<string>, jurisdiction: Effect.Effect<string>) => Client;
}) => Effect.Effect<(bucket: Bucket) => Effect.Effect<Client, never, never>, never, CloudflareEnvironment | Self<{
    Type: string;
    LogicalId: string;
}>>;
export interface HttpScope {
    accountId: string;
    bucketName: string;
    cfR2Jurisdiction: string | undefined;
}
export interface HttpToken {
    value: Effect.Effect<Redacted.Redacted<string>>;
    accountId: Effect.Effect<string>;
}
declare const R2_HTTP_PERMISSION_GROUPS: PermissionGroupRef[];
type PermissionGroup = (typeof R2_HTTP_PERMISSION_GROUPS)[number];
/** Resolve the account, bucket, and jurisdiction once per operation. */
export declare const makeR2HttpScope: (accountId: Effect.Effect<string>, bucketName: Effect.Effect<string>, jurisdiction: Effect.Effect<string>) => Effect.Effect<HttpScope>;
/**
 * Bind the token's `value` (as `secret_text`) and `accountId` (as `plain_text`)
 * into the Worker so they can be read at runtime.
 */
export declare const toR2Error: (error: unknown) => R2Error;
export interface HttpMetadata {
    contentType?: string;
    contentEncoding?: string;
    contentDisposition?: string;
    contentLanguage?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
}
/** Normalize the caller's `httpMetadata` option (object or `Headers`). */
export declare const readHttpMetadata: (options: {
    httpMetadata?: unknown;
} | undefined) => HttpMetadata | undefined;
export declare const baseObject: (key: string, meta: HttpMetadata, attrs: {
    size?: number;
    etag?: string;
    uploaded?: Date;
    storageClass?: string;
    customMetadata?: Record<string, string>;
}) => R2Object;
/** Collect a put `value` into a body accepted by the R2 HTTP API. */
export declare const toBody: (value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob | Stream.Stream<Uint8Array, unknown>) => Effect.Effect<{
    body: Blob | Uint8Array | ArrayBuffer | string;
    contentLength?: number;
}, R2Error>;
export {};
//# sourceMappingURL=BucketHttp.d.ts.map