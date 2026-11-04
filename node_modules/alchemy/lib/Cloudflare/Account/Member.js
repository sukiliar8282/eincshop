import * as accounts from "@distilled.cloud/cloudflare/accounts";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Account.Member";
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
export const Member = Resource(TypeId);
/**
 * Returns true if the given value is an Member resource.
 */
export const isMember = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const MemberProvider = () => Provider.succeed(Member, {
    stables: ["memberId", "accountId", "email", "userId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Exhaustively paginate the account membership list to collect every
        // member id, then re-read each membership through `getMember` so each
        // element matches the EXACT shape `read`/`reconcile` produce. A
        // membership that vanishes between the list and the per-item read
        // (typed `MemberNotFound`, Cloudflare code 1003) is dropped.
        const ids = yield* accounts.listMembers.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .map((member) => member.id)
            .filter((id) => id != null))));
        const rows = yield* Effect.forEach(ids, (memberId) => getMember(accountId, memberId).pipe(Effect.map((member) => member ? toAttributes(member, accountId) : undefined)), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        // No prior props to compare against — let the engine decide.
        if (o.email === undefined)
            return undefined;
        // The email is the identity of the invite — it cannot be changed.
        if (!sameEmail(o.email, n.email)) {
            return { action: "replace" };
        }
        // Per the API, demoting an accepted membership back to `pending`
        // requires removing and re-inviting the member.
        if (o.status === "accepted" && n.status === "pending") {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by our persisted membership id.
        if (output?.memberId) {
            const observed = yield* getMember(acct, output.memberId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Adoption path: a membership for this email may already exist.
        // Memberships carry no ownership markers, so we cannot prove we
        // created it — brand it `Unowned` so the engine refuses to take
        // over unless `adopt` is set.
        const email = output?.email ?? olds?.email;
        if (email) {
            const observed = yield* findByEmail(acct, email);
            if (observed)
                return Unowned(toAttributes(observed, acct));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Inputs have been resolved to concrete strings by Plan.
        const desiredRoles = news.roles;
        // 1. Observe — the membership id cached on `output` is a hint, not
        //    a guarantee: a missing member falls through to the email scan
        //    and then to create.
        let observed = output?.memberId
            ? yield* getMember(accountId, output.memberId)
            : undefined;
        // 2. Fall back to scanning the account for the email. Ownership has
        //    already been verified upstream — `read` reports existing
        //    memberships as `Unowned` and the engine gates takeover behind
        //    the adopt policy before reconcile ever runs.
        if (!observed) {
            observed = yield* findByEmail(accountId, news.email);
        }
        // 3. Ensure — invite when missing. A concurrent (or orphaned) invite
        //    for the same email surfaces either as a generic validation error
        //    or as the typed `AccountMemberAlreadyExists` (Cloudflare answers
        //    the duplicate with HTTP 400 "Account member already exists for
        //    email address"): in both cases converge by re-scanning for the
        //    membership that won the race and adopting it.
        if (!observed) {
            const created = yield* accounts
                .createMember({
                accountId,
                email: news.email,
                roles: desiredRoles,
                policies: news.policies,
                status: news.status,
            })
                .pipe(Effect.catchTag(["ValidationError", "AccountMemberAlreadyExists"], (error) => findByEmail(accountId, news.email).pipe(Effect.flatMap((existing) => existing ? Effect.succeed(existing) : Effect.fail(error)))));
            observed = created;
        }
        // 4. Sync — diff the observed roles/policies against desired; skip
        //    the PUT entirely on a no-op. `status` is not synced: only the
        //    invitee can accept, and accepted -> pending is a replacement
        //    handled by diff.
        const memberId = observed.id ?? "";
        const rolesDirty = desiredRoles !== undefined &&
            !sameIdSet((observed.roles ?? []).map((role) => role.id), desiredRoles);
        const policiesDirty = news.policies !== undefined &&
            !samePolicies(observed.policies ?? [], news.policies);
        if (rolesDirty || policiesDirty) {
            observed = yield* accounts.updateMember({
                accountId,
                memberId,
                roles: desiredRoles?.map((id) => ({ id })),
                policies: news.policies,
            });
        }
        return toAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Removing a member cancels a pending invite or revokes an accepted
        // membership. An already-gone member surfaces as `MemberNotFound`
        // (Cloudflare error code 1003) — that's success for delete.
        yield* accounts
            .deleteMember({
            accountId: output.accountId,
            memberId: output.memberId,
        })
            .pipe(Effect.catchTag("MemberNotFound", () => Effect.void));
    }),
});
/**
 * Look up a legacy account role by its exact name (e.g. `"Administrator"`,
 * `"Administrator Read Only"`). Returns `undefined` when the account has no
 * role with that name. Useful for resolving the `roles` prop of
 * {@link Member} without hard-coding role IDs.
 */
export const findAccountRoleByName = (accountId, name) => accounts.listRoles.items({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).find((role) => role.name === name)));
/**
 * Read a membership by id, mapping "gone" (`MemberNotFound`, Cloudflare
 * error code 1003) to `undefined`.
 */
const getMember = (accountId, memberId) => accounts.getMember({ accountId, memberId }).pipe(Effect.map((member) => member), Effect.catchTag("MemberNotFound", () => Effect.succeed(undefined)));
/**
 * Find a membership by email. Emails are unique within an account, so at
 * most one membership can match. The comparison is case-insensitive —
 * Cloudflare normalizes addresses.
 */
const findByEmail = (accountId, email) => accounts.listMembers.items({ accountId }).pipe(Stream.runCollect, Effect.flatMap((chunk) => {
    const match = Array.from(chunk).find((member) => member.email != null && sameEmail(member.email, email));
    // The list payload omits nothing we need, but re-read through
    // `getMember` so every code path observes the same response shape.
    return match?.id != null
        ? getMember(accountId, match.id)
        : Effect.succeed(undefined);
}));
const sameEmail = (a, b) => a.toLowerCase() === b.toLowerCase();
const sameIdSet = (observed, desired) => observed.length === desired.length &&
    [...observed].sort().join(",") === [...desired].sort().join(",");
const samePolicies = (observed, desired) => {
    if (observed.length !== desired.length)
        return false;
    const normalize = (policies) => policies
        .map((policy) => `${policy.access}:${idList(policy.permissionGroups)}:${idList(policy.resourceGroups)}`)
        .sort()
        .join("|");
    return (normalize(observed.map((policy) => ({
        access: policy.access ?? "allow",
        permissionGroups: policy.permissionGroups ?? [],
        resourceGroups: policy.resourceGroups ?? [],
    }))) === normalize(desired));
};
const idList = (groups) => groups
    .map((group) => group.id)
    .sort()
    .join(",");
const toAttributes = (member, accountId) => ({
    memberId: member.id ?? "",
    accountId,
    email: member.email ?? "",
    status: (member.status ?? "pending"),
    roles: (member.roles ?? []).map((role) => ({
        id: role.id,
        name: role.name,
    })),
    policies: member.policies
        ? member.policies.map((policy) => ({
            access: (policy.access ?? "allow"),
            permissionGroups: (policy.permissionGroups ?? []).map((group) => ({
                id: group.id,
            })),
            resourceGroups: (policy.resourceGroups ?? []).map((group) => ({
                id: group.id,
            })),
        }))
        : undefined,
    userId: member.user?.id ?? undefined,
});
//# sourceMappingURL=Member.js.map