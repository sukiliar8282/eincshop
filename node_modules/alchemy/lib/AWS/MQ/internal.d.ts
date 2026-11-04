import * as mq from "@distilled.cloud/aws/mq";
import * as Effect from "effect/Effect";
/**
 * Amazon MQ tags are a plain string map on the wire. Drop any `undefined`
 * values (the distilled map type is `{ [k: string]: string | undefined }`)
 * so downstream diffing works on a clean `Record<string, string>`.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Sync tags on an Amazon MQ resource (broker or configuration): diff the
 * OBSERVED cloud tags against the desired set and apply only the delta via
 * `createTags` (upsert) / `deleteTags` (remove).
 */
export declare const syncMqTags: (arn: string, observedTags: Record<string, string>, desiredTags: Record<string, string>) => Effect.Effect<void, mq.CreateTagsError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=internal.d.ts.map