import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/** A single transformation step in a DataBrew recipe. */
export interface RecipeStep {
    /** The transformation to apply. */
    action: {
        /**
         * The DataBrew operation name, e.g. `UPPER_CASE`, `REMOVE_VALUES`,
         * `RENAME`. See the DataBrew recipe-action reference for the full list.
         */
        operation: string;
        /** Operation parameters, e.g. `{ sourceColumn: "name" }`. */
        parameters?: Record<string, string>;
    };
    /** Conditions that must hold for the step to apply to a row. */
    conditionExpressions?: {
        /** The condition name, e.g. `LESS_THAN`, `IS_MISSING`. */
        condition: string;
        /** The value to compare against (JSON-encoded for lists). */
        value?: string;
        /** The column the condition applies to. */
        targetColumn: string;
    }[];
}
export interface RecipeProps {
    /**
     * Name of the recipe. If omitted, a unique name is generated. Changing
     * the name replaces the recipe.
     * @default a generated physical name
     */
    recipeName?: string;
    /**
     * A description of the recipe.
     */
    description?: string;
    /**
     * The ordered transformation steps applied to the data.
     */
    steps: RecipeStep[];
    /**
     * Publish a new numbered version whenever the working steps change (and
     * once on create). Recipe jobs consume the latest *published* version by
     * default, so set this when the recipe feeds a `DataBrew.Job`.
     * @default false
     */
    publish?: boolean;
    /**
     * Tags to apply to the recipe. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Recipe extends Resource<"AWS.DataBrew.Recipe", RecipeProps, {
    /** Name of the recipe. */
    recipeName: string;
    /** ARN of the recipe. */
    recipeArn: string;
    /** Latest published version (e.g. `"1.0"`), or `"LATEST_WORKING"` if never published. */
    recipeVersion: string;
}, {}, Providers> {
}
/**
 * An AWS Glue DataBrew recipe — an ordered list of data-transformation steps
 * (rename, filter, case conversion, etc.). Edits modify the `LATEST_WORKING`
 * version; setting `publish: true` snapshots numbered versions that recipe
 * jobs consume.
 * ### Creating Recipes
 * **Example:** Simple Transform Recipe
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const recipe = yield* AWS.DataBrew.Recipe("Clean", {
 *   description: "normalize customer names",
 *   steps: [
 *     {
 *       action: {
 *         operation: "UPPER_CASE",
 *         parameters: { sourceColumn: "name" },
 *       },
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Published Recipe for Jobs
 * ```typescript
 * // publish: true snapshots a numbered version (1.0, 2.0, ...) whenever the
 * // steps change — recipe jobs run the latest published version by default.
 * const recipe = yield* AWS.DataBrew.Recipe("Clean", {
 *   publish: true,
 *   steps: [
 *     {
 *       action: {
 *         operation: "REMOVE_VALUES",
 *         parameters: { sourceColumn: "email" },
 *       },
 *       conditionExpressions: [
 *         { condition: "IS_MISSING", targetColumn: "email" },
 *       ],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Recipe: import("../../Resource.ts").ResourceClass<Recipe>;
export declare const buildSteps: (steps: RecipeStep[]) => {
    Action: {
        Operation: string;
        Parameters: Record<string, string> | undefined;
    };
    ConditionExpressions: {
        Condition: string;
        Value: string | undefined;
        TargetColumn: string;
    }[] | undefined;
}[];
export declare const RecipeProvider: () => import("effect/Layer").Layer<Provider.Provider<Recipe>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Recipe.d.ts.map