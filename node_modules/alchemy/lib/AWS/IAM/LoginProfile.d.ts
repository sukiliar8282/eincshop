import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface LoginProfileProps {
    /**
     * User that owns the console login profile.
     */
    userName: string;
    /**
     * Console password. AWS never returns this value after create/update.
     */
    password: Redacted.Redacted<string> | string;
    /**
     * Require a password reset on next sign in.
     */
    passwordResetRequired?: boolean;
}
export interface LoginProfile extends Resource<"AWS.IAM.LoginProfile", LoginProfileProps, {
    /** The IAM user the login profile belongs to. */
    userName: string;
    /** When the login profile was created. */
    createDate: Date | undefined;
    /** Whether the user must set a new password on next sign-in. */
    passwordResetRequired: boolean | undefined;
}, never, Providers> {
}
/**
 * An IAM console login profile for a user.
 *
 * `LoginProfile` manages AWS Management Console access for an IAM user. The
 * password is write-only, so AWS never returns it during later reads.
 * ### Managing Console Access
 * **Example:** Create a Console Login Profile
 * ```typescript
 * const user = yield* User("ConsoleUser", {
 *   userName: "console-user",
 * });
 *
 * const profile = yield* LoginProfile("ConsoleLogin", {
 *   userName: user.userName,
 *   password: Redacted.make("TempPassword123!"),
 *   passwordResetRequired: true,
 * });
 * ```
 *
 * @resource
 */
export declare const LoginProfile: import("../../Resource.ts").ResourceClass<LoginProfile>;
export declare const LoginProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<LoginProfile>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LoginProfile.d.ts.map