import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";
/**
 * A lazily evaluated, memoized effect whose computation runs in a fiber of
 * its own, owned by `scope`.
 *
 * `Effect.cached` evaluates on the fiber of whichever caller gets there
 * first. When that caller is interrupted while others are waiting — a
 * concurrent plan cancelling sibling diffs — every waiter fails
 * interrupt-only and the cache stays poisoned for the rest of the process.
 * A computation that many fibers share must not have that failure mode: here
 * it runs detached from every caller, so interrupting a waiter never touches
 * it, and only closing `scope` cancels it (its waiters then see the
 * interruption, as they should).
 *
 * Requirements are captured from the first caller, exactly as
 * `Effect.cached` does.
 */
export declare const cachedInScope: (scope: Scope.Scope) => <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<Effect.Effect<A, E>, never, R>;
//# sourceMappingURL=Memoize.d.ts.map