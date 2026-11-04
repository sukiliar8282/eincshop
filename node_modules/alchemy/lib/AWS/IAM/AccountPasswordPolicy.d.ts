import * as iam from "@distilled.cloud/aws/iam";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccountPasswordPolicyProps extends Omit<iam.UpdateAccountPasswordPolicyRequest, "MaxPasswordAge"> {
    /**
     * Maximum password validity duration, e.g. `"90 days"` or
     * `Duration.days(90)`. Sent to IAM as whole days (a bare number is
     * milliseconds).
     */
    MaxPasswordAge?: Duration.Input;
}
export interface AccountPasswordPolicy extends Resource<"AWS.IAM.AccountPasswordPolicy", AccountPasswordPolicyProps, iam.PasswordPolicy, never, Providers> {
}
/**
 * The singleton IAM account password policy.
 *
 * `AccountPasswordPolicy` manages the account-wide password requirements that
 * apply to IAM users with console passwords.
 * ### Managing Password Rules
 * **Example:** Require Strong Passwords
 * ```typescript
 * const policy = yield* AccountPasswordPolicy("PasswordPolicy", {
 *   MinimumPasswordLength: 16,
 *   RequireSymbols: true,
 *   RequireNumbers: true,
 *   RequireUppercaseCharacters: true,
 *   RequireLowercaseCharacters: true,
 *   AllowUsersToChangePassword: true,
 * });
 * ```
 *
 * @resource
 */
export declare const AccountPasswordPolicy: import("../../Resource.ts").ResourceClass<AccountPasswordPolicy>;
export declare const AccountPasswordPolicyProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountPasswordPolicy>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AccountPasswordPolicy.d.ts.map