import type { ClusterCredentials, GetClusterResponse, ManagedCluster } from "@distilled.cloud/fly-io/mpg";
import * as machines from "@distilled.cloud/fly-io/machines";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import { type MigrationsInput } from "../SQL/Migrations/index.ts";
import type { Providers } from "./Providers.ts";
export { stripSslQueryParams } from "./PostgresMigrations.ts";
export declare const DEFAULT_POSTGRES_PLAN = "basic";
export declare const DEFAULT_VOLUME_GB = 10;
export declare const DATABASE_URL_SECRET = "DATABASE_URL";
export declare const DIRECT_DATABASE_URL_SECRET = "DIRECT_DATABASE_URL";
export type PostgresPlan = "basic" | "starter" | "launch" | "scale" | "performance" | (string & {});
export interface PostgresProps {
    /**
     * Region the cluster lives in (`iad`, `ord`, `sjc`, …). Required.
     * The cluster is regional; a {@link App} is global. Changing it
     * replaces the cluster.
     */
    region: string;
    /**
     * Hardware plan. `basic` is 2 shared vCPUs / 1 GB RAM.
     *
     * @default "basic"
     */
    plan?: PostgresPlan;
    /**
     * Cluster name. Unique in the organization. If omitted, a unique
     * name is generated from the stack, stage and logical ID. Changing
     * it replaces the cluster.
     */
    name?: string;
    /**
     * Organization slug. Defaults to the current token's org. Changing
     * it replaces the cluster.
     */
    orgSlug?: string;
    /**
     * Initial volume size in GB. Fly defaults to 10. Create-only.
     *
     * @default 10
     */
    volumeSizeGb?: number;
    /**
     * Enable PostGIS. Create-only.
     *
     * @default false
     */
    postgis?: boolean;
    /**
     * Postgres major version (`16` or `17`). Create-only.
     *
     * @default 16
     */
    pgMajorVersion?: number | string;
    /**
     * SQL migrations to apply against the cluster. Accepts a directory
     * path, a `Drizzle.Schema` resource, or `{ dir, table? }`.
     *
     * Bookkeeping always lives in Alchemy's `__alchemy_migrations` table. A
     * database previously migrated by drizzle-kit or Prisma is adopted by a
     * one-way conversion on first deploy: the old tool's applied history is
     * copied into Alchemy's table and the old table is left frozen. No
     * baselining required.
     *
     * Applied over the **direct** (non-PgBouncer) URI. Fly Managed Postgres
     * is reachable on the org private network; deploy-time apply needs a
     * route to that network (a WireGuard peer, `fly mpg proxy`, or a
     * machine already on 6PN).
     */
    migrations?: MigrationsInput;
    /**
     * Paths to additional `.sql` files to apply after migrations. Each file
     * is hashed; only files whose contents change are re-applied on
     * subsequent deploys.
     */
    importFiles?: string[];
}
export type Postgres = Resource<"Fly.Postgres", PostgresProps, {
    /** Fly Managed Postgres cluster id. */
    clusterId: string;
    /** Cluster name (unique in the org). */
    name: string;
    /** Observed status (`creating`, `ready`, `error`, `deleted`, …). */
    status: string | undefined;
    /** Region the cluster lives in. */
    region: string;
    /** Observed hardware plan. */
    plan: string | undefined;
    /** Organization slug. */
    orgSlug: string | undefined;
    /** Observed disk size in GB. */
    disk: number | undefined;
    /** Whether PostGIS is enabled. */
    postgisEnabled: boolean | undefined;
    /** Observed engine string, if the API returned one. */
    engine: string | undefined;
    /** Observed replica count. */
    replicas: number | undefined;
    /** Internal MPG cluster hash id, if the API returned one. */
    mpgdClusterId: string | undefined;
    /**
     * Direct (non-PgBouncer) Postgres URI. Use this for migrations and
     * session-scoped features. Pass to `Drizzle.Postgres` from a laptop
     * Action; from a {@link Service} prefer {@link ConnectPostgres}.
     */
    connectionUri: string;
    /** Pooled PgBouncer URI. Prefer {@link ConnectPostgres} from a Service. */
    pooledConnectionUri: string;
    migrationsDir: string | undefined;
    migrationsTable: string | undefined;
    migrationsHashes: Record<string, string>;
    importHashes: Record<string, string>;
}, never, Providers>;
/**
 * A Fly.Postgres is a Managed Postgres (MPG) cluster. It is billed.
 * Do not wrap unmanaged `fly postgres`.
 *
 * @see https://fly.io/docs/mpg/create-and-connect/
 *
 * ### Create a cluster
 * `region` is required. Alchemy generates a unique name unless you
 * pass one. Omit `name` in tests and CI.
 *
 * **Example:** Generated name
 * ```typescript
 * const db = yield* Fly.Postgres("Db", {
 *   region: "iad",
 * });
 * ```
 *
 * :::caution[Billed]
 * Managed Postgres is billed. Basic is about $38 per month.
 * :::
 *
 * ### Plan
 * `plan` is the hardware size: `basic`, `starter`, `launch`,
 * `scale`, `performance`. Default is `basic`.
 *
 * **Example:** Starter
 * ```typescript
 * const db = yield* Fly.Postgres("Db", {
 *   region: "iad",
 *   plan: "starter",
 * });
 * ```
 *
 * :::note[Create-only]
 * Changing `plan` later is ignored. Fly has no cluster update API.
 * :::
 *
 * ### Region
 * The cluster is regional. An {@link App} is global. Pass `region`
 * on the cluster, not on the App.
 *
 * **Example:** Pin a region
 * ```typescript
 * const db = yield* Fly.Postgres("Db", {
 *   region: "lhr",
 * });
 * ```
 *
 * :::caution[Changing `region` replaces the cluster]
 * A new cluster is created in the new region. The old cluster is
 * deleted. Data is not copied.
 * :::
 *
 * ### Volume size
 * `volumeSizeGb` is the initial disk. Fly defaults to 10 GB.
 *
 * **Example:** 20 GB
 * ```typescript
 * const db = yield* Fly.Postgres("Db", {
 *   region: "iad",
 *   volumeSizeGb: 20,
 * });
 * ```
 *
 * :::note[Create-only]
 * Changing `volumeSizeGb` later is ignored.
 * :::
 *
 * ### PostGIS
 * `postgis: true` enables PostGIS at create.
 *
 * **Example:** Enable PostGIS
 * ```typescript
 * const db = yield* Fly.Postgres("Db", {
 *   region: "iad",
 *   postgis: true,
 * });
 * ```
 *
 * :::note[Create-only]
 * Flipping `postgis` later is ignored.
 * :::
 *
 * ### Connect from a Service
 * Yield `ConnectPostgres` inside init. Provide
 * {@link ConnectPostgresHttp}. Pass `conn.connectionString` to
 * `Drizzle.Postgres` or `SQL.Postgres`.
 *
 * **Example:** Bind and query
 * ```typescript
 * import * as Drizzle from "alchemy/Drizzle/Postgres";
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * export default class Api extends Fly.Service<Api>()(
 *   "Api",
 *   { app: Site, main: import.meta.url, port: 3000 },
 *   Effect.gen(function* () {
 *     const conn = yield* Fly.ConnectPostgres(Db);
 *     const db = yield* Drizzle.Postgres(conn.connectionString);
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const rows = yield* db.execute("select 1 as ok");
 *         return HttpServerResponse.json({ rows });
 *       }),
 *     };
 *   }).pipe(Effect.provide(Fly.ConnectPostgresHttp)),
 * ) {}
 * ```
 *
 * ### Migrations
 * Pass a directory, `{ dir, table? }`, or a `Drizzle.Schema` resource.
 * Alchemy applies pending files on deploy over the direct URI.
 *
 * **Example:** Directory
 * ```typescript
 * const db = yield* Fly.Postgres("Db", {
 *   region: "iad",
 *   migrations: "./migrations",
 * });
 * ```
 *
 * **Example:** Drizzle.Schema
 * ```typescript
 * const schema = yield* Drizzle.Schema("app-schema", {
 *   schema: "./src/schema.ts",
 *   out: "./migrations",
 * });
 *
 * const db = yield* Fly.Postgres("Db", {
 *   region: "iad",
 *   migrations: schema,
 * });
 * ```
 *
 * @resource
 */
export declare const Postgres: import("../Resource.ts").ResourceClass<Postgres>;
declare const PostgresNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.PostgresNotCreated";
} & Readonly<A>;
export declare class PostgresNotCreated extends PostgresNotCreated_base<{
    name: string;
    orgSlug: string;
}> {
}
declare const PostgresCreateFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.PostgresCreateFailed";
} & Readonly<A>;
export declare class PostgresCreateFailed extends PostgresCreateFailed_base<{
    clusterId: string;
    status: string;
}> {
}
declare const PostgresCredentialsMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.PostgresCredentialsMissing";
} & Readonly<A>;
export declare class PostgresCredentialsMissing extends PostgresCredentialsMissing_base<{
    clusterId: string;
}> {
}
declare const PostgresAttachmentFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Fly.PostgresAttachmentFailed";
} & Readonly<A>;
export declare class PostgresAttachmentFailed extends PostgresAttachmentFailed_base<{
    clusterId: string;
    appName: string;
}> {
}
export declare const isLiveCluster: (cluster: ManagedCluster | undefined) => cluster is ManagedCluster;
export declare const unwrapSensitive: (value: string | Redacted.Redacted<string> | undefined) => string | undefined;
export declare const getLiveCluster: (clusterId: string) => Effect.Effect<ManagedCluster | undefined, machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const getClusterResponse: (clusterId: string) => Effect.Effect<GetClusterResponse | undefined, machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const credentialsUri: (credentials: ClusterCredentials | undefined) => string | undefined;
export declare const directUri: (_cluster: ManagedCluster | undefined, credentials: ClusterCredentials | undefined) => string | undefined;
/**
 * Write `DATABASE_URL` (and `DIRECT_DATABASE_URL` if present) onto an
 * App and record the MPG attachment. Called from {@link Service}
 * reconcile when {@link ConnectPostgres} binds a cluster.
 */
export declare const attachPostgresSecrets: (appName: string, clusterId: string, variableName?: string | undefined) => Effect.Effect<number | undefined, import("@distilled.cloud/fly-io").BadRequest | import("@distilled.cloud/fly-io").Conflict | import("@distilled.cloud/fly-io").Forbidden | import("@distilled.cloud/fly-io").NotFound | PostgresAttachmentFailed | PostgresCredentialsMissing | import("effect/Cause").TimeoutError | machines.FlyIoOpError, machines.FlyIoOpContext>;
export declare const PostgresProvider: () => import("effect/Layer").Layer<Provider.Provider<Postgres>, never, import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../Stack.ts").Stack | import("../Stage.ts").Stage | machines.FlyIoOpContext>;
//# sourceMappingURL=Postgres.d.ts.map