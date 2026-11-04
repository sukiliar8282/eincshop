import * as rum from "@distilled.cloud/cloudflare/rum";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Rum.Rule";
type TypeId = typeof TypeId;
export type RuleProps = {
    /**
     * The identifier of the Web Analytics ruleset the rule belongs to.
     * Each zone-based (orange-clouded) `Site` owns one implicit ruleset —
     * pass its `rulesetId` attribute. Changing this property triggers a
     * replacement.
     */
    rulesetId: string;
    /**
     * The hostname the rule applies to (e.g. `example.com`).
     */
    host?: string;
    /**
     * The paths the rule applies to (e.g. `["/blog/*"]`).
     */
    paths?: string[];
    /**
     * Whether the rule includes (`true`) or excludes (`false`) matching
     * traffic from being measured.
     * @default true
     */
    inclusive?: boolean;
    /**
     * Whether the rule is paused.
     * @default false
     */
    isPaused?: boolean;
};
export type RuleAttributes = {
    /**
     * The Web Analytics rule identifier. Stable for the lifetime of the rule.
     */
    id: string;
    /**
     * The identifier of the ruleset the rule belongs to.
     */
    rulesetId: string;
    /**
     * The Cloudflare account the rule belongs to.
     */
    accountId: string;
    /**
     * The hostname the rule applies to.
     */
    host: string | undefined;
    /**
     * The paths the rule applies to.
     */
    paths: string[] | undefined;
    /**
     * Whether the rule includes or excludes matching traffic from being
     * measured.
     */
    inclusive: boolean;
    /**
     * Whether the rule is paused.
     */
    isPaused: boolean;
    /**
     * The rule's evaluation priority within its ruleset (assigned by
     * Cloudflare).
     */
    priority: number | undefined;
    /**
     * When the rule was created.
     */
    created: string | undefined;
};
export type Rule = Resource<TypeId, RuleProps, RuleAttributes, never, Providers>;
/**
 * A Cloudflare Web Analytics (RUM) rule.
 *
 * Rules include or exclude traffic from Web Analytics measurement by
 * hostname and path patterns. They live under the implicit ruleset of a
 * zone-based (orange-clouded) `Site` — pass the site's `rulesetId`
 * attribute. Host, paths, `inclusive`, and `isPaused` are all mutable in
 * place; changing `rulesetId` triggers a replacement.
 *
 * Web Analytics is available on free accounts.
 * ### Excluding traffic
 * **Example:** Exclude a path from measurement
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("Zone", { name: "example.com" });
 *
 * const site = yield* Cloudflare.Rum.Site("Analytics", {
 *   zoneTag: zone.zoneId,
 *   autoInstall: true,
 * });
 *
 * yield* Cloudflare.Rum.Rule("ExcludeAdmin", {
 *   rulesetId: site.rulesetId.as<string>(),
 *   host: "example.com",
 *   paths: ["/admin/*"],
 *   inclusive: false,
 * });
 * ```
 *
 * ### Pausing a rule
 * **Example:** Keep the rule but stop applying it
 * ```typescript
 * yield* Cloudflare.Rum.Rule("ExcludeAdmin", {
 *   rulesetId: site.rulesetId.as<string>(),
 *   host: "example.com",
 *   paths: ["/admin/*"],
 *   inclusive: false,
 *   isPaused: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/web-analytics/
 *
 * @resource
 * @product RUM
 * @category Observability & Analytics
 */
export declare const Rule: import("../../Resource.ts").ResourceClass<Rule>;
/**
 * Returns true if the given value is a Rule resource.
 */
export declare const isRule: (value: unknown) => value is Rule;
export declare const RuleProvider: () => import("effect/Layer").Layer<Provider.Provider<Rule>, never, CloudflareEnvironment | rum.CloudflareOpContext>;
export {};
//# sourceMappingURL=Rule.d.ts.map