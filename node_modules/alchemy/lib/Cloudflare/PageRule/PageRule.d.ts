import * as pageRules from "@distilled.cloud/cloudflare/page-rules";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.PageRule.PageRule";
type TypeId = typeof TypeId;
/**
 * A single Page Rule action — a discriminated union over every setting a
 * Page Rule can override (e.g. `{ id: "always_use_https" }`,
 * `{ id: "cache_level", value: "cache_everything" }`,
 * `{ id: "forwarding_url", value: { url, statusCode: "301" | "302" } }`).
 *
 * Note: `forwarding_url` cannot be combined with most other actions —
 * a rule either redirects or overrides settings, not both.
 */
export type Action = pageRules.CreatePageRuleRequest["actions"][number];
/**
 * Whether the rule is evaluated (`active`) or kept but ignored
 * (`disabled`).
 */
export type Status = "active" | "disabled";
export interface Props {
    /**
     * Zone the Page Rule applies to. Stable — moving a rule between zones
     * triggers a replacement.
     */
    zoneId: string;
    /**
     * The URL pattern the rule matches, e.g. `*.example.com/images/*`.
     *
     * Mutable — the API accepts a new target via PUT. Declared as plain
     * `string` (not `string`) so it is statically knowable inside
     * `diff` and usable as the rule's identity for stateless recovery.
     */
    target: string;
    /**
     * The set of actions to perform when the target matches. Actions can
     * redirect to another URL (`forwarding_url`) or override settings,
     * but not both. Mutable — synced in place via PUT.
     */
    actions: ReadonlyArray<Action>;
    /**
     * The priority of the rule relative to other Page Rules on the zone.
     * A higher number indicates a higher priority. Mutable.
     *
     * Note: priority is positional — Cloudflare clamps it to the number of
     * Page Rules on the zone (a lone rule is always priority `1`), so the
     * echoed priority may be lower than requested.
     *
     * @default 1
     */
    priority?: number;
    /**
     * Whether the rule is evaluated. Mutable.
     *
     * Note: the raw Cloudflare API defaults to `"disabled"`; Alchemy
     * defaults to `"active"` so a deployed rule takes effect immediately.
     *
     * @default "active"
     */
    status?: Status;
}
export interface Attributes {
    /** Cloudflare-assigned identifier of the Page Rule. */
    pageRuleId: string;
    /** Zone the rule belongs to. */
    zoneId: string;
    /** The URL pattern the rule matches. */
    target: string;
    /** The actions the rule performs, as echoed by Cloudflare. */
    actions: ReadonlyArray<Action>;
    /** The rule's priority relative to other Page Rules on the zone. */
    priority: number;
    /** Whether the rule is evaluated (`active`) or ignored (`disabled`). */
    status: Status;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type PageRule = Resource<TypeId, Props, Attributes, never, Providers>;
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
export declare const PageRule: import("../../Resource.ts").ResourceClass<PageRule>;
/**
 * Returns true if the given value is a PageRule resource.
 */
export declare const isPageRule: (value: unknown) => value is PageRule;
export declare const PageRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<PageRule>, never, CloudflareEnvironment | pageRules.CloudflareOpContext>;
export {};
//# sourceMappingURL=PageRule.d.ts.map