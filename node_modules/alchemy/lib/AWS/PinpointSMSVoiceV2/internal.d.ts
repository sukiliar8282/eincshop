import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Effect from "effect/Effect";
/**
 * Flatten the wire `Tag[]` list into a plain string record.
 */
export declare const toTagRecord: (tags: readonly smsvoice.Tag[] | undefined) => Record<string, string>;
/**
 * Convert a plain string record into the wire `Tag[]` list.
 */
export declare const toTagList: (tags: Record<string, string>) => smsvoice.Tag[];
/**
 * Read the observed tags of an End User Messaging SMS resource.
 * Best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readSmsVoiceTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an End User Messaging SMS resource: diff the OBSERVED
 * cloud tags against the desired set and apply only the delta.
 */
export declare const syncSmsVoiceTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, smsvoice.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Explicitly-typed pipeable retry helper (inlining `Effect.retry` in a
 * provider op widens the layer type in declaration emit). Retries
 * `ThrottlingException` on a bounded exponential schedule — the End User
 * Messaging SMS control plane has low per-account TPS limits.
 */
export declare const retrySmsVoiceThrottled: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map