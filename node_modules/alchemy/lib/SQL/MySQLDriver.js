import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
/**
 * Lazily load the `mysql2/promise` driver (an optional peer dependency of
 * alchemy) with a descriptive failure when it isn't installed. The
 * promise flavor is the canonical surface — its `.pool` property exposes
 * the callback pool for consumers (like Kysely) that drive that API.
 */
export const importMySql = () => import("mysql2/promise")
    .then((mod) => mod.default?.createPool !==
    undefined
    ? mod
        .default
    : mod)
    .catch((cause) => {
    throw new Error("Failed to load the 'mysql2' driver. Install the optional peer dependency 'mysql2' to connect to MySQL.", { cause });
});
/**
 * Open a raw `mysql2/promise` pool on the current `Scope` — `pool.end()`
 * runs when the scope closes. Pair with `makeExecutionMemo` for the
 * one-pool-per-event shape workerd and Lambda require.
 *
 * `connectionLimit` defaults to 1: per-execution pools never need more
 * than one connection.
 */
export const openMySQLPool = (url, config) => Effect.gen(function* () {
    const mysql = yield* Effect.promise(importMySql);
    const uri = Redacted.value(yield* url);
    return yield* Effect.acquireRelease(Effect.sync(() => mysql.createPool({ uri, connectionLimit: 1, ...config })), (pool) => Effect.promise(() => pool.end()));
});
//# sourceMappingURL=MySQLDriver.js.map