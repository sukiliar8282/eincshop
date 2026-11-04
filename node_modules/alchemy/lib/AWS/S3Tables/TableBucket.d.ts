import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type TableBucketArn = `arn:aws:s3tables:${RegionID}:${AccountID}:bucket/${string}`;
/**
 * Server-side encryption configuration for an S3 table bucket. Applied at
 * create time; changing it replaces the bucket.
 */
export interface TableBucketEncryption {
    /**
     * Encryption algorithm. `AES256` uses S3-managed keys (SSE-S3); `aws:kms`
     * uses AWS KMS (SSE-KMS) and requires `kmsKeyArn`.
     */
    sseAlgorithm: "AES256" | "aws:kms";
    /**
     * ARN of the KMS key to use when `sseAlgorithm` is `aws:kms`.
     */
    kmsKeyArn?: string;
}
export interface TableBucketProps {
    /**
     * Name of the table bucket. Must be 3-63 characters, lowercase letters,
     * numbers, and hyphens, beginning and ending with a letter or number.
     * Changing the name replaces the bucket.
     * @default a deterministic name derived from `${app}-${id}-${stage}`
     */
    name?: string;
    /**
     * Default server-side encryption for tables in this bucket. Applied at
     * create time; changing it replaces the bucket.
     */
    encryptionConfiguration?: TableBucketEncryption;
}
export interface TableBucket extends Resource<"AWS.S3Tables.TableBucket", TableBucketProps, {
    tableBucketArn: TableBucketArn;
    name: string;
    ownerAccountId: string;
    createdAt: Date;
    tableBucketId: string | undefined;
    type: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon S3 Tables table bucket — a purpose-built bucket for storing
 * fully-managed Apache Iceberg tables.
 *
 * A table bucket is regional and holds {@link Namespace}s, which in turn hold
 * {@link Table}s. The bucket name is auto-generated from the app, stage, and
 * logical ID unless you provide one explicitly.
 * ### Creating Table Buckets
 * **Example:** Basic Table Bucket
 * ```typescript
 * import * as S3Tables from "alchemy/AWS/S3Tables";
 *
 * const bucket = yield* S3Tables.TableBucket("Analytics");
 * ```
 *
 * **Example:** Named Table Bucket
 * ```typescript
 * const bucket = yield* S3Tables.TableBucket("Analytics", {
 *   name: "my-analytics-tables",
 * });
 * ```
 *
 * ### Encryption
 * **Example:** KMS-encrypted Table Bucket
 * ```typescript
 * const bucket = yield* S3Tables.TableBucket("Secure", {
 *   encryptionConfiguration: {
 *     sseAlgorithm: "aws:kms",
 *     kmsKeyArn: key.keyArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const TableBucket: import("../../Resource.ts").ResourceClass<TableBucket>;
export declare const TableBucketProvider: () => import("effect/Layer").Layer<Provider.Provider<TableBucket>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=TableBucket.d.ts.map