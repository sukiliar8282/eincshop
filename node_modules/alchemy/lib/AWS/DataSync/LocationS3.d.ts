import * as datasync from "@distilled.cloud/aws/datasync";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface LocationS3Props {
    /**
     * ARN of the S3 bucket this location points at, e.g.
     * `arn:aws:s3:::my-bucket`. Cannot be changed after creation (replacement).
     */
    s3BucketArn: string;
    /**
     * ARN of the IAM role DataSync assumes to access the bucket. The role's
     * trust policy must allow `datasync.amazonaws.com` and grant the relevant
     * S3 permissions. Cannot be changed after creation (replacement).
     */
    bucketAccessRoleArn: string;
    /**
     * Prefix within the bucket to sync, e.g. `/data`. Cannot be changed after
     * creation (replacement).
     * @default "/" (the bucket root)
     */
    subdirectory?: string;
    /**
     * S3 storage class DataSync writes objects as when this location is a
     * transfer destination. Cannot be changed after creation (replacement).
     * @default "STANDARD"
     */
    s3StorageClass?: datasync.S3StorageClass;
    /**
     * ARNs of DataSync agents used to connect to an S3-on-Outposts bucket.
     * Omit for standard S3 buckets.
     */
    agentArns?: string[];
    /**
     * Tags to apply to the location. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface LocationS3 extends Resource<"AWS.DataSync.LocationS3", LocationS3Props, {
    /** ARN of the DataSync location. */
    locationArn: string;
    /** URI of the location (`s3://…`). */
    locationUri: string;
}, {}, Providers> {
}
/**
 * A DataSync location backed by an Amazon S3 bucket. Locations are the
 * source and destination endpoints referenced by a {@link Task}.
 *
 * S3 locations are immutable apart from their tags: any change to the
 * bucket, subdirectory, storage class, or access role replaces the location.
 * Reconcile is idempotent across state loss — the location is re-discovered
 * by its deterministic `s3://…` URI.
 *
 * ### Creating S3 Locations
 * **Example:** Bucket root
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const source = yield* AWS.DataSync.LocationS3("Source", {
 *   s3BucketArn: bucket.bucketArn,
 *   bucketAccessRoleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Prefix + storage class
 * ```typescript
 * const dest = yield* AWS.DataSync.LocationS3("Dest", {
 *   s3BucketArn: bucket.bucketArn,
 *   bucketAccessRoleArn: role.roleArn,
 *   subdirectory: "/archive",
 *   s3StorageClass: "STANDARD_IA",
 * });
 * ```
 *
 * @resource
 */
export declare const LocationS3: import("../../Resource.ts").ResourceClass<LocationS3>;
export declare const LocationS3Provider: () => import("effect/Layer").Layer<Provider.Provider<LocationS3>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=LocationS3.d.ts.map