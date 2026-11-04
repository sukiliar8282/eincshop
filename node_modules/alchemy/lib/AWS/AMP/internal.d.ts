import * as amp from "@distilled.cloud/aws/amp";
import * as Effect from "effect/Effect";
/**
 * Coerce an AMP wire tag map (values are `string | undefined`) into a plain
 * `Record<string, string>`, dropping undefined values.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of an AMP resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readAmpTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an AMP resource: diff the OBSERVED cloud tags against the
 * desired set and apply only the delta. AMP's `tagResource` takes a tag
 * map (not a list), so the `upsert` delta is folded back into a record.
 */
export declare const syncAmpTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, amp.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * AMP's logging APIs expect the destination CloudWatch Logs log group ARN
 * with a trailing `:*` (the log-stream wildcard). Append it when missing so
 * callers can pass a `Logs.LogGroup`'s `logGroupArn` directly.
 */
export declare const normalizeAmpLogGroupArn: (arn: string) => string;
/** Encode a UTF-8 string definition into the wire blob AMP expects. */
export declare const encodeDefinition: (definition: string) => Effect.Effect<Uint8Array>;
/** Decode an AMP definition blob back into a UTF-8 string. */
export declare const decodeDefinition: (data: Uint8Array) => Effect.Effect<string>;
//# sourceMappingURL=internal.d.ts.map