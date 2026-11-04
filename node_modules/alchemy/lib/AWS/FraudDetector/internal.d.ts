import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Effect from "effect/Effect";
/**
 * Coerce a FraudDetector wire tag list (`{ key, value }[]`) into a plain
 * `Record<string, string>`.
 */
export declare const toTagRecord: (tags: frauddetector.Tag[] | undefined) => Record<string, string>;
/**
 * Read the observed tags of a FraudDetector resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readFraudDetectorTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on a FraudDetector resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta.
 */
export declare const syncFraudDetectorTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, frauddetector.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map