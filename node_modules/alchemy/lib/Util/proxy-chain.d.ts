/** @effect-diagnostics anyUnknownInErrorContext:off */
import * as Effect from "effect/Effect";
/**
 * Wrap a cached `Effect<T>` in a chainable Proxy so callers can use the
 * returned value as if it were `T` itself — every property read and call
 * records a step, and the chain is replayed against the resolved value
 * when it's finally yielded as an Effect.
 *
 * Compare:
 *
 * ```typescript
 * // Without proxyChain — caller has to yield the cached Effect first:
 * const conn = yield* makeConnection();      // Effect<Db>
 * fetch: Effect.gen(function* () {
 *   const db = yield* conn;
 *   const rows = yield* db.select().from(users);
 * });
 *
 * // With proxyChain — caller treats the return as the value directly:
 * const db = proxyChain(yield* Effect.cached(makeDb));   // T
 * fetch: Effect.gen(function* () {
 *   const rows = yield* db.select().from(users);
 * });
 * ```
 *
 * The chain ends when the proxy is yielded as an Effect — the resolved
 * value at that point must be a `Yieldable` (an Effect, drizzle query
 * builder, etc). Anything before that is recorded as ops.
 *
 * A chain passed as an *argument* to another chain over the same effect —
 * e.g. `` sql`INSERT INTO users ${sql.insert(row)}` ``, where `sql.insert(row)`
 * is itself a deferred proxy — is replayed against the same resolved root
 * before the outer call runs, so synchronous fragment helpers compose.
 */
export declare const proxyChain: <T>(cached: Effect.Effect<T, any, any>) => T;
//# sourceMappingURL=proxy-chain.d.ts.map