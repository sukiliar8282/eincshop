import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface UserProps {
    /**
     * The ID of the user pool the user belongs to. Changing this triggers a
     * replacement.
     */
    userPoolId: string;
    /**
     * The username. If omitted, a deterministic physical name is generated
     * from the app, stage, and logical ID. Changing this triggers a
     * replacement. For pools with `usernameAttributes` this must be a value
     * of one of those attributes (e.g. an email address).
     */
    username?: string;
    /**
     * User attributes as name → value pairs (e.g.
     * `{ email: "a@b.com", email_verified: "true" }`). Attributes declared
     * here are kept in sync; removing a previously declared attribute deletes
     * it from the user.
     */
    attributes?: Record<string, string>;
    /**
     * A permanent password for the user, set via `AdminSetUserPassword`
     * (`Permanent: true`), which moves the user to `CONFIRMED`. Without it
     * the user is created in `FORCE_CHANGE_PASSWORD` state. Must satisfy the
     * pool's password policy. Wrap with `Redacted.make(...)` so the value
     * never leaks into logs or state output.
     */
    password?: Redacted.Redacted<string>;
    /**
     * Whether the user account is enabled.
     * @default true
     */
    enabled?: boolean;
}
export interface User extends Resource<"AWS.Cognito.User", UserProps, {
    /** The username. */
    username: string;
    /** The ID of the user pool the user belongs to. */
    userPoolId: string;
    /** The user's stable unique identifier (the `sub` attribute). */
    sub: string;
    /** The user's status, e.g. `CONFIRMED` or `FORCE_CHANGE_PASSWORD`. */
    userStatus: string;
}, never, Providers> {
}
/**
 * A user within an Amazon Cognito user pool, created administratively via
 * `AdminCreateUser`. The invitation message is always suppressed
 * (`MessageAction: SUPPRESS`) — declaratively managed users never trigger
 * invite emails/SMS; set a permanent `password` to make the account usable
 * immediately.
 * ### Creating Users
 * **Example:** Basic User
 * ```typescript
 * import * as Cognito from "alchemy/AWS/Cognito";
 *
 * const pool = yield* Cognito.UserPool("Users", {});
 * const user = yield* Cognito.User("Admin", {
 *   userPoolId: pool.userPoolId,
 *   attributes: { email: "admin@example.com", email_verified: "true" },
 * });
 * ```
 *
 * **Example:** Confirmed User with a Permanent Password
 * ```typescript
 * import * as Redacted from "effect/Redacted";
 *
 * const user = yield* Cognito.User("ServiceAccount", {
 *   userPoolId: pool.userPoolId,
 *   username: "service-account",
 *   password: Redacted.make("A-Str0ng-Passw0rd!"),
 *   attributes: { email: "svc@example.com", email_verified: "true" },
 * });
 * // user.userStatus === "CONFIRMED"
 * ```
 *
 * @resource
 */
export declare const User: import("../../Resource.ts").ResourceClass<User>;
export declare const UserProvider: () => import("effect/Layer").Layer<Provider.Provider<User>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=User.d.ts.map