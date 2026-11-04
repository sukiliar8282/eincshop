import * as translate from "@distilled.cloud/aws/translate";
import * as Effect from "effect/Effect";
/**
 * Coerce a Translate wire tag list (`{ Key, Value }[]`) into a plain
 * `Record<string, string>`.
 */
export declare const toTagRecord: (tags: readonly translate.Tag[] | undefined) => Record<string, string>;
/**
 * Read the observed tags of a Translate resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readTranslateTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a Translate resource: diff the OBSERVED cloud tags against the
 * desired set and apply only the delta.
 */
export declare const syncTranslateTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, translate.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map