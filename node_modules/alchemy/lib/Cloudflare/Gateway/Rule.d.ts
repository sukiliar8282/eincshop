import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Action Cloudflare Gateway takes when a rule's traffic/identity/device-posture
 * expressions match. Mirrors the open-ended literal union distilled exposes so
 * unknown values flowing back from Cloudflare narrow cleanly.
 */
export type RuleAction = "on" | "off" | "allow" | "block" | "scan" | "noscan" | "safesearch" | "ytrestricted" | "isolate" | "noisolate" | "override" | "l4_override" | "egress" | "resolve" | "quarantine" | "redirect" | (string & {});
/**
 * Filter Cloudflare Gateway evaluates the rule against. Selects the layer the
 * `traffic` expression operates on — DNS, HTTP, raw L4, the egress path, or
 * the `dns_resolver` plane (which is what private-app destinations use when
 * Gateway needs to override the answer for an internal hostname).
 */
export type RuleFilter = "http" | "dns" | "l4" | "egress" | "dns_resolver" | (string & {});
/**
 * Settings the rule applies when it matches. Re-exports distilled's request
 * shape so every server-recognised knob (override host, block page, DNS
 * resolvers, BISO controls, egress IPs, redirect target, …) is available
 * without re-declaring the structure.
 *
 * Only a subset is meaningful for any given `action`; consult Cloudflare's
 * Gateway rule docs for which settings apply per action.
 */
export type RuleSettings = NonNullable<zeroTrust.CreateGatewayRuleRequest["ruleSettings"]>;
export interface RuleProps {
    /**
     * Human-readable rule name. If omitted, a deterministic physical name is
     * generated from the app/stage/logical-id. Used during adoption to locate
     * an existing rule by name when no `ruleId` is cached.
     */
    name?: string;
    /**
     * Action Cloudflare Gateway takes when the rule matches. Stable across
     * reconciles; changing it triggers a replacement so a rule never silently
     * flips semantics under existing references.
     */
    action: RuleAction;
    /**
     * Protocol/layer the rule's `traffic` expression evaluates against.
     * Cloudflare currently accepts a single filter per rule; the SDK still
     * types it as an array to mirror the wire shape.
     */
    filters: ReadonlyArray<RuleFilter>;
    /**
     * Wirefilter expression used for traffic matching. Cloudflare auto-formats
     * and sanitises this server-side — to avoid perpetual diffs, prefer the
     * formatted form (e.g. `'any(dns.domains[*] == "internal.example")'`).
     */
    traffic?: string;
    /**
     * Wirefilter expression used for identity matching (group memberships,
     * email, IdP attrs). Combined with `traffic` and `devicePosture` via
     * logical AND.
     */
    identity?: string;
    /**
     * Wirefilter expression used for device-posture matching (WARP, MDM, etc).
     */
    devicePosture?: string;
    /**
     * Per-action settings applied when the rule matches. The most common
     * private-app use case sets `overrideHost` to a `${tunnelId}.cfargotunnel.com`
     * to point intercepted DNS at a Cloudflare Tunnel.
     *
     * @example
     * ```ts
     * ruleSettings: {
     *   overrideHost: `${tunnelId}.cfargotunnel.com`,
     * }
     * ```
     */
    ruleSettings?: RuleSettings;
    /**
     * Rule precedence — lower values evaluate first. When unset, Cloudflare
     * picks one server-side; we then echo whatever it assigned back through
     * the output attributes.
     */
    precedence?: number;
    /**
     * Whether the rule is enabled.
     *
     * @default true
     */
    enabled?: boolean;
    /**
     * Free-form description.
     */
    description?: string;
    /**
     * Adopt an existing rule with the same name (matched during the list-scan
     * fallback when no `ruleId` is cached) instead of failing on conflict.
     *
     * @default false
     */
    adopt?: boolean;
}
export interface RuleAttributes {
    /** Cloudflare-assigned rule UUID. */
    ruleId: string;
    /** Resolved display name (server-side). */
    name: string;
    /** Resolved action. */
    action: RuleAction;
    /** Resolved filters. */
    filters: ReadonlyArray<RuleFilter>;
    /** Server-assigned precedence (always populated on the response). */
    precedence: number;
    /** Account that owns this rule. */
    accountId: string;
    /** ISO8601 creation timestamp. */
    createdAt: string | undefined;
    /** ISO8601 last-update timestamp. */
    updatedAt: string | undefined;
}
export type Rule = Resource<"Cloudflare.Gateway.Rule", RuleProps, RuleAttributes, never, Providers>;
/**
 * A Cloudflare Zero Trust Gateway rule.
 *
 * Gateway rules sit on the WARP/Gateway data plane and run *before* Access:
 * they decide whether to allow, block, override, isolate, or redirect a
 * request based on wirefilter expressions over the request traffic,
 * the authenticated identity, and the device posture. The most common
 * companion to {@link Application} with a `private` destination is a
 * `dns` rule with `action: "override"` that points an internal hostname at
 * a Cloudflare Tunnel — without it, WARP intercepts the lookup but has
 * nowhere to send the answer.
 * ### DNS override for a private app
 * **Example:** Resolve an internal hostname through a Cloudflare Tunnel
 * ```typescript
 * const adminDns = yield* Cloudflare.Gateway.Rule("AdminMicroagiDns", {
 *   name: "research-admin-microagi-dns-override",
 *   action: "override",
 *   filters: ["dns"],
 *   traffic: 'any(dns.domains[*] == "cluster-admin.microagi")',
 *   ruleSettings: {
 *     overrideHost: `${tunnel.tunnelId}.cfargotunnel.com`,
 *   },
 *   enabled: true,
 * });
 * ```
 *
 * ### Block a category
 * **Example:** Block known phishing on HTTP
 * ```typescript
 * yield* Cloudflare.Gateway.Rule("BlockPhishing", {
 *   name: "block-phishing",
 *   action: "block",
 *   filters: ["http"],
 *   traffic: "any(http.request.uri.content_category[*] in {178})",
 * });
 * ```
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export declare const Rule: import("../../Resource.ts").ResourceClass<Rule>;
export declare const RuleProvider: () => import("effect/Layer").Layer<Provider.Provider<Rule>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | zeroTrust.CloudflareOpContext>;
//# sourceMappingURL=Rule.d.ts.map