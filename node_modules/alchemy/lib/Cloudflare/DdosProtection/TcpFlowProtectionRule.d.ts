import * as ddos from "@distilled.cloud/cloudflare/ddos-protection";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DdosProtection.TcpFlowProtectionRule";
type TypeId = typeof TypeId;
/**
 * Operating mode of a TCP Flow Protection rule: actively mitigate
 * (`enabled`), observe only (`monitoring`), or stand down (`disabled`).
 */
export type TcpFlowProtectionRuleMode = "enabled" | "disabled" | "monitoring";
/**
 * Where a TCP Flow Protection rule applies: every prefix (`global`), one
 * Cloudflare region (`region`), or one data center (`datacenter`).
 */
export type TcpFlowProtectionRuleScope = "global" | "region" | "datacenter";
/**
 * Sensitivity of the TCP Flow Protection thresholds.
 */
export type TcpFlowProtectionRuleSensitivity = "low" | "medium" | "high";
export interface TcpFlowProtectionRuleProps {
    /**
     * The scope of the rule: `global`, `region`, or `datacenter`.
     *
     * Immutable — the API only patches mode/sensitivities, so changing the
     * scope triggers a replacement.
     */
    scope: TcpFlowProtectionRuleScope;
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
    mode: TcpFlowProtectionRuleMode;
    /**
     * The burst sensitivity. Mutable — patched in place.
     */
    burstSensitivity: TcpFlowProtectionRuleSensitivity;
    /**
     * The rate sensitivity. Mutable — patched in place.
     */
    rateSensitivity: TcpFlowProtectionRuleSensitivity;
}
export interface TcpFlowProtectionRuleAttributes {
    /** Cloudflare-assigned identifier of the TCP Flow Protection rule. */
    ruleId: string;
    /** The Cloudflare account the rule belongs to. */
    accountId: string;
    /** The scope of the rule. */
    scope: TcpFlowProtectionRuleScope;
    /** The name of the rule, relative to its scope. */
    name: string;
    /** Operating mode of the rule. */
    mode: TcpFlowProtectionRuleMode;
    /** The burst sensitivity. */
    burstSensitivity: TcpFlowProtectionRuleSensitivity;
    /** The rate sensitivity. */
    rateSensitivity: TcpFlowProtectionRuleSensitivity;
    /** ISO8601 creation timestamp. */
    createdOn: string;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string;
}
export type TcpFlowProtectionRule = Resource<TypeId, TcpFlowProtectionRuleProps, TcpFlowProtectionRuleAttributes, never, Providers>;
/**
 * An Advanced TCP Protection out-of-state TCP flow rule (Magic Transit).
 *
 * Rules tune how Cloudflare mitigates out-of-state TCP packet floods (ACK,
 * RST, …) on Magic Transit prefixes, per scope (`global`, a region, or a
 * data center). The rule's identity is its `scope` + `name` pair — only
 * `mode` and the sensitivities are mutable in place.
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
 * **Example:** Global TCP flow protection in monitoring mode
 * ```typescript
 * const rule = yield* Cloudflare.DdosProtection.TcpFlowProtectionRule("GlobalFlow", {
 *   scope: "global",
 *   mode: "monitoring",
 *   burstSensitivity: "medium",
 *   rateSensitivity: "medium",
 * });
 * ```
 *
 * **Example:** Region-scoped rule
 * ```typescript
 * yield* Cloudflare.DdosProtection.TcpFlowProtectionRule("WeurFlow", {
 *   scope: "region",
 *   name: "WEUR",
 *   mode: "enabled",
 *   burstSensitivity: "high",
 *   rateSensitivity: "low",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/ddos-protection/advanced-ddos-systems/overview/advanced-tcp-protection/
 *
 * @resource
 * @product DDoS Protection
 * @category Network
 */
export declare const TcpFlowProtectionRule: import("../../Resource.ts").ResourceClass<TcpFlowProtectionRule>;
/**
 * Returns true if the given value is a TcpFlowProtectionRule resource.
 */
export declare const isTcpFlowProtectionRule: (value: unknown) => value is TcpFlowProtectionRule;
export declare const TcpFlowProtectionRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<TcpFlowProtectionRule>, never, CloudflareEnvironment | ddos.CloudflareOpContext>;
export {};
//# sourceMappingURL=TcpFlowProtectionRule.d.ts.map