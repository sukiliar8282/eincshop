import * as organizations from "@distilled.cloud/aws/organizations";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { ServiceControlPolicyDocument } from "../IAM/Policy.ts";
import * as IdentityCenter from "../IdentityCenter/index.ts";
import type { Account, AccountProps } from "./Account.ts";
import type { DelegatedAdministrator } from "./DelegatedAdministrator.ts";
import type { Organization, OrganizationProps } from "./Organization.ts";
import type { OrganizationalUnit, OrganizationalUnitProps } from "./OrganizationalUnit.ts";
import type { Policy } from "./Policy.ts";
import type { PolicyAttachment } from "./PolicyAttachment.ts";
import type { Root, RootProps } from "./Root.ts";
import type { RootPolicyType } from "./RootPolicyType.ts";
import type { TrustedServiceAccess } from "./TrustedServiceAccess.ts";
export type TenantTargetKey = "root" | string;
export interface TenantAccountSpec extends Omit<AccountProps, "parentId" | "name" | "email"> {
    /** Stable key identifying the account within the tenant (used in logical IDs and `targetKeys`). */
    key: string;
    /** Friendly account name. */
    name: string;
    /** Globally unique email address for the account. */
    email: string;
}
export interface TenantOrganizationalUnitSpec extends Omit<OrganizationalUnitProps, "parentId" | "name"> {
    /** Stable key identifying the OU within the tenant (used in logical IDs and `targetKeys`). */
    key: string;
    /**
     * OU name.
     * @default the spec `key`
     */
    name?: string;
    /** Member accounts vended directly under this OU. */
    accounts?: TenantAccountSpec[];
    /** Nested child OUs. */
    children?: TenantOrganizationalUnitSpec[];
}
export interface TenantPolicySpec {
    /** Stable key identifying the policy within the tenant. */
    key: string;
    /** Policy name. If omitted, Alchemy generates one. */
    name?: string;
    /** Policy description. */
    description?: string;
    /**
     * Organizations policy type.
     * @default "SERVICE_CONTROL_POLICY"
     */
    type?: organizations.PolicyType;
    /**
     * Policy content — a typed {@link ServiceControlPolicyDocument} for
     * SCP/RCP policies, or a raw JSON `string` for other policy types
     * (tag, backup, ...) and as the escape hatch.
     */
    document: ServiceControlPolicyDocument | string;
    /** Keys of the roots/OUs/accounts to attach the policy to (`"root"` or a spec key). */
    targetKeys: TenantTargetKey[];
    /** Tags applied to the policy, merged with tenant-wide tags. */
    tags?: Record<string, string>;
}
export interface TenantIdentityCenterGroupSpec {
    /** Stable key identifying the group within the tenant. */
    key: string;
    /** Display name of the Identity Center group. */
    displayName: string;
    /** Group description. */
    description?: string;
}
export interface TenantIdentityCenterPermissionSetSpec {
    /** Stable key identifying the permission set within the tenant. */
    key: string;
    /** Name of the permission set. */
    name: string;
    /** Permission set description. */
    description?: string;
    /**
     * Optional session duration, e.g. `"8 hours"` or `Duration.hours(8)`.
     * Sent to Identity Center as an ISO-8601 string such as `PT8H` (a bare
     * number is milliseconds).
     */
    sessionDuration?: Duration.Input;
    /** URL the user lands on after federating into the account. */
    relayState?: string;
}
export interface TenantIdentityCenterAssignmentSpec {
    /** Stable key for the assignment. Defaults to a key derived from the other fields. */
    key?: string;
    /** Key of the permission set to assign. */
    permissionSetKey: string;
    /** Key of the account the principal is granted access to. */
    accountKey: string;
    /**
     * Kind of principal being assigned.
     * @default "GROUP"
     */
    principalType?: "USER" | "GROUP";
    /** Key of the Identity Center group to assign (when `principalType` is `GROUP`). */
    groupKey?: string;
    /** Explicit principal ID (e.g. an existing user) instead of a group key. */
    principalId?: string;
}
export interface TenantIdentityCenterSpec {
    /**
     * Whether to adopt the org's existing Identity Center instance
     * (`existing`) or create an account instance (`account`).
     * @default "existing"
     */
    mode?: "existing" | "account";
    /** ARN of an existing Identity Center instance to use explicitly. */
    instanceArn?: string;
    /** Name for the Identity Center instance. */
    name?: string;
    /** Account key to register as the Identity Center delegated administrator. */
    delegatedAdminAccountKey?: string;
    /** Identity Center groups to create. */
    groups?: TenantIdentityCenterGroupSpec[];
    /** Permission sets to create. */
    permissionSets?: TenantIdentityCenterPermissionSetSpec[];
    /** Account assignments binding groups/users to permission sets. */
    assignments?: TenantIdentityCenterAssignmentSpec[];
}
export interface TenantRootProps {
    /** Organization settings (feature set). Defaults to `featureSet: "ALL"`. */
    organization?: OrganizationProps;
    /** Root import settings (explicit root ID, tags). */
    root?: RootProps;
    /**
     * Policy types to enable on the root.
     * @default ["SERVICE_CONTROL_POLICY"]
     */
    policyTypes?: organizations.PolicyType[];
    /** Service principals granted trusted access (Identity Center's is added automatically). */
    trustedServicePrincipals?: string[];
    /** OU tree to create under the root. Defaults to a security/infrastructure/workloads baseline. */
    organizationalUnits?: TenantOrganizationalUnitSpec[];
    /** Organizations policies to create and attach via `targetKeys`. */
    policies?: TenantPolicySpec[];
    /** IAM Identity Center groups, permission sets, and assignments. */
    identityCenter?: TenantIdentityCenterSpec;
    /** Tags applied to every taggable resource in the tenant. */
    tags?: Record<string, string>;
}
export interface TenantRootResult {
    organization: Organization;
    root: Root;
    policyTypes: RootPolicyType[];
    trustedServiceAccess: TrustedServiceAccess[];
    delegatedAdministrators: DelegatedAdministrator[];
    organizationalUnits: Record<string, OrganizationalUnit>;
    accounts: Record<string, Account>;
    policies: Record<string, Policy>;
    policyAttachments: PolicyAttachment[];
    identityCenter?: {
        instance: IdentityCenter.Instance;
        groups: Record<string, IdentityCenter.Group>;
        permissionSets: Record<string, IdentityCenter.PermissionSet>;
        assignments: Record<string, IdentityCenter.AccountAssignment>;
    };
}
/**
 * Compose an opinionated single-tenant landing zone inside the current AWS
 * Organizations management account.
 *
 * This helper intentionally stays aligned to native AWS semantics:
 * one real Organization, one root, nested OUs, and accounts beneath that
 * tenant root. The broader `RootRoot` concept is an Alchemy control-plane
 * abstraction over many such tenant roots deployed into separate management
 * accounts, not a nested AWS Organizations feature.
 * ### Creating A Tenant Root
 * **Example:** Tenant With Baseline Accounts
 * ```typescript
 * const tenant = yield* TenantRoot("CustomerA", {
 *   identityCenter: {
 *     mode: "existing",
 *     groups: [
 *       { key: "platform", displayName: "platform-engineers" },
 *     ],
 *     permissionSets: [
 *       {
 *         key: "admin",
 *         name: "AdministratorAccess",
 *         sessionDuration: "8 hours",
 *       },
 *     ],
 *     assignments: [
 *       {
 *         permissionSetKey: "admin",
 *         groupKey: "platform",
 *         accountKey: "prod",
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const TenantRoot: (id: string, props?: TenantRootProps | undefined) => Effect.Effect<{
    organization: Organization;
    root: Root;
    policyTypes: RootPolicyType[];
    trustedServiceAccess: TrustedServiceAccess[];
    delegatedAdministrators: DelegatedAdministrator[];
    organizationalUnits: Record<string, OrganizationalUnit>;
    accounts: Record<string, Account>;
    policies: Record<string, Policy>;
    policyAttachments: PolicyAttachment[];
    identityCenter: {
        instance: IdentityCenter.Instance;
        groups: Record<string, IdentityCenter.Group>;
        permissionSets: Record<string, IdentityCenter.PermissionSet>;
        assignments: Record<string, IdentityCenter.AccountAssignment>;
    } | undefined;
}, unknown, unknown>;
//# sourceMappingURL=TenantRoot.d.ts.map