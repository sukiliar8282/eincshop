import type * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Authentication mode for a MemoryDB user.
 */
export interface UserAuthenticationMode {
    /**
     * How the user authenticates:
     * - `"password"` — one or two SHA-256 passwords (supplied in `passwords`).
     * - `"iam"` — IAM authentication; the username must match the IAM identity.
     * - `"no-password"` — the user has no password (typically the default user).
     */
    type: "password" | "iam" | "no-password";
    /**
     * One or two passwords (16-128 printable characters each). Required when
     * `type` is `"password"`. Passwords are write-only — the API never returns
     * them, so changes to `passwords` alone are not auto-detected on update;
     * change `type` (or replace the user) to force a credential reset.
     */
    passwords?: Redacted.Redacted<string>[];
}
export interface UserProps {
    /**
     * Name of the user. Must be 1-40 alphanumeric characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * user.
     */
    userName?: string;
    /**
     * How the user authenticates.
     */
    authenticationMode: UserAuthenticationMode;
    /**
     * Redis ACL access string describing the user's permissions, e.g.
     * `"on ~* +@all"`. See the MemoryDB / Redis ACL documentation.
     */
    accessString: string;
    /**
     * User-defined tags for the user.
     */
    tags?: Record<string, string>;
}
export interface User extends Resource<"AWS.MemoryDB.User", UserProps, {
    /** Name of the user. */
    userName: string;
    /** ARN of the user. */
    userArn: string;
    /** Current lifecycle status (e.g. `active`, `modifying`). */
    status: string;
    /** Access string defining the user's permissions. */
    accessString: string | undefined;
    /** How the user authenticates (`password` or `iam`). */
    authenticationType: string | undefined;
    /** Minimum engine version the user is compatible with. */
    minimumEngineVersion: string | undefined;
    /** Tags on the user (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A MemoryDB user — an RBAC identity that authenticates to a cluster and is
 * granted permissions through an access string. Users are grouped into
 * {@link ACL}s, which are attached to clusters.
 *
 * Users are free and provision quickly. Passwords are write-only.
 * ### Creating a User
 * **Example:** Password User with Full Access
 * ```typescript
 * const user = yield* User("AppUser", {
 *   authenticationMode: { type: "password", passwords: [appPassword] },
 *   accessString: "on ~* +@all",
 * });
 * ```
 *
 * **Example:** IAM-Authenticated User
 * ```typescript
 * const user = yield* User("IamUser", {
 *   userName: "iam-app-user",
 *   authenticationMode: { type: "iam" },
 *   accessString: "on ~* +@all",
 * });
 * ```
 *
 * @resource
 */
export declare const User: import("../../Resource.ts").ResourceClass<User>;
export declare const UserProvider: () => import("effect/Layer").Layer<Provider.Provider<User>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=User.d.ts.map