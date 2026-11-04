import * as PgClient from "@effect/sql-pg/PgClient";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type * as Redacted from "effect/Redacted";
import * as Sql from "effect/unstable/sql/SqlClient";
/**
 * Options for {@link Postgres}: `@effect/sql-pg`'s pool configuration, with
 * `url` widened to also accept an Effect (e.g. a Hyperdrive connection
 * string, which resolves from the Worker environment at runtime).
 */
export type PostgresConfig<E, R> = Omit<PgClient.PgPoolConfig, "url"> & {
    readonly url: Redacted.Redacted<string> | Effect.Effect<Redacted.Redacted<string>, E, R>;
};
/**
 * Open an `@effect/sql-pg` client (a connection pool) from a connection URL.
 *
 * Accepts a plain `Redacted` URL or an Effect of one — e.g.
 * `Cloudflare.Hyperdrive.Connect(...)` or `Fly.ConnectPostgres(...)`'s
 * `connectionString` — and returns a
 * `PgClient` (which implements the generic `SqlClient` interface) wrapped in
 * a chainable Proxy, so it can be resolved once at init and used from any
 * handler:
 *
 * ```typescript
 * import * as SQL from "alchemy/SQL/Postgres";
 *
 * const hd = yield* Cloudflare.Hyperdrive.Connect(Hyperdrive);
 * const sql = yield* SQL.Postgres({ url: hd.connectionString });
 *
 * fetch: Effect.gen(function* () {
 *   const users = yield* sql`SELECT * FROM users`;
 * });
 * ```
 *
 * The pool is built lazily on the first query and memoized on the current
 * execution's `Scope` (via {@link makeExecutionMemo}), so it's created at
 * most once per execution — a Worker `fetch`/`queue`/`scheduled` event, a
 * Durable Object call, a Workflow run, or a Lambda invocation — and its
 * `end` finalizer fires when the event settles. Yielding the connection URL
 * is likewise deferred, so deploy / plan-time invocations never connect.
 *
 * @binding
 */
export declare const Postgres: <E = never, R = never>(config: PostgresConfig<E, R>) => Effect.Effect<PgClient.PgClient, never, never>;
/**
 * Provide an `@effect/sql-pg` client as the `PgClient` and generic
 * `SqlClient` services, so cloud-agnostic services written against
 * `SqlClient.SqlClient` (or drizzle's `effect-postgres` driver, which
 * depends on `PgClient`) run on the configured pool:
 *
 * ```typescript
 * const hd = yield* Cloudflare.Hyperdrive.Connect(Hyperdrive);
 * const app = yield* makeApp.pipe(
 *   Effect.provide(SQL.PostgresLayer({ url: hd.connectionString })),
 * );
 * ```
 *
 * The layer itself builds synchronously at init; the underlying pool is
 * created lazily per execution (see {@link Postgres}).
 */
export declare const PostgresLayer: <E = never, R = never>(config: PostgresConfig<E, R>) => Layer.Layer<PgClient.PgClient | Sql.SqlClient, never, never>;
//# sourceMappingURL=Postgres.d.ts.map