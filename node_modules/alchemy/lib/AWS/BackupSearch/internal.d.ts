import * as backupsearch from "@distilled.cloud/aws/backupsearch";
import * as Effect from "effect/Effect";
/**
 * Coerce a BackupSearch wire tag map (a sparse `Record<string, string |
 * undefined>`) into a plain `Record<string, string>`.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of a BackupSearch resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with job expiry) reports no tags.
 */
export declare const readBackupSearchTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a BackupSearch resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta.
 */
export declare const syncBackupSearchTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, backupsearch.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map