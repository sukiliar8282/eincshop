import * as ivschat from "@distilled.cloud/aws/ivschat";
import * as Effect from "effect/Effect";
/**
 * IVS Chat wire tags allow `undefined` values in the record type —
 * flatten to a plain string record, dropping malformed entries.
 */
export declare const toTagRecord: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Read the observed tags of an IVS Chat resource. Best-effort — a
 * failure (e.g. a race with deletion) reports no tags.
 */
export declare const readIvsChatTags: (arn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync tags on an IVS Chat resource: diff the OBSERVED cloud tags
 * against the desired set and apply only the delta.
 */
export declare const syncIvsChatTags: (arn: string, desiredTags: Record<string, string>) => Effect.Effect<void, ivschat.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Explicitly-typed pipeable retry helper (inlined `Effect.retry` in a
 * provider op widens the layer type in declaration emit). Retries
 * `ConflictException` — e.g. mutating or deleting a logging
 * configuration while it is mid-state-transition — on a bounded schedule.
 */
export declare const retryWhileConflict: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Retries the `ValidationException` IVS Chat raises while a freshly-added
 * `lambda:InvokeFunction` permission for `ivschat.amazonaws.com` is still
 * propagating — associating a `messageReviewHandler` validates the
 * permission, and Create/UpdateRoom can race the IAM propagation window
 * ("Request member: uri failed to satisfy the constraints: invalid lambda
 * permission"). Bounded (~30s).
 */
export declare const retryWhileHandlerPermissionPropagating: <A, E, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Retries `ThrottlingException` on a bounded exponential schedule. IVS
 * APIs have very low TPS limits (e.g. ListPlaybackKeyPairs is 1 TPS), so
 * back-to-back reconciles routinely trip 429s.
 */
export declare const retryWhileThrottled: <A, E extends {
    readonly _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map