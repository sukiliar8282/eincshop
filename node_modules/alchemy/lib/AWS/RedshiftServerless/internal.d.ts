import * as redshiftserverless from "@distilled.cloud/aws/redshift-serverless";
import * as Effect from "effect/Effect";
/**
 * Convert a Redshift Serverless wire tag list (`{ key, value }`) into a plain
 * record, dropping malformed entries.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    key?: string;
    value?: string;
}> | undefined) => Record<string, string>;
/**
 * Convert a desired tag record into the wire tag list (`{ key, value }`) used
 * by create/tag calls.
 */
export declare const toWireTags: (tags: Record<string, string>) => redshiftserverless.Tag[];
/**
 * Read the observed tags of a Redshift Serverless resource. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a Redshift Serverless resource: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export declare const syncTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, redshiftserverless.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map