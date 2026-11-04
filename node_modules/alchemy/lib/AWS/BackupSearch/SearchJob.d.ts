import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface BackupCreationTimeFilter {
    /** Only include recovery points created after this ISO-8601 timestamp. */
    createdAfter?: string;
    /** Only include recovery points created before this ISO-8601 timestamp. */
    createdBefore?: string;
}
export interface SearchScope {
    /**
     * Resource types of the recovery points to include in the search:
     * `S3` and/or `EBS`.
     */
    backupResourceTypes: string[];
    /** Filter recovery points by their backup creation time. */
    backupResourceCreationTime?: BackupCreationTimeFilter;
    /** Only search backups of these source resources (ARNs). */
    sourceResourceArns?: string[];
    /** Only search these recovery points (recovery point ARNs). */
    backupResourceArns?: string[];
    /** Only search recovery points carrying these tags. */
    backupResourceTags?: Record<string, string>;
}
export interface StringCondition {
    /** The string value to compare against. */
    value: string;
    /**
     * Comparison operator: `EQUALS_TO`, `NOT_EQUALS_TO`, `CONTAINS`,
     * `DOES_NOT_CONTAIN`, `BEGINS_WITH`, `ENDS_WITH`, `DOES_NOT_BEGIN_WITH`,
     * or `DOES_NOT_END_WITH`.
     * @default EQUALS_TO
     */
    operator?: string;
}
export interface LongCondition {
    /** The numeric value to compare against. */
    value: number;
    /**
     * Comparison operator: `EQUALS_TO`, `NOT_EQUALS_TO`,
     * `LESS_THAN_EQUAL_TO`, or `GREATER_THAN_EQUAL_TO`.
     * @default EQUALS_TO
     */
    operator?: string;
}
export interface TimeCondition {
    /** The ISO-8601 timestamp to compare against. */
    value: string;
    /**
     * Comparison operator: `EQUALS_TO`, `NOT_EQUALS_TO`,
     * `LESS_THAN_EQUAL_TO`, or `GREATER_THAN_EQUAL_TO`.
     * @default EQUALS_TO
     */
    operator?: string;
}
export interface S3ItemFilter {
    /** Match S3 objects by key. */
    objectKeys?: StringCondition[];
    /** Match S3 objects by size in bytes. */
    sizes?: LongCondition[];
    /** Match S3 objects by creation time. */
    creationTimes?: TimeCondition[];
    /** Match S3 objects by version id. */
    versionIds?: StringCondition[];
    /** Match S3 objects by ETag. */
    etags?: StringCondition[];
}
export interface EBSItemFilter {
    /** Match EBS files by path. */
    filePaths?: StringCondition[];
    /** Match EBS files by size in bytes. */
    sizes?: LongCondition[];
    /** Match EBS files by creation time. */
    creationTimes?: TimeCondition[];
    /** Match EBS files by last-modification time. */
    lastModificationTimes?: TimeCondition[];
}
export interface ItemFilters {
    /** Filters applied to items inside S3 recovery points. */
    s3ItemFilters?: S3ItemFilter[];
    /** Filters applied to items inside EBS recovery points. */
    ebsItemFilters?: EBSItemFilter[];
}
export interface SearchJobProps {
    /**
     * Display name of the search job. If omitted, a unique name is generated
     * from the app, stage, and logical ID. Changing the name replaces the job.
     */
    name?: string;
    /**
     * ARN of the KMS key used to encrypt the search results. Immutable —
     * changing it replaces the job.
     */
    encryptionKeyArn?: string;
    /**
     * The recovery points to search. Immutable — changing it replaces the job.
     */
    searchScope: SearchScope;
    /**
     * Filters applied to the items inside the recovery points. Immutable —
     * changing them replaces the job.
     */
    itemFilters?: ItemFilters;
    /**
     * User-defined tags for the search job.
     */
    tags?: Record<string, string>;
}
export interface SearchJob extends Resource<"AWS.BackupSearch.SearchJob", SearchJobProps, {
    /**
     * Service-assigned unique ID of the search job.
     */
    searchJobIdentifier: string;
    /**
     * ARN of the search job.
     */
    searchJobArn: string;
    /**
     * Name of the search job.
     */
    name: string | undefined;
    /**
     * Current status of the search job (e.g. `RUNNING`, `COMPLETED`).
     */
    status: string;
}, never, Providers> {
}
/**
 * An AWS Backup Search job — a data-plane search over AWS Backup recovery
 * points (S3 and EBS) whose backup indexes are active. A search job is
 * immutable once started: it runs to completion, retains its results for
 * seven days, and can only be stopped while `RUNNING` (destroying the
 * resource stops a running job; completed jobs age out server-side).
 *
 * ### Creating a Search Job
 * **Example:** Search All S3 Backups
 * ```typescript
 * const search = yield* BackupSearch.SearchJob("FindReports", {
 *   searchScope: { backupResourceTypes: ["S3"] },
 *   itemFilters: {
 *     s3ItemFilters: [
 *       { objectKeys: [{ value: "reports/", operator: "BEGINS_WITH" }] },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Search Specific Recovery Points
 * ```typescript
 * const search = yield* BackupSearch.SearchJob("AuditSearch", {
 *   searchScope: {
 *     backupResourceTypes: ["EBS"],
 *     backupResourceArns: [recoveryPointArn],
 *     backupResourceCreationTime: { createdAfter: "2026-01-01T00:00:00Z" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const SearchJob: import("../../Resource.ts").ResourceClass<SearchJob>;
export declare const SearchJobProvider: () => import("effect/Layer").Layer<Provider.Provider<SearchJob>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SearchJob.d.ts.map