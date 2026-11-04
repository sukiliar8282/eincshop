import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { makeExecutionMemo } from "../Runtime/ExecutionMemo.js";
import { proxyChain } from "../Util/proxy-chain.js";
/**
 * Open a Drizzle/MySQL database from a connection URL using the
 * `drizzle-orm/effect-mysql2` integration.
 *
 * ```typescript
 * const conn = yield* Cloudflare.Hyperdrive.Connect(Hyperdrive);
 * const db = yield* Drizzle.MySQL(conn.connectionString, { relations });
 *
 * fetch: Effect.gen(function* () {
 *   const rows = yield* db.select().from(users);
 * });
 * ```
 *
 * The pool opens on the first query of an execution, is reused for every
 * query in it, and closes when the event settles (see
 * {@link makeExecutionMemo}); plan/deploy never connect. Workers defaults
 * ({@link resolveMySQLConfig}) are overridden via `config.client`:
 *
 * ```typescript
 * const db = yield* Drizzle.MySQL(connectionString, {
 *   relations,
 *   client: { poolConfig: { ssl: { rejectUnauthorized: true } } },
 * });
 * ```
 *
 * @binding
 */
export const MySQL = (connectionString, config) => Effect.map(makeExecutionMemo(Effect.gen(function* () {
    const [MysqlClient, MySqlDrizzle, { resolveMySQLConfig }] = yield* Effect.promise(() => Promise.all([
        import("@effect/sql-mysql2/MysqlClient"),
        import("drizzle-orm/effect-mysql2"),
        import("../SQL/MySQL.js"),
    ]));
    const { client, ...drizzleConfig } = config ?? {};
    const mysqlCtx = yield* Layer.build(MysqlClient.layer(yield* resolveMySQLConfig({ ...client, url: connectionString })));
    return yield* MySqlDrizzle.makeWithDefaults(drizzleConfig).pipe(Effect.provideContext(mysqlCtx));
})), (db) => proxyChain(db));
//# sourceMappingURL=MySQL.js.map