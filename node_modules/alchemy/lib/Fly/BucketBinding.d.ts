import { Credentials } from "@distilled.cloud/aws/Credentials";
import type { RegionName } from "@distilled.cloud/aws/Region";
import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { Bucket } from "./Bucket.ts";
import { TigrisCredentialsMissing } from "./Errors.ts";
/**
 * Shared scaffolding for Tigris S3 bindings.
 *
 * Tigris speaks the S3 API. Each `{Op}Http.ts` is a thin
 * `Layer.effect(Cap, makeTigrisS3Binding({ operation }))` that:
 * - registers the bucket on the host so Service reconcile can write
 *   Tigris `AWS_*` / `BUCKET_NAME` App secrets
 * - calls `@distilled.cloud/aws/s3` with those credentials and endpoint
 *
 * NOT exported from `index.ts`.
 */
export interface TigrisS3Scope {
    bucketName: string;
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    region: RegionName;
}
export declare const makeTigrisS3Binding: <I extends {
    Bucket?: string;
}, A, E>(options: {
    tag: string;
    operation: (input: I) => Effect.Effect<A, E, Credentials | HttpClient.HttpClient>;
}) => Effect.Effect<(bucket: Bucket) => Effect.Effect<(request?: Omit<I, "Bucket"> | undefined) => Effect.Effect<A, E | TigrisCredentialsMissing, RuntimeContext>, never, never>, never, never>;
//# sourceMappingURL=BucketBinding.d.ts.map