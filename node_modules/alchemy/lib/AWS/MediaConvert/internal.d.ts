import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Effect from "effect/Effect";
/**
 * Coerce a MediaConvert wire tag map (values are `string | undefined`) into a
 * plain `Record<string, string>`, dropping any undefined values.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of a MediaConvert resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readMcTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a MediaConvert resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta. MediaConvert's `tagResource`
 * takes a tag map keyed by ARN in the body; `untagResource` takes an ARN path
 * label plus the keys to remove.
 */
export declare const syncMcTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, mediaconvert.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map