import * as b2bi from "@distilled.cloud/aws/b2bi";
import * as Effect from "effect/Effect";
/**
 * Convert a B2BI wire tag list (`{ Key, Value }[]`) into a plain record,
 * dropping malformed entries.
 */
export declare const toTagRecord: (tags: ReadonlyArray<{
    Key?: string;
    Value?: string;
}> | undefined) => Record<string, string>;
/**
 * Convert a desired tag record into the B2BI wire tag list for create calls.
 */
export declare const toWireTags: (tags: Record<string, string>) => b2bi.Tag[];
/**
 * Read the observed tags of a B2BI resource. Tag reads are best-effort —
 * a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readB2biTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a B2BI resource: diff the OBSERVED cloud tags against the
 * desired set and apply only the delta.
 */
export declare const syncB2biTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, b2bi.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map