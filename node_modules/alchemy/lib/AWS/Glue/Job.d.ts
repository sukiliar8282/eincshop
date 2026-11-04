import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface JobCommand {
    /**
     * The command name: `glueetl` (Spark), `pythonshell` (Python shell), or
     * `gluestreaming` (Spark streaming).
     */
    name: "glueetl" | "pythonshell" | "gluestreaming" | (string & {});
    /** The S3 path to the job script, e.g. `s3://my-bucket/scripts/job.py`. */
    scriptLocation?: string;
    /** For `pythonshell`, the Python version (`3` or `3.9`). */
    pythonVersion?: string;
    /** The Ray runtime version (for Ray jobs). */
    runtime?: string;
}
export interface JobProps {
    /**
     * Name of the job. If omitted, a unique name is generated. Changing the
     * name replaces the job.
     * @default a generated physical name
     */
    jobName?: string;
    /**
     * The IAM role (ARN or name) the job assumes to run.
     */
    role: string;
    /**
     * The job's execution command (script location + runtime).
     */
    command: JobCommand;
    /**
     * A description of the job.
     */
    description?: string;
    /**
     * Default arguments passed to the script (keys are `--`-prefixed), e.g.
     * `{ "--TempDir": "s3://.../tmp/", "--job-language": "python" }`.
     */
    defaultArguments?: Record<string, string>;
    /**
     * Arguments that cannot be overridden at run time.
     */
    nonOverridableArguments?: Record<string, string>;
    /**
     * Glue connection names the job uses.
     */
    connections?: string[];
    /**
     * Max retries before the job run is considered failed.
     */
    maxRetries?: number;
    /**
     * Job timeout, e.g. `"1 hour"` or `Duration.minutes(60)`. Rounded to
     * whole minutes on the wire (the Glue API unit).
     */
    timeout?: Duration.Input;
    /**
     * Max Glue data processing units (DPUs) for `pythonshell` (0.0625 or 1).
     * Mutually exclusive with `numberOfWorkers`/`workerType`.
     */
    maxCapacity?: number;
    /**
     * The Glue version (e.g. `4.0`, `3.0`).
     */
    glueVersion?: string;
    /**
     * The number of workers of `workerType` allocated (Spark jobs).
     */
    numberOfWorkers?: number;
    /**
     * The worker type for Spark jobs: `Standard`, `G.1X`, `G.2X`, `G.025X`,
     * `G.4X`, `G.8X`, `Z.2X`.
     */
    workerType?: string;
    /**
     * Execution class: `STANDARD` or `FLEX`.
     */
    executionClass?: "STANDARD" | "FLEX";
    /**
     * Concurrency configuration.
     */
    executionProperty?: {
        /** Maximum number of concurrent runs allowed. */
        maxConcurrentRuns?: number;
    };
    /**
     * Tags to apply to the job. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Job extends Resource<"AWS.Glue.Job", JobProps, {
    /** The name of the job. */
    jobName: string;
    /** The ARN of the job. */
    jobArn: string;
    /** The IAM role the job assumes to run. */
    role: string;
}, {}, Providers> {
}
/**
 * An AWS Glue job — a Spark (`glueetl`), Python shell (`pythonshell`), or
 * streaming ETL job definition (script in S3 + IAM role + arguments). The
 * definition lifecycle is instant and free; job *runs* are billed and are
 * started via `startJobRun`.
 * ### Creating Jobs
 * **Example:** Python Shell Job
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const job = yield* AWS.Glue.Job("Etl", {
 *   role: jobRole.roleArn,
 *   command: {
 *     name: "pythonshell",
 *     pythonVersion: "3.9",
 *     scriptLocation: "s3://my-bucket/scripts/etl.py",
 *   },
 *   maxCapacity: 0.0625,
 *   glueVersion: "3.0",
 *   defaultArguments: { "--job-language": "python" },
 * });
 * ```
 *
 * **Example:** Spark ETL Job
 * ```typescript
 * const job = yield* AWS.Glue.Job("SparkEtl", {
 *   role: jobRole.roleArn,
 *   command: {
 *     name: "glueetl",
 *     scriptLocation: "s3://my-bucket/scripts/spark.py",
 *   },
 *   glueVersion: "4.0",
 *   workerType: "G.1X",
 *   numberOfWorkers: 2,
 *   timeout: "1 hour",
 * });
 * ```
 *
 * ### Running Jobs
 * **Example:** Start a Job Run from a Lambda
 * ```typescript
 * // init
 * const startJobRun = yield* AWS.Glue.StartJobRun(job);
 *
 * // runtime
 * const { JobRunId } = yield* startJobRun({});
 * ```
 *
 * @resource
 */
export declare const Job: import("../../Resource.ts").ResourceClass<Job>;
export declare const JobProvider: () => import("effect/Layer").Layer<Provider.Provider<Job>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Job.d.ts.map