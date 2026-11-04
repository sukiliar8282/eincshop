import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
export interface FileSystemProps {
    /**
     * ARN of the S3 general purpose bucket the file system exposes as POSIX
     * storage (`arn:aws:s3:::my-bucket`). The bucket must have versioning
     * enabled. Changing it replaces the file system.
     */
    bucket: string;
    /**
     * Optional key prefix that scopes the file system to a portion of the
     * bucket. Changing it replaces the file system.
     */
    prefix?: string;
    /**
     * ARN of the IAM role that grants the S3 Files service permission to read
     * and write the bucket on the file system's behalf. S3 Files runs on EFS
     * infrastructure, so the role must trust the
     * `elasticfilesystem.amazonaws.com` service principal. Changing it
     * replaces the file system.
     */
    roleArn: string;
    /**
     * KMS key used to encrypt file system data. Changing it replaces the file
     * system.
     * @default AWS-managed encryption
     */
    kmsKeyId?: string;
    /**
     * Acknowledge the service warning that applies when creating a file system
     * over a bucket that already contains data.
     * @default false
     */
    acceptBucketWarning?: boolean;
    /**
     * IAM resource policy controlling access to the file system. Omitting it
     * removes any existing policy.
     */
    policy?: PolicyDocument;
    /**
     * When true, deletion force-deletes the file system even if it still has
     * pending export data.
     * @default false
     */
    forceDestroy?: boolean;
    /**
     * Tags to apply to the file system. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface FileSystem extends Resource<"AWS.S3Files.FileSystem", FileSystemProps, {
    /**
     * Unique ID of the file system.
     */
    fileSystemId: string;
    /**
     * ARN of the file system.
     */
    fileSystemArn: string;
    /**
     * Name of the S3 general purpose bucket backing the file system.
     */
    bucket: string;
    /**
     * ARN of the IAM role the file system uses to access the backing bucket.
     */
    roleArn: string;
    /**
     * Current lifecycle status of the file system (e.g. `AVAILABLE`).
     */
    status: string;
    /**
     * Key prefix within the backing bucket that scopes the file system, if
     * one was configured.
     */
    prefix?: string;
}, never, Providers> {
}
/**
 * An Amazon S3 File System — POSIX-style file system access over an S3
 * general purpose bucket (mountable from EC2/ECS via mount targets, with
 * application-scoped access via {@link AccessPoint}s).
 *
 * S3 Files is a newer service; availability varies by region and account.
 *
 * ### Creating a File System
 * **Example:** Basic File System
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * // S3 Files requires versioning on the source bucket.
 * const bucket = yield* AWS.S3.Bucket("Data", { versioning: "Enabled" });
 * const role = yield* AWS.IAM.Role("FilesRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         // S3 Files runs on EFS infrastructure and assumes the role as
 *         // the elasticfilesystem service principal.
 *         Principal: { Service: "elasticfilesystem.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 *   inlinePolicies: {
 *     bucket: {
 *       Version: "2012-10-17",
 *       Statement: [
 *         {
 *           Effect: "Allow",
 *           Action: ["s3:ListBucket", "s3:ListBucketVersions"],
 *           Resource: [bucket.bucketArn],
 *         },
 *         {
 *           Effect: "Allow",
 *           Action: ["s3:GetObject*", "s3:PutObject*", "s3:DeleteObject*", "s3:List*", "s3:AbortMultipartUpload"],
 *           Resource: [AWS.Output.interpolate`${bucket.bucketArn}/*`],
 *         },
 *       ],
 *     },
 *   },
 * });
 *
 * const fs = yield* AWS.S3Files.FileSystem("Files", {
 *   bucket: bucket.bucketArn,
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Prefix-Scoped File System
 * ```typescript
 * const fs = yield* AWS.S3Files.FileSystem("Files", {
 *   bucket: bucket.bucketArn,
 *   prefix: "shared/",
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const FileSystem: import("../../Resource.ts").ResourceClass<FileSystem>;
export declare const FileSystemProvider: () => import("effect/Layer").Layer<Provider.Provider<FileSystem>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=FileSystem.d.ts.map