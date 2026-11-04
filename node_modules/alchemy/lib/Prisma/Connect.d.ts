import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Binding from "../Binding.ts";
import { RuntimeContext } from "../RuntimeContext.ts";
import type { Connection } from "./Connection.ts";
/**
 * The typed runtime client returned by {@link Connect}.
 */
export interface ConnectClient {
    /**
     * Conventional application database URL, redacted.
     *
     * Resolves to the pooled Postgres URL first, then direct Postgres, then
     * Accelerate — the serverless-safe default for application traffic. Dies
     * with a descriptive defect when the connection carries no URL at all.
     *
     * Feed it straight into `SQL.Postgres` / `Drizzle.Postgres`:
     *
     * ```typescript
     * const db = yield* Prisma.Connect(connection);
     * const sql = yield* SQL.Postgres({ url: db.databaseUrl });
     * ```
     */
    databaseUrl: Effect.Effect<Redacted.Redacted<string>, never, RuntimeContext>;
    /**
     * Prisma connection/API key ID.
     */
    connectionId: Effect.Effect<string, never, RuntimeContext>;
    /**
     * Database ID this connection belongs to.
     */
    databaseId: Effect.Effect<string, never, RuntimeContext>;
    /**
     * Direct Postgres connection string, when available.
     */
    directConnectionString: Effect.Effect<Redacted.Redacted<string> | undefined, never, RuntimeContext>;
    /**
     * Pooled Prisma Postgres connection string, when available.
     */
    pooledConnectionString: Effect.Effect<Redacted.Redacted<string> | undefined, never, RuntimeContext>;
    /**
     * Accelerate connection string, when available.
     */
    accelerateConnectionString: Effect.Effect<Redacted.Redacted<string> | undefined, never, RuntimeContext>;
    /**
     * Direct database host, when available.
     */
    host: Effect.Effect<string | null | undefined, never, RuntimeContext>;
    /**
     * Direct database user, when available.
     */
    user: Effect.Effect<string | null | undefined, never, RuntimeContext>;
    /**
     * Direct database password, when available.
     */
    password: Effect.Effect<Redacted.Redacted<string> | undefined, never, RuntimeContext>;
}
/**
 * Bind a {@link Connection} to a Prisma Compute app, AWS Lambda Function,
 * Cloudflare Worker, or Cloudflare Container and obtain the typed runtime
 * client.
 *
 * `Connect` is a single identifier that is simultaneously the binding's
 * Context tag, its type, and the callable —
 * `yield* Prisma.Connect(connection)`.
 *
 * Provide `Prisma.ConnectBinding` on the host implementation so Alchemy can
 * register the deploy-time binding and resolve the client at runtime.
 *
 * ### Binding a Connection
 * **Example:** Use a connection inside Prisma Compute
 * ```typescript
 * export default Prisma.Compute(
 *   "api",
 *   { project, main: import.meta.filename },
 *   Effect.gen(function* () {
 *     const db = yield* Prisma.Connect(connection);
 *     const sql = yield* SQL.Postgres({ url: db.databaseUrl });
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const users = yield* sql`SELECT * FROM users`;
 *         return yield* HttpServerResponse.json(users);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Prisma.ConnectBinding)),
 * );
 * ```
 *
 * **Example:** Use a connection inside a Cloudflare Container
 * ```typescript
 * export default Api.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const db = yield* Prisma.Connect(connection);
 *     const sql = yield* SQL.Postgres({ url: db.databaseUrl });
 *
 *     return Api.of({
 *       fetch: Effect.gen(function* () {
 *         const users = yield* sql`SELECT * FROM users`;
 *         return yield* HttpServerResponse.json(users);
 *       }),
 *     });
 *   }).pipe(Effect.provide(Prisma.ConnectBinding)),
 * );
 * ```
 *
 * A container is a real process with no workerd bindings, so the connection
 * travels as plain environment variables — the same channel Prisma Compute
 * and Lambda use. Start the container with
 * `Cloudflare.Containers.layer(Api, { enableInternet: true })` so it can
 * reach the database. (Hyperdrive, by contrast, is a workerd binding and is
 * unavailable inside a container.)
 *
 * @binding
 */
export interface Connect extends Binding.Service<Connect, "Prisma.Connect", (connection: Connection) => Effect.Effect<ConnectClient>> {
}
export declare const Connect: Connect;
export interface ConnectEnvKeys {
    connectionId: string;
    databaseId: string;
    directConnectionString: string;
    pooledConnectionString: string;
    accelerateConnectionString: string;
    host: string;
    user: string;
    password: string;
}
/**
 * Derive the env var names {@link Connect} uses to carry a Connection's
 * outputs into the host runtime.
 */
export declare const connectEnvKeys: (connection: Pick<Connection, "FQN" | "LogicalId">) => ConnectEnvKeys;
/**
 * Implementation layer for {@link Connect}. Provide it on the host
 * Function/Worker Effect:
 *
 * ```typescript
 * Effect.gen(function* () {
 *   const db = yield* Prisma.Connect(connection);
 *   // ...
 * }).pipe(Effect.provide(Prisma.ConnectBinding))
 * ```
 */
export declare const ConnectBinding: Layer.Layer<Connect, never, never>;
//# sourceMappingURL=Connect.d.ts.map