import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Whether the classification job runs once (`ONE_TIME`) or on a recurring
 * schedule (`SCHEDULED`).
 */
export type JobType = "ONE_TIME" | "SCHEDULED";
/**
 * How Macie selects managed data identifiers for the job.
 */
export type ManagedDataIdentifierSelector = "ALL" | "EXCLUDE" | "INCLUDE" | "NONE" | "RECOMMENDED";
/**
 * A set of S3 buckets (within one account) that the job analyzes.
 */
export interface BucketDefinition {
    /** The account that owns the buckets. */
    accountId: string;
    /** The names of the buckets to analyze. */
    buckets: string[];
}
export interface ClassificationJobProps {
    /**
     * Custom name for the job. Must be unique per account. If omitted, a unique
     * name is generated from the app/stage/logical ID.
     */
    name?: string;
    /**
     * Whether the job runs once (`ONE_TIME`) or on a recurring schedule
     * (`SCHEDULED`).
     * @default "ONE_TIME"
     */
    jobType?: JobType;
    /**
     * The S3 buckets to analyze, grouped by owning account. Changing this
     * replaces the job — classification jobs are immutable once created.
     */
    bucketDefinitions: BucketDefinition[];
    /**
     * Optional description of the job.
     */
    description?: string;
    /**
     * The sampling depth, as a percentage, applied to objects in the buckets.
     * @default 100
     */
    samplingPercentage?: number;
    /**
     * For a scheduled job, whether Macie analyzes all existing eligible objects
     * immediately on the first run.
     */
    initialRun?: boolean;
    /**
     * How Macie selects managed data identifiers for the job.
     */
    managedDataIdentifierSelector?: ManagedDataIdentifierSelector;
    /**
     * Tags applied to the job. Alchemy ownership tags are merged in automatically.
     */
    tags?: Record<string, string>;
}
/** @resource */
export interface ClassificationJob extends Resource<"AWS.Macie2.ClassificationJob", ClassificationJobProps, {
    /** Generated job ID. */
    jobId: string;
    /** ARN of the classification job. */
    jobArn: string;
    /** The resolved job name. */
    name: string;
    /** Current job status (`RUNNING` / `COMPLETE` / `CANCELLED` / ...). */
    jobStatus: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon Macie classification job — scans one or more S3 buckets for
 * sensitive data. Requires Macie to be enabled for the account (see
 * `Macie2.Session`). Jobs are immutable once created; changing the job type,
 * name, or bucket set replaces the job. Destroy cancels the job.
 *
 * ### Creating a classification job
 * **Example:** One-time job over a bucket
 * ```typescript
 * const job = yield* Macie2.ClassificationJob("Scan", {
 *   jobType: "ONE_TIME",
 *   bucketDefinitions: [{ accountId, buckets: ["my-bucket"] }],
 * });
 * ```
 *
 * **Example:** Sampled scan with a description
 * ```typescript
 * const job = yield* Macie2.ClassificationJob("Scan", {
 *   jobType: "ONE_TIME",
 *   bucketDefinitions: [{ accountId, buckets: ["my-bucket"] }],
 *   samplingPercentage: 20,
 *   description: "PII sweep",
 * });
 * ```
 */
declare const ClassificationJobResource: import("../../Resource.ts").ResourceClass<ClassificationJob>;
export { ClassificationJobResource as ClassificationJob };
export declare const ClassificationJobProvider: () => import("effect/Layer").Layer<Provider.Provider<ClassificationJob>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ClassificationJob.d.ts.map