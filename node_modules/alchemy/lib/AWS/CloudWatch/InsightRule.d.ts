import * as cloudwatch from "@distilled.cloud/aws/cloudwatch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type InsightRuleName = string;
export type InsightRuleArn = `arn:aws:cloudwatch:${RegionID}:${AccountID}:insight-rule/${string}`;
export interface CloudWatchLogRuleFilter {
    Match: string;
    In: string[];
}
export interface CloudWatchLogRuleDefinition {
    Schema: {
        Name: "CloudWatchLogRule";
        Version: 1;
    };
    LogGroupNames?: string[];
    LogGroupARNs?: string[];
    LogFormat: "JSON" | "CLF" | (string & {});
    Contribution: {
        Keys: string[];
        ValueOf?: string;
        Filters?: CloudWatchLogRuleFilter[];
    };
    AggregateOn: "Count" | "Sum" | (string & {});
}
export interface InsightRuleProps extends Omit<cloudwatch.PutInsightRuleInput, "RuleDefinition" | "RuleName" | "Tags"> {
    /**
     * Name of the insight rule. If omitted, a unique name is generated.
     */
    name?: InsightRuleName;
    /**
     * Optional tags to apply to the insight rule.
     */
    tags?: Record<string, string>;
    /**
     * Typed Contributor Insights rule definition. The provider serializes this
     * object to the JSON string expected by the CloudWatch API.
     */
    RuleDefinition?: CloudWatchLogRuleDefinition;
}
export interface InsightRule extends Resource<"AWS.CloudWatch.InsightRule", InsightRuleProps, {
    /** Physical name of the insight rule. */
    ruleName: InsightRuleName;
    /** ARN of the insight rule. */
    ruleArn: InsightRuleArn;
    /** Current state of the rule (`ENABLED` or `DISABLED`). */
    state: string | undefined;
    /** The full InsightRule description as last read from CloudWatch. */
    insightRule: cloudwatch.InsightRule;
    /** Tags on the insight rule, including the internal Alchemy ownership tags. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A CloudWatch Contributor Insights rule — analyzes log group entries to
 * surface the top-N contributors (IPs, user IDs, …) to a metric derived
 * from structured logs.
 * ### Creating Insight Rules
 * **Example:** Rule Definition
 * ```typescript
 * const rule = yield* InsightRule("TopContributors", {
 *   RuleState: "ENABLED",
 *   RuleDefinition: {
 *     Schema: {
 *       Name: "CloudWatchLogRule",
 *       Version: 1,
 *     },
 *     LogGroupNames: ["/my-app/access-logs"],
 *     LogFormat: "JSON",
 *     Contribution: {
 *       Keys: ["$.ip"],
 *     },
 *     AggregateOn: "Count",
 *   },
 * });
 * ```
 *
 * ### Reading Reports at Runtime
 * **Example:** Fetch the Rule's Top Contributors from a Function
 * ```typescript
 * // init — bind the rule to the function (see GetInsightRuleReport)
 * const getInsightRuleReport = yield* AWS.CloudWatch.GetInsightRuleReport(rule);
 *
 * // runtime
 * const now = yield* Effect.sync(() => Date.now());
 * const report = yield* getInsightRuleReport({
 *   StartTime: new Date(now - 3_600_000),
 *   EndTime: new Date(now),
 *   Period: 300,
 * });
 * ```
 *
 * @resource
 */
export declare const InsightRule: import("../../Resource.ts").ResourceClass<InsightRule>;
export declare const InsightRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<InsightRule>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=InsightRule.d.ts.map