import * as rulesets from "@distilled.cloud/cloudflare/rulesets";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import type { Zone } from "../Zone/index.ts";
export type Phase = rulesets.CreateRulesetForZoneRequest["phase"];
export type Rule = NonNullable<rulesets.PutPhasForZoneRequest["rules"]>[number];
export type OutputRule = Omit<NonNullable<rulesets.GetPhasResponse["rules"]>[number], "lastUpdated" | "version">;
export type RulesetProps = {
    /**
     * Zone to apply the ruleset to. Pass a `Cloudflare.Zone.Zone`.
     */
    zone: Zone;
    /**
     * Ruleset phase entrypoint to own.
     */
    phase: Phase;
    /**
     * Rules to apply to the phase entrypoint.
     */
    rules: Rule[];
    /**
     * Human-readable name for the ruleset.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Description for the ruleset.
     */
    description?: string;
};
export type Kind = "managed" | "custom" | "root" | "zone" | (string & {});
export type Ruleset = Resource<"Cloudflare.Ruleset.Ruleset", RulesetProps, {
    /** The unique ID of the ruleset (Cloudflare `id`). */
    rulesetId: string;
    /**
     * Zone the ruleset phase entrypoint belongs to. Alchemy-flattened
     * identifier — not part of Cloudflare's phase-entrypoint response.
     */
    zoneId: string;
    /** The kind of the ruleset. */
    kind: Kind;
    /** The human-readable name of the ruleset. */
    name: string;
    /** The phase of the ruleset. */
    phase: Phase;
    /** An informative description of the ruleset. */
    description: string | undefined;
    /** The list of rules in the ruleset. */
    rules: OutputRule[];
    /** The timestamp of when the ruleset was last modified. */
    lastUpdated: string;
    /** The version of the ruleset. */
    version: string;
}, never, Providers>;
/**
 * A Cloudflare Ruleset phase entrypoint for a zone.
 *
 * This resource owns the entire ruleset for a phase entrypoint. Rules managed
 * elsewhere in the same phase can be overwritten on deploy.
 * ### WAF Rules
 * **Example:** Block probes in the custom firewall phase
 * ```typescript
 * const zone = yield* Cloudflare.Zone.Zone("MyZone", { name: "example.com" });
 * const waf = yield* Cloudflare.Ruleset.Ruleset("WafRules", {
 *   zone,
 *   phase: "http_request_firewall_custom",
 *   rules: [
 *     {
 *       description: "Block exploit probes",
 *       expression: `lower(http.request.uri.path) contains "/.env"`,
 *       action: "block",
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 * @product Rulesets
 * @category Rules & Configuration
 */
export declare const Ruleset: import("../../Resource.ts").ResourceClassWithMethods<Ruleset, {}>;
export declare const RulesetProvider: () => import("effect/Layer").Layer<Provider.Provider<Ruleset>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | rulesets.CloudflareOpContext>;
export declare const toRulesetAttributes: (zoneId: string, ruleset: rulesets.GetPhasResponse | rulesets.PutPhasResponse) => Ruleset["Attributes"];
//# sourceMappingURL=Ruleset.d.ts.map