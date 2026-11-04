import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { type WafScope } from "./internal.ts";
export interface RegexPatternSetProps {
    /**
     * Name of the regex pattern set. Must match `^[\w\-]+$` and be 1-128
     * characters. Changing the name replaces the regex pattern set.
     * @default a physical name derived from the app, stage and logical ID
     */
    regexPatternSetName?: string;
    /**
     * Scope of the regex pattern set — `REGIONAL` (ambient region) or
     * `CLOUDFRONT` (pinned to `us-east-1`). Must match the scope of the web
     * ACLs and rule groups that reference it. Changing the scope replaces the
     * regex pattern set.
     * @default "REGIONAL"
     */
    scope?: WafScope;
    /**
     * Regular expressions in the set (1-10 patterns, each up to 200
     * characters). Mutable — updated in place.
     */
    regularExpressions: string[];
    /**
     * Description of the regex pattern set.
     */
    description?: string;
    /**
     * User-defined tags to apply to the regex pattern set.
     */
    tags?: Record<string, string>;
}
export interface RegexPatternSet extends Resource<"AWS.WAFv2.RegexPatternSet", RegexPatternSetProps, {
    /**
     * Name of the regex pattern set.
     */
    regexPatternSetName: string;
    /**
     * WAF-assigned unique ID of the regex pattern set.
     */
    regexPatternSetId: string;
    /**
     * ARN of the regex pattern set — reference it from a rule's
     * `RegexPatternSetReferenceStatement`.
     */
    regexPatternSetArn: string;
    /**
     * Scope the regex pattern set was created in.
     */
    scope: WafScope;
    /**
     * Current regular expressions in the set.
     */
    regularExpressions: string[];
}, never, Providers> {
}
/**
 * An AWS WAFv2 regex pattern set — a named collection of regular expressions
 * referenced from web ACL and rule group rules via
 * `RegexPatternSetReferenceStatement`.
 *
 * ### Creating Regex Pattern Sets
 * **Example:** Block Requests Matching Bad Path Patterns
 * ```typescript
 * const badPaths = yield* AWS.WAFv2.RegexPatternSet("BadPaths", {
 *   regularExpressions: ["^/wp-admin", "\\.php$"],
 * });
 * ```
 *
 * **Example:** Reference from a Web ACL Rule
 * ```typescript
 * const acl = yield* AWS.WAFv2.WebACL("Firewall", {
 *   rules: [
 *     {
 *       Name: "block-bad-paths",
 *       Priority: 0,
 *       Statement: {
 *         RegexPatternSetReferenceStatement: {
 *           ARN: badPaths.regexPatternSetArn,
 *           FieldToMatch: { UriPath: {} },
 *           TextTransformations: [{ Priority: 0, Type: "NONE" }],
 *         },
 *       },
 *       Action: { Block: {} },
 *       VisibilityConfig: {
 *         SampledRequestsEnabled: true,
 *         CloudWatchMetricsEnabled: true,
 *         MetricName: "block-bad-paths",
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const RegexPatternSet: import("../../Resource.ts").ResourceClass<RegexPatternSet>;
export declare const RegexPatternSetProvider: () => import("effect/Layer").Layer<Provider.Provider<RegexPatternSet>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RegexPatternSet.d.ts.map