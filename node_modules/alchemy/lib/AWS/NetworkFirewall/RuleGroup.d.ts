import type * as NFW from "@distilled.cloud/aws/network-firewall";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RuleGroupProps {
    /**
     * Name of the rule group. Must be 1-128 alphanumeric characters or
     * hyphens. If omitted, a deterministic physical name is generated.
     * Changing the name replaces the rule group.
     */
    ruleGroupName?: string;
    /**
     * Whether the rule group inspects packets on their own (`STATELESS`) or
     * in the context of their traffic flow (`STATEFUL`). Changing the type
     * replaces the rule group.
     */
    type: "STATELESS" | "STATEFUL";
    /**
     * Maximum operating capacity the rule group can consume when applied.
     * Capacity cannot be changed after creation — changing it replaces the
     * rule group.
     */
    capacity: number;
    /**
     * The rule group definition (rule variables, reference sets, and the
     * rules source). Provide either `ruleGroup` or `rules`, not both.
     * Uses raw Network Firewall API structures.
     */
    ruleGroup?: NFW.RuleGroup;
    /**
     * A string containing stateful rules in Suricata format. Provide either
     * `rules` or `ruleGroup`, not both. Only valid for `STATEFUL` groups.
     */
    rules?: string;
    /**
     * Which rule attributes (`SID`, `MSG`, `METADATA`) DescribeRuleGroupSummary
     * includes in per-rule summaries. Only valid for `STATEFUL` groups; when
     * omitted, summaries are not generated.
     */
    summaryConfiguration?: NFW.SummaryConfiguration;
    /**
     * Human-readable description of the rule group.
     */
    description?: string;
    /**
     * Tags to apply to the rule group. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface RuleGroup extends Resource<"AWS.NetworkFirewall.RuleGroup", RuleGroupProps, {
    /** Name of the rule group. */
    ruleGroupName: string;
    /** ARN of the rule group. */
    ruleGroupArn: string;
    /** Server-assigned unique id of the rule group. */
    ruleGroupId: string;
    /** Rule group type (`STATELESS` or `STATEFUL`). */
    type: string;
    /** Reserved rule capacity of the group. */
    capacity: number;
}, never, Providers> {
}
/**
 * An AWS Network Firewall rule group — a reusable collection of stateless
 * or stateful network traffic inspection rules referenced by
 * {@link FirewallPolicy | firewall policies}.
 * ### Creating Rule Groups
 * **Example:** Stateless Rule Group
 * ```typescript
 * import * as NetworkFirewall from "alchemy/AWS/NetworkFirewall";
 *
 * const stateless = yield* NetworkFirewall.RuleGroup("AllowHttp", {
 *   type: "STATELESS",
 *   capacity: 10,
 *   ruleGroup: {
 *     RulesSource: {
 *       StatelessRulesAndCustomActions: {
 *         StatelessRules: [
 *           {
 *             Priority: 1,
 *             RuleDefinition: {
 *               Actions: ["aws:pass"],
 *               MatchAttributes: {
 *                 Protocols: [6],
 *                 DestinationPorts: [{ FromPort: 80, ToPort: 80 }],
 *               },
 *             },
 *           },
 *         ],
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Stateful Rule Group (Suricata rules)
 * ```typescript
 * const stateful = yield* NetworkFirewall.RuleGroup("BlockDomains", {
 *   type: "STATEFUL",
 *   capacity: 100,
 *   rules: 'drop tcp any any -> any any (msg:"drop all tcp"; sid:1; rev:1;)',
 * });
 * ```
 *
 * **Example:** Stateful Domain List
 * ```typescript
 * const domains = yield* NetworkFirewall.RuleGroup("DenyList", {
 *   type: "STATEFUL",
 *   capacity: 100,
 *   ruleGroup: {
 *     RulesSource: {
 *       RulesSourceList: {
 *         Targets: [".example.com"],
 *         TargetTypes: ["TLS_SNI", "HTTP_HOST"],
 *         GeneratedRulesType: "DENYLIST",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const RuleGroup: import("../../Resource.ts").ResourceClass<RuleGroup>;
export declare const RuleGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<RuleGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RuleGroup.d.ts.map