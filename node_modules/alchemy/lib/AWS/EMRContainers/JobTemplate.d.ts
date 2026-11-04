import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface JobTemplateSparkSubmitJobDriver {
    /**
     * The entry point of the Spark application — an S3 URI to a jar or Python
     * script (e.g. `s3://my-bucket/scripts/etl.py`).
     */
    entryPoint: string;
    /**
     * Arguments passed to the entry point.
     */
    entryPointArguments?: string[];
    /**
     * `spark-submit` parameters (e.g. `--conf spark.executor.instances=2`).
     */
    sparkSubmitParameters?: string;
}
export interface JobTemplateSparkSqlJobDriver {
    /**
     * The S3 URI of the SQL file to execute.
     */
    entryPoint?: string;
    /**
     * Spark SQL parameters.
     */
    sparkSqlParameters?: string;
}
export interface JobTemplateJobDriver {
    /**
     * The Spark submit job driver.
     */
    sparkSubmitJobDriver?: JobTemplateSparkSubmitJobDriver;
    /**
     * The Spark SQL job driver.
     */
    sparkSqlJobDriver?: JobTemplateSparkSqlJobDriver;
}
export interface JobTemplateConfiguration {
    /**
     * The classification of the configuration (e.g. `spark-defaults`).
     */
    classification: string;
    /**
     * Configuration properties for the classification.
     */
    properties?: Record<string, string>;
    /**
     * Nested configurations.
     */
    configurations?: JobTemplateConfiguration[];
}
export interface JobTemplateMonitoringConfiguration {
    /**
     * Whether the persistent application UI (Spark history server) is enabled.
     */
    persistentAppUI?: "ENABLED" | "DISABLED" | (string & {});
    /**
     * CloudWatch log delivery for the job's containers.
     */
    cloudWatchMonitoringConfiguration?: {
        /** The CloudWatch log group to deliver logs to. */
        logGroupName?: string;
        /** A prefix for the log stream names. */
        logStreamNamePrefix?: string;
    };
    /**
     * S3 log delivery for the job's containers.
     */
    s3MonitoringConfiguration?: {
        /** The S3 URI to deliver logs to. */
        logUri?: string;
    };
}
export interface JobTemplateConfigurationOverrides {
    /**
     * Application configurations (Spark/Hadoop classification properties).
     */
    applicationConfiguration?: JobTemplateConfiguration[];
    /**
     * Monitoring (log delivery) configuration.
     */
    monitoringConfiguration?: JobTemplateMonitoringConfiguration;
}
export interface JobTemplateParameterConfiguration {
    /**
     * The data type of the template parameter.
     * @default "STRING"
     */
    type?: "NUMBER" | "STRING" | (string & {});
    /**
     * The default value used when `StartJobRun` omits the parameter.
     */
    defaultValue?: string;
}
export interface JobTemplateDataProps {
    /**
     * The IAM execution role ARN the job runs as. May reference template
     * parameters (e.g. `${ExecutionRoleArn}`).
     */
    executionRoleArn: string;
    /**
     * The EMR release label (e.g. `emr-7.5.0-latest`).
     */
    releaseLabel: string;
    /**
     * Configuration overrides applied to jobs started from the template.
     */
    configurationOverrides?: JobTemplateConfigurationOverrides;
    /**
     * The job driver (Spark submit or Spark SQL) for jobs started from the
     * template.
     */
    jobDriver: JobTemplateJobDriver;
    /**
     * Declares the `${placeholders}` used in the template and their types /
     * default values.
     */
    parameterConfiguration?: Record<string, JobTemplateParameterConfiguration>;
    /**
     * Tags applied to the *job runs* started from this template (distinct from
     * the template's own `tags`).
     */
    jobTags?: Record<string, string>;
}
export interface JobTemplateProps {
    /**
     * Name of the job template (1-64 characters). Changing the name replaces
     * the job template.
     * @default a generated physical name
     */
    jobTemplateName?: string;
    /**
     * The StartJobRun values the template stores. Job templates are immutable —
     * any change replaces the template.
     */
    jobTemplateData: JobTemplateDataProps;
    /**
     * The KMS key ARN used to encrypt the template. Changing it replaces the
     * job template.
     */
    kmsKeyArn?: string;
    /**
     * Tags to apply to the job template. Merged with the internal Alchemy
     * tags. Tags are set at creation only — the EMR containers `TagResource`
     * API rejects job template ARNs (typed `InvalidResourceArn`), so changing
     * tags replaces the template.
     */
    tags?: Record<string, string>;
}
export interface JobTemplate extends Resource<"AWS.EMRContainers.JobTemplate", JobTemplateProps, {
    /** The ID of the job template. */
    jobTemplateId: string;
    /** The name of the job template. */
    jobTemplateName: string;
    /** The ARN of the job template. */
    jobTemplateArn: string;
}, {}, Providers> {
}
declare const JobTemplateConsistencyError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "JobTemplateConsistencyError";
} & Readonly<A>;
export declare class JobTemplateConsistencyError extends JobTemplateConsistencyError_base<{
    readonly jobTemplateId: string;
    readonly jobTemplateName: string;
    readonly operation: "create" | "delete";
    readonly message: string;
}> {
}
/**
 * An Amazon EMR on EKS job template — a stored set of `StartJobRun` values
 * (execution role, release label, job driver, configuration) that can be
 * referenced by ID when starting job runs, optionally with `${placeholder}`
 * parameters filled in per run.
 *
 * Job templates are account-level and fully immutable: any change (including
 * tags, which the tagging API does not support post-create for templates)
 * replaces the template. They pair with the
 * {@link StartJobRun | AWS.EMRContainers.StartJobRun} binding — a Lambda can
 * start a templated Spark job with just the template ID and parameter values.
 *
 * ### Creating Job Templates
 * **Example:** A Spark Job Template
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const template = yield* AWS.EMRContainers.JobTemplate("EtlTemplate", {
 *   jobTemplateData: {
 *     executionRoleArn: jobRole.roleArn,
 *     releaseLabel: "emr-7.5.0-latest",
 *     jobDriver: {
 *       sparkSubmitJobDriver: {
 *         entryPoint: "s3://my-bucket/scripts/etl.py",
 *         sparkSubmitParameters: "--conf spark.executor.instances=2",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Parameterized Template
 * ```typescript
 * const template = yield* AWS.EMRContainers.JobTemplate("Parameterized", {
 *   jobTemplateData: {
 *     executionRoleArn: jobRole.roleArn,
 *     releaseLabel: "emr-7.5.0-latest",
 *     jobDriver: {
 *       sparkSubmitJobDriver: { entryPoint: "${EntryPoint}" },
 *     },
 *     parameterConfiguration: {
 *       EntryPoint: { type: "STRING" },
 *     },
 *   },
 * });
 * // StartJobRun with jobTemplateId + jobTemplateParameters: { EntryPoint: "s3://..." }
 * ```
 *
 * @resource
 */
export declare const JobTemplate: import("../../Resource.ts").ResourceClass<JobTemplate>;
export declare const JobTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<JobTemplate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=JobTemplate.d.ts.map