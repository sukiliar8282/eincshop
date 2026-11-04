import * as Effect from "effect/Effect";
/**
 * Options for creating a cached function.
 */
export interface CachedFunctionOptions<A> {
    /**
     * Function to convert arguments to a cache key string.
     * Defaults to `JSON.stringify`.
     */
    readonly key?: (args: A) => string;
}
/**
 * Creates a memoized version of a function that returns an Effect.
 *
 * The key feature is deduplication of concurrent calls with the same inputs -
 * only one execution happens while other callers wait for and receive the same result.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect";
 * import { cachedFunction } from "~/lib/cached-function";
 *
 * const fetchUser = (id: string) =>
 *   Effect.promise(() => fetch(`/users/${id}`).then(r => r.json()));
 *
 * const program = Effect.gen(function* () {
 *   const cachedFetchUser = yield* cachedFunction(fetchUser);
 *
 *   // These concurrent calls will only trigger one fetch
 *   const [user1, user2] = yield* Effect.all([
 *     cachedFetchUser("123"),
 *     cachedFetchUser("123"),
 *   ]);
 * });
 * ```
 */
export declare const cachedFunction: <A extends Array<any>, B, E, R>(fn: (...args: A) => Effect.Effect<B, E, R>, options?: CachedFunctionOptions<A>) => Effect.Effect<(...args: A) => Effect.Effect<B, E, R>>;
//# sourceMappingURL=cached-function.d.ts.map