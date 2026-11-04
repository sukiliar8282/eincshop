import * as emr from "@distilled.cloud/aws/emr-serverless";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * The engine an EMR Serverless application runs. Changing the type replaces
 * the application.
 */
export type ApplicationType = "SPARK" | "HIVE";
/**
 * Auto-stop behavior for an EMR Serverless {@link Application}.
 */
export interface AutoStopConfiguration {
    /**
     * Whether the application stops automatically after being idle.
     * @default true
     */
    enabled?: boolean;
    /**
     * Idle time after which the application stops automatically — e.g.
     * `"5 minutes"` or `Duration.minutes(5)`. Sent to AWS as whole minutes.
     * @default "15 minutes"
     */
    idleTimeout?: Duration.Input;
}
export interface ApplicationProps {
    /**
     * Name of the application (1-64 characters: letters, digits, `.` `_` `/`
     * `#` `-`). Changing the name replaces the application.
     * @default a generated physical name
     */
    applicationName?: string;
    /**
     * The engine type. Changing the type replaces the application.
     * @default "SPARK"
     */
    type?: ApplicationType;
    /**
     * The Amazon EMR release associated with the application, e.g.
     * `emr-7.9.0`. Updatable in place (the application must be in a `CREATED`
     * or `STOPPED` state; the provider stops a `STARTED` application before
     * applying the update).
     */
    releaseLabel: string;
    /**
     * The CPU architecture of the application.
     * @default "X86_64"
     */
    architecture?: "X86_64" | "ARM64";
    /**
     * Pre-initialized capacity kept warm per worker type (e.g. `Driver` and
     * `Executor` for Spark; `HiveDriver` and `TezTask` for Hive). Warm workers
     * bill while the application is started.
     */
    initialCapacity?: Record<string, emr.InitialCapacityConfig>;
    /**
     * The maximum aggregate vCPU, memory and disk the application may scale to.
     */
    maximumCapacity?: emr.MaximumAllowedResources;
    /**
     * Whether the application starts automatically on job submission.
     * @default enabled
     */
    autoStartConfiguration?: emr.AutoStartConfig;
    /**
     * Whether (and after how long idle) the application stops
     * automatically.
     * @default enabled after 15 idle minutes
     */
    autoStopConfiguration?: AutoStopConfiguration;
    /**
     * VPC connectivity (subnet + security group IDs) for jobs that must reach
     * resources in a VPC. Omit for the default non-VPC connectivity.
     */
    networkConfiguration?: emr.NetworkConfiguration;
    /**
     * Tags to apply to the application. Merged with the internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Application extends Resource<"AWS.EMRServerless.Application", ApplicationProps, {
    /** The ID of the application. */
    applicationId: string;
    /** The name of the application. */
    applicationName: string;
    /** The ARN of the application. */
    applicationArn: string;
    /** The application type (`SPARK` or `HIVE`). */
    type: string;
    /** The EMR release label the application runs (e.g. `emr-7.5.0`). */
    releaseLabel: string;
    /** The application state (e.g. `CREATED`, `STARTED`, `STOPPED`). */
    state?: string;
}, {}, Providers> {
}
/**
 * An Amazon EMR Serverless application — a serverless Spark or Hive
 * environment that automatically provisions and scales workers per job,
 * with no cluster to manage. An application in the `CREATED` or `STOPPED`
 * state costs nothing; billing only occurs for workers while the application
 * is started (including any pre-initialized `initialCapacity`).
 *
 * ### Creating Applications
 * **Example:** Spark Application
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const app = yield* AWS.EMRServerless.Application("Spark", {
 *   releaseLabel: "emr-7.9.0",
 * });
 * // app.applicationId is passed to StartJobRun
 * ```
 *
 * **Example:** Hive Application with Auto-Stop Tuning
 * ```typescript
 * const app = yield* AWS.EMRServerless.Application("Hive", {
 *   type: "HIVE",
 *   releaseLabel: "emr-7.9.0",
 *   autoStartConfiguration: { enabled: true },
 *   autoStopConfiguration: { enabled: true, idleTimeout: "5 minutes" },
 * });
 * ```
 *
 * ### Capacity
 * **Example:** Pre-Initialized Capacity for Low-Latency Jobs
 * ```typescript
 * const app = yield* AWS.EMRServerless.Application("Warm", {
 *   releaseLabel: "emr-7.9.0",
 *   initialCapacity: {
 *     Driver: {
 *       workerCount: 1,
 *       workerConfiguration: { cpu: "2 vCPU", memory: "4 GB" },
 *     },
 *     Executor: {
 *       workerCount: 2,
 *       workerConfiguration: { cpu: "2 vCPU", memory: "4 GB" },
 *     },
 *   },
 *   maximumCapacity: { cpu: "16 vCPU", memory: "64 GB" },
 * });
 * ```
 *
 * ### Networking
 * **Example:** VPC-Connected Application
 * ```typescript
 * const app = yield* AWS.EMRServerless.Application("InVpc", {
 *   releaseLabel: "emr-7.9.0",
 *   networkConfiguration: {
 *     subnetIds: [subnet.subnetId],
 *     securityGroupIds: [securityGroup.securityGroupId],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Application: import("../../Resource.ts").ResourceClass<Application>;
export declare const ApplicationProvider: () => import("effect/Layer").Layer<Provider.Provider<Application>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Application.d.ts.map