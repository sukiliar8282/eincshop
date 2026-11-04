import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/**
 * A Cloudflare Zero Trust Access group — a reusable, account-scoped set of
 * Access rule criteria. Groups are referenced from Access policies via a
 * `{ group: { id } }` rule, letting many policies share one membership
 * definition.
 * ### Creating a Group
 * **Example:** Allow a single email domain
 * ```typescript
 * const group = yield* Cloudflare.Access.Group("ExampleDomain", {
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 * ```
 *
 * **Example:** Combine include, exclude and require rules
 * ```typescript
 * const group = yield* Cloudflare.Access.Group("UsEngineers", {
 *   include: [{ emailDomain: { domain: "example.com" } }],
 *   exclude: [{ email: { email: "intern@example.com" } }],
 *   require: [{ geo: { countryCode: "US" } }],
 * });
 * ```
 *
 * ### Referencing a Group from a Policy
 * **Example:** Allow members of the group
 * ```typescript
 * const group = yield* Cloudflare.Access.Group("Team", {
 *   include: [{ emailDomain: { domain: "example.com" } }],
 * });
 *
 * const policy = yield* Cloudflare.Access.Policy("AllowTeam", {
 *   decision: "allow",
 *   include: [{ group: { id: group.groupId } }],
 * });
 * ```
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export const Group = Resource("Cloudflare.Access.Group");
export const isGroup = (value) => Predicate.hasProperty(value, "Type") &&
    value.Type === "Cloudflare.Access.Group";
export const GroupProvider = () => Provider.succeed(Group, {
    stables: ["groupId", "accountId"],
    diff: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // Everything else (name, rules, isDefault) converges via PUT.
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.groupId) {
            const direct = yield* zeroTrust
                .getAccessGroupForAccount({
                accountId: acct,
                groupId: output.groupId,
            })
                .pipe(Effect.map(toObserved), Effect.catchTag("AccessGroupNotFound", () => Effect.succeed(undefined)));
            if (direct && direct.id) {
                return {
                    groupId: direct.id,
                    accountId: acct,
                    name: direct.name ?? output.name,
                    isDefault: direct.isDefault ?? output.isDefault,
                };
            }
        }
        const name = yield* createGroupName(id, olds?.name ?? output?.name);
        const existing = yield* findGroupByName(acct, name);
        if (!existing || !existing.id)
            return undefined;
        return {
            groupId: existing.id,
            accountId: acct,
            name: existing.name ?? name,
            isDefault: existing.isDefault ?? undefined,
        };
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listAccessGroupsForAccount
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((g) => g.id != null)
            .map((g) => ({
            groupId: g.id,
            accountId,
            name: g.name ?? "",
            isDefault: g.isDefault ?? undefined,
        })))));
    }),
    reconcile: Effect.fn(function* ({ id, news = {}, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createGroupName(id, news.name);
        const acct = output?.accountId ?? accountId;
        // Observe — prefer the cached groupId, fall back to a name lookup so
        // we recover from out-of-band deletes and partial state-persistence
        // failures.
        let observed;
        if (output?.groupId) {
            observed = yield* zeroTrust
                .getAccessGroupForAccount({
                accountId: acct,
                groupId: output.groupId,
            })
                .pipe(Effect.map(toObserved), Effect.catchTag("AccessGroupNotFound", () => Effect.succeed(undefined)));
        }
        if (!observed) {
            observed = yield* findGroupByName(acct, name);
        }
        // Ensure — create the group when missing. Tolerate a race where a
        // parallel actor created the same-named group by re-observing.
        let ensured;
        if (!observed || !observed.id) {
            ensured = yield* zeroTrust
                .createAccessGroupForAccount({
                accountId: acct,
                name,
                include: news.include,
                exclude: news.exclude,
                require: news.require,
                isDefault: news.isDefault,
            })
                .pipe(Effect.map(toObserved), Effect.catch((err) => Effect.gen(function* () {
                const existing = yield* findGroupByName(acct, name);
                if (existing && existing.id)
                    return existing;
                return yield* Effect.fail(err);
            })));
        }
        else {
            // Sync — Cloudflare PUTs the group as a whole replacement, so a
            // single update converges every mutable field (name, rule sets,
            // isDefault). The API is idempotent for equal payloads.
            const prior = observed;
            const updated = yield* zeroTrust.updateAccessGroupForAccount({
                accountId: acct,
                groupId: prior.id,
                name,
                include: news.include,
                exclude: news.exclude,
                require: news.require,
                isDefault: news.isDefault,
            });
            ensured = {
                id: updated.id ?? prior.id,
                name: updated.name ?? prior.name,
                isDefault: updated.isDefault ?? prior.isDefault,
            };
        }
        if (!ensured.id) {
            return yield* Effect.fail(new Error("Group: ensured group missing id"));
        }
        return {
            groupId: ensured.id,
            accountId: acct,
            name: ensured.name ?? name,
            isDefault: ensured.isDefault ?? news.isDefault,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* zeroTrust
            .deleteAccessGroupForAccount({
            accountId: output.accountId,
            groupId: output.groupId,
        })
            .pipe(Effect.catchTag("AccessGroupNotFound", () => Effect.void));
    }),
});
const createGroupName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    return yield* createPhysicalName({ id });
});
const findGroupByName = (acct, name) => zeroTrust.listAccessGroupsForAccount.items({ accountId: acct }).pipe(Stream.filter((g) => g.name === name), Stream.runHead, Effect.map(Option.getOrUndefined), Effect.catch(() => Effect.succeed(undefined)));
const toObserved = (g) => ({
    id: g.id,
    name: g.name,
    isDefault: g.isDefault,
});
//# sourceMappingURL=Group.js.map