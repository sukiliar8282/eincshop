import * as firewall from "@distilled.cloud/cloudflare/firewall";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const LockdownTypeId = "Cloudflare.Firewall.Lockdown";
/**
 * A Cloudflare Zone Lockdown rule — restrict one or more URL patterns on a
 * zone so that only an allow-list of IP addresses and CIDR ranges can access
 * them. Every other visitor receives an "Access Denied" page.
 *
 * Everything about a lockdown rule is mutable in place: `urls`,
 * `configurations`, `description`, `paused`, and `priority` are all updated
 * via PUT without replacing the rule. Only moving the rule to a different
 * zone triggers a replacement.
 *
 * Zone Lockdown is available on Pro plans and above, with per-plan rule
 * quotas (Pro: 3, Business: 10, Enterprise: 200). Cloudflare rejects a
 * second rule covering the same URLs with a duplicate error, so a rule's
 * URL set acts as its identity within a zone.
 *
 * Safety: lockdown rules carry no ownership markers. When there is no prior
 * state, `read` scans the zone for an existing rule with the same URL set
 * and reports it as `Unowned`, so the engine refuses to take it over unless
 * `--adopt` (or `adopt(true)`) is set.
 * ### Locking down a URL
 * **Example:** Allow a single office IP to reach an admin panel
 * ```typescript
 * yield* Cloudflare.Firewall.Lockdown("AdminLockdown", {
 *   zoneId: zone.zoneId,
 *   urls: ["shop.example.com/admin*"],
 *   configurations: [{ target: "ip", value: "198.51.100.4" }],
 *   description: "only the office can reach /admin",
 * });
 * ```
 *
 * **Example:** Allow a CIDR range across multiple URLs
 * ```typescript
 * yield* Cloudflare.Firewall.Lockdown("StaffOnly", {
 *   zoneId: zone.zoneId,
 *   urls: ["example.com/internal*", "example.com/staging*"],
 *   configurations: [
 *     { target: "ip_range", value: "203.0.113.0/24" },
 *     { target: "ip", value: "198.51.100.4" },
 *   ],
 * });
 * ```
 *
 * ### Pausing a rule
 * **Example:** Temporarily disable a lockdown without deleting it
 * ```typescript
 * yield* Cloudflare.Firewall.Lockdown("AdminLockdown", {
 *   zoneId: zone.zoneId,
 *   urls: ["shop.example.com/admin*"],
 *   configurations: [{ target: "ip", value: "198.51.100.4" }],
 *   paused: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/tools/zone-lockdown/
 *
 * @resource
 * @product Firewall
 * @category Application Security
 */
export const Lockdown = Resource(LockdownTypeId);
/**
 * Returns true if the given value is a Lockdown resource.
 */
export const isLockdown = (value) => Predicate.hasProperty(value, "Type") && value.Type === LockdownTypeId;
export const LockdownProvider = () => Provider.succeed(Lockdown, {
    stables: ["lockdownId", "zoneId", "createdOn"],
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        // No prior props to compare against — let the engine decide.
        if (o.zoneId === undefined)
            return undefined;
        // zoneId is Input<string>; compare only once both are concrete.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (zoneId === undefined)
            return undefined;
        // Owned path: refresh by our persisted lockdown id.
        if (output?.lockdownId) {
            const observed = yield* getLockdown(zoneId, output.lockdownId);
            if (observed)
                return toAttributes(observed, zoneId);
        }
        // Adoption path: a rule covering the same URLs may already exist —
        // Cloudflare rejects overlapping duplicates, so the URL set is the
        // rule's identity within the zone. Lockdown rules carry no ownership
        // markers, so brand a match `Unowned` and let the engine gate
        // takeover behind the adopt policy.
        const urls = output?.urls ?? olds?.urls;
        if (urls) {
            const observed = yield* findByUrls(zoneId, urls);
            if (observed)
                return Unowned(toAttributes(observed, zoneId));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        // 1. Observe — the lockdown id cached on `output` is a hint, not a
        //    guarantee: a missing rule falls through to the URL scan and
        //    then to create.
        let observed = output?.lockdownId
            ? yield* getLockdown(zoneId, output.lockdownId)
            : undefined;
        // 2. Fall back to scanning the zone for a rule with the same URL
        //    set. Ownership has already been verified upstream — `read`
        //    reports existing rules as `Unowned` and the engine gates
        //    takeover behind the adopt policy before reconcile ever runs.
        if (!observed) {
            observed = yield* findByUrls(zoneId, news.urls);
        }
        // 3. Ensure — create when missing. A concurrent create surfaces as
        //    `DuplicateLockdown` (Cloudflare code 10009): converge by
        //    re-scanning for the rule that won the race.
        if (!observed) {
            observed = yield* firewall
                .createLockdown({
                zoneId,
                urls: news.urls,
                configurations: news.configurations,
                description: news.description,
                paused: news.paused,
                priority: news.priority,
            })
                .pipe(Effect.catchTag("DuplicateLockdown", (error) => findByUrls(zoneId, news.urls).pipe(Effect.flatMap((existing) => existing ? Effect.succeed(existing) : Effect.fail(error)))));
        }
        // 4. Sync — diff observed cloud state against desired; skip the PUT
        //    entirely on a no-op. Undefined optional props are treated as
        //    "no constraint" so adoption doesn't clobber foreign settings.
        const dirty = !sameStringSet(observed.urls, news.urls) ||
            !sameConfigurationSet(observed.configurations, news.configurations) ||
            (news.description !== undefined &&
                (observed.description ?? "") !== news.description) ||
            (news.paused !== undefined && observed.paused !== news.paused) ||
            (news.priority !== undefined &&
                (observed.priority ?? undefined) !== news.priority);
        if (dirty) {
            observed = yield* firewall.updateLockdown({
                zoneId,
                lockDownsId: observed.id,
                urls: news.urls,
                configurations: news.configurations,
                description: news.description,
                paused: news.paused,
                priority: news.priority,
            });
        }
        return toAttributes(observed, zoneId);
    }),
    // Zone Lockdown rules are zone-scoped: there is no account-wide list, so
    // enumerate every zone and exhaustively paginate its lockdown rules,
    // hydrating each into the same Attributes shape `read` returns. Zone
    // Lockdown is a Pro+ feature, so plan-gated zones reject the route with a
    // typed `Forbidden` — skip those rather than failing the whole list.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => firewall.listLockdowns.items({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).map((rule) => toAttributes(rule, zone.id))), Effect.catchTag("Forbidden", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    delete: Effect.fn(function* ({ output }) {
        // Cloudflare's DELETE is naturally idempotent (an already-gone rule
        // answers HTTP 200 echoing the id) — the typed catch covers the rare
        // not-found envelope race.
        yield* firewall
            .deleteLockdown({
            zoneId: output.zoneId,
            lockDownsId: output.lockdownId,
        })
            .pipe(Effect.catchTag("LockdownNotFound", () => Effect.void));
    }),
});
/**
 * Read a lockdown rule by id, mapping "gone" (`LockdownNotFound`, Cloudflare
 * error code 10001 `zonelockdown.api.not_found`) to `undefined`.
 */
const getLockdown = (zoneId, lockdownId) => firewall.getLockdown({ zoneId, lockDownsId: lockdownId }).pipe(Effect.map((rule) => rule), Effect.catchTag("LockdownNotFound", () => Effect.succeed(undefined)));
/**
 * Find a lockdown rule by exact URL set within the zone. Cloudflare rejects
 * a second rule covering the same URLs as `zonelockdown.api.duplicate_of_existing`,
 * so the URL set acts as a rule's identity.
 */
const findByUrls = (zoneId, urls) => firewall.listLockdowns.items({ zoneId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).find((rule) => sameStringSet(rule.urls, urls))));
const sameStringSet = (a, b) => a.length === b.length &&
    [...a].sort().join("\n") === [...b].sort().join("\n");
const configurationKey = (c) => `${c.target ?? ""}=${c.value ?? ""}`;
const sameConfigurationSet = (a, b) => a.length === b.length &&
    a.map(configurationKey).sort().join("\n") ===
        b.map(configurationKey).sort().join("\n");
const toAttributes = (rule, zoneId) => ({
    lockdownId: rule.id,
    zoneId,
    urls: [...rule.urls],
    configurations: rule.configurations.map((c) => ({
        // Distilled types each union variant's target/value as optional —
        // Cloudflare always echoes both for a persisted rule.
        target: (c.target ?? "ip"),
        value: c.value ?? "",
    })),
    description: rule.description ?? undefined,
    paused: rule.paused,
    priority: rule.priority ?? undefined,
    createdOn: rule.createdOn,
    modifiedOn: rule.modifiedOn,
});
//# sourceMappingURL=Lockdown.js.map