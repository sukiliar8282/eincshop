import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * POSIX identity enforced for all file system operations made through an
 * access point.
 */
export interface AccessPointPosixUser {
    /**
     * POSIX user id.
     */
    uid: number;
    /**
     * POSIX group id.
     */
    gid: number;
    /**
     * Secondary POSIX group ids.
     */
    secondaryGids?: number[];
}
/**
 * Ownership and permissions applied when the access point's root directory
 * is created on first use.
 */
export interface AccessPointCreationPermissions {
    /**
     * POSIX user id that owns the root directory.
     */
    ownerUid: number;
    /**
     * POSIX group id that owns the root directory.
     */
    ownerGid: number;
    /**
     * POSIX permission mode for the root directory (e.g. `"0755"`).
     */
    permissions: string;
}
/**
 * Root directory the access point exposes as its file system root.
 */
export interface AccessPointRootDirectory {
    /**
     * Path within the file system to expose as the access point root.
     * @default "/"
     */
    path?: string;
    /**
     * Ownership and mode applied if the service creates the root directory.
     */
    creationPermissions?: AccessPointCreationPermissions;
}
export interface AccessPointProps {
    /**
     * Id of the {@link FileSystem} the access point attaches to. Changing it
     * replaces the access point.
     */
    fileSystemId: string;
    /**
     * POSIX identity enforced for all operations through the access point.
     * Immutable — changing it replaces the access point.
     */
    posixUser?: AccessPointPosixUser;
    /**
     * Root directory the access point exposes. Immutable — changing it
     * replaces the access point.
     */
    rootDirectory?: AccessPointRootDirectory;
    /**
     * Tags to apply to the access point. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface AccessPoint extends Resource<"AWS.S3Files.AccessPoint", AccessPointProps, {
    /**
     * Unique ID of the access point.
     */
    accessPointId: string;
    /**
     * ARN of the access point.
     */
    accessPointArn: string;
    /**
     * ID of the file system the access point attaches to.
     */
    fileSystemId: string;
    /**
     * Current lifecycle status of the access point (e.g. `AVAILABLE`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An Amazon S3 File System Access Point — application-specific access to a
 * {@link FileSystem} with POSIX user identity and root directory
 * enforcement, for managing shared datasets in multi-tenant scenarios.
 *
 * ### Creating an Access Point
 * **Example:** Basic Access Point
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const accessPoint = yield* AWS.S3Files.AccessPoint("AppAccess", {
 *   fileSystemId: fs.fileSystemId,
 * });
 * ```
 *
 * **Example:** Access Point with POSIX Identity and Root Directory
 * ```typescript
 * const accessPoint = yield* AWS.S3Files.AccessPoint("AppAccess", {
 *   fileSystemId: fs.fileSystemId,
 *   posixUser: { uid: 1000, gid: 1000 },
 *   rootDirectory: {
 *     path: "/app",
 *     creationPermissions: { ownerUid: 1000, ownerGid: 1000, permissions: "0755" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const AccessPoint: import("../../Resource.ts").ResourceClass<AccessPoint>;
export declare const AccessPointProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessPoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AccessPoint.d.ts.map