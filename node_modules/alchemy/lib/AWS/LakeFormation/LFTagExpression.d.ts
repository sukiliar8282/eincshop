import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * One LF-tag condition inside an expression.
 */
export interface LFTagPairSpec {
    /**
     * Key of the LF-tag.
     */
    tagKey: string;
    /**
     * Values of the LF-tag the condition matches.
     */
    tagValues: string[];
}
export interface LFTagExpressionProps {
    /**
     * Name of the LF-tag expression (unique within the catalog). Changing it
     * replaces the expression.
     */
    name: string;
    /**
     * Human-readable description of the expression.
     */
    description?: string;
    /**
     * The LF-tag conditions (logical AND) that make up the expression. The
     * referenced LF-tags must exist.
     */
    expression: LFTagPairSpec[];
    /**
     * The catalog id (AWS account id) the expression lives in. Changing it
     * replaces the expression.
     * @default the caller's account
     */
    catalogId?: string;
}
export interface LFTagExpression extends Resource<"AWS.LakeFormation.LFTagExpression", LFTagExpressionProps, {
    name: string;
    description: string | undefined;
    expression: LFTagPairSpec[];
    catalogId: string;
}, {}, Providers> {
}
/**
 * A named Lake Formation LF-tag expression — a reusable, saved combination
 * of LF-tag conditions that can be referenced from permission grants
 * (`Resource.LFTagExpression`) instead of repeating the raw expression.
 *
 * Creating LF-tag expressions requires `CREATE_LF_TAG_EXPRESSION` on the
 * catalog (data lake administrators have it) plus
 * `GRANT_WITH_LF_TAG_EXPRESSION` on the underlying LF-tag pairs — see
 * {@link DataLakeSettings | AWS.LakeFormation.DataLakeSettings}.
 *
 * ### Creating LF-Tag Expressions
 * **Example:** Saved Expression over an Environment Tag
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const tag = yield* AWS.LakeFormation.LFTag("EnvTag", {
 *   tagKey: "environment",
 *   tagValues: ["dev", "prod"],
 * });
 * const expression = yield* AWS.LakeFormation.LFTagExpression("ProdData", {
 *   name: "prod-data",
 *   description: "All resources tagged environment=prod",
 *   expression: [{ tagKey: tag.tagKey, tagValues: ["prod"] }],
 * });
 * ```
 *
 * @resource
 */
export declare const LFTagExpression: import("../../Resource.ts").ResourceClass<LFTagExpression>;
export declare const LFTagExpressionProvider: () => import("effect/Layer").Layer<Provider.Provider<LFTagExpression>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=LFTagExpression.d.ts.map