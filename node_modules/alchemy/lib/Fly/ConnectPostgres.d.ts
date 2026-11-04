import type * as Effect from "effect/Effect";
import type * as Redacted from "effect/Redacted";
import * as Binding from "../Binding.ts";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { Postgres } from "./Postgres.ts";
/**
 * Bind a {@link Postgres} cluster to a Fly {@link Service} and obtain
 * the Effect-native connection strings for `Drizzle.Postgres` /
 * `SQL.Postgres`.
 *
 * `ConnectPostgres` is the Context tag, the type, and the callable —
 * `yield* Fly.ConnectPostgres(Db)`. Provide {@link ConnectPostgresHttp}.
 *
 * **Example:** Bind Postgres in a Service
 * ```typescript
 * import * as Drizzle from "alchemy/Drizzle/Postgres";
 *
 * const conn = yield* Fly.ConnectPostgres(Db);
 * const db = yield* Drizzle.Postgres(conn.connectionString);
 *
 * fetch: Effect.gen(function* () {
 *   const rows = yield* db.select().from(users);
 * });
 * ```
 *
 * @binding
 */
export interface ConnectPostgres extends Binding.Service<ConnectPostgres, "Fly.ConnectPostgres", (postgres: Postgres) => Effect.Effect<ConnectPostgresClient>> {
}
export declare const ConnectPostgres: ConnectPostgres;
export declare const connectEnvKeys: (postgres: Pick<Postgres, "LogicalId">) => {
    pooled: string;
    direct: string;
};
declare const PostgresUrlMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.PostgresUrlMissing";
} & Readonly<A>;
export declare class PostgresUrlMissing extends PostgresUrlMissing_base<{
    name: string;
}> {
}
export interface ConnectPostgresClient {
    /**
     * Pooled PgBouncer connection string. Pass this to
     * {@link Drizzle.Postgres} or `SQL.Postgres`.
     */
    connectionString: Effect.Effect<Redacted.Redacted<string>, PostgresUrlMissing, RuntimeContext>;
    /**
     * Direct (non-PgBouncer) connection string. Use this for session-scoped
     * features (advisory locks, `LISTEN/NOTIFY`) when you are not going
     * through the pooled URL.
     */
    directConnectionString: Effect.Effect<Redacted.Redacted<string>, PostgresUrlMissing, RuntimeContext>;
}
export {};
//# sourceMappingURL=ConnectPostgres.d.ts.map