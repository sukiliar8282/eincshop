import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
/**
 * Bounded 5-second poll (~3 minutes total) until `until` is satisfied.
 *
 * Explicitly annotated so the `Effect.repeat` conditional return type never
 * survives into declaration emit (which would widen the provider layers of
 * every `AWS.providers()` consumer — see processes/AWS/PATTERNS.md §7).
 */
export const pollBatch = (self, until) => Effect.repeat(self, {
    schedule: Schedule.spaced("5 seconds"),
    until,
    times: 36,
});
/**
 * Bounded retry (5s spacing, 10 tries) while the typed predicate holds.
 * Same explicit-annotation rationale as {@link pollBatch}.
 */
export const retryBatch = (self, while_, times = 10) => Effect.retry(self, {
    while: while_,
    schedule: Schedule.max([
        Schedule.spaced("5 seconds"),
        Schedule.recurs(times),
    ]),
});
//# sourceMappingURL=internal.js.map