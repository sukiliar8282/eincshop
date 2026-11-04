import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import { type S3Location } from "./Dataset.ts";
/** An S3 output target for a recipe job. */
export interface JobOutput {
    /** The S3 location the transformed data is written to. */
    location: S3Location;
    /** The output file format. @default "CSV" */
    format?: "CSV" | "JSON" | "PARQUET" | "GLUEPARQUET" | "AVRO" | "ORC" | "XML" | "TABLEAUHYPER" | (string & {});
    /** Compression applied to the output files. */
    compressionFormat?: "GZIP" | "LZ4" | "SNAPPY" | "BZIP2" | "DEFLATE" | "LZO" | "BROTLI" | "ZSTD" | "ZLIB" | (string & {});
    /** Columns to partition the output by. */
    partitionColumns?: string[];
    /** Overwrite previous output files on each run. @default false */
    overwrite?: boolean;
    /** Format-specific output options. */
    formatOptions?: {
        /** CSV output options. */
        csv?: {
            /** The single-character field delimiter. @default "," */
            delimiter?: string;
        };
    };
    /** Maximum number of output files. */
    maxOutputFiles?: number;
}
/** A pointer to the recipe (and version) a recipe job applies. */
export interface JobRecipeReference {
    /** The recipe name. */
    name: string;
    /**
     * The recipe version to run.
     * @default "LATEST_PUBLISHED"
     */
    recipeVersion?: string;
}
/** How much of the dataset a profile job analyzes. */
export interface JobSample {
    /** `FULL_DATASET` or `CUSTOM_ROWS`. @default "CUSTOM_ROWS" */
    mode?: "FULL_DATASET" | "CUSTOM_ROWS" | (string & {});
    /** Row count when mode is `CUSTOM_ROWS`. @default 20000 */
    size?: number;
}
/** Selects columns by exact name or regex. */
export interface ColumnSelector {
    /** A regular expression matching column names. */
    regex?: string;
    /** An exact column name. */
    name?: string;
}
/** Which statistics a profile job computes. */
export interface StatisticsConfiguration {
    /** Statistics to include (default: all supported). */
    includedStatistics?: string[];
    /** Per-statistic parameter overrides. */
    overrides?: {
        /** The statistic name. */
        statistic: string;
        /** Statistic parameters. */
        parameters: Record<string, string>;
    }[];
}
/** Fine-grained configuration for a profile job. */
export interface ProfileJobConfiguration {
    /** Dataset-level statistics configuration. */
    datasetStatisticsConfiguration?: StatisticsConfiguration;
    /** Restrict profiling to these columns. */
    profileColumns?: ColumnSelector[];
    /** Column-level statistics configurations. */
    columnStatisticsConfigurations?: {
        /** The columns the configuration applies to (default: all). */
        selectors?: ColumnSelector[];
        /** The statistics to compute for those columns. */
        statistics: StatisticsConfiguration;
    }[];
    /** PII entity detection configuration. */
    entityDetectorConfiguration?: {
        /** Entity types to detect, e.g. `["USA_SSN", "EMAIL"]`. */
        entityTypes: string[];
        /** Statistics allowed on detected-entity columns. */
        allowedStatistics?: {
            /** The allowed statistic names. */
            statistics: string[];
        }[];
    };
}
/** Attaches a ruleset to a profile job for data-quality validation. */
export interface ValidationConfiguration {
    /** The ARN of the ruleset to validate against. */
    rulesetArn: string;
    /** The validation mode. @default "CHECK_ALL" */
    validationMode?: "CHECK_ALL" | (string & {});
}
export interface JobProps {
    /**
     * Name of the job. If omitted, a unique name is generated. Changing the
     * name replaces the job.
     * @default a generated physical name
     */
    jobName?: string;
    /**
     * The job type: `PROFILE` analyzes a dataset and writes a data profile;
     * `RECIPE` applies a recipe's transformations and writes the output.
     * Changing the type replaces the job.
     */
    type: "PROFILE" | "RECIPE";
    /**
     * The dataset the job reads. Required for `PROFILE` jobs; for `RECIPE`
     * jobs provide either `datasetName` + `recipeReference` or `projectName`.
     * Changing it replaces the job.
     */
    datasetName?: string;
    /**
     * The IAM role ARN DataBrew assumes to run the job (read the input,
     * write the output).
     */
    role: string;
    /**
     * S3 location the profile results are written to (PROFILE jobs only).
     */
    outputLocation?: S3Location;
    /**
     * Fine-grained profiling configuration (PROFILE jobs only).
     */
    configuration?: ProfileJobConfiguration;
    /**
     * Rulesets to validate the data against (PROFILE jobs only).
     */
    validationConfigurations?: ValidationConfiguration[];
    /**
     * How much of the dataset to profile (PROFILE jobs only).
     * @default 20,000 rows
     */
    jobSample?: JobSample;
    /**
     * S3 outputs the transformed data is written to (RECIPE jobs only).
     */
    outputs?: JobOutput[];
    /**
     * The recipe to apply (RECIPE jobs only). Defaults to the recipe's latest
     * *published* version. Changing it replaces the job.
     */
    recipeReference?: JobRecipeReference;
    /**
     * Derive dataset + recipe from an existing DataBrew project instead of
     * `datasetName`/`recipeReference` (RECIPE jobs only). Changing it
     * replaces the job.
     */
    projectName?: string;
    /**
     * The encryption mode for job output: `SSE-KMS` or `SSE-S3`.
     */
    encryptionMode?: "SSE-KMS" | "SSE-S3";
    /**
     * The KMS key ARN when `encryptionMode` is `SSE-KMS`.
     */
    encryptionKeyArn?: string;
    /**
     * Enable CloudWatch logging for the job.
     * @default "ENABLE"
     */
    logSubscription?: "ENABLE" | "DISABLE";
    /**
     * Maximum number of compute nodes the job can consume.
     * @default 5
     */
    maxCapacity?: number;
    /**
     * Maximum retries after a job run fails.
     * @default 0
     */
    maxRetries?: number;
    /**
     * Job timeout, e.g. `"90 minutes"` or `Duration.hours(2)`. DataBrew
     * measures the timeout in whole minutes.
     * @default "48 hours"
     */
    timeout?: Duration.Input;
    /**
     * Tags to apply to the job. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Job extends Resource<"AWS.DataBrew.Job", JobProps, {
    /** Name of the job. */
    jobName: string;
    /** ARN of the job. */
    jobArn: string;
    /** Type of the job (`PROFILE` or `RECIPE`). */
    type: string;
}, {}, Providers> {
}
/**
 * An AWS Glue DataBrew job definition — either a `PROFILE` job that analyzes
 * a dataset and writes a data-quality profile to S3, or a `RECIPE` job that
 * applies a published recipe's transformations and writes the result to S3.
 * The definition is free and instant; job *runs* are billed per node-hour
 * and are started with `StartJobRun`.
 * ### Profile Jobs
 * **Example:** Profile a Dataset
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const profile = yield* AWS.DataBrew.Job("Profile", {
 *   type: "PROFILE",
 *   datasetName: dataset.datasetName,
 *   role: role.roleArn,
 *   outputLocation: { bucket: bucket.bucketName, key: "profiles/" },
 *   jobSample: { mode: "CUSTOM_ROWS", size: 1000 },
 * });
 * ```
 *
 * ### Recipe Jobs
 * **Example:** Transform with a Published Recipe
 * ```typescript
 * const transform = yield* AWS.DataBrew.Job("Transform", {
 *   type: "RECIPE",
 *   datasetName: dataset.datasetName,
 *   recipeReference: { name: recipe.recipeName },
 *   role: role.roleArn,
 *   outputs: [
 *     {
 *       location: { bucket: bucket.bucketName, key: "curated/" },
 *       format: "CSV",
 *       overwrite: true,
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Job: import("../../Resource.ts").ResourceClass<Job>;
declare const DataBrewJobConfigError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "DataBrewJobConfigError";
} & Readonly<A>;
/** The job's props don't satisfy the requirements of its `type`. */
export declare class DataBrewJobConfigError extends DataBrewJobConfigError_base<{
    message: string;
}> {
}
export declare const JobProvider: () => import("effect/Layer").Layer<Provider.Provider<Job>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Job.d.ts.map