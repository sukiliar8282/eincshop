import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Database } from "./Database.ts";
import type { PostgresOrigin } from "./PostgresOrigin.ts";
import type { Providers } from "./Providers.ts";
export interface ConnectionProps {
    /**
     * Database ID or `database.databaseId` output this connection belongs to.
     */
    database: string | Database;
    /**
     * Human-readable connection name prefix. Alchemy appends the resource
     * instance identity because Prisma permits duplicate connection names and
     * exposes no ownership tags.
     *
     * @default the resource's logical ID
     */
    name?: string;
    /**
     * Rotate credentials when this value changes from `false` to `true` while
     * keeping the connection ID. Prisma revokes the previous credentials on a
     * best-effort basis. Deploy `false` before changing back to `true` for a
     * later rotation.
     *
     * @default false
     */
    rotate?: boolean;
}
export interface Connection extends Resource<"Prisma.Connection", ConnectionProps, {
    /**
     * Prisma connection/API key ID.
     */
    connectionId: string;
    /**
     * Connection display name.
     */
    connectionName: string;
    /**
     * Database ID this connection belongs to.
     */
    databaseId: string;
    /**
     * Connection kind returned by Prisma.
     */
    kind: "postgres" | "accelerate";
    /**
     * ISO timestamp when the connection was created.
     */
    createdAt: string;
    /**
     * Direct Postgres connection string, redacted in state.
     */
    directConnectionString: Redacted.Redacted<string> | undefined;
    /**
     * Pooled Postgres connection string, redacted in state.
     */
    pooledConnectionString: Redacted.Redacted<string> | undefined;
    /**
     * Accelerate connection string, redacted in state.
     */
    accelerateConnectionString: Redacted.Redacted<string> | undefined;
    /**
     * Direct database host, when returned by Prisma.
     */
    host: string | null | undefined;
    /**
     * Direct database username, when returned by Prisma.
     */
    user: string | null | undefined;
    /**
     * Direct database password, redacted in state.
     */
    password: Redacted.Redacted<string> | undefined;
    /**
     * Conventional application database URL, redacted in state.
     *
     * Resolves to the pooled Postgres URL first, then direct Postgres, then
     * Accelerate — the serverless-safe default for application traffic.
     */
    databaseUrl: Redacted.Redacted<string> | undefined;
    /**
     * Parsed direct connection components ready to feed into a Postgres
     * origin — e.g. `Cloudflare.Hyperdrive`'s `origin` prop. Points at the
     * direct (non-pooled) endpoint, which is the recommended target when
     * fronting Prisma Postgres with another pooler like Hyperdrive.
     */
    origin: PostgresOrigin | undefined;
    /**
     * Parsed pooled connection components. Useful as a Hyperdrive `dev`
     * origin when local workers bypass Hyperdrive and connect directly.
     */
    pooledOrigin: PostgresOrigin | undefined;
}, never, Providers> {
}
/**
 * A Prisma database connection/API key.
 *
 * Prisma returns connection credentials only when it creates or rotates a
 * connection. Alchemy stores those outputs as `Redacted` values. Changing the
 * database or name replaces the connection; changing `rotate` from `false` to
 * `true` keeps the connection ID and requests fresh credentials.
 *
 * ### Creating a Connection
 * **Example:** Application connection
 * ```typescript
 * const connection = yield* Prisma.Connection("api", {
 *   database: database.databaseId,
 * });
 * ```
 *
 * ### Binding to Platforms
 * **Example:** Pass database URLs to Compute env
 * ```typescript
 * const connection = yield* Prisma.Connection("api", {
 *   database,
 * });
 *
 * const app = yield* Prisma.Compute("api", {
 *   project,
 *   path: "./apps/api",
 *   env: {
 *     DATABASE_URL: connection.databaseUrl,
 *     DIRECT_URL: connection.directConnectionString,
 *   },
 * });
 * ```
 *
 * **Example:** Use a connection inside an Effect-native Compute app
 * ```typescript
 * export default Prisma.Compute(
 *   "api",
 *   { project, appName: "api", main: import.meta.filename },
 *   Effect.gen(function* () {
 *     const db = yield* Prisma.Connect(connection);
 *     const sql = yield* SQL.Postgres({ url: db.databaseUrl });
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
 * **Example:** Use a connection inside an Effect-native Lambda function
 * ```typescript
 * export default AWS.Lambda.Function(
 *   "api",
 *   { main: import.meta.filename, functionUrl: true },
 *   Effect.gen(function* () {
 *     const db = yield* Prisma.Connect(connection);
 *     const sql = yield* SQL.Postgres({ url: db.databaseUrl });
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
 * **Example:** Use a connection inside an Effect-native Cloudflare Worker
 * ```typescript
 * export default Cloudflare.Worker(
 *   "api",
 *   { main: import.meta.filename, compatibility: { flags: ["nodejs_compat"] } },
 *   Effect.gen(function* () {
 *     const db = yield* Prisma.Connect(connection);
 *     const sql = yield* SQL.Postgres({ url: db.databaseUrl });
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const result = yield* sql`SELECT 1 AS ok`;
 *         return yield* HttpServerResponse.json(result);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Prisma.ConnectBinding)),
 * );
 * ```
 *
 * ### Rotating Credentials
 * **Example:** Request one rotation
 * ```typescript
 * const connection = yield* Prisma.Connection("api", {
 *   database,
 *   rotate: true,
 * });
 * ```
 *
 * ### Connecting over Hyperdrive
 * **Example:** Front Prisma Postgres with Cloudflare Hyperdrive
 * ```typescript
 * const hyperdrive = yield* Cloudflare.Hyperdrive.Connection("api-hd", {
 *   origin: connection.origin.as<Prisma.PostgresOrigin>(),
 * });
 *
 * export default Cloudflare.Worker(
 *   "api",
 *   { main: import.meta.filename, compatibility: { flags: ["nodejs_compat"] } },
 *   Effect.gen(function* () {
 *     const hd = yield* Cloudflare.Hyperdrive.Connect(hyperdrive);
 *     const sql = yield* SQL.Postgres({ url: hd.connectionString });
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const users = yield* sql`SELECT * FROM users`;
 *         return yield* HttpServerResponse.json(users);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.Hyperdrive.ConnectBinding)),
 * );
 * ```
 *
 * @resource
 */
export declare const Connection: import("../Resource.ts").ResourceClass<Connection>;
export declare const ConnectionProvider: () => import("effect/Layer").Layer<Provider.Provider<Connection>, never, any>;
//# sourceMappingURL=Connection.d.ts.map