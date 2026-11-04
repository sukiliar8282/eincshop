import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface S3ExportSpecification {
    /** Name of the destination S3 bucket that receives the results `.csv`. */
    destinationBucket: string;
    /** Key prefix under which the results are written. */
    destinationPrefix?: string;
}
export interface ExportSpecification {
    /** Export the search results to an S3 bucket. */
    s3ExportSpecification: S3ExportSpecification;
}
export interface ExportJobProps {
    /**
     * Identifier of the search job whose results are exported. Immutable —
     * changing it replaces the export job.
     */
    searchJobIdentifier: string;
    /**
     * Where the results are exported to. Immutable — changing it replaces the
     * export job.
     */
    exportSpecification: ExportSpecification;
    /**
     * ARN of the IAM role BackupSearch assumes to write the export to the
     * destination bucket. Immutable — changing it replaces the export job.
     */
    roleArn?: string;
    /**
     * User-defined tags for the export job.
     */
    tags?: Record<string, string>;
}
export interface ExportJob extends Resource<"AWS.BackupSearch.ExportJob", ExportJobProps, {
    /**
     * Service-assigned unique ID of the export job.
     */
    exportJobIdentifier: string;
    /**
     * ARN of the export job.
     */
    exportJobArn: string;
    /**
     * ARN of the search job whose results are exported.
     */
    searchJobArn: string | undefined;
    /**
     * Current status of the export job (e.g. `RUNNING`, `COMPLETED`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An AWS Backup Search export job — transmits the results of a completed
 * search job to a designated S3 bucket as a `.csv` file, retaining them
 * beyond the search job's seven-day retention. An export job is immutable
 * once started and cannot be stopped or deleted; its record ages out
 * server-side.
 *
 * ### Exporting Search Results
 * **Example:** Export to an S3 Bucket
 * ```typescript
 * const exportJob = yield* BackupSearch.ExportJob("Results", {
 *   searchJobIdentifier: search.searchJobIdentifier,
 *   exportSpecification: {
 *     s3ExportSpecification: {
 *       destinationBucket: bucket.bucketName,
 *       destinationPrefix: "backup-search-results/",
 *     },
 *   },
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * @resource
 */
export declare const ExportJob: import("../../Resource.ts").ResourceClass<ExportJob>;
export declare const ExportJobProvider: () => import("effect/Layer").Layer<Provider.Provider<ExportJob>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ExportJob.d.ts.map