import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccountAliasProps {
    /**
     * The AWS account alias to manage.
     */
    accountAlias: string;
}
export interface AccountAlias extends Resource<"AWS.IAM.AccountAlias", AccountAliasProps, {
    /** The alias assigned to the AWS account. */
    accountAlias: string;
}, never, Providers> {
}
/**
 * The singleton IAM account alias for an AWS account.
 *
 * `AccountAlias` manages the one account-level alias that customizes the AWS
 * sign-in URL for the current account.
 * ### Managing Account Identity
 * **Example:** Set the Account Alias
 * ```typescript
 * const alias = yield* AccountAlias("AccountAlias", {
 *   accountAlias: "my-company-prod",
 * });
 * ```
 *
 * @resource
 */
export declare const AccountAlias: import("../../Resource.ts").ResourceClass<AccountAlias>;
export declare const AccountAliasProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountAlias>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AccountAlias.d.ts.map