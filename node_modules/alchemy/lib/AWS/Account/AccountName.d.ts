import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AccountNameProps {
    /**
     * The new name for the account. Between 1 and 50 characters.
     */
    accountName: string;
    /**
     * Account ID to operate on. Only usable from an Organizations management or
     * delegated-admin account with trusted access enabled; omit to target the
     * calling account.
     */
    accountId?: string;
}
export interface AccountName extends Resource<"AWS.Account.AccountName", AccountNameProps, {
    /** The account's current name. */
    accountName: string;
    /** The 12-digit AWS account ID the name belongs to. */
    accountId: string;
    /** The state of the account, e.g. `ACTIVE`. */
    accountState?: string;
    /** ISO-8601 timestamp of when the account was created. */
    accountCreatedDate?: string;
}, never, Providers> {
}
/**
 * The display name of an AWS account. Every account has exactly one name; this
 * account-global singleton sets it via `account:PutAccountName`. Deleting the
 * resource stops managing the name and leaves the last value in place (an
 * account always has a name).
 *
 * ### Naming the Account
 * **Example:** Set the Calling Account's Name
 * ```typescript
 * const name = yield* AccountName("Name", {
 *   accountName: "acme-prod",
 * });
 * ```
 *
 * **Example:** Rename an Organizations Member Account
 * ```typescript
 * const name = yield* AccountName("MemberName", {
 *   accountName: "acme-sandbox",
 *   accountId: "123456789012",
 * });
 * ```
 *
 * @resource
 */
export declare const AccountName: import("../../Resource.ts").ResourceClass<AccountName>;
export declare const AccountNameProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountName>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=AccountName.d.ts.map