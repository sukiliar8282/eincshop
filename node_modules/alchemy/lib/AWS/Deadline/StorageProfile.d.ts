import * as deadline from "@distilled.cloud/aws/deadline";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type StorageProfileOperatingSystemFamily = deadline.StorageProfileOperatingSystemFamily;
export type FileSystemLocation = deadline.FileSystemLocation;
export interface StorageProfileProps {
    /**
     * The identifier of the farm the storage profile belongs to. Changing it
     * replaces the storage profile.
     */
    farmId: string;
    /**
     * Display name of the storage profile.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * Operating system family of the hosts the profile describes
     * (`WINDOWS`, `LINUX`, `MACOS`).
     */
    osFamily: StorageProfileOperatingSystemFamily;
    /**
     * Shared or local file system locations available on hosts using this
     * profile.
     */
    fileSystemLocations?: FileSystemLocation[];
}
export interface StorageProfile extends Resource<"AWS.Deadline.StorageProfile", StorageProfileProps, {
    /**
     * The identifier of the farm the storage profile belongs to.
     */
    farmId: string;
    /**
     * Service-assigned unique identifier of the storage profile (`sp-...`).
     */
    storageProfileId: string;
    /**
     * The storage profile's display name.
     */
    displayName: string;
    /**
     * The configured operating system family.
     */
    osFamily: StorageProfileOperatingSystemFamily;
    /**
     * The configured file system locations.
     */
    fileSystemLocations: FileSystemLocation[];
}, never, Providers> {
}
/**
 * An AWS Deadline Cloud storage profile — describes the operating system
 * and file system locations of the hosts in a farm so path mapping works
 * across mixed environments.
 *
 * ### Creating Storage Profiles
 * **Example:** Linux Storage Profile
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const profile = yield* AWS.Deadline.StorageProfile("LinuxHosts", {
 *   farmId: farm.farmId,
 *   osFamily: "LINUX",
 *   fileSystemLocations: [
 *     { name: "Assets", path: "/mnt/assets", type: "SHARED" },
 *   ],
 * });
 * ```
 *
 * **Example:** Cross-Platform Path Mapping
 * ```typescript
 * // A second profile in the same farm maps the same shared location to its
 * // Windows drive path, so jobs submitted from either OS resolve `Assets`.
 * const windows = yield* AWS.Deadline.StorageProfile("WindowsHosts", {
 *   farmId: farm.farmId,
 *   osFamily: "WINDOWS",
 *   fileSystemLocations: [
 *     { name: "Assets", path: "Z:\\assets", type: "SHARED" },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const StorageProfile: import("../../Resource.ts").ResourceClass<StorageProfile>;
export declare const StorageProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<StorageProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=StorageProfile.d.ts.map