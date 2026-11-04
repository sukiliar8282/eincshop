import * as iam from "@distilled.cloud/cloudflare/iam";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Iam.UserGroup";
type TypeId = typeof TypeId;
/**
 * A fine-grained policy attached to a user group: an allow/deny decision
 * over a set of permission groups (what actions) and resource groups
 * (which resources).
 */
export interface UserGroupPolicyInput {
    /**
     * Whether the policy allows or denies the combined permission/resource
     * groups. Note: Cloudflare currently rejects `deny` user-group policies
     * with "Policy validation failed" — only `allow` is accepted in
     * practice.
     */
    access: "allow" | "deny";
    /**
     * IDs of the permission groups (what actions are permitted). Look these
     * up via the account's `/iam/permission_groups` catalog.
     */
    permissionGroups: string[];
    /**
     * IDs of the resource groups (which resources the permissions apply
     * to) — e.g. from {@link ResourceGroup}.
     */
    resourceGroups: string[];
}
/**
 * A fully-resolved user group policy as observed on Cloudflare, including
 * the server-assigned policy id.
 */
export interface UserGroupPolicy {
    /**
     * Server-assigned identifier of the policy. Not stable — Cloudflare
     * assigns fresh policy ids on every policy update.
     */
    id: string | undefined;
    /** Whether the policy allows or denies. */
    access: "allow" | "deny";
    /** IDs of the permission groups in the policy. */
    permissionGroups: string[];
    /** IDs of the resource groups in the policy. */
    resourceGroups: string[];
}
export interface UserGroupProps {
    /**
     * Name of the user group. If omitted, a unique name is generated from
     * the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Fine-grained policies attached to the user group. Mutable in place —
     * the full set is replaced on update.
     */
    policies?: UserGroupPolicyInput[];
}
export interface UserGroupAttributes {
    /** Cloudflare-assigned identifier of the user group. */
    userGroupId: string;
    /** The Cloudflare account the user group belongs to. */
    accountId: string;
    /** Name of the user group. */
    name: string;
    /** Policies attached to the user group (with server-assigned ids). */
    policies: UserGroupPolicy[];
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type UserGroup = Resource<TypeId, UserGroupProps, UserGroupAttributes, never, Providers>;
/**
 * A Cloudflare IAM user group — a named set of account members that share
 * fine-grained policies (permission groups scoped to resource groups).
 *
 * Both `name` and `policies` are mutable in place; updating policies
 * replaces the full set. Add members with
 * {@link UserGroupMembership}.
 *
 * Account-scoped IAM (resource groups, user groups) is an Enterprise
 * feature.
 * ### Creating a User Group
 * **Example:** Empty group
 * ```typescript
 * const group = yield* Cloudflare.Iam.UserGroup("Operators", {});
 * ```
 *
 * **Example:** Group with a policy
 * ```typescript
 * const readers = yield* Cloudflare.Iam.UserGroup("Readers", {
 *   name: "zone-readers",
 *   policies: [
 *     {
 *       access: "allow",
 *       permissionGroups: [readOnlyPermissionGroupId],
 *       resourceGroups: [resourceGroup.resourceGroupId],
 *     },
 *   ],
 * });
 * ```
 *
 * ### Managing Members
 * **Example:** Add an account member to the group
 * ```typescript
 * yield* Cloudflare.Iam.UserGroupMembership("SamInReaders", {
 *   userGroup: readers.userGroupId,
 *   memberId: accountMember.memberId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-members/user-groups/
 *
 * @resource
 * @product IAM
 * @category Account & Identity
 */
export declare const UserGroup: import("../../Resource.ts").ResourceClass<UserGroup>;
/**
 * Returns true if the given value is an UserGroup resource.
 */
export declare const isUserGroup: (value: unknown) => value is UserGroup;
export declare const UserGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<UserGroup>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | iam.CloudflareOpContext>;
export {};
//# sourceMappingURL=UserGroup.d.ts.map