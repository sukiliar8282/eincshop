import * as Effect from "effect/Effect";
/**
 * Bounded 5-second poll (~3 minutes total) until `until` is satisfied.
 *
 * Explicitly annotated so the `Effect.repeat` conditional return type never
 * survives into declaration emit (which would widen the provider layers of
 * every `AWS.providers()` consumer — see processes/AWS/PATTERNS.md §7).
 */
export declare const pollBatch: <A, E, R>(self: Effect.Effect<A, E, R>, until: (a: A) => boolean) => Effect.Effect<A, E, R>;
/**
 * Bounded retry (5s spacing, 10 tries) while the typed predicate holds.
 * Same explicit-annotation rationale as {@link pollBatch}.
 */
export declare const retryBatch: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>, while_: (e: E) => boolean, times?: number) => Effect.Effect<A, E, R>;
//# sourceMappingURL=internal.d.ts.map