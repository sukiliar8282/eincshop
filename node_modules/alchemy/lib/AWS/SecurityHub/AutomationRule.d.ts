import * as securityhub from "@distilled.cloud/aws/securityhub";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** Whether the automation rule is applied to new and updated findings. */
export type RuleStatus = "ENABLED" | "DISABLED";
export interface AutomationRuleProps {
    /**
     * Name of the rule. If omitted, a unique name is generated. Updatable in
     * place.
     */
    ruleName?: string;
    /**
     * Description of the rule. Updatable in place.
     */
    description: string;
    /**
     * Order in which rules are applied (1 first; lower wins on conflicts).
     * Updatable in place.
     */
    ruleOrder: number;
    /**
     * Whether the rule is applied to findings: `ENABLED` or `DISABLED`.
     * Updatable in place.
     * @default "ENABLED"
     */
    ruleStatus?: RuleStatus;
    /**
     * Whether matching findings stop evaluating further rules. Updatable in
     * place.
     * @default false
     */
    isTerminal?: boolean;
    /**
     * The criteria findings are matched against, e.g.
     * `{ SeverityLabel: [{ Value: "INFORMATIONAL", Comparison: "EQUALS" }] }`.
     * Updatable in place.
     */
    criteria: securityhub.AutomationRulesFindingFilters;
    /**
     * The updates applied to matching findings, e.g.
     * `[{ Type: "FINDING_FIELDS_UPDATE", FindingFieldsUpdate: { Workflow: { Status: "SUPPRESSED" } } }]`.
     * Updatable in place.
     */
    actions: securityhub.AutomationRulesAction[];
    /**
     * Tags applied to the rule. Alchemy ownership tags are merged in
     * automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface AutomationRule extends Resource<"AWS.SecurityHub.AutomationRule", AutomationRuleProps, {
    /** ARN of the automation rule (its identity). */
    ruleArn: string;
    /** Name of the rule. */
    ruleName: string;
    /** Evaluation order of the rule. */
    ruleOrder: number | undefined;
    /** Whether the rule is applied to findings. */
    ruleStatus: string | undefined;
    /** Whether matching findings stop evaluating further rules. */
    isTerminal: boolean | undefined;
}, never, Providers> {
}
/**
 * A Security Hub automation rule — automatically updates findings that match
 * its criteria (suppress, change severity, add notes) as they are ingested.
 *
 * ### Automating Finding Triage
 * **Example:** Suppress Informational Findings
 * ```typescript
 * const rule = yield* AWS.SecurityHub.AutomationRule("SuppressInfo", {
 *   description: "Suppress informational findings",
 *   ruleOrder: 1,
 *   criteria: {
 *     SeverityLabel: [{ Value: "INFORMATIONAL", Comparison: "EQUALS" }],
 *   },
 *   actions: [{
 *     Type: "FINDING_FIELDS_UPDATE",
 *     FindingFieldsUpdate: { Workflow: { Status: "SUPPRESSED" } },
 *   }],
 * });
 * ```
 *
 * **Example:** Escalate Production Findings
 * ```typescript
 * const rule = yield* AWS.SecurityHub.AutomationRule("EscalateProd", {
 *   description: "Raise severity of findings on production resources",
 *   ruleOrder: 2,
 *   isTerminal: true,
 *   criteria: {
 *     ResourceTags: [{ Key: "env", Value: "prod", Comparison: "EQUALS" }],
 *   },
 *   actions: [{
 *     Type: "FINDING_FIELDS_UPDATE",
 *     FindingFieldsUpdate: { Severity: { Label: "CRITICAL" } },
 *   }],
 * });
 * ```
 */
declare const AutomationRuleResource: import("../../Resource.ts").ResourceClass<AutomationRule>;
export { AutomationRuleResource as AutomationRule };
export declare const AutomationRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<AutomationRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AutomationRule.d.ts.map