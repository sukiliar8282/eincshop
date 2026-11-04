import type * as WAFV2 from "@distilled.cloud/aws/wafv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type WafScope } from "./internal.ts";
export interface WebACLProps {
    /**
     * Name of the web ACL. Must match `^[\w\-]+$` and be 1-128 characters.
     * Changing the name replaces the web ACL.
     * @default a physical name derived from the app, stage and logical ID
     */
    webAclName?: string;
    /**
     * Scope of the web ACL. `REGIONAL` protects regional resources (ALB,
     * API Gateway, AppSync, Cognito user pool, App Runner, Verified Access)
     * in the ambient region; `CLOUDFRONT` protects CloudFront distributions
     * and is always provisioned in `us-east-1` (the provider pins the region
     * automatically). Changing the scope replaces the web ACL.
     * @default "REGIONAL"
     */
    scope?: WafScope;
    /**
     * Action to take on a request that matches none of the rules.
     * @default { Allow: {} }
     */
    defaultAction?: WAFV2.DefaultAction;
    /**
     * Description of the web ACL.
     */
    description?: string;
    /**
     * Rules to evaluate, in `Priority` order. Supports custom statements
     * (byte match, rate-based, geo, IP set references, ...) and managed rule
     * groups (e.g. `AWSManagedRulesCommonRuleSet`). Raw WAFv2 API shapes.
     */
    rules?: WAFV2.Rule[];
    /**
     * CloudWatch metrics and sampled-request settings for the web ACL itself.
     * @default sampled requests + metrics enabled, MetricName = the web ACL name
     */
    visibilityConfig?: WAFV2.VisibilityConfig;
    /**
     * Custom response bodies referenced by rule actions in this web ACL.
     */
    customResponseBodies?: {
        [key: string]: WAFV2.CustomResponseBody | undefined;
    };
    /**
     * Default CAPTCHA immunity-time configuration.
     */
    captchaConfig?: WAFV2.CaptchaConfig;
    /**
     * Default challenge immunity-time configuration.
     */
    challengeConfig?: WAFV2.ChallengeConfig;
    /**
     * Domains that WAF accepts for CAPTCHA/challenge tokens.
     */
    tokenDomains?: string[];
    /**
     * Association-level configuration (e.g. request body size limits).
     */
    associationConfig?: WAFV2.AssociationConfig;
    /**
     * User-defined tags to apply to the web ACL.
     */
    tags?: Record<string, string>;
}
export interface WebACL extends Resource<"AWS.WAFv2.WebACL", WebACLProps, {
    /**
     * Name of the web ACL.
     */
    webAclName: string;
    /**
     * WAF-assigned unique ID of the web ACL.
     */
    webAclId: string;
    /**
     * ARN of the web ACL. Use this to associate regional resources
     * (via {@link WebACLAssociation}) or as CloudFront's `webAclId`.
     */
    webAclArn: string;
    /**
     * Scope the web ACL was created in.
     */
    scope: WafScope;
}, never, Providers> {
}
/**
 * An AWS WAFv2 Web ACL — a collection of rules that inspect and control web
 * requests for the AWS resources it is associated with.
 *
 * `REGIONAL` web ACLs protect regional resources (Application Load Balancer,
 * API Gateway, AppSync, Cognito user pools, App Runner, Verified Access) via
 * {@link WebACLAssociation}. `CLOUDFRONT` web ACLs protect CloudFront
 * distributions (set `Distribution.webAclId` to the web ACL's ARN) and are
 * always provisioned in `us-east-1` — the provider pins the region for you.
 *
 * ### Creating Web ACLs
 * **Example:** Allow-by-Default Web ACL with a Managed Rule Group
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("ApiFirewall", {
 *   rules: [
 *     {
 *       Name: "common-rule-set",
 *       Priority: 0,
 *       Statement: {
 *         ManagedRuleGroupStatement: {
 *           VendorName: "AWS",
 *           Name: "AWSManagedRulesCommonRuleSet",
 *         },
 *       },
 *       OverrideAction: { None: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "common-rule-set",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Rate Limiting Requests per IP
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("RateLimited", {
 *   defaultAction: { Allow: {} },
 *   rules: [
 *     {
 *       Name: "rate-limit",
 *       Priority: 0,
 *       Statement: {
 *         RateBasedStatement: { Limit: 100, AggregateKeyType: "IP" },
 *       },
 *       Action: { Block: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "rate-limit",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * ### CloudFront Scope
 * **Example:** Web ACL for a CloudFront Distribution
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("EdgeFirewall", {
 *   scope: "CLOUDFRONT", // provisioned in us-east-1 automatically
 *   defaultAction: { Allow: {} },
 * });
 *
 * const distribution = yield* AWS.CloudFront.Distribution("Site", {
 *   // ...
 *   webAclId: acl.webAclArn,
 * });
 * ```
 *
 * ### Protecting Regional Resources
 * **Example:** Associate with a Cognito User Pool
 * ```typescript
 * const association = yield* AWS.WAFv2.WebACLAssociation("PoolFirewall", {
 *   webAclArn: acl.webAclArn,
 *   resourceArn: userPool.userPoolArn,
 * });
 * ```
 *
 * @resource
 */
export declare const WebACL: import("../../Resource.ts").ResourceClass<WebACL>;
export declare const WebACLProvider: () => import("effect/Layer").Layer<Provider.Provider<WebACL>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=WebACL.d.ts.map