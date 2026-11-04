import * as ivs from "@distilled.cloud/aws/ivs";
import * as Effect from "effect/Effect";
/**
 * IVS wire tags allow `undefined` values in the record type — flatten to a
 * plain string record, dropping malformed entries.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of an IVS resource. Tag reads are best-effort —
 * a failure (e.g. a race with deletion) reports no tags.
 */
export declare const readIvsTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an IVS resource: diff the OBSERVED cloud tags against the
 * desired set and apply only the delta.
 */
export declare const syncIvsTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, ivs.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Explicitly-typed pipeable retry helper. Inlining `Effect.retry` in a
 * provider op lets `Retry.Return`'s conditional type survive into
 * declaration emit and widens the provider layer to `unknown` for every
 * `AWS.providers()` consumer — keep the annotation explicit.
 *
 * Retries `ConflictException` (e.g. deleting a channel while a stream is
 * live, or a resource is mid-transition) on a bounded schedule.
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Retries `ThrottlingException` on a bounded exponential schedule. IVS
 * APIs have very low TPS limits (e.g. ListPlaybackKeyPairs is 1 TPS), so
 * back-to-back reconciles routinely trip 429s.
 */
export declare const retryWhileThrottled: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map