import * as databrew from "@distilled.cloud/aws/databrew";
import * as Effect from "effect/Effect";
/** `arn:aws:databrew:{region}:{account}:{type}/{name}` */
export declare const databrewArn: (region: string, accountId: string, type: "dataset" | "recipe" | "project" | "job" | "ruleset" | "schedule", name: string) => string;
/**
 * Fetch the observed DataBrew tags for a resource ARN as a plain record.
 * Tolerate a missing/untaggable resource as `{}`.
 */
export declare const fetchObservedTags: (resourceArn: string) => Effect.Effect<Record<string, string>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Sync a DataBrew resource's tags: diff OBSERVED cloud tags against desired
 * and apply the delta via `TagResource` (map upsert) / `UntagResource`
 * (removed keys).
 */
export declare const syncTags: (resourceArn: string, observed: Record<string, string>, desired: Record<string, string>) => Effect.Effect<void, databrew.TagResourceError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Bounded retry through `ConflictException` — DataBrew rejects mutations
 * while a conflicting operation is in flight (e.g. deleting a job whose run
 * is still starting, or racing reconciles on the same name). The budget is
 * ~2 minutes because deletes run in parallel: a dataset/recipe delete can
 * legitimately conflict ("is used in job …") for the whole window in which
 * the associated job is still waiting for its last run to wind down before
 * deleting itself. Explicitly typed so the conditional `Retry.Return` type
 * does not leak into the provider's declaration emit and widen
 * `AWS.providers()` for downstream consumers.
 */
export declare const retryWhileConflict: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry through `DataBrewRoleNotAssumable` — a freshly-created IAM
 * role is not yet visible to DataBrew (IAM propagation), which surfaces as a
 * message-discriminated `ValidationException` ("DataBrew is not a trusted
 * entity for the data access role ...", patched into a typed tag).
 * Explicitly typed for the same declaration-emit reason as above.
 */
export declare const retryWhileRoleNotAssumable: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/** DataBrew free-form maps arrive with `undefined` values erased. */
export declare const cleanMap: (map: Record<string, string | undefined> | undefined) => Record<string, string>;
/**
 * Canonical (key-sorted) JSON — used to compare an observed wire-shaped
 * structure against the desired one so no-op updates can skip API calls
 * and recipe publishing only happens when the working copy actually changed.
 */
export declare const canonicalJson: (value: unknown) => string;
//# sourceMappingURL=internal.d.ts.map