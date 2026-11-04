import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * A single filter criterion evaluated against a finding attribute. Provide at
 * least one comparison; multiple comparisons on one criterion are ANDed.
 */
export interface ArchiveRuleCriterion {
    /** The attribute value must equal one of these values. */
    eq?: string[];
    /** The attribute value must not equal any of these values. */
    neq?: string[];
    /** The attribute value must contain one of these substrings. */
    contains?: string[];
    /** The attribute must (or must not) be present. */
    exists?: boolean;
}
export interface ArchiveRuleProps {
    /**
     * The name of the analyzer the rule belongs to. Changing the analyzer
     * replaces the rule.
     */
    analyzerName: string;
    /**
     * The name of the archive rule, unique within the analyzer. Changing the
     * name replaces the rule.
     */
    ruleName: string;
    /**
     * The filter criteria keyed by finding attribute (e.g. `principal.AWS`,
     * `resource`, `condition.aws:PrincipalOrgID`, `isPublic`). New findings
     * matching every criterion are automatically archived. Mutable — changing
     * the filter updates the rule in place.
     */
    filter: Record<string, ArchiveRuleCriterion>;
}
export interface ArchiveRule extends Resource<"AWS.AccessAnalyzer.ArchiveRule", ArchiveRuleProps, {
    analyzerName: string;
    ruleName: string;
}, {}, Providers> {
}
/**
 * An archive rule for an IAM Access Analyzer — automatically archives new
 * findings that match the filter criteria, so expected cross-account or
 * public grants don't clutter the active findings list.
 *
 * Archive rules apply only to findings created after the rule; existing
 * findings are unaffected.
 * ### Creating Archive Rules
 * **Example:** Archive Findings from a Trusted Account
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const analyzer = yield* AWS.AccessAnalyzer.Analyzer("AccountAnalyzer", {});
 *
 * yield* AWS.AccessAnalyzer.ArchiveRule("TrustedAccount", {
 *   analyzerName: analyzer.analyzerName,
 *   ruleName: "trusted-account",
 *   filter: {
 *     "principal.AWS": { eq: ["123456789012"] },
 *   },
 * });
 * ```
 *
 * **Example:** Archive Public S3 Findings
 * ```typescript
 * yield* AWS.AccessAnalyzer.ArchiveRule("PublicBuckets", {
 *   analyzerName: analyzer.analyzerName,
 *   ruleName: "public-buckets",
 *   filter: {
 *     resourceType: { eq: ["AWS::S3::Bucket"] },
 *     isPublic: { eq: ["true"] },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ArchiveRule: import("../../Resource.ts").ResourceClass<ArchiveRule>;
export declare const ArchiveRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<ArchiveRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ArchiveRule.d.ts.map