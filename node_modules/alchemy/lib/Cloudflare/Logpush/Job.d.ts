import * as logpush from "@distilled.cloud/cloudflare/logpush";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Logpush.Job";
type TypeId = typeof TypeId;
/**
 * Name of the dataset a Logpush job pushes. The available datasets depend
 * on the job's scope (account vs zone) and the account's plan — e.g.
 * `workers_trace_events` and `audit_logs` are account-scoped, while
 * `http_requests` and `firewall_events` are zone-scoped (Enterprise).
 */
export type Dataset = Exclude<NonNullable<logpush.CreateJobForAccountRequest["dataset"]>, null>;
/**
 * Structured output configuration for a Logpush job — the replacement for
 * the deprecated `logpull_options` string.
 */
export interface OutputOptions {
    /**
     * String prepended to each batch (e.g. `[` to build a JSON array).
     */
    batchPrefix?: string;
    /**
     * String appended to each batch (e.g. `]`).
     */
    batchSuffix?: string;
    /**
     * Mitigation flag for CVE-2021-44228 — when `true`, verbatim
     * `${` sequences are replaced with `x{`.
     */
    "cve-2021-44228"?: boolean;
    /**
     * Delimiter between fields in `csv` output.
     */
    fieldDelimiter?: string;
    /**
     * Log fields to include in the output. Available fields per dataset are
     * listed on the Cloudflare developer docs.
     */
    fieldNames?: string[];
    /**
     * Whether to merge sub-request data into the parent request record
     * (only meaningful for some datasets).
     */
    mergeSubrequests?: boolean;
    /**
     * Output format.
     * @default "ndjson"
     */
    outputType?: "ndjson" | "csv";
    /**
     * Delimiter inserted between records.
     */
    recordDelimiter?: string;
    /**
     * String prepended to each record.
     */
    recordPrefix?: string;
    /**
     * String appended to each record.
     */
    recordSuffix?: string;
    /**
     * Go-template string used to render each record (mutually exclusive
     * with prefix/suffix/delimiter options).
     */
    recordTemplate?: string;
    /**
     * Floating point fraction (0.0–1.0) of records to include.
     * @default 1
     */
    sampleRate?: number;
    /**
     * Timestamp rendering format.
     * @default "unixnano"
     */
    timestampFormat?: "unixnano" | "unix" | "rfc3339" | "rfc3339ms" | "rfc3339ns";
}
export interface JobProps {
    /**
     * Zone the job is scoped to. When omitted, the job is account-scoped
     * (using the account from the active Cloudflare credentials).
     *
     * Stable — moving a job between scopes triggers a replacement.
     */
    zoneId?: string;
    /**
     * Name of the dataset to push (e.g. `workers_trace_events`,
     * `audit_logs`, `http_requests`).
     *
     * Stable — the dataset is fixed at creation, so changing it triggers
     * a replacement.
     */
    dataset: Dataset;
    /**
     * Destination URI, including any credentials the destination needs —
     * e.g. `r2://bucket/{DATE}?account-id=…&access-key-id=…&secret-access-key=…`
     * for R2, or an `s3://`, `gs://`, `https://` endpoint.
     *
     * Cloudflare validates the destination synchronously on create/update by
     * writing a test object, so the destination (e.g. the R2 bucket) must
     * already exist.
     *
     * Mutable — but Cloudflare may reject changing the destination
     * *provider/domain* of an existing job; in that case change a
     * replacement-triggering prop instead.
     */
    destinationConf: string;
    /**
     * Optional human readable job name (not unique). If omitted, a unique
     * name will be generated.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Whether the job actively pushes logs.
     * @default false
     */
    enabled?: boolean;
    /**
     * Filter expression (JSON-encoded) selecting which events to push.
     * See https://developers.cloudflare.com/logs/reference/filters/.
     */
    filter?: string;
    /**
     * Differentiates Logpush (`""`) from Edge Log Delivery (`"edge"`) jobs.
     *
     * Stable — changing the kind triggers a replacement.
     * @default ""
     */
    kind?: "" | "edge";
    /**
     * Structured output configuration (fields, format, delimiters, sampling).
     */
    outputOptions?: OutputOptions;
    /**
     * Maximum uncompressed file size of a batch, in bytes. Between 5 MB and
     * 1 GB, or `0` to disable the limit.
     * @default 0
     */
    maxUploadBytes?: number;
    /**
     * Maximum interval in seconds between log batches. Between 30 and 300,
     * or `0` to disable the limit.
     * @default 30
     */
    maxUploadIntervalSeconds?: number;
    /**
     * Maximum number of log lines per batch. Between 1,000 and 1,000,000,
     * or `0` to disable the limit.
     * @default 100000
     */
    maxUploadRecords?: number;
    /**
     * Ownership challenge token proving destination ownership — required
     * for destinations like S3/GCS/Azure. R2 destinations authenticated via
     * credentials in `destinationConf` do not need it.
     *
     * Write-only: Cloudflare never echoes it back, so it does not
     * participate in drift detection.
     */
    ownershipChallenge?: string;
}
export interface JobAttributes {
    /** Cloudflare-assigned numeric job id. */
    jobId: number;
    /** Account that owns the job. */
    accountId: string;
    /** Zone the job is scoped to, or `undefined` for account-scoped jobs. */
    zoneId: string | undefined;
    /** Job name. */
    name: string;
    /** Dataset the job pushes. */
    dataset: Dataset;
    /**
     * Destination URI. Note Cloudflare redacts embedded secrets (e.g. the
     * R2 `secret-access-key`) when echoing this back.
     */
    destinationConf: string;
    /** Whether the job is enabled. */
    enabled: boolean;
    /** Job kind (`""` for Logpush, `"edge"` for Edge Log Delivery). */
    kind: string;
    /** Last failure message, if the job is currently failing. */
    errorMessage: string | undefined;
    /** End of the last successfully-pushed log range. */
    lastComplete: string | undefined;
    /** Time of the last push failure. */
    lastError: string | undefined;
}
export type Job = Resource<TypeId, JobProps, JobAttributes, never, Providers>;
/**
 * A Cloudflare Logpush job that pushes batches of logs (HTTP requests,
 * Workers trace events, audit logs, Zero Trust datasets, …) to a
 * destination such as R2, S3, GCS, or an HTTP endpoint.
 *
 * Jobs can be account-scoped (default) or zone-scoped (pass `zoneId`).
 * The dataset, kind, and scope are fixed at creation — changing any of
 * them triggers a replacement; everything else updates in place.
 * ### Pushing Workers trace events to R2
 * **Example:** Account-scoped job writing to an R2 bucket
 * The R2 destination authenticates with S3-compatible credentials embedded
 * in the destination URI, so no ownership challenge is required.
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("logs", {});
 *
 * const job = yield* Cloudflare.Logpush.Job("worker-logs", {
 *   dataset: "workers_trace_events",
 *   destinationConf: Output.interpolate`r2://${bucket.bucketName}/{DATE}?account-id=${accountId}&access-key-id=${r2AccessKeyId}&secret-access-key=${r2SecretAccessKey}`,
 *   enabled: true,
 * });
 * ```
 *
 * ### Zone-scoped jobs
 * **Example:** HTTP requests dataset on a zone (Enterprise)
 * ```typescript
 * const job = yield* Cloudflare.Logpush.Job("http-logs", {
 *   zoneId: zone.zoneId,
 *   dataset: "http_requests",
 *   destinationConf: "s3://my-bucket/logs?region=us-east-1",
 *   ownershipChallenge: "00000000000000000000",
 * });
 * ```
 *
 * ### Output configuration
 * **Example:** Selecting fields and batching limits
 * ```typescript
 * const job = yield* Cloudflare.Logpush.Job("worker-logs", {
 *   dataset: "workers_trace_events",
 *   destinationConf,
 *   outputOptions: {
 *     fieldNames: ["EventTimestampMs", "Outcome", "ScriptName"],
 *     outputType: "ndjson",
 *     timestampFormat: "rfc3339",
 *   },
 *   maxUploadIntervalSeconds: 60,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/logs/logpush/
 *
 * @resource
 * @product Logpush
 * @category Observability & Analytics
 */
export declare const Job: import("../../Resource.ts").ResourceClass<Job>;
/**
 * Returns true if the given value is a Job resource.
 */
export declare const isJob: (value: unknown) => value is Job;
export declare const JobProvider: () => import("effect/Layer").Layer<Provider.Provider<Job>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | logpush.CloudflareOpContext>;
export {};
//# sourceMappingURL=Job.d.ts.map