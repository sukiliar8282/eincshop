import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface MountTargetProps {
    /**
     * ID of the EFS file system to expose through this mount target
     * (e.g. `fileSystem.fileSystemId`). Cannot be changed after creation
     * (replacement).
     */
    fileSystemId: string;
    /**
     * ID of the subnet to create the mount target in. Determines the VPC and
     * Availability Zone; one mount target is allowed per AZ. Cannot be changed
     * after creation (replacement).
     */
    subnetId: string;
    /**
     * Static private IPv4 address for the mount target within the subnet's
     * range. Cannot be changed after creation (replacement).
     * @default an address assigned by EFS
     */
    ipAddress?: string;
    /**
     * Security groups attached to the mount target's network interface (up to
     * five). NFS clients must be allowed to reach TCP port 2049 through these
     * groups. Updatable in place.
     * @default the VPC's default security group
     */
    securityGroups?: string[];
}
export interface MountTarget extends Resource<"AWS.EFS.MountTarget", MountTargetProps, {
    /** The ID of the mount target (e.g. `fsmt-0123456789abcdef0`). */
    mountTargetId: string;
    /** The ID of the EFS file system the mount target belongs to. */
    fileSystemId: string;
    /** The ID of the subnet the mount target was created in. */
    subnetId: string;
    /** The IPv4 address at which the file system is reachable in the subnet. */
    ipAddress: string | undefined;
    /** The ID of the network interface created for the mount target. */
    networkInterfaceId: string | undefined;
    /** The name of the Availability Zone the mount target resides in. */
    availabilityZoneName: string | undefined;
}, {}, Providers> {
}
/**
 * An Amazon EFS mount target — the per-subnet network endpoint (an ENI
 * serving NFS on TCP 2049) that compute in a VPC uses to reach a file
 * system.
 *
 * Create one mount target per Availability Zone you run compute in. The
 * reconciler waits for the mount target to reach the `available` state
 * (typically 1–2 minutes), so downstream resources that depend on its
 * attributes deploy only once the endpoint is usable. Deletion likewise
 * waits until the mount target is fully gone, because its ENI must be
 * released before the subnet, security groups, or file system can be
 * deleted.
 * ### Creating Mount Targets
 * **Example:** Mount target in a subnet
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const files = yield* AWS.EFS.FileSystem("Files");
 * const target = yield* AWS.EFS.MountTarget("FilesTarget", {
 *   fileSystemId: files.fileSystemId,
 *   subnetId,
 * });
 * ```
 *
 * **Example:** Mount target with explicit security groups
 * ```typescript
 * const target = yield* AWS.EFS.MountTarget("FilesTarget", {
 *   fileSystemId: files.fileSystemId,
 *   subnetId,
 *   securityGroups: [nfsSecurityGroupId],
 * });
 * ```
 *
 * @resource
 */
export declare const MountTarget: import("../../Resource.ts").ResourceClass<MountTarget>;
declare const MountTargetNotAvailable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MountTargetNotAvailable";
} & Readonly<A>;
/**
 * Internal marker error used to drive the bounded wait for a mount target to
 * reach the `available` lifecycle state.
 */
export declare class MountTargetNotAvailable extends MountTargetNotAvailable_base<{
    mountTargetId: string;
    state: string;
}> {
}
declare const MountTargetStillDeleting_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MountTargetStillDeleting";
} & Readonly<A>;
/**
 * Internal marker error used to drive the bounded wait for a mount target to
 * disappear after deletion (its ENI releases asynchronously).
 */
export declare class MountTargetStillDeleting extends MountTargetStillDeleting_base<{
    mountTargetId: string;
    state: string;
}> {
}
export declare const MountTargetProvider: () => import("effect/Layer").Layer<Provider.Provider<MountTarget>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=MountTarget.d.ts.map