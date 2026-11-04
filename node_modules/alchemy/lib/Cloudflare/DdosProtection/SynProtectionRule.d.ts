import * as ddos from "@distilled.cloud/cloudflare/ddos-protection";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DdosProtection.SynProtectionRule";
type TypeId = typeof TypeId;
/**
 * Operating mode of an Advanced TCP Protection rule: actively mitigate
 * (`enabled`), observe only (`monitoring`), or stand down (`disabled`).
 */
export type SynProtectionRuleMode = "enabled" | "disabled" | "monitoring";
/**
 * Where a SYN Protection rule applies: every prefix (`global`), one
 * Cloudflare region (`region`), or one data center (`datacenter`).
 */
export type SynProtectionRuleScope = "global" | "region" | "datacenter";
/**
 * Sensitivity of the SYN Protection thresholds.
 */
export type SynProtectionRuleSensitivity = "low" | "medium" | "high";
/**
 * How SYN Protection mitigates matched floods.
 */
export type SynProtectionMitigationType = "challenge" | "retransmit";
export interface SynProtectionRuleProps {
    /**
     * The scope of the rule: `global`, `region`, or `datacenter`.
     *
     * Immutable — the API only patches mode/sensitivities, so changing the
     * scope triggers a replacement.
     */
    scope: SynProtectionRuleScope;
    /**
     * The name of the rule, relative to `scope`: for `global` scope the name
     * is `global`; for `region`/`datacenter` scope it is the region or data
     * center name (e.g. `WEUR`, `SJC`).
     *
     * Immutable — changing the name triggers a replacement.
     * @default "global"
     */
    name?: string;
    /**
     * Operating mode of the rule. Mutable — patched in place.
     */
    mode: SynProtectionRuleMode;
    /**
     * The burst sensitivity. Mutable — patched in place.
     */
    burstSensitivity: SynProtectionRuleSensitivity;
    /**
     * The rate sensitivity. Mutable — patched in place.
     */
    rateSensitivity: SynProtectionRuleSensitivity;
    /**
     * The type of mitigation applied to matched SYN floods. Mutable —
     * patched in place.
     * @default "challenge"
     */
    mitigationType?: SynProtectionMitigationType;
}
export interface SynProtectionRuleAttributes {
    /** Cloudflare-assigned identifier of the SYN Protection rule. */
    ruleId: string;
    /** The Cloudflare account the rule belongs to. */
    accountId: string;
    /** The scope of the rule. */
    scope: SynProtectionRuleScope;
    /** The name of the rule, relative to its scope. */
    name: string;
    /** Operating mode of the rule. */
    mode: SynProtectionRuleMode;
    /** The burst sensitivity. */
    burstSensitivity: SynProtectionRuleSensitivity;
    /** The rate sensitivity. */
    rateSensitivity: SynProtectionRuleSensitivity;
    /** The type of mitigation applied to matched SYN floods. */
    mitigationType: SynProtectionMitigationType;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type SynProtectionRule = Resource<TypeId, SynProtectionRuleProps, SynProtectionRuleAttributes, never, Providers>;
/**
 * An Advanced TCP Protection SYN flood rule (Magic Transit).
 *
 * Rules tune how Cloudflare mitigates SYN floods on Magic Transit prefixes,
 * per scope (`global`, a region, or a data center). The rule's identity is
 * its `scope` + `name` pair — only `mode`, sensitivities, and
 * `mitigationType` are mutable in place.
 *
 * Requires the **Magic Transit / Advanced TCP Protection** entitlement; on
 * accounts without it every API call fails with the typed
 * `AdvancedTcpProtectionNotEntitled` error.
 *
 * Safety: rules carry no ownership markers. When there is no prior state,
 * `read` scans for an existing rule with the same scope + name and reports
 * it as `Unowned`, so the engine refuses to take it over unless `--adopt`
 * (or `adopt(true)`) is set.
 * ### Creating a rule
 * **Example:** Global SYN protection in monitoring mode
 * ```typescript
 * const rule = yield* Cloudflare.DdosProtection.SynProtectionRule("GlobalSyn", {
 *   scope: "global",
 *   mode: "monitoring",
 *   burstSensitivity: "medium",
 *   rateSensitivity: "medium",
 * });
 * ```
 *
 * **Example:** Data-center scoped rule with retransmit mitigation
 * ```typescript
 * yield* Cloudflare.DdosProtection.SynProtectionRule("SjcSyn", {
 *   scope: "datacenter",
 *   name: "SJC",
 *   mode: "enabled",
 *   burstSensitivity: "high",
 *   rateSensitivity: "high",
 *   mitigationType: "retransmit",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ddos-protection/advanced-ddos-systems/overview/advanced-tcp-protection/
 *
 * @resource
 * @product DDoS Protection
 * @category Network
 */
export declare const SynProtectionRule: import("../../Resource.ts").ResourceClass<SynProtectionRule>;
/**
 * Returns true if the given value is a SynProtectionRule resource.
 */
export declare const isSynProtectionRule: (value: unknown) => value is SynProtectionRule;
export declare const SynProtectionRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<SynProtectionRule>, never, CloudflareEnvironment | ddos.CloudflareOpContext>;
export {};
//# sourceMappingURL=SynProtectionRule.d.ts.map