import * as fsx from "@distilled.cloud/aws/fsx";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface FileSystemProps {
    /**
     * The type of file system to create. Cannot be changed after creation
     * (replacement). `LUSTRE` is the cheapest/fastest scratch storage;
     * `WINDOWS`, `ONTAP`, and `OPENZFS` are the other managed engines.
     */
    fileSystemType: fsx.FileSystemType;
    /**
     * Storage capacity in GiB. Minimums depend on the engine and deployment
     * type (e.g. Lustre `SCRATCH_2` starts at 1200 GiB). Can be increased in
     * place; decreasing requires replacement.
     */
    storageCapacity?: number;
    /**
     * Storage type. `SSD` (default) or `HDD` (Lustre `PERSISTENT_1` / Windows
     * only), or `INTELLIGENT_TIERING` (OpenZFS). Cannot be changed after
     * creation (replacement).
     */
    storageType?: fsx.StorageType;
    /**
     * Subnet IDs the file system is deployed into. Single-AZ engines take one
     * subnet; multi-AZ ONTAP/OpenZFS take two. Cannot be changed after
     * creation (replacement).
     */
    subnetIds: string[];
    /**
     * Security group IDs to associate with the file system's network
     * interfaces.
     */
    securityGroupIds?: string[];
    /**
     * The KMS key used to encrypt the file system at rest. Cannot be changed
     * after creation (replacement).
     * @default the AWS-managed FSx key
     */
    kmsKeyId?: string;
    /**
     * Engine version string (e.g. Lustre `"2.15"`, ONTAP `"9.13"`). Cannot be
     * changed after creation (replacement).
     */
    fileSystemTypeVersion?: string;
    /**
     * Lustre-specific configuration (deployment type, per-unit throughput,
     * data-repository import/export, compression, etc.). Passed straight
     * through to the FSx API.
     */
    lustreConfiguration?: fsx.CreateFileSystemLustreConfiguration;
    /**
     * Windows-specific configuration (Active Directory, throughput capacity,
     * deployment type). Passed straight through to the FSx API.
     */
    windowsConfiguration?: fsx.CreateFileSystemWindowsConfiguration;
    /**
     * NetApp ONTAP-specific configuration. Passed straight through to the FSx
     * API.
     */
    ontapConfiguration?: fsx.CreateFileSystemOntapConfiguration;
    /**
     * OpenZFS-specific configuration. Passed straight through to the FSx API.
     */
    openZFSConfiguration?: fsx.CreateFileSystemOpenZFSConfiguration;
    /**
     * Tags to apply to the file system. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface FileSystem extends Resource<"AWS.FSx.FileSystem", FileSystemProps, {
    /** The generated ID of the file system, e.g. `fs-0123456789abcdef0`. */
    fileSystemId: string;
    /** The ARN of the file system. */
    fileSystemArn: string;
    /** The engine of the file system: `LUSTRE`, `WINDOWS`, `ONTAP`, or `OPENZFS`. */
    fileSystemType: fsx.FileSystemType;
    /** The DNS name clients mount, e.g. `fs-....fsx.us-west-2.amazonaws.com`. */
    dnsName: string | undefined;
    /** The VPC the file system's network interfaces live in. */
    vpcId: string | undefined;
}, {}, Providers> {
}
/**
 * An Amazon FSx file system — fully-managed shared storage for Lustre,
 * Windows File Server, NetApp ONTAP, or OpenZFS.
 *
 * FSx file systems take several minutes to provision. The file system id,
 * ARN, and DNS name are returned as soon as `CreateFileSystem` accepts the
 * request; the file system then transitions `CREATING` → `AVAILABLE`
 * asynchronously. Create is idempotent on a deterministic client request
 * token derived from the app, stage, and logical id; if state is lost, the
 * file system is re-discovered by its internal Alchemy tags.
 *
 * ### Creating File Systems
 * **Example:** Lustre scratch file system (cheapest / fastest)
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const scratch = yield* AWS.FSx.FileSystem("Scratch", {
 *   fileSystemType: "LUSTRE",
 *   storageCapacity: 1200,
 *   subnetIds: [subnetId],
 *   lustreConfiguration: { DeploymentType: "SCRATCH_2" },
 * });
 * ```
 *
 * **Example:** Persistent Lustre with S3 data repository
 * ```typescript
 * const files = yield* AWS.FSx.FileSystem("Files", {
 *   fileSystemType: "LUSTRE",
 *   storageCapacity: 1200,
 *   subnetIds: [subnetId],
 *   lustreConfiguration: {
 *     DeploymentType: "PERSISTENT_2",
 *     PerUnitStorageThroughput: 125,
 *     DataCompressionType: "LZ4",
 *   },
 * });
 * ```
 *
 * **Example:** OpenZFS file system
 * ```typescript
 * const zfs = yield* AWS.FSx.FileSystem("Zfs", {
 *   fileSystemType: "OPENZFS",
 *   storageCapacity: 64,
 *   subnetIds: [subnetId],
 *   openZFSConfiguration: {
 *     DeploymentType: "SINGLE_AZ_1",
 *     ThroughputCapacity: 64,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const FileSystem: import("../../Resource.ts").ResourceClass<FileSystem>;
export declare const FileSystemProvider: () => import("effect/Layer").Layer<Provider.Provider<FileSystem>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=FileSystem.d.ts.map