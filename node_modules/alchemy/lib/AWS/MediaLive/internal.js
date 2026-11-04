import * as medialive from "@distilled.cloud/aws/medialive";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { diffTags } from "../../Tags.js";
/**
 * Raised while a MediaLive resource is still transitioning (e.g. a channel
 * in `CREATING`); used as a typed retry signal, never surfaced on success.
 */
export class MediaLiveResourcePending extends Data.TaggedError("MediaLiveResourcePending") {
}
// Explicitly-typed pipeable retry helpers. Inlining `Effect.retry` in a
// provider lifecycle op leaks `Retry.Return`'s conditional into declaration
// emit and widens the provider layer to `unknown` R for every consumer of
// `AWS.providers()`.
/** Bounded wait (3s x 30 = 90s) while a resource is still transitioning. */
export const retryWhilePending = (self) => Effect.retry(self, {
    while: (e) => e._tag === "MediaLiveResourcePending",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(30)]),
});
/**
 * Bounded retry (3s x 10) on `ConflictException` — MediaLive rejects
 * deletes/updates while a dependent resource is still detaching.
 */
export const retryWhileConflict = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ConflictException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
/**
 * Raised when a MediaLive API response omits a field the provider requires
 * (e.g. a create response without the resource body or its Id/Arn).
 */
export class MediaLiveIncompleteResponse extends Data.TaggedError("MediaLiveIncompleteResponse") {
}
/** Narrow an optional wire field to defined with a typed failure. */
export const ensurePresent = (value, what) => value === undefined
    ? Effect.fail(new MediaLiveIncompleteResponse({
        message: `MediaLive response is missing ${what}`,
    }))
    : Effect.succeed(value);
/**
 * Narrow a MediaLive resource body to one whose server-assigned `Id`/`Arn`
 * are present, failing with a typed error otherwise.
 */
export const ensureIdentified = (value, what) => value === undefined || value.Id === undefined || value.Arn === undefined
    ? Effect.fail(new MediaLiveIncompleteResponse({
        message: `MediaLive response is missing ${what}`,
    }))
    : Effect.succeed(value);
/**
 * Coerce a MediaLive wire tag map (values are `string | undefined`) into a
 * plain `Record<string, string>`, dropping any undefined values.
 */
export const toTagRecord = (tags) => Object.fromEntries(Object.entries(tags ?? {}).filter((entry) => typeof entry[1] === "string"));
/**
 * Read the observed tags of a MediaLive resource by ARN. Tag reads are
 * best-effort — a failure (e.g. a race with deletion) reports no tags.
 */
export const readMlTags = Effect.fn(function* (arn) {
    const response = yield* medialive
        .listTagsForResource({ ResourceArn: arn })
        .pipe(Effect.catch(() => Effect.succeed(undefined)));
    return toTagRecord(response?.Tags);
});
/**
 * Sync tags on a MediaLive resource: diff the OBSERVED cloud tags against
 * the desired set and apply only the delta. MediaLive's `createTags` upserts
 * a tag map; `deleteTags` removes keys.
 */
export const syncMlTags = Effect.fn(function* (arn, desiredTags) {
    const observedTags = yield* readMlTags(arn);
    const { removed, upsert } = diffTags(observedTags, desiredTags);
    if (upsert.length > 0) {
        yield* medialive.createTags({
            ResourceArn: arn,
            Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
        });
    }
    if (removed.length > 0) {
        yield* medialive.deleteTags({ ResourceArn: arn, TagKeys: removed });
    }
});
//# sourceMappingURL=internal.js.map