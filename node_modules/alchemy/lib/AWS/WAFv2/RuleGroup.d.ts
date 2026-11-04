import type * as WAFV2 from "@distilled.cloud/aws/wafv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type WafScope } from "./internal.ts";
export interface RuleGroupProps {
    /**
     * Name of the rule group. Must match `^[\w\-]+$` and be 1-128 characters.
     * Changing the name replaces the rule group.
     * @default a physical name derived from the app, stage and logical ID
     */
    ruleGroupName?: string;
    /**
     * Scope of the rule group — `REGIONAL` (ambient region) or `CLOUDFRONT`
     * (pinned to `us-east-1`). Must match the scope of the web ACLs that
     * reference it. Changing the scope replaces the rule group.
     * @default "REGIONAL"
     */
    scope?: WafScope;
    /**
     * Web ACL capacity units (WCU) reserved for this rule group. Immutable —
     * changing the capacity replaces the rule group.
     */
    capacity: number;
    /**
     * Rules to evaluate, in `Priority` order. Raw WAFv2 API shapes.
     */
    rules?: WAFV2.Rule[];
    /**
     * CloudWatch metrics and sampled-request settings for the rule group.
     * @default sampled requests + metrics enabled, MetricName = the rule group name
     */
    visibilityConfig?: WAFV2.VisibilityConfig;
    /**
     * Description of the rule group.
     */
    description?: string;
    /**
     * Custom response bodies referenced by rule actions in this rule group.
     */
    customResponseBodies?: {
        [key: string]: WAFV2.CustomResponseBody | undefined;
    };
    /**
     * User-defined tags to apply to the rule group.
     */
    tags?: Record<string, string>;
}
export interface RuleGroup extends Resource<"AWS.WAFv2.RuleGroup", RuleGroupProps, {
    /**
     * Name of the rule group.
     */
    ruleGroupName: string;
    /**
     * WAF-assigned unique ID of the rule group.
     */
    ruleGroupId: string;
    /**
     * ARN of the rule group — reference it from a web ACL rule's
     * `RuleGroupReferenceStatement`.
     */
    ruleGroupArn: string;
    /**
     * Scope the rule group was created in.
     */
    scope: WafScope;
    /**
     * Immutable WCU capacity of the rule group.
     */
    capacity: number;
}, never, Providers> {
}
/**
 * An AWS WAFv2 rule group — a reusable, capacity-bounded collection of rules
 * referenced from web ACLs via `RuleGroupReferenceStatement`.
 *
 * The `capacity` (web ACL capacity units, WCU) is fixed at creation;
 * changing it replaces the rule group.
 *
 * ### Creating Rule Groups
 * **Example:** Rule Group with a Byte-Match Rule
 * ```typescript
 * const group = yield* AWS.WAFv2.RuleGroup("BlockAdminPaths", {
 *   capacity: 50,
 *   rules: [
 *     {
 *       Name: "block-admin",
 *       Priority: 0,
 *       Statement: {
 *         ByteMatchStatement: {
 *           SearchString: new TextEncoder().encode("/admin"),
 *           FieldToMatch: { UriPath: {} },
 *           TextTransformations: [{ Priority: 0, Type: "LOWERCASE" }],
 *           PositionalConstraint: "STARTS_WITH",
 *         },
 *       },
 *       Action: { Block: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "block-admin",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Reference from a Web ACL
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("Firewall", {
 *   rules: [
 *     {
 *       Name: "custom-rules",
 *       Priority: 0,
 *       Statement: {
 *         RuleGroupReferenceStatement: { ARN: group.ruleGroupArn },
 *       },
 *       OverrideAction: { None: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "custom-rules",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const RuleGroup: import("../../Resource.ts").ResourceClass<RuleGroup>;
export declare const RuleGroupProvider: () => import("effect/Layer").Layer<Provider.Provider<RuleGroup>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RuleGroup.d.ts.map