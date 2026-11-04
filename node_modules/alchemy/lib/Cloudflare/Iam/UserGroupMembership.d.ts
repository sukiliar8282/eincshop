import * as iam from "@distilled.cloud/cloudflare/iam";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Iam.UserGroupMembership";
type TypeId = typeof TypeId;
export interface UserGroupMembershipProps {
    /**
     * ID of the user group to add the member to — e.g.
     * `userGroup.userGroupId`. Immutable — changing it triggers a
     * replacement.
     */
    userGroup: string;
    /**
     * Account member ID to add to the user group (the membership id from
     * the account's member roster, not the user id). Immutable — changing
     * it triggers a replacement.
     */
    memberId: string;
}
export interface UserGroupMembershipAttributes {
    /** ID of the user group the member belongs to. */
    userGroupId: string;
    /** Account member ID of the member. */
    memberId: string;
    /** The Cloudflare account the user group belongs to. */
    accountId: string;
    /** The contact email address of the member, if known. */
    email: string | undefined;
    /** The member's status in the account (`accepted` or `pending`). */
    status: string | undefined;
}
export type UserGroupMembership = Resource<TypeId, UserGroupMembershipProps, UserGroupMembershipAttributes, never, Providers>;
/**
 * Membership of a single account member in a Cloudflare IAM user group.
 *
 * This is an existence-only resource: it has no mutable aspects beyond its
 * identity (user group + member), so changing either property triggers a
 * replacement. Cloudflare's member-add API is idempotent — adding a member
 * who is already in the group succeeds — so reconcile is a simple
 * observe-then-ensure flow.
 *
 * Account-scoped IAM (user groups and their members) is an Enterprise
 * feature.
 * ### Adding a Member
 * **Example:** Add an account member to a user group
 * ```typescript
 * const group = yield* Cloudflare.Iam.UserGroup("Operators", {});
 *
 * yield* Cloudflare.Iam.UserGroupMembership("SamInOperators", {
 *   userGroup: group.userGroupId,
 *   memberId: "b67b4c279ea0177a0ddff0a2ef64b11b",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-members/user-groups/
 *
 * @resource
 * @product IAM
 * @category Account & Identity
 */
export declare const UserGroupMembership: import("../../Resource.ts").ResourceClass<UserGroupMembership>;
/**
 * Returns true if the given value is an UserGroupMembership resource.
 */
export declare const isUserGroupMembership: (value: unknown) => value is UserGroupMembership;
export declare const UserGroupMembershipProvider: () => import("effect/Layer").Layer<Provider.Provider<UserGroupMembership>, never, CloudflareEnvironment | iam.CloudflareOpContext>;
export {};
//# sourceMappingURL=UserGroupMembership.d.ts.map