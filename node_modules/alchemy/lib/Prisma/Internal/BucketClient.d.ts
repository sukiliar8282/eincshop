/**
 * Runtime half of the Prisma Object Store bindings: an S3-compatible client
 * pointed at a bucket key's endpoint. Internal — the capability modules
 * (`ReadBucket.ts`, `WriteBucket.ts`, `ReadWriteBucket.ts`) build their public
 * clients on top of these primitives.
 */
import { Credentials, Region } from "@distilled.cloud/aws";
import type * as S3 from "@distilled.cloud/aws/s3";
import * as Effect from "effect/Effect";
import type { HttpClient } from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { BucketError, type BucketCredentials, type BucketObject, type BucketObjectBody, type BucketRange } from "../BucketTypes.ts";
/**
 * SigV4 credential scope used for Prisma Object Store requests. Prisma
 * addresses buckets through a single regionless endpoint and does not report
 * a region on a bucket key, so requests are signed under the `auto` scope
 * that S3-compatible stores conventionally accept.
 */
export declare const BUCKET_SIGNING_REGION = "auto";
export type PresignRequest = {
    method: "GET";
    key: string;
    expiresIn?: number | undefined;
    /** Signed `response-content-type` override for the download. */
    responseContentType?: string | undefined;
} | {
    method: "PUT";
    key: string;
    expiresIn?: number | undefined;
    /** `Content-Type` header the uploader must send, signed into the URL. */
    contentType?: string | undefined;
};
/**
 * The transport a capability client is built against: the resolved bucket
 * name, a way to run a distilled S3 operation with the bucket key's
 * credentials, and SigV4 query-string presigning against the same endpoint.
 */
export interface BucketAccess {
    bucketName: Effect.Effect<string, never, RuntimeContext>;
    authorize: <A, E>(effect: Effect.Effect<A, E, Credentials.Credentials | Region.Region | HttpClient>) => Effect.Effect<A, E, RuntimeContext>;
    presign: (request: PresignRequest) => Effect.Effect<string, BucketError, RuntimeContext>;
}
export declare const toBucketError: (error: unknown) => BucketError;
/**
 * Build the transport for a bound bucket key. Requests are signed with the
 * key's own credentials against its endpoint; because a custom endpoint is
 * set, the S3 client addresses the bucket path-style rather than through the
 * AWS virtual-host rules.
 */
export declare const makeBucketAccess: (credentials: BucketCredentials) => BucketAccess;
/** Render a {@link BucketRange} as an HTTP `Range` header value. */
export declare const rangeHeader: (range: BucketRange | undefined) => string | undefined;
export declare const objectFrom: (key: string, attributes: {
    ContentLength?: number | undefined;
    ETag?: string | undefined;
    LastModified?: Date | undefined;
    ContentType?: string | undefined;
    Metadata?: {
        [key: string]: string | undefined;
    } | undefined;
}) => BucketObject;
export declare const objectFromListEntry: (entry: S3.Object) => BucketObject;
/**
 * Wrap a `GetObject` response as a {@link BucketObjectBody}. The body is a
 * single-consumption stream, so `body` and the buffering accessors are three
 * views of the same bytes and only one of them may be read.
 */
export declare const objectBodyFrom: (key: string, response: S3.GetObjectOutput) => BucketObjectBody;
//# sourceMappingURL=BucketClient.d.ts.map