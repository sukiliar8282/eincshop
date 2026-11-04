import * as MysqlClient from "@effect/sql-mysql2/MysqlClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Sql from "effect/unstable/sql/SqlClient";
/**
 * Options for {@link MySQL}: `@effect/sql-mysql2`'s client configuration,
 * with `url` widened to also accept an Effect (e.g. a Hyperdrive connection
 * string, which resolves from the Worker environment at runtime).
 */
export type MySQLConfig<E = never, R = never> = Omit<MysqlClient.MysqlClientConfig, "url"> & {
    readonly url: Redacted.Redacted<string> | Effect.Effect<Redacted.Redacted<string>, E, R>;
};
/**
 * Resolve a {@link MySQLConfig} into the `MysqlClientConfig` handed to
 * `@effect/sql-mysql2`. The `url` is parsed into discrete connection fields
 * (mysql2's URI code path ignores `poolConfig`), and on workerd the defaults
 * flip to `poolConfig.disableEval` (no runtime codegen in the isolate) and
 * `disablePreparedStatements` (Hyperdrive's MySQL proxy has no
 * `COM_STMT_PREPARE`). Explicit config fields always win over parsed /
 * detected values.
 */
export declare const resolveMySQLConfig: <E = never, R = never>(config: MySQLConfig<E, R>) => Effect.Effect<MysqlClient.MysqlClientConfig, E, R>;
/**
 * Open an `@effect/sql-mysql2` client (a connection pool) from a connection
 * URL — a plain `Redacted` or an Effect of one, e.g. Hyperdrive's
 * `connectionString`:
 *
 * ```typescript
 * import * as SQL from "alchemy/SQL/MySQL";
 *
 * const hd = yield* Cloudflare.Hyperdrive.Connect(Hyperdrive);
 * const sql = yield* SQL.MySQL({ url: hd.connectionString });
 *
 * fetch: Effect.gen(function* () {
 *   const users = yield* sql`SELECT * FROM users`;
 * });
 * ```
 *
 * The pool opens on the first query of an execution, is reused for every
 * query in it, and closes when the event settles (see
 * {@link makeExecutionMemo}); plan/deploy never connect. Workers defaults
 * ({@link resolveMySQLConfig}) are overridden in the config:
 *
 * ```typescript
 * const sql = yield* SQL.MySQL({
 *   url,
 *   disablePreparedStatements: true,
 *   poolConfig: { ssl: { rejectUnauthorized: true } },
 * });
 * ```
 *
 * @binding
 */
export declare const MySQL: <E = never, R = never>(config: MySQLConfig<E, R>) => Effect.Effect<MysqlClient.MysqlClient, never, never>;
/**
 * Provide an `@effect/sql-mysql2` client as the `MysqlClient` and generic
 * `SqlClient` services:
 *
 * ```typescript
 * const hd = yield* Cloudflare.Hyperdrive.Connect(Hyperdrive);
 * const app = yield* makeApp.pipe(
 *   Effect.provide(SQL.MySQLLayer({ url: hd.connectionString })),
 * );
 * ```
 *
 * The layer itself builds synchronously at init; the underlying pool is
 * created lazily per execution (see {@link MySQL}).
 */
export declare const MySQLLayer: <E = never, R = never>(config: MySQLConfig<E, R>) => Layer.Layer<MysqlClient.MysqlClient | Sql.SqlClient, never, never>;
//# sourceMappingURL=MySQL.d.ts.map