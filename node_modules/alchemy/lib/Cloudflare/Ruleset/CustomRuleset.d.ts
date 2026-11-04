import * as rulesets from "@distilled.cloud/cloudflare/rulesets";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import type { OutputRule, Phase } from "./Ruleset.ts";
declare const TypeId: "Cloudflare.Rulesets.CustomRuleset";
type TypeId = typeof TypeId;
/**
 * Kind of a standalone account-level ruleset. `custom` rulesets are deployed
 * into a phase by an `execute` rule in the account's phase entrypoint;
 * `root` rulesets are account entrypoint rulesets themselves.
 */
export type CustomRulesetKind = "custom" | "root";
/**
 * A rule inside an account custom ruleset — same shape Cloudflare accepts
 * on the update (PUT) endpoint.
 */
export type CustomRulesetRule = NonNullable<rulesets.UpdateRulesetForAccountRequest["rules"]>[number];
export type CustomRulesetProps = {
    /**
     * Human-readable name of the ruleset.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The kind of the ruleset. `custom` rulesets are deployed by an `execute`
     * rule in a phase entrypoint. Changing the kind triggers a replacement.
     * @default "custom"
     */
    kind?: CustomRulesetKind;
    /**
     * The phase the ruleset belongs to (e.g. `http_request_firewall_custom`).
     * Changing the phase triggers a replacement.
     */
    phase: Phase;
    /**
     * The full list of rules in the ruleset. This resource owns every rule —
     * rules added out-of-band are overwritten on the next deploy.
     */
    rules: CustomRulesetRule[];
    /**
     * An informative description of the ruleset.
     */
    description?: string;
};
export type CustomRulesetAttributes = {
    /** The unique ID of the ruleset (Cloudflare `id`). */
    rulesetId: string;
    /**
     * Account the ruleset belongs to. Alchemy-flattened identifier — not part
     * of Cloudflare's ruleset response.
     */
    accountId: string;
    /** The kind of the ruleset. */
    kind: string;
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
};
export type CustomRuleset = Resource<TypeId, CustomRulesetProps, CustomRulesetAttributes, never, Providers>;
/**
 * A standalone account-level Cloudflare ruleset (`kind: "custom"`).
 *
 * Custom rulesets are the Enterprise WAF deployment workflow: define a
 * reusable ruleset once at the account level, then deploy it across zones
 * with an `execute` rule in a phase entrypoint (see
 * `Cloudflare.Ruleset.AccountEntrypoint`). Account-level WAF phases require
 * an Enterprise plan — on lower plans, creation fails with the typed
 * `PhaseNotEntitled` error.
 *
 * For zone-level rules, use `Cloudflare.Ruleset.Ruleset` (the zone phase
 * entrypoint) instead.
 * ### Custom Rulesets
 * **Example:** Define an account custom WAF ruleset
 * ```typescript
 * const ruleset = yield* Cloudflare.Ruleset.CustomRuleset("SharedWafRules", {
 *   phase: "http_request_firewall_custom",
 *   description: "Org-wide exploit probes",
 *   rules: [
 *     {
 *       description: "Block .env probes",
 *       expression: `lower(http.request.uri.path) contains "/.env"`,
 *       action: "block",
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Deploy the custom ruleset via the account entrypoint
 * ```typescript
 * yield* Cloudflare.Ruleset.AccountEntrypoint("WafDeployment", {
 *   phase: "http_request_firewall_custom",
 *   rules: [
 *     {
 *       description: "Deploy shared WAF rules everywhere",
 *       expression: "true",
 *       action: "execute",
 *       actionParameters: { id: ruleset.rulesetId },
 *     },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/account/custom-rulesets/
 *
 * @resource
 * @product Rulesets
 * @category Rules & Configuration
 */
export declare const CustomRuleset: import("../../Resource.ts").ResourceClass<CustomRuleset>;
/**
 * Returns true if the given value is a CustomRuleset resource.
 */
export declare const isCustomRuleset: (value: unknown) => value is CustomRuleset;
export declare const CustomRulesetProvider: () => import("effect/Layer").Layer<Provider.Provider<CustomRuleset>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | rulesets.CloudflareOpContext>;
export {};
//# sourceMappingURL=CustomRuleset.d.ts.map