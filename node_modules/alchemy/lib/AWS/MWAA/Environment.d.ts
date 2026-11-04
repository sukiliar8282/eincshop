import * as Redacted from "effect/Redacted";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Per-module CloudWatch logging configuration for an MWAA {@link Environment}.
 */
export interface ModuleLoggingConfig {
    /**
     * Whether this Airflow log group is published to CloudWatch Logs.
     */
    enabled: boolean;
    /**
     * Airflow log level — one of `CRITICAL`, `ERROR`, `WARNING`, `INFO`, `DEBUG`.
     */
    logLevel: string;
}
/**
 * CloudWatch logging configuration for the five Airflow log groups of an MWAA
 * {@link Environment}. Any group left unset is disabled.
 */
export interface EnvironmentLoggingConfig {
    /** DAG processing logs. */
    dagProcessingLogs?: ModuleLoggingConfig;
    /** Scheduler logs. */
    schedulerLogs?: ModuleLoggingConfig;
    /** Webserver logs. */
    webserverLogs?: ModuleLoggingConfig;
    /** Worker logs. */
    workerLogs?: ModuleLoggingConfig;
    /** Task logs. */
    taskLogs?: ModuleLoggingConfig;
}
export interface EnvironmentProps {
    /**
     * Name of the environment (1-80 chars, must start with a letter). If omitted,
     * a deterministic physical name is generated. Changing the name replaces the
     * environment.
     */
    environmentName?: string;
    /**
     * ARN of the IAM execution role Amazon MWAA and Apache Airflow assume to
     * access AWS resources (the DAGs bucket, CloudWatch, SQS, KMS). Updateable
     * in place.
     */
    executionRoleArn: string;
    /**
     * ARN of the S3 bucket that holds your DAG code, `requirements.txt`, plugins,
     * and startup script. The bucket must block public access and have
     * versioning enabled. Updateable in place.
     */
    sourceBucketArn: string;
    /**
     * Relative path (within the source bucket) to the folder containing your DAG
     * files, e.g. `"dags"`. Updateable in place.
     */
    dagS3Path: string;
    /**
     * The private subnet IDs (exactly two, in distinct Availability Zones) the
     * environment's webserver, scheduler, and workers run in. Changing the
     * subnets replaces the environment.
     */
    subnetIds: string[];
    /**
     * VPC security group IDs applied to the environment's network interfaces.
     * Updateable in place.
     * @default a security group created for the environment
     */
    securityGroupIds?: string[];
    /**
     * Apache Airflow version, e.g. `"2.10.3"`. Downgrades are not permitted.
     * @default the latest version supported by MWAA
     */
    airflowVersion?: string;
    /**
     * Environment class (sizing), e.g. `"mw1.small"`, `"mw1.medium"`,
     * `"mw1.large"`. Updateable in place.
     * @default "mw1.small"
     */
    environmentClass?: string;
    /**
     * Maximum number of Airflow workers to scale up to. Updateable in place.
     * @default 10
     */
    maxWorkers?: number;
    /**
     * Minimum number of Airflow workers. Updateable in place.
     * @default 1
     */
    minWorkers?: number;
    /**
     * Maximum number of Airflow web servers (Airflow 2.2.2+). Updateable in
     * place.
     */
    maxWebservers?: number;
    /**
     * Minimum number of Airflow web servers (Airflow 2.2.2+). Updateable in
     * place.
     */
    minWebservers?: number;
    /**
     * Number of Airflow schedulers. Updateable in place.
     */
    schedulers?: number;
    /**
     * Apache Airflow web server access mode — `PRIVATE_ONLY` (VPC-only endpoint)
     * or `PUBLIC_ONLY` (internet-accessible). Updateable in place.
     * @default "PRIVATE_ONLY"
     */
    webserverAccessMode?: string;
    /**
     * Day and time of the weekly 30-minute maintenance window in
     * `DAY:HH:MM` (UTC), e.g. `"MON:03:30"`. Updateable in place.
     */
    weeklyMaintenanceWindowStart?: string;
    /**
     * ARN or key ID of the customer-managed KMS key used to encrypt data.
     * Changing the key replaces the environment.
     * @default an AWS-owned key
     */
    kmsKey?: string;
    /**
     * Whether the VPC endpoints for the environment are managed by MWAA
     * (`SERVICE`) or by you (`CUSTOMER`). Changing this replaces the environment.
     * @default "SERVICE"
     */
    endpointManagement?: string;
    /**
     * Apache Airflow configuration overrides, keyed by
     * `section.option`, e.g. `{ "core.default_task_retries": "3" }`. Values
     * carrying secrets (SMTP passwords, connection URIs, …) may be passed as
     * `Redacted.Redacted<string>` so they never appear in logs. Updateable in
     * place.
     */
    airflowConfigurationOptions?: Record<string, string | Redacted.Redacted<string>>;
    /**
     * Relative path to the plugins `.zip` in the source bucket. Updateable in
     * place.
     */
    pluginsS3Path?: string;
    /**
     * S3 object version of the plugins `.zip`. Updateable in place.
     */
    pluginsS3ObjectVersion?: string;
    /**
     * Relative path to `requirements.txt` in the source bucket. Updateable in
     * place.
     */
    requirementsS3Path?: string;
    /**
     * S3 object version of `requirements.txt`. Updateable in place.
     */
    requirementsS3ObjectVersion?: string;
    /**
     * Relative path to the startup shell script in the source bucket. Updateable
     * in place.
     */
    startupScriptS3Path?: string;
    /**
     * S3 object version of the startup script. Updateable in place.
     */
    startupScriptS3ObjectVersion?: string;
    /**
     * CloudWatch logging configuration for the five Airflow log groups.
     * Updateable in place.
     */
    loggingConfiguration?: EnvironmentLoggingConfig;
    /**
     * User-defined tags for the environment.
     */
    tags?: Record<string, string>;
}
export interface Environment extends Resource<"AWS.MWAA.Environment", EnvironmentProps, {
    /** Name of the environment. */
    environmentName: string;
    /** ARN of the environment. */
    arn: string;
    /** Current lifecycle status (e.g. `CREATING`, `AVAILABLE`). */
    status: string;
    /** Host name of the Airflow web server UI. */
    webserverUrl: string | undefined;
    /** ARN of the execution role Airflow tasks run as. */
    executionRoleArn: string | undefined;
    /** ARN of the service-linked role MWAA uses to manage the environment. */
    serviceRoleArn: string | undefined;
    /** Running Apache Airflow version. */
    airflowVersion: string | undefined;
    /** Environment size class (e.g. `mw1.small`). */
    environmentClass: string | undefined;
    /** ARN of the S3 bucket holding DAG code. */
    sourceBucketArn: string | undefined;
    /** Relative S3 path to the DAGs folder. */
    dagS3Path: string | undefined;
    /** Celery executor queue used by the environment's workers. */
    celeryExecutorQueue: string | undefined;
    /** VPC endpoint service name for the Airflow metadata database. */
    databaseVpcEndpointService: string | undefined;
    /** VPC endpoint service name for the Airflow web server. */
    webserverVpcEndpointService: string | undefined;
    /** Tags on the environment (user + internal Alchemy tags). */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon Managed Workflows for Apache Airflow (MWAA) environment — a fully
 * managed Apache Airflow deployment that runs your DAGs.
 *
 * Environments take roughly 20-30 minutes to create and are billed hourly for
 * the environment, workers, and schedulers while they exist. Each environment
 * needs an S3 bucket for DAG code (versioned, public access blocked), an IAM
 * execution role, and two private subnets in distinct Availability Zones with
 * outbound internet access (via NAT gateway or VPC endpoints). Destroy
 * environments you are not using.
 * ### Creating an Environment
 * **Example:** Basic Environment
 * ```typescript
 * const environment = yield* Environment("Airflow", {
 *   executionRoleArn: role.roleArn,
 *   sourceBucketArn: bucket.bucketArn,
 *   dagS3Path: "dags",
 *   subnetIds: [privateSubnetA.subnetId, privateSubnetB.subnetId],
 *   airflowVersion: "2.10.3",
 *   environmentClass: "mw1.small",
 *   maxWorkers: 5,
 * });
 * ```
 *
 * **Example:** Public Webserver with Logging
 * ```typescript
 * const environment = yield* Environment("Airflow", {
 *   executionRoleArn: role.roleArn,
 *   sourceBucketArn: bucket.bucketArn,
 *   dagS3Path: "dags",
 *   subnetIds: [privateSubnetA.subnetId, privateSubnetB.subnetId],
 *   webserverAccessMode: "PUBLIC_ONLY",
 *   loggingConfiguration: {
 *     schedulerLogs: { enabled: true, logLevel: "INFO" },
 *     workerLogs: { enabled: true, logLevel: "INFO" },
 *     taskLogs: { enabled: true, logLevel: "INFO" },
 *   },
 *   airflowConfigurationOptions: {
 *     "core.default_task_retries": "3",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Environment: import("../../Resource.ts").ResourceClass<Environment>;
export declare const EnvironmentProvider: () => import("effect/Layer").Layer<Provider.Provider<Environment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Environment.d.ts.map