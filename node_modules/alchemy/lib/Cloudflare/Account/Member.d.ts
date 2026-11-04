import * as accounts from "@distilled.cloud/cloudflare/accounts";
import * as Effect from "effect/Effect";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Account.Member";
type TypeId = typeof TypeId;
/**
 * A member's invitation status in the account. New invites start as
 * `pending` and become `accepted` when the invitee accepts.
 */
export type MemberStatus = "accepted" | "pending";
/**
 * A scoped access policy attached to an account membership. Policies are an
 * Enterprise alternative to legacy `roles` — they grant a permission group
 * over a resource group with an explicit allow/deny.
 */
export interface MemberPolicy {
    /**
     * Whether the policy allows or denies the permission groups on the
     * resource groups.
     */
    access: "allow" | "deny";
    /**
     * Permission groups granted by this policy.
     */
    permissionGroups: {
        id: string;
    }[];
    /**
     * Resource groups this policy applies to.
     */
    resourceGroups: {
        id: string;
    }[];
}
export interface MemberProps {
    /**
     * The contact email address of the user to invite. The email is the
     * identity of the membership — there is no API to change it, so updating
     * this property triggers a replacement (a new invite is sent and the old
     * membership is removed).
     */
    email: string;
    /**
     * IDs of legacy account roles to assign to the member. Mutable — role
     * changes are applied in place via `PUT`. Role IDs can be looked up by
     * name with {@link findAccountRoleByName}.
     *
     * Exactly one of `roles` or `policies` should be provided.
     */
    roles?: string[];
    /**
     * Scoped access policies to attach to the member (Enterprise feature).
     * Mutable — policy changes are applied in place via `PUT`.
     *
     * Exactly one of `roles` or `policies` should be provided.
     */
    policies?: MemberPolicy[];
    /**
     * Status of the member invitation. Only `pending` can be requested when
     * inviting; the invitee flips it to `accepted` by accepting. Changing an
     * already-`accepted` membership back to `pending` triggers a replacement
     * (the member is removed and re-invited).
     * @default "pending"
     */
    status?: MemberStatus;
}
export interface MemberAttributes {
    /**
     * Membership identifier tag assigned by Cloudflare.
     */
    memberId: string;
    /**
     * The Cloudflare account the membership belongs to.
     */
    accountId: string;
    /**
     * The contact email address of the member.
     */
    email: string;
    /**
     * The member's invitation status (`pending` until the invite is
     * accepted).
     */
    status: MemberStatus;
    /**
     * Roles assigned to the member, resolved to `{ id, name }` pairs.
     */
    roles: {
        id: string;
        name: string;
    }[];
    /**
     * Scoped access policies attached to the member, or `undefined` when the
     * membership uses legacy roles only.
     */
    policies: MemberPolicy[] | undefined;
    /**
     * The user id behind the membership, if the invitee already has a
     * Cloudflare user.
     */
    userId: string | undefined;
}
export type Member = Resource<TypeId, MemberProps, MemberAttributes, never, Providers>;
/**
 * A member of a Cloudflare account — an invitation for a user (by email) to
 * join the account with a set of roles or scoped policies.
 *
 * The membership's identity is its `email`: there is no API to change the
 * address, so updating `email` triggers a replacement (a fresh invite). The
 * assigned `roles`/`policies` are mutable in place. New invites stay
 * `pending` until the invitee accepts; deleting the resource cancels a
 * pending invite or removes an accepted member.
 *
 * Safety: memberships carry no ownership markers. When there is no prior
 * state, `read` scans the account for an existing membership with the same
 * email and reports it as `Unowned`, so the engine refuses to take it over
 * unless `--adopt` (or `adopt(true)`) is set.
 * ### Inviting a member
 * **Example:** Invite with a role looked up by name
 * ```typescript
 * const role = yield* Cloudflare.Account.findAccountRoleByName(
 *   accountId,
 *   "Administrator Read Only",
 * );
 *
 * yield* Cloudflare.Account.Member("Auditor", {
 *   email: "auditor@example.com",
 *   roles: [role!.id],
 * });
 * ```
 *
 * ### Changing roles
 * **Example:** Swap the member's role in place
 * ```typescript
 * // Same email — the membership is updated, not replaced.
 * yield* Cloudflare.Account.Member("Auditor", {
 *   email: "auditor@example.com",
 *   roles: [adminRole.id],
 * });
 * ```
 *
 * ### Scoped policies (Enterprise)
 * **Example:** Invite with a scoped policy instead of roles
 * ```typescript
 * yield* Cloudflare.Account.Member("ScopedOperator", {
 *   email: "operator@example.com",
 *   policies: [{
 *     access: "allow",
 *     permissionGroups: [{ id: permissionGroupId }],
 *     resourceGroups: [{ id: resourceGroupId }],
 *   }],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/fundamentals/manage-members/
 *
 * @resource
 * @product Accounts
 * @category Account & Identity
 */
export declare const Member: import("../../Resource.ts").ResourceClass<Member>;
/**
 * Returns true if the given value is an Member resource.
 */
export declare const isMember: (value: unknown) => value is Member;
export declare const MemberProvider: () => import("effect/Layer").Layer<Provider.Provider<Member>, never, CloudflareEnvironment | accounts.CloudflareOpContext>;
/**
 * Look up a legacy account role by its exact name (e.g. `"Administrator"`,
 * `"Administrator Read Only"`). Returns `undefined` when the account has no
 * role with that name. Useful for resolving the `roles` prop of
 * {@link Member} without hard-coding role IDs.
 */
export declare const findAccountRoleByName: (accountId: string, name: string) => Effect.Effect<accounts.MembersCreateResponseRolesItem | undefined, accounts.CloudflareOpError, accounts.CloudflareOpContext>;
export {};
//# sourceMappingURL=Member.d.ts.map