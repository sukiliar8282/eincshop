import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyStatement } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
/**
 * Server-side encryption configuration for a vector bucket. Immutable —
 * changing it replaces the bucket.
 */
export interface VectorBucketEncryption {
    /**
     * The SSE algorithm. `AES256` uses S3-managed keys; `aws:kms` uses a KMS
     * key (supply `kmsKeyArn`).
     * @default "AES256"
     */
    sseType?: "AES256" | "aws:kms";
    /**
     * ARN of the KMS key to use when `sseType` is `aws:kms`.
     */
    kmsKeyArn?: string;
}
export interface VectorBucketProps {
    /**
     * Name of the vector bucket (3-63 chars, lowercase). If omitted, a unique
     * name is generated from the app, stage, and logical id.
     *
     * Changing the name replaces the bucket.
     * @default ${app}-${stage}-${id}
     */
    vectorBucketName?: string;
    /**
     * Server-side encryption configuration. Immutable — changing it replaces
     * the bucket.
     */
    encryption?: VectorBucketEncryption;
    /**
     * Resource policy statements for the vector bucket, granting or denying
     * cross-account/principal access to it and the indexes inside it
     * (`arn:…:bucket/<name>/index/*`). Rendered as a standard
     * `2012-10-17` policy document via `PutVectorBucketPolicy`; omitting the
     * prop removes any existing policy.
     */
    policy?: PolicyStatement[];
    /**
     * Tags to apply to the bucket. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface VectorBucket extends Resource<"AWS.S3Vectors.VectorBucket", VectorBucketProps, {
    /**
     * Name of the vector bucket.
     */
    vectorBucketName: string;
    /**
     * ARN of the vector bucket.
     */
    vectorBucketArn: string;
}, never, Providers> {
}
/**
 * An Amazon S3 Vectors bucket — durable storage for vector embeddings,
 * queryable by similarity. Create one or more {@link Index}es inside it to
 * store and query vectors.
 *
 * S3 Vectors is in preview; availability varies by region.
 *
 * ### Creating a Vector Bucket
 * **Example:** Basic Vector Bucket
 * ```typescript
 * import * as S3Vectors from "alchemy/AWS/S3Vectors";
 *
 * const bucket = yield* S3Vectors.VectorBucket("Embeddings", {});
 * ```
 *
 * **Example:** Vector Bucket with KMS Encryption
 * ```typescript
 * const bucket = yield* S3Vectors.VectorBucket("Embeddings", {
 *   encryption: { sseType: "aws:kms", kmsKeyArn: key.keyArn },
 * });
 * ```
 *
 * ### Bucket Policy
 * **Example:** Grant Another Account Read Access
 * ```typescript
 * const bucket = yield* S3Vectors.VectorBucket("Embeddings", {
 *   vectorBucketName: "shared-embeddings",
 *   policy: [
 *     {
 *       Effect: "Allow",
 *       Principal: { AWS: "arn:aws:iam::123456789012:root" },
 *       Action: ["s3vectors:GetVectors", "s3vectors:QueryVectors"],
 *       Resource:
 *         "arn:aws:s3vectors:us-east-1:999999999999:bucket/shared-embeddings/index/*",
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const VectorBucket: import("../../Resource.ts").ResourceClass<VectorBucket>;
export declare const VectorBucketProvider: () => import("effect/Layer").Layer<Provider.Provider<VectorBucket>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=VectorBucket.d.ts.map