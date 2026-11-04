import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Addressing.PrefixDelegation";
/**
 * Delegates part of a BYOIP prefix to another Cloudflare account, allowing
 * that account to use the delegated CIDR (e.g. for its own service
 * bindings).
 *
 * Delegations are create/delete only — every prop change forces a
 * replacement.
 * ### Delegating a Prefix
 * **Example:** Delegate a /26 to another account
 * ```typescript
 * const delegation = yield* Cloudflare.Addressing.PrefixDelegation("share", {
 *   prefixId: prefix.prefixId,
 *   cidr: "192.0.2.0/26",
 *   delegatedAccountId: "023e105f4ecef8ad9ca31a8372d0c353",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/byoip/
 *
 * @resource
 * @product Addressing
 * @category Network
 */
export const PrefixDelegation = Resource(TypeId);
/**
 * Returns true if the given value is an PrefixDelegation resource.
 */
export const isPrefixDelegation = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const PrefixDelegationProvider = () => Provider.succeed(PrefixDelegation, {
    stables: [
        "delegationId",
        "prefixId",
        "accountId",
        "cidr",
        "delegatedAccountId",
        "createdAt",
    ],
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (olds === undefined)
            return undefined;
        if (!isResolved(news) || !isResolved(olds))
            return undefined;
        // Create/delete only — any change forces a replacement.
        const oldPrefixId = output?.prefixId ?? olds.prefixId;
        if (typeof oldPrefixId === "string" &&
            typeof news.prefixId === "string" &&
            news.prefixId !== oldPrefixId) {
            return { action: "replace" };
        }
        if (news.cidr !== (output?.cidr ?? olds.cidr)) {
            return { action: "replace" };
        }
        const oldDelegated = output?.delegatedAccountId ?? olds.delegatedAccountId;
        if (typeof oldDelegated === "string" &&
            typeof news.delegatedAccountId === "string" &&
            news.delegatedAccountId !== oldDelegated) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const prefixId = output?.prefixId ??
            (typeof olds?.prefixId === "string" ? olds.prefixId : undefined);
        if (!prefixId)
            return undefined;
        // There is no get-by-id op — list and filter. Cold reads match on
        // (cidr, delegatedAccountId), which identify a delegation uniquely.
        const delegations = yield* listDelegations(acct, prefixId);
        const match = output?.delegationId
            ? delegations.find((d) => d.id === output.delegationId)
            : delegations.find((d) => d.cidr === (output?.cidr ?? olds?.cidr) &&
                d.delegatedAccountId ===
                    (output?.delegatedAccountId ??
                        (typeof olds?.delegatedAccountId === "string"
                            ? olds.delegatedAccountId
                            : undefined)));
        return match ? toAttributes(match, prefixId, acct) : undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const prefixId = news.prefixId;
        const delegatedAccountId = news.delegatedAccountId;
        // 1. Observe — find an existing delegation with the same identity.
        const delegations = yield* listDelegations(acct, prefixId);
        const observed = (output?.delegationId
            ? delegations.find((d) => d.id === output.delegationId)
            : undefined) ??
            delegations.find((d) => d.cidr === news.cidr && d.delegatedAccountId === delegatedAccountId);
        if (observed) {
            // Nothing is mutable — converged.
            return toAttributes(observed, prefixId, acct);
        }
        // 2. Ensure — create the delegation.
        const created = yield* addressing.createPrefixDelegation({
            accountId: acct,
            prefixId,
            cidr: news.cidr,
            delegatedAccountId,
        });
        return toAttributes(created, prefixId, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* addressing
            .deletePrefixDelegation({
            accountId: output.accountId,
            prefixId: output.prefixId,
            delegationId: output.delegationId,
        })
            .pipe(Effect.catchTag("DelegationNotFound", () => Effect.void));
    }),
    // Delegations are children of BYOIP prefixes and have no account-wide
    // enumeration API. Fan out: list every account prefix, then list the
    // delegations on each prefix (bounded concurrency). A prefix that has
    // gone away between the two calls reads as an empty list (typed
    // `PrefixNotFound`, handled in `listDelegations`).
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const prefixIds = yield* addressing.listPrefixes
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .map((p) => p.id)
            .filter((id) => typeof id === "string"))));
        const rows = yield* Effect.forEach(prefixIds, (prefixId) => listDelegations(accountId, prefixId).pipe(Effect.map((delegations) => delegations.map((d) => toAttributes(d, prefixId, accountId)))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * List all delegations on a prefix. A missing parent prefix reads as an
 * empty list.
 */
const listDelegations = (accountId, prefixId) => addressing.listPrefixDelegations.items({ accountId, prefixId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)), Effect.catchTag("PrefixNotFound", () => Effect.succeed([])));
const toAttributes = (delegation, prefixId, accountId) => ({
    delegationId: delegation.id ?? "",
    prefixId,
    accountId,
    cidr: delegation.cidr ?? "",
    delegatedAccountId: delegation.delegatedAccountId ?? "",
    createdAt: delegation.createdAt ?? undefined,
});
//# sourceMappingURL=PrefixDelegation.js.map