import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * How often AWS Config runs evaluations for a periodic rule.
 */
export type ConfigMaximumExecutionFrequency = "One_Hour" | "Three_Hours" | "Six_Hours" | "Twelve_Hours" | "TwentyFour_Hours";
export interface ConfigRuleSourceDetail {
    /**
     * The source of the event that triggers evaluation.
     * @default "aws.config"
     */
    eventSource?: string;
    /**
     * The type of notification that triggers evaluation, e.g.
     * `ConfigurationItemChangeNotification` or `ScheduledNotification`.
     */
    messageType?: string;
    /**
     * The frequency at which the rule is evaluated when the message type is
     * `ScheduledNotification`.
     */
    maximumExecutionFrequency?: ConfigMaximumExecutionFrequency;
}
export interface ConfigRuleSource {
    /**
     * Who owns and maintains the rule logic. `AWS` for managed rules,
     * `CUSTOM_LAMBDA` for Lambda-backed custom rules, `CUSTOM_POLICY` for
     * Guard custom-policy rules.
     */
    owner: "AWS" | "CUSTOM_LAMBDA" | "CUSTOM_POLICY";
    /**
     * For managed rules, the rule identifier, e.g.
     * `S3_BUCKET_VERSIONING_ENABLED`. For custom Lambda rules, the ARN of the
     * rule's Lambda function.
     */
    sourceIdentifier?: string;
    /**
     * The source and type of events that trigger evaluation. Required for
     * custom Lambda rules; not used for managed rules.
     */
    sourceDetails?: ConfigRuleSourceDetail[];
    /**
     * Guard policy details for `CUSTOM_POLICY` rules.
     */
    customPolicyDetails?: {
        /**
         * The runtime system for the Guard policy, e.g. `guard-2.x.x`.
         */
        policyRuntime: string;
        /**
         * The Guard policy text.
         */
        policyText: string;
        /**
         * Whether to log Guard debug output.
         * @default false
         */
        enableDebugLogDelivery?: boolean;
    };
}
export interface ConfigRuleScope {
    /**
     * Resource types the rule evaluates, e.g. `AWS::S3::Bucket`.
     */
    complianceResourceTypes?: string[];
    /**
     * Tag key applied to resources the rule evaluates.
     */
    tagKey?: string;
    /**
     * Tag value applied to resources the rule evaluates. Requires `tagKey`.
     */
    tagValue?: string;
    /**
     * The ID of a single resource the rule evaluates. Requires exactly one
     * entry in `complianceResourceTypes`.
     */
    complianceResourceId?: string;
}
export interface ConfigRuleProps {
    /**
     * Name of the Config rule. Changing the name replaces the rule.
     * @default ${app}-${stage}-${id}
     */
    configRuleName?: string;
    /**
     * Description of the rule.
     */
    description?: string;
    /**
     * The rule's source: owner (AWS-managed, custom Lambda, or Guard custom
     * policy) plus the identifier of the rule logic.
     */
    source: ConfigRuleSource;
    /**
     * Input parameters passed to the rule's evaluation logic, serialized to
     * JSON.
     */
    inputParameters?: Record<string, string>;
    /**
     * The maximum frequency at which AWS Config runs evaluations for a
     * periodic rule.
     */
    maximumExecutionFrequency?: ConfigMaximumExecutionFrequency;
    /**
     * Restricts the rule to a subset of resources by type, tag, or ID. When
     * omitted, evaluations are triggered for all supported resources.
     */
    scope?: ConfigRuleScope;
    /**
     * The evaluation modes the rule runs in.
     * @default ["DETECTIVE"]
     */
    evaluationModes?: ("DETECTIVE" | "PROACTIVE")[];
    /**
     * Tags to apply to the rule. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface ConfigRule extends Resource<"AWS.Config.ConfigRule", ConfigRuleProps, {
    /** Physical name of the config rule. */
    configRuleName: string;
    /** ARN of the config rule. */
    configRuleArn: string;
    /** Unique AWS-assigned rule ID. */
    configRuleId: string;
}, never, Providers> {
}
/**
 * An AWS Config rule that evaluates whether your AWS resources comply with
 * a desired configuration — either an AWS-managed rule, a custom Lambda
 * rule, or a Guard custom-policy rule.
 *
 * The account/region must have an AWS Config configuration recorder before
 * rules can be created (see `AWS.Config.ConfigurationRecorder`).
 * ### Creating Rules
 * **Example:** AWS-managed rule
 * ```typescript
 * import * as Config from "alchemy/AWS/Config";
 *
 * const rule = yield* Config.ConfigRule("BucketVersioning", {
 *   source: {
 *     owner: "AWS",
 *     sourceIdentifier: "S3_BUCKET_VERSIONING_ENABLED",
 *   },
 * });
 * ```
 *
 * **Example:** Managed rule with input parameters and scope
 * ```typescript
 * const rule = yield* Config.ConfigRule("RequiredTags", {
 *   description: "All buckets must carry a team tag",
 *   source: { owner: "AWS", sourceIdentifier: "REQUIRED_TAGS" },
 *   inputParameters: { tag1Key: "team" },
 *   scope: { complianceResourceTypes: ["AWS::S3::Bucket"] },
 * });
 * ```
 *
 * ### Periodic Evaluation
 * **Example:** Evaluate on a schedule
 * ```typescript
 * const rule = yield* Config.ConfigRule("RootMfa", {
 *   source: {
 *     owner: "AWS",
 *     sourceIdentifier: "ROOT_ACCOUNT_MFA_ENABLED",
 *   },
 *   maximumExecutionFrequency: "TwentyFour_Hours",
 * });
 * ```
 *
 * @resource
 */
export declare const ConfigRule: import("../../Resource.ts").ResourceClass<ConfigRule>;
declare const ConfigRuleNotVisible_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ConfigRuleNotVisible";
} & Readonly<A>;
/**
 * Raised when a Config rule that was just written does not become visible
 * to `DescribeConfigRules` within the reconciler's bounded wait.
 */
export declare class ConfigRuleNotVisible extends ConfigRuleNotVisible_base<{
    message: string;
}> {
}
export declare const ConfigRuleProvider: () => import("effect/Layer").Layer<Provider.Provider<ConfigRule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ConfigRule.d.ts.map