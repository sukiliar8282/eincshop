import * as analytics from "@distilled.cloud/aws/kinesis-analytics-v2";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * Runtime environment of a Managed Service for Apache Flink application,
 * e.g. `"FLINK-1_20"`.
 */
export type RuntimeEnvironment = analytics.RuntimeEnvironment;
/**
 * Lifecycle status of the application.
 */
export type ApplicationStatus = analytics.ApplicationStatus;
/**
 * Mode of the application. `STREAMING` runs the packaged Flink job;
 * `INTERACTIVE` backs a Studio (Zeppelin) notebook.
 */
export type ApplicationMode = "STREAMING" | "INTERACTIVE";
export interface ApplicationCodeProps {
    /**
     * ARN of the S3 bucket that contains the application code package
     * (a zip/jar built for the configured Flink runtime).
     */
    bucketArn: string;
    /**
     * Object key of the application code package within the bucket.
     */
    fileKey: string;
    /**
     * Version of the S3 object containing the application code.
     * @default the latest object version
     */
    objectVersion?: string;
}
export interface CheckpointConfigurationProps {
    /**
     * Whether to use the `DEFAULT` Flink checkpointing behavior or the
     * `CUSTOM` values supplied in this configuration.
     */
    configurationType: "DEFAULT" | "CUSTOM";
    /**
     * Whether checkpointing is enabled. Only used with `CUSTOM`.
     */
    checkpointingEnabled?: boolean;
    /**
     * Interval between checkpoints, e.g. `"1 minute"` or
     * `Duration.seconds(30)`. The API stores whole milliseconds. Only used
     * with `CUSTOM`.
     */
    checkpointInterval?: Duration.Input;
    /**
     * Minimum pause between checkpoint operations, e.g. `"5 seconds"`. The
     * API stores whole milliseconds. Only used with `CUSTOM`.
     */
    minPauseBetweenCheckpoints?: Duration.Input;
}
export interface MonitoringConfigurationProps {
    /**
     * Whether to use the `DEFAULT` monitoring behavior or the `CUSTOM`
     * values supplied in this configuration.
     */
    configurationType: "DEFAULT" | "CUSTOM";
    /**
     * Granularity of the CloudWatch metrics emitted by the application.
     * Only used with `CUSTOM`.
     */
    metricsLevel?: "APPLICATION" | "TASK" | "OPERATOR" | "PARALLELISM";
    /**
     * Log verbosity of the application. Only used with `CUSTOM`.
     */
    logLevel?: "INFO" | "WARN" | "ERROR" | "DEBUG";
}
export interface ParallelismConfigurationProps {
    /**
     * Whether to use the `DEFAULT` parallelism behavior or the `CUSTOM`
     * values supplied in this configuration.
     */
    configurationType: "DEFAULT" | "CUSTOM";
    /**
     * Initial number of parallel tasks the application can perform.
     * Only used with `CUSTOM`.
     */
    parallelism?: number;
    /**
     * Number of parallel tasks per Kinesis Processing Unit.
     * Only used with `CUSTOM`.
     */
    parallelismPerKPU?: number;
    /**
     * Whether the service automatically scales the application's parallelism.
     * Only used with `CUSTOM`.
     */
    autoScalingEnabled?: boolean;
}
export interface FlinkConfigurationProps {
    /**
     * Checkpointing (fault tolerance) settings for the Flink job.
     */
    checkpointConfiguration?: CheckpointConfigurationProps;
    /**
     * CloudWatch metrics/logging verbosity settings for the Flink job.
     */
    monitoringConfiguration?: MonitoringConfigurationProps;
    /**
     * Parallelism (KPU scaling) settings for the Flink job.
     */
    parallelismConfiguration?: ParallelismConfigurationProps;
}
export interface PropertyGroupProps {
    /**
     * Identifier of the property group, e.g. `"kinesis.analytics.flink.run.options"`
     * or an application-defined group name.
     */
    propertyGroupId: string;
    /**
     * Key-value runtime properties exposed to the application through this group.
     */
    propertyMap: Record<string, string>;
}
export interface ApplicationVpcProps {
    /**
     * IDs of the subnets the application's ENIs are placed in.
     */
    subnetIds: string[];
    /**
     * IDs of the security groups attached to the application's ENIs.
     */
    securityGroupIds: string[];
}
export interface ApplicationProps {
    /**
     * Name of the application. Changing the name replaces the application.
     * @default ${app}-${id}-${stage}-${instanceId}
     */
    applicationName?: string;
    /**
     * Description of the application. The API offers no way to change the
     * description in place, so changing it replaces the application.
     */
    description?: string;
    /**
     * Runtime environment of the application, e.g. `"FLINK-1_20"`.
     * Updated in place (Flink version upgrade).
     */
    runtimeEnvironment: RuntimeEnvironment;
    /**
     * Mode of the application. Changing the mode replaces the application.
     * @default "STREAMING"
     */
    applicationMode?: ApplicationMode;
    /**
     * ARN of the IAM role the service assumes to read the code object and
     * access sources/sinks.
     * @default a role is auto-created granting read access to the code
     * bucket, CloudWatch Logs delivery, and (when `vpc` is set) the EC2
     * permissions required to manage the application's network interfaces.
     */
    serviceExecutionRole?: string;
    /**
     * Location of the application code package (zip/jar) in S3.
     */
    code: ApplicationCodeProps;
    /**
     * Runtime properties exposed to the application as property groups.
     */
    environmentProperties?: PropertyGroupProps[];
    /**
     * Flink-specific settings (checkpointing, monitoring, parallelism).
     */
    flinkConfiguration?: FlinkConfigurationProps;
    /**
     * Whether snapshots (savepoints) are enabled for the application.
     * @default false
     */
    snapshotsEnabled?: boolean;
    /**
     * VPC configuration. When set the application's ENIs are placed in the
     * given subnets so the Flink job can reach VPC-private resources.
     */
    vpc?: ApplicationVpcProps;
    /**
     * Whether the application should be running. When `true` the reconciler
     * starts the application and waits for `RUNNING`; when `false` (default)
     * a running application is force-stopped back to `READY`.
     *
     * Starting requires the code object to be a real Flink application jar —
     * a placeholder zip passes creation but fails to start.
     * @default false
     */
    start?: boolean;
    /**
     * Start of the 8-hour daily window in which the service may apply
     * maintenance (patching) to the application, as `"HH:mm"` UTC — e.g.
     * `"02:00"`. When omitted the service-assigned window is left unchanged.
     */
    maintenanceWindowStartTime?: string;
    /**
     * Tags to apply to the application.
     */
    tags?: Record<string, string>;
}
export interface Application extends Resource<"AWS.KinesisAnalyticsV2.Application", ApplicationProps, {
    /**
     * Physical name of the application.
     */
    applicationName: string;
    /**
     * ARN of the application.
     */
    applicationArn: string;
    /**
     * Current lifecycle status of the application.
     */
    applicationStatus: ApplicationStatus;
    /**
     * Current version of the application's configuration. Incremented by
     * every configuration update.
     */
    applicationVersionId: number;
    /**
     * Runtime environment of the application.
     */
    runtimeEnvironment: RuntimeEnvironment;
    /**
     * Mode of the application.
     */
    applicationMode: ApplicationMode | undefined;
    /**
     * ARN of the IAM role the service assumes.
     */
    serviceExecutionRole: string | undefined;
    /**
     * Name of the auto-created IAM role, when one was synthesized for this
     * application. `undefined` when the caller supplied `serviceExecutionRole`.
     */
    roleName: string | undefined;
    /**
     * ID of the application's VPC configuration, when one is attached.
     */
    vpcConfigurationId: string | undefined;
    /**
     * ARN of the S3 bucket currently holding the application code.
     */
    codeBucketArn: string | undefined;
    /**
     * Object key of the application code currently configured.
     */
    codeFileKey: string | undefined;
    /**
     * Object version of the application code currently configured.
     */
    codeObjectVersion: string | undefined;
    /**
     * Start of the daily maintenance window currently configured, as
     * `"HH:mm"` UTC.
     */
    maintenanceWindowStartTime: string | undefined;
    /**
     * End of the daily maintenance window currently configured, as
     * `"HH:mm"` UTC (always 8 hours after the start).
     */
    maintenanceWindowEndTime: string | undefined;
    /**
     * Current tags reported for the application.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A Managed Service for Apache Flink (Kinesis Data Analytics v2)
 * application.
 *
 * `Application` owns the application definition — runtime environment, code
 * location in S3, runtime properties, Flink settings, optional VPC
 * connectivity and tags — and converges each aspect in place via
 * `UpdateApplication`. Unless you supply `serviceExecutionRole`, an IAM role
 * is auto-created granting the service read access to the code bucket and
 * CloudWatch Logs delivery.
 *
 * The application is created in `READY` and does not run (or bill KPUs)
 * until started. Set `start: true` to have the reconciler start the job and
 * wait for `RUNNING` — this requires the code object to be a real Flink
 * application jar.
 * ### Creating Applications
 * **Example:** Flink application from S3 code
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const bucket = yield* AWS.S3.Bucket("FlinkCode");
 * const app = yield* AWS.KinesisAnalyticsV2.Application("Enrichment", {
 *   runtimeEnvironment: "FLINK-1_20",
 *   code: {
 *     bucketArn: bucket.bucketArn,
 *     fileKey: "jobs/enrichment-1.0.jar",
 *   },
 * });
 * ```
 *
 * **Example:** Runtime properties and parallelism
 * ```typescript
 * const app = yield* AWS.KinesisAnalyticsV2.Application("Enrichment", {
 *   runtimeEnvironment: "FLINK-1_20",
 *   code: { bucketArn: bucket.bucketArn, fileKey: "jobs/enrichment-1.0.jar" },
 *   environmentProperties: [
 *     {
 *       propertyGroupId: "EnrichmentProperties",
 *       propertyMap: { "input.stream": "clickstream", "region": "us-west-2" },
 *     },
 *   ],
 *   flinkConfiguration: {
 *     parallelismConfiguration: {
 *       configurationType: "CUSTOM",
 *       parallelism: 2,
 *       parallelismPerKPU: 1,
 *       autoScalingEnabled: false,
 *     },
 *   },
 *   snapshotsEnabled: true,
 * });
 * ```
 *
 * ### VPC Connectivity
 * **Example:** Place the application in a VPC
 * ```typescript
 * const app = yield* AWS.KinesisAnalyticsV2.Application("Enrichment", {
 *   runtimeEnvironment: "FLINK-1_20",
 *   code: { bucketArn: bucket.bucketArn, fileKey: "jobs/enrichment-1.0.jar" },
 *   vpc: {
 *     subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *     securityGroupIds: [sg.securityGroupId],
 *   },
 * });
 * ```
 *
 * ### Maintenance Window
 * **Example:** Pin the daily maintenance window
 * ```typescript
 * const app = yield* AWS.KinesisAnalyticsV2.Application("Enrichment", {
 *   runtimeEnvironment: "FLINK-1_20",
 *   code: { bucketArn: bucket.bucketArn, fileKey: "jobs/enrichment-1.0.jar" },
 *   maintenanceWindowStartTime: "02:00",
 * });
 * ```
 *
 * ### Running the Application
 * **Example:** Start the Flink job and keep it running
 * ```typescript
 * const app = yield* AWS.KinesisAnalyticsV2.Application("Enrichment", {
 *   runtimeEnvironment: "FLINK-1_20",
 *   code: { bucketArn: bucket.bucketArn, fileKey: "jobs/enrichment-1.0.jar" },
 *   start: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
declare const ApplicationValidationError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ApplicationValidationError";
} & Readonly<A>;
/**
 * Validation error raised before any AWS call when the props are invalid.
 */
export declare class ApplicationValidationError extends ApplicationValidationError_base<{
    readonly message: string;
}> {
}
declare const ApplicationNotStable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ApplicationNotStable";
} & Readonly<A>;
/**
 * The application did not settle into a stable status (READY / RUNNING /
 * ROLLED_BACK) within the bounded wait.
 */
export declare class ApplicationNotStable extends ApplicationNotStable_base<{
    readonly applicationName: string;
    readonly status: string;
}> {
}
declare const ApplicationStartFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "ApplicationStartFailed";
} & Readonly<A>;
/**
 * `start: true` was requested but the application failed to reach `RUNNING`
 * — either the start rolled back (bad jar, bad configuration) or the
 * bounded wait elapsed.
 */
export declare class ApplicationStartFailed extends ApplicationStartFailed_base<{
    readonly applicationName: string;
    readonly status: string;
}> {
}
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Application.d.ts.map