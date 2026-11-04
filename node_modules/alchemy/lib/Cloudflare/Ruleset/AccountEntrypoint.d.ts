import * as rulesets from "@distilled.cloud/cloudflare/rulesets";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
import type { OutputRule, Phase } from "./Ruleset.ts";
declare const TypeId: "Cloudflare.Rulesets.AccountEntrypoint";
type TypeId = typeof TypeId;
/**
 * A rule inside an account phase entrypoint — same shape Cloudflare accepts
 * on the entrypoint PUT endpoint.
 */
export type AccountEntrypointRule = NonNullable<rulesets.PutPhasForAccountRequest["rules"]>[number];
export type AccountEntrypointProps = {
    /**
     * Ruleset phase entrypoint to own (e.g. `http_request_firewall_custom`,
     * `ddos_l4`, `magic_transit`). Changing the phase triggers a
     * replacement. Account-level phases are Enterprise-gated — on lower
     * plans, deploys fail with the typed `PhaseNotEntitled` error.
     */
    phase: Phase;
    /**
     * The full list of rules in the phase entrypoint. This resource owns the
     * entire entrypoint — rules managed elsewhere in the same phase are
     * overwritten on deploy. For the Enterprise WAF deployment workflow, use
     * `execute` rules referencing `Cloudflare.Ruleset.CustomRuleset` ids.
     */
    rules: AccountEntrypointRule[];
    /**
     * Human-readable name for the entrypoint ruleset.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * An informative description of the ruleset.
     */
    description?: string;
};
export type AccountEntrypointAttributes = {
    /** The unique ID of the entrypoint ruleset (Cloudflare `id`). */
    rulesetId: string;
    /**
     * Account the phase entrypoint belongs to. Alchemy-flattened identifier —
     * not part of Cloudflare's phase-entrypoint response.
     */
    accountId: string;
    /** The kind of the ruleset (`root` for account entrypoints). */
    kind: string;
    /** The human-readable name of the ruleset. */
    name: string;
    /** The phase of the ruleset. */
    phase: Phase;
    /** An informative description of the ruleset. */
    description: string | undefined;
    /** The list of rules in the entrypoint. */
    rules: OutputRule[];
    /** The timestamp of when the ruleset was last modified. */
    lastUpdated: string;
    /** The version of the ruleset. */
    version: string;
};
export type AccountEntrypoint = Resource<TypeId, AccountEntrypointProps, AccountEntrypointAttributes, never, Providers>;
/**
 * A Cloudflare Ruleset phase entrypoint for an account.
 *
 * The account-level counterpart of `Cloudflare.Ruleset.Ruleset`: it owns the entire
 * ruleset for an account phase entrypoint (e.g. deploying custom WAF
 * rulesets across zones with `execute` rules, or configuring `ddos_l4` /
 * `magic_transit` rules). The entrypoint is a per-phase singleton — destroy
 * empties its rules rather than deleting the phase.
 *
 * Account-level phases require an Enterprise plan; on lower plans deploys
 * fail with the typed `PhaseNotEntitled` error.
 * ### Account WAF Deployment
 * **Example:** Deploy a custom ruleset across all zones
 * ```typescript
 * const ruleset = yield* Cloudflare.Ruleset.CustomRuleset("SharedWafRules", {
 *   phase: "http_request_firewall_custom",
 *   rules: [
 *     {
 *       description: "Block exploit probes",
 *       expression: `lower(http.request.uri.path) contains "/.env"`,
 *       action: "block",
 *     },
 *   ],
 * });
 *
 * yield* Cloudflare.Ruleset.AccountEntrypoint("WafDeployment", {
 *   phase: "http_request_firewall_custom",
 *   rules: [
 *     {
 *       description: "Deploy shared WAF rules",
 *       expression: "true",
 *       action: "execute",
 *       actionParameters: { id: ruleset.rulesetId },
 *     },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/account/
 *
 * @resource
 * @product Rulesets
 * @category Rules & Configuration
 */
export declare const AccountEntrypoint: import("../../Resource.ts").ResourceClass<AccountEntrypoint>;
/**
 * Returns true if the given value is a AccountEntrypoint resource.
 */
export declare const isAccountEntrypoint: (value: unknown) => value is AccountEntrypoint;
export declare const AccountEntrypointProvider: () => import("effect/Layer").Layer<Provider.Provider<AccountEntrypoint>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | rulesets.CloudflareOpContext>;
export {};
//# sourceMappingURL=AccountEntrypoint.d.ts.map