import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccessPointPosixUser {
    /** POSIX user ID applied to all file-system requests through this access point. */
    uid: number;
    /** POSIX group ID applied to all file-system requests through this access point. */
    gid: number;
    /** Secondary POSIX group IDs. */
    secondaryGids?: number[];
}
export interface AccessPointRootDirectory {
    /**
     * Path on the file system to expose as the access point's root.
     * @default "/"
     */
    path?: string;
    /**
     * Ownership and permissions EFS applies when it creates the root directory
     * on first mount. Required if `path` does not already exist on the file
     * system (which is always the case for a freshly created file system).
     */
    creationInfo?: {
        /** POSIX user ID that owns the created root directory. */
        ownerUid: number;
        /** POSIX group ID that owns the created root directory. */
        ownerGid: number;
        /** Octal permissions of the created root directory, e.g. `"750"`. */
        permissions: string;
    };
}
export interface AccessPointProps {
    /**
     * ID of the EFS file system the access point exposes
     * (e.g. `fileSystem.fileSystemId`). Cannot be changed after creation
     * (replacement).
     */
    fileSystemId: string;
    /**
     * POSIX identity enforced for all requests through this access point.
     * Cannot be changed after creation (replacement).
     */
    posixUser?: AccessPointPosixUser;
    /**
     * Directory on the file system exposed as the access point's root,
     * optionally created on first mount with the given ownership/permissions.
     * Cannot be changed after creation (replacement).
     */
    rootDirectory?: AccessPointRootDirectory;
    /**
     * Tags to apply to the access point. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AccessPoint extends Resource<"AWS.EFS.AccessPoint", AccessPointProps, {
    /** The ID of the access point (e.g. `fsap-0123456789abcdef0`). */
    accessPointId: string;
    /** The ARN of the access point. */
    accessPointArn: string;
    /** The ID of the EFS file system the access point belongs to. */
    fileSystemId: string;
}, {}, Providers> {
}
/**
 * An Amazon EFS access point — an application-specific entry point into a
 * file system that enforces a POSIX identity and a root directory.
 *
 * Access points are how Lambda (and other serverless compute) mounts EFS:
 * pass `accessPoint.accessPointArn` to a Lambda Function's
 * `fileSystemConfigs`. The POSIX user and root directory are immutable —
 * changing them replaces the access point.
 * ### Creating Access Points
 * **Example:** Access point with a POSIX identity and auto-created root
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const files = yield* AWS.EFS.FileSystem("Files");
 * const accessPoint = yield* AWS.EFS.AccessPoint("FilesAccess", {
 *   fileSystemId: files.fileSystemId,
 *   posixUser: { uid: 1000, gid: 1000 },
 *   rootDirectory: {
 *     path: "/app",
 *     creationInfo: { ownerUid: 1000, ownerGid: 1000, permissions: "750" },
 *   },
 * });
 * ```
 *
 * ### Mounting into Lambda
 * **Example:** Mount at /mnt/files
 * ```typescript
 * const fn = yield* AWS.Lambda.Function("Api", {
 *   main: "./src/handler.ts",
 *   vpc: { subnetIds: [subnetId], securityGroupIds: [securityGroupId] },
 *   fileSystemConfigs: [
 *     { arn: accessPoint.accessPointArn, localMountPath: "/mnt/files" },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const AccessPoint: import("../../Resource.ts").ResourceClass<AccessPoint>;
declare const AccessPointNotAvailable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AccessPointNotAvailable";
} & Readonly<A>;
/**
 * Internal marker error used to drive the bounded wait for an access point
 * to reach the `available` lifecycle state.
 */
export declare class AccessPointNotAvailable extends AccessPointNotAvailable_base<{
    accessPointId: string;
    state: string;
}> {
}
export declare const AccessPointProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessPoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=AccessPoint.d.ts.map