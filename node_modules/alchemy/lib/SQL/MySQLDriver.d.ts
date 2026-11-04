import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type * as Scope from "effect/Scope";
import type { Pool, PoolOptions } from "mysql2/promise";
/**
 * Lazily load the `mysql2/promise` driver (an optional peer dependency of
 * alchemy) with a descriptive failure when it isn't installed. The
 * promise flavor is the canonical surface — its `.pool` property exposes
 * the callback pool for consumers (like Kysely) that drive that API.
 */
export declare const importMySql: () => Promise<typeof import("mysql2/promise")>;
/**
 * Open a raw `mysql2/promise` pool on the current `Scope` — `pool.end()`
 * runs when the scope closes. Pair with `makeExecutionMemo` for the
 * one-pool-per-event shape workerd and Lambda require.
 *
 * `connectionLimit` defaults to 1: per-execution pools never need more
 * than one connection.
 */
export declare const openMySQLPool: (url: Effect.Effect<Redacted.Redacted<string>>, config?: Omit<PoolOptions, "uri">) => Effect.Effect<Pool, never, Scope.Scope>;
//# sourceMappingURL=MySQLDriver.d.ts.map