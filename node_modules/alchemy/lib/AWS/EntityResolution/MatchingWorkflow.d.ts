import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface MatchingWorkflowProps {
    /**
     * Name of the matching workflow. Must be unique per account/region and
     * match `[a-zA-Z_0-9-]*`. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Changing the name replaces the workflow.
     */
    workflowName?: string;
    /**
     * A description of the workflow.
     */
    description?: string;
    /**
     * The input records to match: each entry names a Glue table
     * (`inputSourceARN`) and the schema mapping (`schemaName`) that describes
     * its columns.
     */
    inputSourceConfig: entityresolution.InputSource[];
    /**
     * Where matched output records are written: an S3 path (`outputS3Path`),
     * the columns to include (`output`), and an optional KMS key (`KMSArn`).
     */
    outputSourceConfig: entityresolution.OutputSource[];
    /**
     * How records are matched: `RULE_MATCHING` with `ruleBasedProperties`,
     * `ML_MATCHING`, or a `PROVIDER` service.
     */
    resolutionTechniques: entityresolution.ResolutionTechniques;
    /**
     * Incremental-run configuration. Only supported for `RULE_MATCHING`
     * workflows.
     */
    incrementalRunConfig?: entityresolution.IncrementalRunConfig;
    /**
     * The ARN of the IAM role Entity Resolution assumes to read the input Glue
     * tables and write the S3 output on your behalf.
     */
    roleArn: string;
    /**
     * Tags to apply to the workflow. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface MatchingWorkflow extends Resource<"AWS.EntityResolution.MatchingWorkflow", MatchingWorkflowProps, {
    /**
     * The name of the matching workflow.
     */
    workflowName: string;
    /**
     * The ARN of the matching workflow.
     */
    workflowArn: string;
}, never, Providers> {
}
/**
 * An AWS Entity Resolution matching workflow — a data-processing job
 * definition that matches and deduplicates records across Glue table input
 * sources using rule-based or ML-powered matching, writing matched record
 * groups to S3.
 *
 * The workflow definition itself is cheap and instant; a matching RUN
 * (`StartMatchingJob`) processes the full input and takes many minutes.
 *
 * ### Creating Workflows
 * **Example:** Rule-based matching over a Glue table
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const workflow = yield* AWS.EntityResolution.MatchingWorkflow("Dedupe", {
 *   inputSourceConfig: [
 *     { inputSourceARN: table.tableArn, schemaName: schema.schemaName },
 *   ],
 *   outputSourceConfig: [
 *     {
 *       outputS3Path: `s3://${bucket.bucketName}/matches/`,
 *       output: [{ name: "id" }, { name: "email" }],
 *     },
 *   ],
 *   resolutionTechniques: {
 *     resolutionType: "RULE_MATCHING",
 *     ruleBasedProperties: {
 *       rules: [{ ruleName: "ByEmail", matchingKeys: ["email"] }],
 *       attributeMatchingModel: "ONE_TO_ONE",
 *     },
 *   },
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** ML-powered matching
 * ```typescript
 * const workflow = yield* AWS.EntityResolution.MatchingWorkflow("MlDedupe", {
 *   inputSourceConfig: [
 *     { inputSourceARN: table.tableArn, schemaName: schema.schemaName },
 *   ],
 *   outputSourceConfig: [
 *     {
 *       outputS3Path: `s3://${bucket.bucketName}/ml-matches/`,
 *       output: [{ name: "id" }],
 *     },
 *   ],
 *   resolutionTechniques: { resolutionType: "ML_MATCHING" },
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const MatchingWorkflow: import("../../Resource.ts").ResourceClass<MatchingWorkflow>;
export declare const MatchingWorkflowProvider: () => import("effect/Layer").Layer<Provider.Provider<MatchingWorkflow>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=MatchingWorkflow.d.ts.map