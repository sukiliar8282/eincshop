import * as pageRules from "@distilled.cloud/cloudflare/page-rules";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.PageRule.PageRule";
/**
 * A Cloudflare **Page Rule** — a legacy zone-level rule that matches a URL
 * pattern (`target`) and applies a set of `actions` (cache settings, SSL
 * mode, redirects, etc.) at a given `priority`.
 *
 * :::caution[Legacy]
 * Page Rules are a legacy product superseded by Cloudflare's modern Rules
 * platform (Rulesets — Cache Rules, Redirect Rules, Configuration Rules,
 * Origin Rules, Transform Rules). Prefer `Cloudflare.Ruleset.Ruleset` for new
 * projects; use `Cloudflare.PageRule.PageRule` only for existing setups or
 * migrations. Page Rules are also plan-limited (Free 3, Pro 20,
 * Business 50, Enterprise 125).
 * :::
 *
 * A rule's recoverable identity is its `target` URL pattern within the
 * zone. Page Rules carry no ownership markers, so when there is no prior
 * state `read` scans the zone for a rule with the same target and reports
 * it as `Unowned` — the engine refuses to take it over unless `--adopt`
 * (or `adopt(true)`) is set.
 * ### Caching
 * **Example:** Cache everything under a path
 * ```typescript
 * yield* Cloudflare.PageRule.PageRule("CacheImages", {
 *   zoneId: zone.zoneId,
 *   target: `${zone.name}/images/*`,
 *   actions: [
 *     { id: "cache_level", value: "cache_everything" },
 *     { id: "edge_cache_ttl", value: 7200 },
 *   ],
 * });
 * ```
 *
 * ### Redirects
 * **Example:** Permanent redirect with forwarding_url
 * ```typescript
 * // forwarding_url cannot be combined with most other actions.
 * yield* Cloudflare.PageRule.PageRule("RedirectOldBlog", {
 *   zoneId: zone.zoneId,
 *   target: `${zone.name}/blog/*`,
 *   actions: [
 *     {
 *       id: "forwarding_url",
 *       value: { url: "https://new.example.com/blog/$1", statusCode: "301" },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Security
 * **Example:** Force HTTPS and raise the security level
 * ```typescript
 * yield* Cloudflare.PageRule.PageRule("SecureAdmin", {
 *   zoneId: zone.zoneId,
 *   target: `${zone.name}/admin/*`,
 *   actions: [
 *     { id: "always_use_https" },
 *     { id: "security_level", value: "high" },
 *   ],
 *   priority: 2,
 * });
 * ```
 *
 * ### Staged rollout
 * **Example:** Create the rule disabled, flip to active later
 * ```typescript
 * yield* Cloudflare.PageRule.PageRule("BypassCacheBeta", {
 *   zoneId: zone.zoneId,
 *   target: `${zone.name}/beta/*`,
 *   actions: [{ id: "cache_level", value: "bypass" }],
 *   status: "disabled",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/rules/page-rules/
 *
 * @resource
 * @product Page Rules
 * @category Rules & Configuration
 */
export const PageRule = Resource(TypeId, {
    aliases: ["Cloudflare.PageRule"],
});
/**
 * Returns true if the given value is a PageRule resource.
 */
export const isPageRule = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const PageRuleProvider = () => Provider.succeed(PageRule, {
    stables: ["pageRuleId", "zoneId", "createdOn"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Page Rules live inside a zone (`/zones/{id}/pagerules`) with no
        // account-wide enumeration API. Fan out over every zone and list
        // its rules; `listPageRules` is non-paginated (returns the whole
        // array in one response). Skip plan-gated zones with the typed
        // `Forbidden` tag.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => pageRules.listPageRules({ zoneId: zone.id }).pipe(Effect.map((rules) => rules.map((rule) => toAttributes(rule, zone.id))), 
        // Skip plan-gated zones (`Forbidden`) and zones Cloudflare rejects
        // with "Invalid zone identifier" (e.g. pending/partial-setup zones
        // that don't accept the page-rules endpoint) — they contribute no
        // rules and shouldn't fail the whole account enumeration.
        Effect.catchTag(["Forbidden", "InvalidZoneIdentifier"], () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ olds = {}, news }) {
        const o = olds;
        const n = news;
        // zoneId is Input<string>; compare only once both are concrete.
        if (typeof o.zoneId === "string" &&
            typeof n.zoneId === "string" &&
            o.zoneId !== n.zoneId) {
            return { action: "replace" };
        }
        // Everything else (target, actions, priority, status) is mutable
        // via PUT — let the engine apply the default update logic.
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ?? olds?.zoneId;
        if (!zoneId)
            return undefined;
        // Owned path: refresh by our persisted rule id.
        if (output?.pageRuleId) {
            const observed = yield* getRule(zoneId, output.pageRuleId);
            if (observed)
                return toAttributes(observed, zoneId);
        }
        // Adoption path: a rule with this target may already exist on the
        // zone. Page Rules carry no ownership markers, so we cannot prove
        // we created it — brand it `Unowned` so the engine refuses to take
        // over unless `adopt` is set.
        const target = output?.target ?? olds?.target;
        if (target) {
            const observed = yield* findByTarget(zoneId, target);
            if (observed)
                return Unowned(toAttributes(observed, zoneId));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        const desired = desiredBody(news);
        // 1. Observe — the rule id cached on `output` is a hint, not a
        //    guarantee: a missing rule falls through to the target scan
        //    and then to create.
        let observed = output?.pageRuleId
            ? yield* getRule(zoneId, output.pageRuleId)
            : undefined;
        // 2. Fall back to scanning the zone for a rule with the same
        //    target. Ownership has already been verified upstream — `read`
        //    reports existing rules as `Unowned` and the engine gates
        //    takeover behind the adopt policy before reconcile ever runs.
        if (!observed) {
            observed = yield* findByTarget(zoneId, news.target);
        }
        // 3. Ensure — create when missing. Pass the desired status
        //    explicitly because the raw API defaults to "disabled".
        if (!observed) {
            observed = yield* pageRules.createPageRule({
                zoneId,
                ...desired,
            });
        }
        // 4. Sync — diff observed against desired; the update endpoint is
        //    a PUT-style full replace, so resend the whole desired body
        //    when any mutable aspect differs. Skip the call on a no-op.
        //    A rule deleted between observe and update surfaces as the
        //    typed `PageRuleNotFound` — converge by re-creating.
        if (!ruleMatchesDesired(observed, news)) {
            observed = yield* pageRules
                .updatePageRule({
                zoneId,
                pageruleId: observed.id,
                ...desired,
            })
                .pipe(Effect.catchTag("PageRuleNotFound", () => pageRules.createPageRule({ zoneId, ...desired })));
        }
        // 5. Return the fresh attributes shape.
        return toAttributes(observed, zoneId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* pageRules
            .deletePageRule({
            zoneId: output.zoneId,
            pageruleId: output.pageRuleId,
        })
            .pipe(
        // Already gone — deletion is idempotent.
        Effect.catchTag("PageRuleNotFound", () => Effect.void));
    }),
});
/**
 * Read a rule by id, mapping "gone" (typed `PageRuleNotFound`, HTTP 404)
 * to `undefined`.
 */
const getRule = (zoneId, pageruleId) => pageRules.getPageRule({ zoneId, pageruleId }).pipe(Effect.map((rule) => rule), Effect.catchTag("PageRuleNotFound", () => Effect.succeed(undefined)));
/**
 * Find a rule on the zone whose URL-pattern target matches. The target is
 * the rule's only recoverable identity — Cloudflare rejects a second rule
 * with the same target, so at most one rule can match.
 */
const findByTarget = (zoneId, target) => pageRules
    .listPageRules({ zoneId })
    .pipe(Effect.map((rules) => rules.find((rule) => targetOf(rule) === target)));
/** The desired request body (everything except path params). */
const desiredBody = (news) => ({
    targets: [
        {
            target: "url",
            constraint: { operator: "matches", value: news.target },
        },
    ],
    actions: Array.from(news.actions),
    priority: news.priority ?? 1,
    status: news.status ?? "active",
});
/** Extract the URL pattern from a rule's targets. */
const targetOf = (rule) => rule.targets[0]?.constraint?.value;
/**
 * Deep-canonicalise a JSON-ish value for comparison: drop `null` /
 * `undefined` members and sort object keys. Action arrays are compared
 * order-insensitively (sorted by action id) because Cloudflare reorders
 * them on echo.
 */
const canonical = (v) => {
    if (Array.isArray(v))
        return v.map(canonical);
    if (v !== null && typeof v === "object") {
        return Object.fromEntries(Object.entries(v)
            .filter(([, val]) => val !== undefined && val !== null)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, val]) => [k, canonical(val)]));
    }
    return v;
};
const canonicalActions = (actions) => JSON.stringify(actions
    .map((a) => canonical(a))
    .sort((a, b) => (a.id ?? "") < (b.id ?? "") ? -1 : (a.id ?? "") > (b.id ?? "") ? 1 : 0));
/** True when the observed rule already matches every desired aspect. */
const ruleMatchesDesired = (observed, news) => targetOf(observed) === news.target &&
    observed.priority === (news.priority ?? 1) &&
    observed.status === (news.status ?? "active") &&
    canonicalActions(observed.actions) ===
        canonicalActions(news.actions);
const toAttributes = (rule, zoneId) => ({
    pageRuleId: rule.id,
    zoneId,
    target: targetOf(rule) ?? "",
    actions: rule.actions,
    priority: rule.priority,
    status: rule.status,
    createdOn: rule.createdOn,
    modifiedOn: rule.modifiedOn,
});
//# sourceMappingURL=PageRule.js.map