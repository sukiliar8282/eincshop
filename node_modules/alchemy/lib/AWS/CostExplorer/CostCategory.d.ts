import * as ce from "@distilled.cloud/aws/cost-explorer";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CostCategoryProps {
    /**
     * Name of the cost category. Must be unique within the account and between
     * 1 and 50 characters. If omitted, a unique name is generated from the app,
     * stage, and logical ID.
     *
     * Changing the name replaces the cost category.
     */
    name?: string;
    /**
     * The rule schema version.
     * @default "CostCategoryExpression.v1"
     */
    ruleVersion?: "CostCategoryExpression.v1" | (string & {});
    /**
     * The categorization rules, evaluated in order. Each rule maps costs
     * matching its expression to a category value (raw Cost Explorer
     * `CostCategoryRule` shape).
     */
    rules: ce.CostCategoryRule[];
    /**
     * The value assigned to any cost that no rule matches.
     */
    defaultValue?: string;
    /**
     * Rules splitting charges between category values (raw Cost Explorer
     * `CostCategorySplitChargeRule` shape).
     */
    splitChargeRules?: ce.CostCategorySplitChargeRule[];
    /**
     * The category's effective start date (`yyyy-MM-dd'T'HH:mm:ssZ`, first of a
     * month, at most 12 months back).
     * @default the first day of the current month
     */
    effectiveStart?: string;
    /**
     * User-defined tags to apply to the cost category.
     */
    tags?: Record<string, string>;
}
export interface CostCategory extends Resource<"AWS.CostExplorer.CostCategory", CostCategoryProps, {
    /** ARN of the cost category. */
    costCategoryArn: string;
    /** Name of the cost category. */
    name: string;
    /** ISO timestamp the current rule version took effect. */
    effectiveStart: string | undefined;
    /** Current tags on the cost category. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A Cost Explorer cost category — rule-based groupings that map your AWS
 * costs into named values (e.g. team, environment, project) usable across
 * Cost Explorer, Budgets, and CUR reports.
 *
 * Cost Explorer is a global service — all calls are pinned to `us-east-1`
 * regardless of the stack region. Rules, the default value, and split-charge
 * rules are mutable in place; changing the name replaces the category.
 *
 * ### Creating Cost Categories
 * **Example:** Categorize by linked account name
 * ```typescript
 * import * as CostExplorer from "alchemy/AWS/CostExplorer";
 *
 * const category = yield* CostExplorer.CostCategory("Environment", {
 *   rules: [
 *     {
 *       Value: "production",
 *       Type: "REGULAR",
 *       Rule: {
 *         Dimensions: {
 *           Key: "LINKED_ACCOUNT_NAME",
 *           MatchOptions: ["ENDS_WITH"],
 *           Values: ["-prod"],
 *         },
 *       },
 *     },
 *   ],
 *   defaultValue: "other",
 * });
 * ```
 *
 * **Example:** Categorize by cost allocation tag
 * ```typescript
 * const category = yield* CostExplorer.CostCategory("Team", {
 *   rules: [
 *     {
 *       Value: "platform",
 *       Type: "REGULAR",
 *       Rule: {
 *         Tags: { Key: "team", Values: ["platform"], MatchOptions: ["EQUALS"] },
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const CostCategory: import("../../Resource.ts").ResourceClass<CostCategory>;
export declare const CostCategoryProvider: () => import("effect/Layer").Layer<Provider.Provider<CostCategory>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CostCategory.d.ts.map