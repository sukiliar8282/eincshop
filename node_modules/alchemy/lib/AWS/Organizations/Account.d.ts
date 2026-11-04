import * as organizations from "@distilled.cloud/aws/organizations";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type AccountId = string;
export type AccountArn = string;
export interface AccountProps {
    /**
     * Account email. Must be globally unique across AWS accounts.
     */
    email: string;
    /**
     * Friendly account name.
     */
    name: string;
    /**
     * Parent root or OU ID.
     */
    parentId: string;
    /**
     * Optional cross-account access role name created during account vending.
     */
    roleName?: string;
    /**
     * Whether IAM users can access billing information.
     */
    iamUserAccessToBilling?: organizations.IAMUserAccessToBilling;
    /**
     * Optional tags applied to the member account while it remains in the org.
     */
    tags?: Record<string, string>;
}
export interface Account extends Resource<"AWS.Organizations.Account", AccountProps, {
    /**
     * 12-digit AWS account ID.
     */
    accountId: AccountId;
    /**
     * ARN of the member account.
     */
    accountArn: AccountArn;
    /**
     * Friendly account name.
     */
    name: string | undefined;
    /**
     * Email address associated with the account.
     */
    email: string | undefined;
    /**
     * ID of the parent root or OU.
     */
    parentId: string | undefined;
    /**
     * Account status (`ACTIVE`, `SUSPENDED`, or `PENDING_CLOSURE`).
     */
    status: organizations.AccountStatus | undefined;
    /**
     * Account state reported by AWS Organizations.
     */
    state: organizations.AccountState | undefined;
    /**
     * How the account joined the organization (`CREATED` or `INVITED`).
     */
    joinedMethod: organizations.AccountJoinedMethod | undefined;
    /**
     * When the account joined the organization.
     */
    joinedTimestamp: Date | undefined;
    /**
     * Tags on the member account.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A member account created and managed by AWS Organizations.
 *
 * Account creation is asynchronous — the provider polls the vending request
 * until the account ID is assigned. Must be deployed from the organization's
 * management account. Changing `email` replaces the account; changing `name`
 * updates it in place.
 * ### Creating Member Accounts
 * **Example:** Account Under the Organization Root
 * ```typescript
 * const root = yield* Root("Root", {});
 *
 * const dev = yield* Account("Dev", {
 *   name: "dev",
 *   email: "aws-dev@example.com",
 *   parentId: root.rootId,
 * });
 * ```
 *
 * **Example:** Account Inside an Organizational Unit
 * ```typescript
 * const workloads = yield* OrganizationalUnit("Workloads", {
 *   parentId: root.rootId,
 *   name: "workloads",
 * });
 *
 * const prod = yield* Account("Prod", {
 *   name: "prod",
 *   email: "aws-prod@example.com",
 *   parentId: workloads.ouId,
 *   roleName: "OrganizationAccountAccessRole",
 *   tags: { environment: "prod" },
 * });
 * ```
 *
 * @resource
 */
export declare const Account: import("../../Resource.ts").ResourceClass<Account>;
export declare const AccountProvider: () => import("effect/Layer").Layer<Provider.Provider<Account>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Account.d.ts.map