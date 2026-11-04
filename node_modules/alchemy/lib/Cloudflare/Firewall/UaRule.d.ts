import * as firewall from "@distilled.cloud/cloudflare/firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const UaRuleTypeId: "Cloudflare.Firewall.UaRule";
type UaRuleTypeId = typeof UaRuleTypeId;
/**
 * The action a User Agent Blocking rule applies to a matched request.
 */
export type UaRuleMode = "block" | "challenge" | "js_challenge" | "managed_challenge";
export interface UaRuleProps {
    /**
     * Zone the rule applies to.
     *
     * Stable — moving a rule between zones triggers a replacement.
     */
    zoneId: string;
    /**
     * The exact User-Agent string to match. The whole UA header must equal
     * this value — no wildcards or substring matching.
     *
     * Mutable — updated in place via PUT. Note that Cloudflare rejects a
     * second rule for the same User-Agent string in a zone, so the value
     * acts as the rule's identity for adoption.
     */
    userAgent: string;
    /**
     * The action to apply to a matched request. Mutable — updated in place.
     */
    mode: UaRuleMode;
    /**
     * An informative summary of the rule. Sanitized server-side (HTML tags
     * are removed). Mutable — updated in place.
     */
    description?: string;
    /**
     * When true, the rule is disabled without being deleted.
     * Mutable — updated in place.
     *
     * @default false
     */
    paused?: boolean;
}
export interface UaRuleAttributes {
    /** Cloudflare-assigned identifier of the User Agent Blocking rule. */
    uaRuleId: string;
    /** Zone the rule belongs to. */
    zoneId: string;
    /** The exact User-Agent string the rule matches. */
    userAgent: string;
    /** The action applied to matched requests. */
    mode: UaRuleMode;
    /** The rule's informative summary, if set. */
    description: string | undefined;
    /** Whether the rule is currently paused. */
    paused: boolean;
}
export type UaRule = Resource<UaRuleTypeId, UaRuleProps, UaRuleAttributes, never, Providers>;
/**
 * A Cloudflare User Agent Blocking rule — block or challenge every request
 * to a zone whose `User-Agent` header exactly matches a given string.
 *
 * Everything about a UA rule is mutable in place: `userAgent`, `mode`,
 * `description`, and `paused` are all updated via PUT without replacing the
 * rule. Only moving the rule to a different zone triggers a replacement.
 *
 * Cloudflare rejects a second rule for the same User-Agent string in a zone
 * with a duplicate error, so the UA string acts as a rule's identity. Plan
 * quotas: Free 10, Pro 50, Business 250, Enterprise 1000 rules.
 *
 * Safety: UA rules carry no ownership markers. When there is no prior
 * state, `read` scans the zone for an existing rule with the same
 * User-Agent string and reports it as `Unowned`, so the engine refuses to
 * take it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Blocking a User-Agent
 * **Example:** Block a scraper outright
 * ```typescript
 * yield* Cloudflare.Firewall.UaRule("BlockScraper", {
 *   zoneId: zone.zoneId,
 *   userAgent: "BadBot/1.2 (+http://badbot.example)",
 *   mode: "block",
 *   description: "aggressive scraper",
 * });
 * ```
 *
 * ### Challenging a User-Agent
 * **Example:** Managed challenge instead of a hard block
 * ```typescript
 * yield* Cloudflare.Firewall.UaRule("ChallengeOldClient", {
 *   zoneId: zone.zoneId,
 *   userAgent: "LegacyApp/0.9",
 *   mode: "managed_challenge",
 * });
 * ```
 *
 * ### Pausing a rule
 * **Example:** Temporarily disable a rule without deleting it
 * ```typescript
 * yield* Cloudflare.Firewall.UaRule("BlockScraper", {
 *   zoneId: zone.zoneId,
 *   userAgent: "BadBot/1.2 (+http://badbot.example)",
 *   mode: "block",
 *   paused: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/tools/user-agent-blocking/
 *
 * @resource
 * @product Firewall
 * @category Application Security
 */
export declare const UaRule: import("../../Resource.ts").ResourceClass<UaRule>;
/**
 * Returns true if the given value is a UaRule resource.
 */
export declare const isUaRule: (value: unknown) => value is UaRule;
export declare const UaRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<UaRule>, never, CloudflareEnvironment | firewall.CloudflareOpContext>;
export {};
//# sourceMappingURL=UaRule.d.ts.map