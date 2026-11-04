import * as entityresolution from "@distilled.cloud/aws/entityresolution";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface IdMappingWorkflowProps {
    /**
     * Name of the ID mapping workflow. Must be unique per account/region and
     * match `[a-zA-Z_0-9-]*`. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Changing the name replaces the workflow.
     */
    workflowName?: string;
    /**
     * A description of the workflow.
     */
    description?: string;
    /**
     * The input records to map: for rule-based mapping, entries reference ID
     * namespace ARNs (`inputSourceARN`) with their role (`type: "SOURCE"` or
     * `"TARGET"`); for provider-based mapping, entries may reference Glue
     * tables with a `schemaName`.
     */
    inputSourceConfig: entityresolution.IdMappingWorkflowInputSource[];
    /**
     * Where mapped output records are written: an S3 path (`outputS3Path`) and
     * an optional KMS key (`KMSArn`). Optional — rule-based workflows can also
     * receive per-job output configuration on `StartIdMappingJob`.
     */
    outputSourceConfig?: entityresolution.IdMappingWorkflowOutputSource[];
    /**
     * How records are mapped: `RULE_BASED` with `ruleBasedProperties`
     * (definition type, attribute/record matching models) or a `PROVIDER`
     * service (e.g. LiveRamp).
     */
    idMappingTechniques: entityresolution.IdMappingTechniques;
    /**
     * Incremental-run configuration. Note the service currently rejects
     * incremental processing for ID mapping workflows.
     */
    incrementalRunConfig?: entityresolution.IdMappingIncrementalRunConfig;
    /**
     * The ARN of the IAM role Entity Resolution assumes to read Glue-table
     * input sources and write the S3 output on your behalf. Optional when all
     * input sources are ID namespaces that carry their own roles.
     */
    roleArn?: string;
    /**
     * Tags to apply to the workflow. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface IdMappingWorkflow extends Resource<"AWS.EntityResolution.IdMappingWorkflow", IdMappingWorkflowProps, {
    /**
     * The name of the ID mapping workflow.
     */
    workflowName: string;
    /**
     * The ARN of the ID mapping workflow.
     */
    workflowArn: string;
}, never, Providers> {
}
/**
 * An AWS Entity Resolution ID mapping workflow — a data-processing job
 * definition that translates record identifiers between a `SOURCE` and a
 * `TARGET` ID namespace, using rule-based matching or a provider service.
 *
 * The workflow definition itself is cheap and instant; a mapping RUN
 * (`StartIdMappingJob`) processes the full input and takes many minutes.
 *
 * ### Creating ID Mapping Workflows
 * **Example:** Rule-based ID mapping between two namespaces
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const workflow = yield* AWS.EntityResolution.IdMappingWorkflow("Map", {
 *   inputSourceConfig: [
 *     { inputSourceARN: source.idNamespaceArn, type: "SOURCE" },
 *     { inputSourceARN: target.idNamespaceArn, type: "TARGET" },
 *   ],
 *   idMappingTechniques: {
 *     idMappingType: "RULE_BASED",
 *     ruleBasedProperties: {
 *       ruleDefinitionType: "TARGET",
 *       attributeMatchingModel: "ONE_TO_ONE",
 *       recordMatchingModel: "ONE_SOURCE_TO_ONE_TARGET",
 *     },
 *   },
 *   outputSourceConfig: [
 *     { outputS3Path: `s3://${bucket.bucketName}/idmapping/` },
 *   ],
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const IdMappingWorkflow: import("../../Resource.ts").ResourceClass<IdMappingWorkflow>;
export declare const IdMappingWorkflowProvider: () => import("effect/Layer").Layer<Provider.Provider<IdMappingWorkflow>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=IdMappingWorkflow.d.ts.map