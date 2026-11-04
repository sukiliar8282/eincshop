import * as rules from "@distilled.cloud/cloudflare/rules";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Rules.List";
/**
 * A Cloudflare account-level List (Lists API) — a named collection of IP
 * addresses, ASNs, hostnames, or URL redirects referenced from ruleset
 * expressions (`ip.src in $my_list`) and Bulk Redirect rules.
 *
 * `name` and `kind` are immutable and changing either triggers a
 * replacement. The list's items are managed as part of the resource: on any
 * change the full contents are replaced via the asynchronous bulk items
 * operation, which the provider polls to completion.
 * ### Creating a List
 * **Example:** IP list with items
 * ```typescript
 * const blocklist = yield* Cloudflare.Rules.List("blocklist", {
 *   kind: "ip",
 *   description: "Known bad actors",
 *   items: [
 *     { ip: "203.0.113.7", comment: "scanner" },
 *     { ip: "198.51.100.0/24" },
 *   ],
 * });
 * ```
 *
 * **Example:** ASN list with an explicit name
 * ```typescript
 * const asns = yield* Cloudflare.Rules.List("bad-asns", {
 *   name: "bad_asns",
 *   kind: "asn",
 *   items: [{ asn: 64496 }, { asn: 64511, comment: "spam network" }],
 * });
 * ```
 *
 * **Example:** Redirect list for Bulk Redirects
 * ```typescript
 * const redirects = yield* Cloudflare.Rules.List("redirects", {
 *   kind: "redirect",
 *   items: [
 *     {
 *       redirect: {
 *         sourceUrl: "example.com/old",
 *         targetUrl: "https://example.com/new",
 *         statusCode: 301,
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Referencing a List from rules
 * **Example:** Use the list name in a Ruleset expression
 * ```typescript
 * const list = yield* Cloudflare.Rules.List("blocklist", { kind: "ip" });
 *
 * // The stable `name` attribute interpolates into rule expressions:
 * // `ip.src in $<name>`
 * const expression = list.name.apply((name) => `ip.src in $${name}`);
 * ```
 *
 * @see https://developers.cloudflare.com/waf/tools/lists/
 *
 * @resource
 * @product Rules
 * @category Rules & Configuration
 */
export const List = Resource(TypeId);
/**
 * Returns true if the given value is a List resource.
 */
export const isList = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
/**
 * The asynchronous bulk items operation finished in a non-`completed`
 * state (or never completed within the polling budget).
 */
export class ListBulkOperationError extends Data.TaggedError("ListBulkOperationError") {
}
export const ListProvider = () => Provider.succeed(List, {
    stables: ["listId", "accountId", "name", "kind", "createdOn"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* rules.listLists.items({ accountId }).pipe(Stream.map((list) => toAttributes(list, accountId)), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
    }),
    diff: Effect.fn(function* ({ id, olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // Lists cannot be renamed and the kind is immutable.
        const oldName = output?.name ?? olds?.name;
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a replace.
        const desiredName = news.name ?? oldName;
        if (oldName !== undefined && desiredName !== oldName) {
            return { action: "replace" };
        }
        const oldKind = output?.kind ?? olds?.kind;
        if (oldKind !== undefined && news.kind !== oldKind) {
            // List names are unique per account. When the name is unchanged the
            // replacement cannot be create-first (the create would collide with
            // the old list), so delete the old list before creating the new one.
            return { action: "replace", deleteFirst: true };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.listId) {
            const observed = yield* getListById(acct, output.listId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. List names are unique per account, so an exact match
        // is authoritative.
        const name = yield* createListName(id, olds?.name);
        const match = yield* findByName(acct, name);
        return match ? toAttributes(match, acct) : undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Prefer the deployed name: regenerating would target a different
        // resource if the generator's output for this id ever drifts.
        const name = yield* createListName(id, news.name ?? output?.name);
        // Observe — the listId cached on `output` is a hint, not a guarantee:
        // a missing list falls through to "missing" and ensure recreates.
        let observed = output?.listId
            ? yield* getListById(output.accountId ?? accountId, output.listId)
            : undefined;
        const acct = observed ? (output?.accountId ?? accountId) : accountId;
        // Ensure — create when missing. A duplicate-name conflict is a race
        // (or an out-of-band create): adopt the existing list with that name
        // when its kind matches. When the kind differs the list cannot be
        // converged in place (kind is immutable and names are unique), so the
        // stale list is deleted and recreated — this is how a replacement of
        // an explicitly-named list lands, since a create-first replacement
        // would always collide on the name.
        if (!observed) {
            const create = rules.createList({
                accountId: acct,
                name,
                kind: news.kind,
                description: news.description,
            });
            observed = yield* create.pipe(Effect.catchTag("ListAlreadyExists", (error) => findByName(acct, name).pipe(Effect.flatMap((match) => {
                if (!match)
                    return Effect.fail(error);
                if (match.kind === news.kind)
                    return Effect.succeed(match);
                return rules
                    .deleteList({ accountId: acct, listId: match.id })
                    .pipe(Effect.catchTag("ListNotFound", () => Effect.void), Effect.flatMap(() => create));
            }))));
        }
        // Sync description — diff observed cloud state against desired and
        // skip the API call entirely on a no-op.
        if ((observed.description ?? undefined) !== news.description) {
            observed = yield* rules.updateList({
                accountId: acct,
                listId: observed.id,
                description: news.description,
            });
        }
        // Sync items — read the observed items fresh from the cloud, compare
        // against the desired set (keyed on value fields + comment, ignoring
        // server-assigned ids/timestamps), and on any delta replace the full
        // contents via the asynchronous bulk PUT, polling it to completion.
        const desiredItems = news.items ?? [];
        const observedItems = yield* listAllItems(acct, observed.id);
        if (!sameItems(observedItems, desiredItems)) {
            const { operationId } = yield* rules.updateListItem({
                accountId: acct,
                listId: observed.id,
                body: desiredItems,
            });
            yield* awaitBulkOperation(acct, operationId);
        }
        // Return — re-read so eventually-consistent counters (numItems) and
        // timestamps are as fresh as possible.
        const final = yield* getListById(acct, observed.id);
        return toAttributes(final ?? observed, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Cloudflare's delete is itself idempotent (deleting a missing list
        // succeeds), but tolerate a typed not-found anyway.
        yield* rules
            .deleteList({
            accountId: output.accountId,
            listId: output.listId,
        })
            .pipe(Effect.catchTag("ListNotFound", () => Effect.void));
    }),
});
/**
 * List names only allow letters, numbers, and underscores (max 50 chars), so
 * the generated physical name swaps the default hyphen delimiter for an
 * underscore.
 */
const createListName = (id, name) => Effect.gen(function* () {
    if (name !== undefined)
        return name;
    const generated = yield* createPhysicalName({
        id,
        lowercase: true,
        delimiter: "_",
        maxLength: 50,
    });
    return generated.replaceAll("-", "_");
});
/**
 * Read a list by id, mapping "gone" (`ListNotFound`, Cloudflare error code
 * 10001) to `undefined`.
 */
const getListById = (accountId, listId) => rules
    .getList({ accountId, listId })
    .pipe(Effect.catchTag("ListNotFound", () => Effect.succeed(undefined)));
/**
 * Find a list by exact name. List names are unique per account.
 */
const findByName = (accountId, name) => rules.listLists.items({ accountId }).pipe(Stream.filter((list) => list.name === name), Stream.runHead, Effect.map(Option.getOrUndefined));
/**
 * Read the full observed contents of a list (all pages).
 */
const listAllItems = (accountId, listId) => rules.listListItems.items({ accountId, listId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
/**
 * Canonicalize an item (desired prop or observed response) into a stable
 * string key: server-assigned ids/timestamps are ignored and optional fields
 * are normalized to their API defaults so omitted props compare equal to the
 * defaults the API materializes.
 */
const canonicalItem = (item) => {
    const comment = "comment" in item && item.comment != null && item.comment !== ""
        ? item.comment
        : undefined;
    if ("ip" in item) {
        return JSON.stringify({ ip: item.ip, comment });
    }
    if ("asn" in item) {
        return JSON.stringify({ asn: item.asn, comment });
    }
    if ("hostname" in item) {
        return JSON.stringify({
            hostname: {
                urlHostname: item.hostname.urlHostname,
                excludeExactHostname: item.hostname.excludeExactHostname ?? false,
            },
            comment,
        });
    }
    return JSON.stringify({
        redirect: {
            sourceUrl: item.redirect.sourceUrl,
            targetUrl: item.redirect.targetUrl,
            includeSubdomains: item.redirect.includeSubdomains ?? false,
            preservePathSuffix: item.redirect.preservePathSuffix ?? false,
            preserveQueryString: item.redirect.preserveQueryString ?? false,
            statusCode: item.redirect.statusCode ?? 301,
            subpathMatching: item.redirect.subpathMatching ?? false,
        },
        comment,
    });
};
/**
 * Compare observed and desired items as multisets of canonical keys.
 */
const sameItems = (observed, desired) => {
    if (observed.length !== desired.length)
        return false;
    const a = observed.map(canonicalItem).sort();
    const b = desired.map(canonicalItem).sort();
    return a.every((key, i) => key === b[i]);
};
/**
 * Poll an asynchronous bulk items operation until it reaches a terminal
 * state, failing with a typed error when it does not complete successfully.
 */
const awaitBulkOperation = (accountId, operationId) => Effect.gen(function* () {
    const operation = yield* rules
        .getListBulkOperation({ accountId, operationId })
        .pipe(Effect.repeat({
        schedule: Schedule.spaced("2 seconds"),
        until: (op) => op.status === "completed" || op.status === "failed",
        times: 90,
    }));
    if (operation.status !== "completed") {
        return yield* Effect.fail(new ListBulkOperationError({
            operationId,
            status: operation.status,
            message: "error" in operation ? operation.error : undefined,
        }));
    }
});
const toAttributes = (list, accountId) => ({
    listId: list.id,
    accountId,
    name: list.name,
    // Distilled widens generated string enums to open unions (`string & {}`).
    kind: list.kind,
    description: list.description ?? undefined,
    numItems: list.numItems,
    numReferencingFilters: list.numReferencingFilters,
    createdOn: list.createdOn,
    modifiedOn: list.modifiedOn,
});
//# sourceMappingURL=List.js.map