import * as accounts from "@distilled.cloud/cloudflare/accounts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Account.Account";
type TypeId = typeof TypeId;
/**
 * The kind of Cloudflare account. Cannot be changed after creation.
 */
export type AccountType = "standard" | "enterprise";
export interface AccountProps {
    /**
     * Account name (display name). Mutable in place. If omitted, a unique
     * name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The kind of account to create. Cannot be changed after creation —
     * Cloudflare rejects type changes (`UpdateAccountTypeNotSupported`), so
     * updating this property triggers a replacement.
     * @default "standard"
     */
    type?: AccountType;
    /**
     * Tenant unit to create the account under. Only meaningful for tenant /
     * partner credentials; defaults to the tenant's root unit. Create-only —
     * updating this property triggers a replacement.
     *
     * @see https://developers.cloudflare.com/tenant/how-to/manage-accounts/
     */
    unit?: {
        /**
         * The id of the tenant unit to create the account on.
         */
        id?: string;
    };
    /**
     * Abuse contact email address for the account
     * (`settings.abuse_contact_email`). Mutable in place. When omitted, the
     * setting is left unmanaged (an existing value is not cleared).
     */
    abuseContactEmail?: string;
    /**
     * Whether membership in this account requires that two-factor
     * authentication is enabled (`settings.enforce_twofactor`). Mutable in
     * place. When omitted, the setting is left unmanaged.
     * @default false
     */
    enforceTwofactor?: boolean;
}
export interface AccountAttributes {
    /**
     * Account identifier tag assigned by Cloudflare.
     */
    accountId: string;
    /**
     * Account name (display name).
     */
    name: string;
    /**
     * The kind of account.
     */
    type: AccountType;
    /**
     * Timestamp for the creation of the account.
     */
    createdOn: string | undefined;
    /**
     * Id of the tenant organization the account is managed by, if any.
     */
    parentOrgId: string | undefined;
    /**
     * Name of the tenant organization the account is managed by, if any.
     */
    parentOrgName: string | undefined;
    /**
     * Abuse contact email address configured on the account, if any.
     */
    abuseContactEmail: string | undefined;
    /**
     * Whether membership in the account requires two-factor authentication.
     */
    enforceTwofactor: boolean;
}
export type Account = Resource<TypeId, AccountProps, AccountAttributes, never, Providers>;
/**
 * A Cloudflare account (subaccount), for tenant / partner platforms that
 * provision an account per customer.
 *
 * Creating accounts (`POST /accounts`) is restricted to credentials with the
 * tenant entitlement — a standard user receives the typed
 * `AccountCreationForbidden` error (Cloudflare error code 1002). The `name`
 * and account settings are mutable in place; `type` and the tenant `unit`
 * are create-only and trigger a replacement. Deleting the resource queues
 * the account for deletion (also tenant-gated).
 *
 * The account's physical identity is the Cloudflare-assigned `accountId`.
 * Account names are not unique, so there is no find-by-name fallback: if
 * state is lost, the account is treated as missing rather than guessed at.
 * ### Creating an account
 * **Example:** Standard subaccount with a generated name
 * ```typescript
 * const account = yield* Cloudflare.Account.Account("CustomerAccount", {});
 * ```
 *
 * **Example:** Subaccount on a specific tenant unit
 * ```typescript
 * const account = yield* Cloudflare.Account.Account("CustomerAccount", {
 *   name: "Customer: ACME Inc",
 *   unit: { id: tenantUnitId },
 * });
 * ```
 *
 * ### Account settings
 * **Example:** Enforce two-factor authentication for all members
 * ```typescript
 * const account = yield* Cloudflare.Account.Account("CustomerAccount", {
 *   name: "Customer: ACME Inc",
 *   enforceTwofactor: true,
 *   abuseContactEmail: "abuse@acme.example",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/tenant/how-to/manage-accounts/
 *
 * @resource
 * @product Accounts
 * @category Account & Identity
 */
export declare const Account: import("../../Resource.ts").ResourceClass<Account>;
/**
 * Returns true if the given value is an Account resource.
 */
export declare const isAccount: (value: unknown) => value is Account;
export declare const AccountProvider: () => import("effect/Layer").Layer<Provider.Provider<Account>, never, import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | accounts.CloudflareOpContext>;
export {};
//# sourceMappingURL=Account.d.ts.map