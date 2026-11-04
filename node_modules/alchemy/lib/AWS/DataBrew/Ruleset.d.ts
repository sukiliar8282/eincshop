import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** A single data-quality rule (a check expression + optional threshold). */
export interface RulesetRule {
    /** The rule name (unique within the ruleset). */
    name: string;
    /** Skip the rule without deleting it. @default false */
    disabled?: boolean;
    /**
     * The check expression, e.g. `:col1 is_between :val1 and :val2` or
     * `AGG(MISSING_VALUES_PERCENTAGE) < :val1`.
     */
    checkExpression: string;
    /** Variable substitutions for the expression, keyed by `:name`. */
    substitutionMap?: Record<string, string>;
    /** Pass/fail threshold for row-level checks. */
    threshold?: {
        /** The threshold value. */
        value: number;
        /** Comparison type. @default "GREATER_THAN_OR_EQUAL" */
        type?: "GREATER_THAN_OR_EQUAL" | "LESS_THAN_OR_EQUAL" | "GREATER_THAN" | "LESS_THAN" | (string & {});
        /** Whether `value` is a row count or a percentage. @default "COUNT" */
        unit?: "COUNT" | "PERCENTAGE" | (string & {});
    };
    /** Columns the rule applies to (by name or regex). */
    columnSelectors?: {
        /** A regular expression matching column names. */
        regex?: string;
        /** An exact column name. */
        name?: string;
    }[];
}
export interface RulesetProps {
    /**
     * Name of the ruleset. If omitted, a unique name is generated. Changing
     * the name replaces the ruleset.
     * @default a generated physical name
     */
    rulesetName?: string;
    /**
     * A description of the ruleset.
     */
    description?: string;
    /**
     * The ARN of the DataBrew dataset the ruleset validates. Changing it
     * replaces the ruleset.
     */
    targetArn: string;
    /**
     * The data-quality rules.
     */
    rules: RulesetRule[];
    /**
     * Tags to apply to the ruleset. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Ruleset extends Resource<"AWS.DataBrew.Ruleset", RulesetProps, {
    /** Name of the ruleset. */
    rulesetName: string;
    /** ARN of the ruleset. */
    rulesetArn: string;
    /** ARN of the dataset the ruleset validates. */
    targetArn: string;
}, {}, Providers> {
}
/**
 * An AWS Glue DataBrew ruleset — a set of data-quality rules bound to a
 * dataset. Attach it to a profile job via `validationConfigurations` to
 * produce pass/fail validation results alongside the data profile.
 * ### Creating Rulesets
 * **Example:** Data-Quality Rules for a Dataset
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const ruleset = yield* AWS.DataBrew.Ruleset("Quality", {
 *   targetArn: dataset.datasetArn,
 *   rules: [
 *     {
 *       name: "no-missing-ids",
 *       checkExpression: "AGG(MISSING_VALUES_PERCENTAGE) == :val1",
 *       substitutionMap: { ":val1": "0" },
 *       columnSelectors: [{ name: "id" }],
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Validate in a Profile Job
 * ```typescript
 * const profile = yield* AWS.DataBrew.Job("Profile", {
 *   type: "PROFILE",
 *   datasetName: dataset.datasetName,
 *   role: role.roleArn,
 *   outputLocation: { bucket: bucket.bucketName, key: "profiles/" },
 *   validationConfigurations: [{ rulesetArn: ruleset.rulesetArn }],
 * });
 * ```
 *
 * @resource
 */
export declare const Ruleset: import("../../Resource.ts").ResourceClass<Ruleset>;
export declare const RulesetProvider: () => import("effect/Layer").Layer<Provider.Provider<Ruleset>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Ruleset.d.ts.map