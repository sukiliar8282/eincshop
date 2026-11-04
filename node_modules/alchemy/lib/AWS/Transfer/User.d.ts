import * as transfer from "@distilled.cloud/aws/transfer";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface UserProps {
    /**
     * ID of the Transfer Family server the user belongs to (e.g.
     * `server.serverId`). Changing it replaces the user.
     */
    serverId: string;
    /**
     * User name clients authenticate as. Must be 3-100 characters. Changing it
     * replaces the user.
     */
    userName: string;
    /**
     * IAM role ARN granting the user access to the storage backend (S3/EFS).
     */
    role: string;
    /**
     * Landing directory when the user connects (PATH mode).
     */
    homeDirectory?: string;
    /**
     * Whether the user sees the absolute bucket path (`PATH`) or a virtual
     * chroot built from `homeDirectoryMappings` (`LOGICAL`).
     * @default "PATH"
     */
    homeDirectoryType?: transfer.HomeDirectoryType;
    /**
     * Virtual-to-actual path mappings for `LOGICAL` home-directory mode.
     */
    homeDirectoryMappings?: transfer.HomeDirectoryMapEntry[];
    /**
     * Inline session policy scoping the user's access, as a JSON string.
     */
    policy?: string;
    /**
     * POSIX identity (uid/gid) applied to the user, required for EFS servers.
     */
    posixProfile?: transfer.PosixProfile;
    /**
     * SSH public key body to register for the user at creation (service-managed
     * identity provider). Additional keys can be managed out of band.
     */
    sshPublicKeyBody?: string;
    /**
     * User-defined tags for the user.
     */
    tags?: Record<string, string>;
}
export interface User extends Resource<"AWS.Transfer.User", UserProps, {
    /**
     * User name clients authenticate as.
     */
    userName: string;
    /**
     * ID of the Transfer Family server the user belongs to.
     */
    serverId: string;
    /**
     * ARN of the user.
     */
    arn: string;
    /**
     * IAM role ARN granting the user access to the storage backend.
     */
    role: string | undefined;
    /**
     * Landing directory when the user connects.
     */
    homeDirectory: string | undefined;
    /**
     * Current tags reported for the user.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A user of an AWS Transfer Family server (service-managed identity
 * provider). Users are free configuration objects attached to a
 * {@link Server}; the server itself is what incurs hourly cost.
 * ### Creating a User
 * **Example:** Service-Managed SFTP User
 * ```typescript
 * const user = yield* User("Alice", {
 *   serverId: server.serverId,
 *   userName: "alice",
 *   role: transferRole.roleArn,
 *   homeDirectory: "/my-bucket/alice",
 *   sshPublicKeyBody: "ssh-ed25519 AAAA...",
 * });
 * ```
 *
 * @resource
 */
export declare const User: import("../../Resource.ts").ResourceClass<User>;
export declare const UserProvider: () => import("effect/Layer").Layer<Provider.Provider<User>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=User.d.ts.map