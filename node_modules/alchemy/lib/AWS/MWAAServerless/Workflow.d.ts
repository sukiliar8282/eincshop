import * as mwaa from "@distilled.cloud/aws/mwaa-serverless";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface WorkflowDefinitionS3Location {
    /**
     * Name of the S3 bucket that holds the workflow definition YAML file.
     */
    bucket: string;
    /**
     * Key of the workflow definition YAML object within the bucket.
     */
    objectKey: string;
    /**
     * Specific S3 object version of the definition to use. Omit to use the
     * latest version.
     */
    versionId?: string;
}
export interface WorkflowEncryptionConfiguration {
    /**
     * How workflow data is encrypted — `"AWS_MANAGED_KEY"` (the default) or
     * `"CUSTOMER_MANAGED_KEY"`.
     *
     * Encryption cannot be changed in place — changing it replaces the
     * workflow.
     * @default "AWS_MANAGED_KEY"
     */
    type: mwaa.EncryptionType;
    /**
     * ID or ARN of the customer managed KMS key to encrypt workflow data
     * with. Required when `type` is `"CUSTOMER_MANAGED_KEY"`.
     */
    kmsKeyId?: string;
}
export interface WorkflowLoggingConfiguration {
    /**
     * Name of the CloudWatch log group that receives task logs for the
     * workflow's runs.
     */
    logGroupName: string;
}
export interface WorkflowNetworkConfiguration {
    /**
     * Security group IDs applied to tasks that access resources inside your
     * VPC.
     */
    securityGroupIds?: string[];
    /**
     * Subnet IDs the workflow's tasks run in when accessing resources inside
     * your VPC.
     */
    subnetIds?: string[];
}
export interface WorkflowProps {
    /**
     * Name of the workflow. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID.
     *
     * Changing the name replaces the workflow.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * S3 location of the workflow definition — a YAML file that defines the
     * DAG structure using supported AWS operators.
     *
     * Updating the definition creates a new workflow version and disables
     * scheduling on all previous versions.
     */
    definitionS3Location: WorkflowDefinitionS3Location;
    /**
     * ARN of the IAM execution role that Amazon MWAA Serverless assumes to
     * run the workflow's tasks. The role's trust policy must allow the
     * `airflow-serverless.amazonaws.com` service principal to assume it.
     */
    roleArn: string;
    /**
     * Human-readable description of the workflow.
     */
    description?: string;
    /**
     * Encryption configuration for workflow data. Omit to use an AWS managed
     * key. Changing encryption replaces the workflow (it cannot be updated
     * in place).
     * @default AWS managed key
     */
    encryptionConfiguration?: WorkflowEncryptionConfiguration;
    /**
     * CloudWatch logging configuration for the workflow's task logs.
     */
    loggingConfiguration?: WorkflowLoggingConfiguration;
    /**
     * Version of the workflow definition engine.
     * @default 1
     */
    engineVersion?: mwaa.EngineVersion;
    /**
     * Network configuration for tasks that access resources inside your VPC.
     */
    networkConfiguration?: WorkflowNetworkConfiguration;
    /**
     * How workflow runs are triggered (for example on a schedule defined in
     * the workflow definition, or only on demand).
     */
    triggerMode?: string;
    /**
     * Tags to apply to the workflow. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Workflow extends Resource<"AWS.MWAAServerless.Workflow", WorkflowProps, {
    /** Name of the workflow. */
    name: string;
    /** ARN of the workflow. */
    workflowArn: string;
    /** Latest workflow version (a new version is published on each update). */
    workflowVersion: string | undefined;
    /** Current lifecycle status of the workflow. */
    workflowStatus: mwaa.WorkflowStatus | undefined;
    /** ARN of the IAM role the workflow's tasks assume. */
    roleArn: string | undefined;
    /** How runs are triggered (e.g. scheduled or on-demand). */
    triggerMode: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Managed Workflows for Apache Airflow **Serverless** workflow —
 * a serverless Airflow DAG defined by a YAML file in S3 and executed by
 * AWS-managed, multi-tenant Airflow infrastructure without provisioning an
 * environment.
 *
 * Each update to the definition or configuration creates a new workflow
 * version; MWAA Serverless keeps only the latest version actively
 * scheduled.
 * ### Creating a Workflow
 * **Example:** Basic Workflow
 * ```typescript
 * import * as MWAAServerless from "alchemy/AWS/MWAAServerless";
 * import * as IAM from "alchemy/AWS/IAM";
 *
 * const role = yield* IAM.Role("WorkflowRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "airflow-serverless.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 * });
 *
 * const workflow = yield* MWAAServerless.Workflow("Etl", {
 *   definitionS3Location: {
 *     bucket: "my-dag-bucket",
 *     objectKey: "workflows/etl.yaml",
 *   },
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Workflow with Logging and Tags
 * ```typescript
 * const workflow = yield* MWAAServerless.Workflow("Etl", {
 *   definitionS3Location: {
 *     bucket: "my-dag-bucket",
 *     objectKey: "workflows/etl.yaml",
 *   },
 *   roleArn: role.roleArn,
 *   description: "nightly ETL",
 *   loggingConfiguration: { logGroupName: "/mwaa-serverless/etl" },
 *   tags: { team: "data" },
 * });
 * ```
 *
 * @resource
 */
export declare const Workflow: import("../../Resource.ts").ResourceClass<Workflow>;
export declare const WorkflowProvider: () => import("effect/Layer").Layer<Provider.Provider<Workflow>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Workflow.d.ts.map