import * as firewall from "@distilled.cloud/cloudflare/firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const FirewallAccessRuleTypeId: "Cloudflare.Firewall.AccessRule";
type FirewallAccessRuleTypeId = typeof FirewallAccessRuleTypeId;
/**
 * The action an IP Access rule applies to a matched request.
 *
 * Note: `block` for `country`/`asn` targets requires an Enterprise plan;
 * `challenge` and `managed_challenge` work on all plans.
 */
export type AccessRuleMode = "block" | "challenge" | "whitelist" | "js_challenge" | "managed_challenge";
/**
 * What a rule's configuration matches on: a single IPv4 (`ip`), a single
 * IPv6 (`ip6`), a CIDR range (`ip_range`), an AS number (`asn`), or a
 * two-letter ISO-3166-1 alpha-2 country code (`country`).
 */
export type AccessRuleTarget = "ip" | "ip6" | "ip_range" | "asn" | "country";
/**
 * The match configuration of an IP Access rule. Immutable — the Cloudflare
 * API only allows `mode`/`notes` to be patched, so changing the
 * configuration replaces the rule.
 */
export interface AccessRuleConfiguration {
    /**
     * What the rule matches on.
     */
    target: AccessRuleTarget;
    /**
     * The value to match — e.g. `198.51.100.4` (`ip`), `2001:db8::/64`
     * (`ip_range`), `AS13335` (`asn`), or `US` (`country`).
     */
    value: string;
}
export interface AccessRuleProps {
    /**
     * Zone the rule applies to. When omitted, the rule is created at the
     * account level and applies to every zone in the account.
     *
     * Stable — moving a rule between scopes triggers a replacement.
     */
    zoneId?: string;
    /**
     * The rule's match configuration (target + value).
     *
     * Immutable — the API has no way to change a rule's configuration
     * (only `mode`/`notes` are patchable), so changing it triggers a
     * replacement.
     */
    configuration: AccessRuleConfiguration;
    /**
     * The action to apply to a matched request. Mutable — patched in place.
     */
    mode: AccessRuleMode;
    /**
     * An informative summary of the rule, typically used as a reminder or
     * explanation. Mutable — patched in place.
     */
    notes?: string;
}
export interface AccessRuleAttributes {
    /** Cloudflare-assigned identifier of the IP Access rule. */
    ruleId: string;
    /** Zone the rule belongs to, or `undefined` for account-scoped rules. */
    zoneId: string | undefined;
    /** Account the rule was created under. */
    accountId: string;
    /** The rule's match configuration. */
    configuration: AccessRuleConfiguration;
    /** The action applied to matched requests. */
    mode: AccessRuleMode;
    /** The actions available for this rule. */
    allowedModes: AccessRuleMode[];
    /** The rule's informative summary, if set. */
    notes: string | undefined;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type AccessRule = Resource<FirewallAccessRuleTypeId, AccessRuleProps, AccessRuleAttributes, never, Providers>;
/**
 * A Cloudflare IP Access rule — block, challenge, or whitelist requests by
 * IP, CIDR range, ASN, or country, either on a single zone or across the
 * whole account.
 *
 * A rule's identity is its `configuration` (target + value) within a scope:
 * Cloudflare rejects a second rule for the same configuration with a
 * duplicate error, and the configuration cannot be changed after creation —
 * only `mode` and `notes` are mutable. Changing `configuration` or moving
 * the rule between zone and account scope triggers a replacement.
 *
 * Safety: IP Access rules carry no ownership markers. When there is no
 * prior state, `read` scans the scope for an existing rule with the same
 * configuration and reports it as `Unowned`, so the engine refuses to take
 * it over unless `--adopt` (or `adopt(true)`) is set.
 * ### Blocking an IP
 * **Example:** Block a single IPv4 address on a zone
 * ```typescript
 * yield* Cloudflare.Firewall.AccessRule("BlockBadActor", {
 *   zoneId: zone.zoneId,
 *   configuration: { target: "ip", value: "198.51.100.4" },
 *   mode: "block",
 *   notes: "repeated credential stuffing",
 * });
 * ```
 *
 * **Example:** Block a CIDR range account-wide
 * ```typescript
 * // No zoneId — the rule applies to every zone in the account.
 * yield* Cloudflare.Firewall.AccessRule("BlockScannerRange", {
 *   configuration: { target: "ip_range", value: "203.0.113.0/24" },
 *   mode: "block",
 * });
 * ```
 *
 * ### Challenging traffic
 * **Example:** Managed challenge for a country
 * ```typescript
 * // `block` for country targets is Enterprise-only; challenges work on
 * // all plans.
 * yield* Cloudflare.Firewall.AccessRule("ChallengeCountry", {
 *   zoneId: zone.zoneId,
 *   configuration: { target: "country", value: "KP" },
 *   mode: "managed_challenge",
 * });
 * ```
 *
 * ### Whitelisting
 * **Example:** Always allow an office IP
 * ```typescript
 * yield* Cloudflare.Firewall.AccessRule("AllowOffice", {
 *   zoneId: zone.zoneId,
 *   configuration: { target: "ip", value: "192.0.2.10" },
 *   mode: "whitelist",
 *   notes: "office egress IP",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/waf/tools/ip-access-rules/
 *
 * @resource
 * @product Firewall
 * @category Application Security
 */
export declare const AccessRule: import("../../Resource.ts").ResourceClass<AccessRule>;
/**
 * Returns true if the given value is a AccessRule resource.
 */
export declare const isAccessRule: (value: unknown) => value is AccessRule;
export declare const AccessRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<AccessRule>, never, CloudflareEnvironment | firewall.CloudflareOpContext>;
export {};
//# sourceMappingURL=AccessRule.d.ts.map