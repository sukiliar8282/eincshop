import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PipelineLogPublishingOptions {
    /**
     * Whether pipeline logs are published to CloudWatch Logs.
     */
    isLoggingEnabled?: boolean;
    /**
     * CloudWatch Logs destination. The log group name must start with
     * `/aws/vendedlogs/`.
     */
    cloudWatchLogDestination?: {
        /** Name of the CloudWatch Logs log group, e.g. `/aws/vendedlogs/OpenSearchIngestion/my-pipeline`. */
        logGroup: string;
    };
}
export interface PipelineBufferOptions {
    /**
     * Whether persistent buffering is enabled for the pipeline.
     */
    persistentBufferEnabled: boolean;
}
export interface PipelineEncryptionAtRestOptions {
    /**
     * ARN of the customer-managed KMS key used to encrypt buffer data.
     */
    kmsKeyArn: string;
}
export interface PipelineVpcOptions {
    /**
     * Subnet IDs the pipeline's VPC endpoint is placed into. Changing VPC
     * options replaces the pipeline.
     */
    subnetIds: string[];
    /**
     * Security group IDs applied to the pipeline's VPC endpoint.
     */
    securityGroupIds?: string[];
}
export interface PipelineProps {
    /**
     * Name of the pipeline. 3-28 characters; lowercase letters, numbers, and
     * hyphens. If omitted, a deterministic physical name is generated.
     * Changing the name replaces the pipeline.
     */
    pipelineName?: string;
    /**
     * Minimum number of Ingestion OpenSearch Compute Units (OCUs) the pipeline
     * scales down to. Minimum 1.
     */
    minUnits: number;
    /**
     * Maximum number of Ingestion OpenSearch Compute Units (OCUs) the pipeline
     * scales up to.
     */
    maxUnits: number;
    /**
     * Data Prepper pipeline configuration in YAML (must start with
     * `version: "2"`). Blueprints for common source/sink topologies are
     * available via the `listPipelineBlueprints`/`getPipelineBlueprint` APIs.
     */
    pipelineConfigurationBody: string;
    /**
     * CloudWatch Logs publishing configuration for pipeline logs.
     */
    logPublishingOptions?: PipelineLogPublishingOptions;
    /**
     * Persistent buffering for the pipeline's ingest data.
     */
    bufferOptions?: PipelineBufferOptions;
    /**
     * Customer-managed KMS encryption for buffer data.
     * @default an AWS-owned key
     */
    encryptionAtRestOptions?: PipelineEncryptionAtRestOptions;
    /**
     * VPC placement for the pipeline's ingest endpoint. Omit for a public
     * endpoint. Changing VPC options replaces the pipeline.
     */
    vpcOptions?: PipelineVpcOptions;
    /**
     * IAM role the pipeline assumes to write to its sinks (overrides the
     * `sts_role_arn` inside the configuration body where supported).
     */
    pipelineRoleArn?: string;
    /**
     * User-defined tags for the pipeline.
     */
    tags?: Record<string, string>;
}
export interface Pipeline extends Resource<"AWS.OSIS.Pipeline", PipelineProps, {
    /**
     * Name of the pipeline.
     */
    pipelineName: string;
    /**
     * ARN of the pipeline.
     */
    pipelineArn: string;
    /**
     * Pipeline status (e.g. `ACTIVE`, `CREATING`, `UPDATING`).
     */
    status: string;
    /**
     * Minimum Ingestion OCUs the pipeline scales down to.
     */
    minUnits: number | undefined;
    /**
     * Maximum Ingestion OCUs the pipeline scales up to.
     */
    maxUnits: number | undefined;
    /**
     * URLs to ingest data into the pipeline.
     */
    ingestEndpointUrls: string[] | undefined;
    /**
     * Tags on the pipeline.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon OpenSearch Ingestion (OSIS) pipeline — a managed Data Prepper
 * pipeline that ingests, transforms, and delivers data to OpenSearch domains,
 * serverless collections, or S3.
 *
 * Pipelines take roughly 5-10 minutes to provision and are billed per
 * Ingestion-OCU-hour while they exist (minimum 1 OCU). Destroy pipelines you
 * are not using.
 * ### Creating a Pipeline
 * **Example:** HTTP Source to S3 Sink
 * ```typescript
 * const pipeline = yield* Pipeline("Logs", {
 *   minUnits: 1,
 *   maxUnits: 1,
 *   pipelineConfigurationBody: Output.interpolate`version: "2"
 * log-pipeline:
 *   source:
 *     http:
 *       path: "/logs"
 *   sink:
 *     - s3:
 *         aws:
 *           sts_role_arn: "${role.roleArn}"
 *           region: "us-west-2"
 *         bucket: "${bucket.bucketName}"
 *         threshold:
 *           event_collect_timeout: "60s"
 *         codec:
 *           ndjson:
 * `,
 * });
 * ```
 *
 * **Example:** Pipeline with CloudWatch Logging
 * ```typescript
 * const pipeline = yield* Pipeline("Logs", {
 *   minUnits: 1,
 *   maxUnits: 2,
 *   pipelineConfigurationBody: configYaml,
 *   logPublishingOptions: {
 *     isLoggingEnabled: true,
 *     cloudWatchLogDestination: {
 *       logGroup: "/aws/vendedlogs/OpenSearchIngestion/logs",
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Pipeline: import("../../Resource.ts").ResourceClass<Pipeline>;
export declare const PipelineProvider: () => import("effect/Layer").Layer<Provider.Provider<Pipeline>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Pipeline.d.ts.map