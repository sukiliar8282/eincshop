import * as databrew from "@distilled.cloud/aws/databrew";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { diffTags } from "../../Tags.js";
/** ARN partition — the testing account is on the standard AWS partition. */
const PARTITION = "aws";
/** `arn:aws:databrew:{region}:{account}:{type}/{name}` */
export const databrewArn = (region, accountId, type, name) => `arn:${PARTITION}:databrew:${region}:${accountId}:${type}/${name}`;
/**
 * Fetch the observed DataBrew tags for a resource ARN as a plain record.
 * Tolerate a missing/untaggable resource as `{}`.
 */
export const fetchObservedTags = Effect.fn("AWS.DataBrew.fetchObservedTags")(function* (resourceArn) {
    const response = yield* databrew
        .listTagsForResource({ ResourceArn: resourceArn })
        .pipe(Effect.catch(() => Effect.succeed({ Tags: undefined })));
    return cleanMap(response.Tags);
});
/**
 * Sync a DataBrew resource's tags: diff OBSERVED cloud tags against desired
 * and apply the delta via `TagResource` (map upsert) / `UntagResource`
 * (removed keys).
 */
export const syncTags = Effect.fn("AWS.DataBrew.syncTags")(function* (resourceArn, observed, desired) {
    const { upsert, removed } = diffTags(observed, desired);
    if (upsert.length > 0) {
        yield* databrew.tagResource({
            ResourceArn: resourceArn,
            Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
        });
    }
    if (removed.length > 0) {
        yield* databrew.untagResource({
            ResourceArn: resourceArn,
            TagKeys: removed,
        });
    }
});
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
export const retryWhileConflict = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ConflictException",
    schedule: Schedule.max([Schedule.fixed("5 seconds"), Schedule.recurs(24)]),
});
/**
 * Bounded retry through `DataBrewRoleNotAssumable` — a freshly-created IAM
 * role is not yet visible to DataBrew (IAM propagation), which surfaces as a
 * message-discriminated `ValidationException` ("DataBrew is not a trusted
 * entity for the data access role ...", patched into a typed tag).
 * Explicitly typed for the same declaration-emit reason as above.
 */
export const retryWhileRoleNotAssumable = (self) => Effect.retry(self, {
    // A freshly-attached S3 policy on the role also propagates lazily and
    // surfaces as AccessDeniedException ("Access denied to s3:GetObject for
    // arn:...:role/... Error: Forbidden") while DataBrew validates the
    // dataset source — retry both bounded.
    while: (e) => e._tag === "DataBrewRoleNotAssumable" ||
        e._tag === "AccessDeniedException",
    schedule: Schedule.max([Schedule.fixed("5 seconds"), Schedule.recurs(12)]),
});
/** DataBrew free-form maps arrive with `undefined` values erased. */
export const cleanMap = (map) => Object.fromEntries(Object.entries(map ?? {}).filter((entry) => entry[1] !== undefined));
/**
 * Canonical (key-sorted) JSON — used to compare an observed wire-shaped
 * structure against the desired one so no-op updates can skip API calls
 * and recipe publishing only happens when the working copy actually changed.
 */
export const canonicalJson = (value) => JSON.stringify(sortKeys(value));
const sortKeys = (value) => {
    if (Array.isArray(value))
        return value.map(sortKeys);
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value)
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
            .map(([k, v]) => [k, sortKeys(v)]));
    }
    return value;
};
//# sourceMappingURL=internal.js.map