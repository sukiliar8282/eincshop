import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Bucket } from "./Bucket.ts";
import type { Providers } from "./Providers.ts";
import type { BucketKeyRole } from "./Types.ts";
export interface BucketAccessKeyProps {
    /**
     * Bucket ID or `bucket.bucketId` output this key grants access to.
     */
    bucket: string | Bucket;
    /**
     * Human-readable key name prefix. Alchemy appends the resource instance
     * identity so an interrupted create can be recovered by name instead of
     * minting a second, unenumerable key.
     *
     * @default the resource's logical ID
     */
    name?: string;
    /**
     * Access role for the key: `"read"` or `"read_write"`.
     */
    role: BucketKeyRole;
}
export interface BucketAccessKey extends Resource<"Prisma.BucketAccessKey", BucketAccessKeyProps, {
    /**
     * Prisma bucket key ID.
     */
    bucketAccessKeyId: string;
    /**
     * Bucket ID the key belongs to, persisted so deletion can address both
     * path parameters.
     */
    bucketId: string;
    /**
     * S3 access key ID.
     */
    accessKeyId: string;
    /**
     * S3 secret access key, redacted in state. Prisma returns it exactly
     * once at creation and never again, so the persisted state is the
     * authoritative copy.
     */
    secretAccessKey: Redacted.Redacted<string>;
    /**
     * S3-compatible endpoint URL for the bucket's region.
     */
    endpoint: string;
    /**
     * Provider-side S3 bucket name (e.g. `user-<id>`). S3 clients must use
     * this as the bucket name, not the display name chosen on the bucket.
     */
    bucketName: string;
}, never, Providers> {
}
/**
 * An access key for a Prisma Object Store bucket, yielding S3 credentials.
 *
 * Prisma returns the secret access key only in the create response, so
 * Alchemy stores it as a `Redacted` value and treats persisted state as
 * authoritative: once created, the secret is never re-read from the API.
 * Changing the bucket, name, or role replaces the key with fresh
 * credentials.
 *
 * ### Creating a Bucket Access Key
 * **Example:** Read-write credentials for a bucket
 * ```typescript
 * const key = yield* Prisma.BucketAccessKey("uploads-key", {
 *   bucket,
 *   role: "read_write",
 * });
 * ```
 *
 * ### Binding to Platforms
 * **Example:** Pass S3 credentials to Compute env
 * ```typescript
 * const app = yield* Prisma.Compute("api", {
 *   project,
 *   path: "./apps/api",
 *   env: {
 *     S3_ENDPOINT: key.endpoint,
 *     S3_BUCKET: key.bucketName,
 *     S3_ACCESS_KEY_ID: key.accessKeyId,
 *     S3_SECRET_ACCESS_KEY: key.secretAccessKey,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const BucketAccessKey: import("../Resource.ts").ResourceClass<BucketAccessKey>;
declare const AmbiguousBucketAccessKeyError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AmbiguousBucketAccessKeyError";
} & Readonly<A>;
/**
 * Raised when more than one key on a bucket carries the deterministic name
 * of a single resource instance, so no key can be recovered unambiguously.
 */
export declare class AmbiguousBucketAccessKeyError extends AmbiguousBucketAccessKeyError_base<{
    bucketId: string;
    name: string;
    count: number;
    message: string;
}> {
}
export declare const BucketAccessKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<BucketAccessKey>, never, any>;
export {};
//# sourceMappingURL=BucketAccessKey.d.ts.map