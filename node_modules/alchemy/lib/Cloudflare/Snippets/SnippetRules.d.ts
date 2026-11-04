import * as snippets from "@distilled.cloud/cloudflare/snippets";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * A single rule mapping a traffic expression to a snippet.
 */
export interface SnippetRule {
    /**
     * Name of the snippet to execute when the expression matches. Reference
     * a `Snippet` resource's `name` output to create the dependency edge so
     * the snippet is created before the rule (and deleted after it).
     */
    snippetName: string;
    /**
     * Cloudflare Rules language expression selecting the traffic the
     * snippet runs on, e.g. `http.request.uri.path wildcard "/api/*"`.
     */
    expression: string;
    /**
     * Whether the rule is enabled.
     * @default true
     */
    enabled?: boolean;
    /**
     * Informative description of the rule.
     */
    description?: string;
}
export interface SnippetRulesProps {
    /**
     * Zone the rules apply to. Stable — changing the zone triggers
     * replacement.
     */
    zoneId: string;
    /**
     * Ordered list of snippet rules. The whole list is owned by this
     * resource and replaced atomically on every change — rules managed
     * elsewhere in the zone will be overwritten on deploy.
     */
    rules: SnippetRule[];
}
/**
 * A snippet rule as Cloudflare reports it.
 */
export interface SnippetRuleAttribute {
    /** Name of the snippet the rule executes. */
    snippetName: string;
    /** Rules language expression selecting matching traffic. */
    expression: string;
    /** Whether the rule is enabled. */
    enabled: boolean;
    /** Informative description of the rule. */
    description: string | undefined;
}
export interface SnippetRulesAttributes {
    /** Zone that owns the rule list. */
    zoneId: string;
    /** The ordered rule list as Cloudflare reports it. */
    rules: SnippetRuleAttribute[];
}
export type SnippetRules = Resource<"Cloudflare.Snippets.Rules", SnippetRulesProps, SnippetRulesAttributes, never, Providers>;
/**
 * The ordered list of snippet rules for a Cloudflare zone.
 *
 * Snippet rules activate snippets against traffic: each rule pairs a
 * Rules-language expression with the name of the snippet to execute on
 * matching requests. The zone has exactly one rule list — this resource
 * owns it in its entirety (PUT-replace semantics), so there should be at
 * most one `SnippetRules` resource per zone.
 *
 * Safety: when there is no prior state and the zone already has a
 * non-empty rule list, `read` reports it as `Unowned` and the engine
 * refuses to take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Activating Snippets
 * **Example:** Route a path through a snippet
 * ```typescript
 * const snippet = yield* Cloudflare.Snippets.Snippet("HeaderSnippet", {
 *   zoneId: zone.zoneId,
 *   code: snippetCode,
 * });
 *
 * yield* Cloudflare.Snippets.SnippetRules("Rules", {
 *   zoneId: zone.zoneId,
 *   rules: [
 *     {
 *       snippetName: snippet.name,
 *       expression: 'http.request.uri.path wildcard "/api/*"',
 *       description: "add headers to API responses",
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 * @product Snippets
 * @category Rules & Configuration
 */
export declare const SnippetRules: import("../../Resource.ts").ResourceClass<SnippetRules>;
export declare const isSnippetRules: (value: unknown) => value is SnippetRules;
export declare const SnippetRulesProvider: () => import("effect/Layer").Layer<Provider.Provider<SnippetRules>, never, CloudflareEnvironment | snippets.CloudflareOpContext>;
//# sourceMappingURL=SnippetRules.d.ts.map