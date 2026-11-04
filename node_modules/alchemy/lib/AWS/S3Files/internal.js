import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
/**
 * Raised when an S3 Files file system or access point fails to settle into
 * `available` within the bounded polling budget, or when the API returns a
 * structurally incomplete description.
 */
export class S3FilesNotConverged extends Data.TaggedError("S3FilesNotConverged") {
}
/**
 * Bounded retry through transient `ConflictException` states — e.g. deleting
 * a file system or access point whose previous lifecycle transition is still
 * settling.
 *
 * Expressed as an explicitly-typed module-scope helper: inlining
 * `Effect.retry` in lifecycle code leaves its conditional return type
 * unresolved in the provider's declaration emit, which widens the
 * `AWS.providers()` layer type for every downstream consumer.
 */
export const retryWhileConflict = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ConflictException",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(10)]),
});
/**
 * Repeat an observe poll until `done` holds (bounded — file systems and
 * access points typically become `available` within seconds). Explicitly
 * typed for the declaration-emit reason above.
 */
export const untilSettled = (self, done) => Effect.repeat(self, {
    schedule: Schedule.spaced("3 seconds"),
    until: done,
    times: 30,
});
/**
 * Convert the wire tag list (`[{ key, value }]`) into a plain record for
 * diffing with `diffTags`.
 */
export const toTagRecord = (tags) => {
    const out = {};
    for (const tag of tags ?? []) {
        out[tag.key] = tag.value;
    }
    return out;
};
/**
 * Convert a plain tag record into the wire tag list shape.
 */
export const toTagList = (tags) => Object.entries(tags).map(([key, value]) => ({ key, value }));
//# sourceMappingURL=internal.js.map