import * as efs from "@distilled.cloud/aws/efs";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import { type PolicyDocument } from "../IAM/Policy.ts";
import type { Providers } from "../Providers.ts";
/**
 * A single EFS lifecycle-management rule. EFS requires each rule to carry
 * exactly one transition setting, so a full configuration is expressed as an
 * array of single-setting policies.
 */
export interface FileSystemLifecyclePolicy {
    /**
     * Transition files to the Infrequent Access (IA) storage class after the
     * given period without access, e.g. `"AFTER_30_DAYS"`.
     */
    transitionToIA?: efs.TransitionToIARules;
    /**
     * Transition files back to primary storage on first access, e.g.
     * `"AFTER_1_ACCESS"`.
     */
    transitionToPrimaryStorageClass?: efs.TransitionToPrimaryStorageClassRules;
    /**
     * Transition files to the Archive storage class after the given period
     * without access, e.g. `"AFTER_90_DAYS"`.
     */
    transitionToArchive?: efs.TransitionToArchiveRules;
}
export interface FileSystemProps {
    /**
     * Performance mode of the file system. `generalPurpose` is recommended for
     * all workloads; `maxIO` is a previous-generation mode for highly
     * parallelized workloads. Cannot be changed after creation (replacement).
     * `maxIO` is not supported with `elastic` throughput or One Zone file
     * systems.
     * @default "generalPurpose"
     */
    performanceMode?: "generalPurpose" | "maxIO";
    /**
     * Whether the file system is encrypted at rest. Cannot be changed after
     * creation (replacement).
     * @default true
     */
    encrypted?: boolean;
    /**
     * The KMS key used to encrypt the file system. Only meaningful when
     * `encrypted` is `true`. Cannot be changed after creation (replacement).
     * @default the AWS-managed `/aws/elasticfilesystem` key
     */
    kmsKeyId?: string;
    /**
     * Throughput mode of the file system. `elastic` scales automatically and is
     * recommended for spiky workloads; `provisioned` requires
     * `provisionedThroughputInMibps`. Updatable in place.
     * @default "bursting"
     */
    throughputMode?: "bursting" | "provisioned" | "elastic";
    /**
     * Provisioned throughput in MiB/s. Required when `throughputMode` is
     * `provisioned`.
     */
    provisionedThroughputInMibps?: number;
    /**
     * Create a One Zone file system in this Availability Zone (e.g.
     * `us-west-2a`). Cannot be changed after creation (replacement).
     * @default regional (multi-AZ) file system
     */
    availabilityZoneName?: string;
    /**
     * Lifecycle management rules that transition files between storage
     * classes. Omit (or pass an empty array) to disable lifecycle management.
     */
    lifecyclePolicies?: FileSystemLifecyclePolicy[];
    /**
     * Whether AWS Backup automatic backups are enabled for the file system.
     * Updatable in place. When omitted, the AWS default is left alone
     * (disabled for regional file systems, enabled for One Zone file
     * systems).
     * @default AWS default (regional: disabled; One Zone: enabled)
     */
    backup?: boolean;
    /**
     * Replication overwrite protection. `ENABLED` (the AWS default) makes the
     * file system writable and blocks it from being used as a replication
     * destination; `DISABLED` makes it read-only so an EFS replication
     * configuration can overwrite it. Updatable in place. When omitted, the
     * current protection setting is left alone.
     * @default AWS default ("ENABLED")
     */
    replicationOverwriteProtection?: "ENABLED" | "DISABLED";
    /**
     * The file system policy — an IAM resource-based policy controlling client
     * access to the file system (e.g. enforcing in-transit encryption or
     * restricting mounts to access points). Either a structured
     * {@link PolicyDocument} or a raw JSON string. Omitting the property
     * removes any explicit policy, reverting to the default EFS policy.
     */
    policy?: PolicyDocument | string;
    /**
     * Tags to apply to the file system. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface FileSystem extends Resource<"AWS.EFS.FileSystem", FileSystemProps, {
    /** The ID of the file system (e.g. `fs-0123456789abcdef0`). */
    fileSystemId: string;
    /** The ARN of the file system. */
    fileSystemArn: string;
}, {}, Providers> {
}
/**
 * An Amazon EFS file system — serverless, elastic, shared POSIX storage.
 *
 * The file system is created encrypted by default with a deterministic
 * creation token derived from the app, stage, and logical ID, so retried
 * creates are idempotent. Mount it into compute with
 * {@link MountTarget} (per-subnet network endpoints) and
 * {@link AccessPoint} (application-specific POSIX entry points — required
 * for Lambda mounts).
 * ### Creating File Systems
 * **Example:** Default file system (encrypted, general purpose)
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const files = yield* AWS.EFS.FileSystem("Files");
 * ```
 *
 * **Example:** Elastic throughput
 * ```typescript
 * const files = yield* AWS.EFS.FileSystem("Files", {
 *   throughputMode: "elastic",
 * });
 * ```
 *
 * ### Lifecycle Management
 * **Example:** Tier cold files to Infrequent Access
 * ```typescript
 * const files = yield* AWS.EFS.FileSystem("Files", {
 *   lifecyclePolicies: [
 *     { transitionToIA: "AFTER_30_DAYS" },
 *     { transitionToPrimaryStorageClass: "AFTER_1_ACCESS" },
 *   ],
 * });
 * ```
 *
 * ### Backup and Protection
 * **Example:** Enable AWS Backup automatic backups
 * ```typescript
 * const files = yield* AWS.EFS.FileSystem("Files", {
 *   backup: true,
 * });
 * ```
 *
 * **Example:** Allow the file system to be a replication destination
 * ```typescript
 * const files = yield* AWS.EFS.FileSystem("Files", {
 *   replicationOverwriteProtection: "DISABLED",
 * });
 * ```
 *
 * ### File System Policy
 * **Example:** Enforce in-transit encryption with a typed PolicyDocument
 * ```typescript
 * const files = yield* AWS.EFS.FileSystem("Files", {
 *   policy: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Sid: "DenyUnencryptedTransport",
 *         Effect: "Deny",
 *         Principal: { AWS: "*" },
 *         Action: ["elasticfilesystem:ClientMount"],
 *         Condition: { Bool: { "aws:SecureTransport": "false" } },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * ### Mounting into Lambda
 * Lambda mounts EFS through an access point; the function must be attached
 * to a VPC that can reach a mount target.
 *
 * **Example:** File system + mount target + access point + Lambda
 * ```typescript
 * const files = yield* AWS.EFS.FileSystem("Files");
 * const target = yield* AWS.EFS.MountTarget("FilesTarget", {
 *   fileSystemId: files.fileSystemId,
 *   subnetId,
 * });
 * const accessPoint = yield* AWS.EFS.AccessPoint("FilesAccess", {
 *   fileSystemId: files.fileSystemId,
 *   posixUser: { uid: 1000, gid: 1000 },
 *   rootDirectory: {
 *     path: "/lambda",
 *     creationInfo: { ownerUid: 1000, ownerGid: 1000, permissions: "750" },
 *   },
 * });
 * const fn = yield* AWS.Lambda.Function("Api", {
 *   main: "./src/handler.ts",
 *   vpc: { subnetIds: [subnetId], securityGroupIds: [securityGroupId] },
 *   fileSystemConfigs: [
 *     // pass the AccessPoint resource itself (or its ARN)
 *     { accessPoint, localMountPath: "/mnt/files" },
 *   ],
 *   // depend on the mount target so the function is created only after
 *   // the network endpoint is available
 *   env: { EFS_MOUNT_TARGET: target.mountTargetId },
 * });
 * ```
 *
 * **Example:** Host-agnostic mount binding (Lambda or ECS)
 * `EFS.mount` wires the mount config + least-privilege IAM through the
 * host's binding channel — the same code works inside a Lambda Function or
 * an ECS Task body (provide `AWS.EFS.MountLive` on the host Effect).
 * ```typescript
 * export default class Api extends AWS.Lambda.Function<Api>()(
 *   "Api",
 *   { main: import.meta.url, vpc: { subnetIds, securityGroupIds } },
 *   Effect.gen(function* () {
 *     const files = yield* AWS.EFS.mount(accessPoint, { path: "/mnt/files" });
 *     return Effect.fn(function* (event: unknown) {
 *       // read/write under files.path at runtime
 *       return { mountedAt: files.path };
 *     });
 *   }).pipe(Effect.provide(AWS.EFS.MountLive)),
 * ) {}
 * ```
 *
 * @resource
 */
export declare const FileSystem: import("../../Resource.ts").ResourceClass<FileSystem>;
declare const FileSystemNotAvailable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "FileSystemNotAvailable";
} & Readonly<A>;
/**
 * Internal marker error used to drive the bounded wait for a file system to
 * reach the `available` lifecycle state.
 */
export declare class FileSystemNotAvailable extends FileSystemNotAvailable_base<{
    fileSystemId: string;
    state: string;
}> {
}
export declare const FileSystemProvider: () => import("effect/Layer").Layer<Provider.Provider<FileSystem>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=FileSystem.d.ts.map