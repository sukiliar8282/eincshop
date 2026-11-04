import type { RuntimeServices } from "@alchemy.run/cloudflare-runtime/core";
import * as d1 from "@distilled.cloud/cloudflare/d1";
import * as Layer from "effect/Layer";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { type MigrationsInput } from "../../SQL/Migrations/index.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export declare const isDatabase: (value: unknown) => value is Database;
export type Jurisdiction = "default" | "eu" | "fedramp";
export type PrimaryLocationHint = "wnam" | "enam" | "weur" | "eeur" | "apac" | "oc";
export type CloneSource = Database | {
    databaseId: string;
} | {
    name: string;
};
export type DatabaseProps = {
    /**
     * Name of the database. If omitted, a unique name will be generated.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Region in which the primary copy of the data is stored. Cannot be
     * changed after creation — updating this property triggers a replacement.
     *
     * - `wnam` — Western North America
     * - `enam` — Eastern North America
     * - `weur` — Western Europe
     * - `eeur` — Eastern Europe
     * - `apac` — Asia Pacific
     * - `oc`   — Oceania
     */
    primaryLocationHint?: PrimaryLocationHint;
    /**
     * Read replication configuration. The only mutable property after
     * creation; toggling `mode` triggers an in-place update.
     *
     * @default { mode: "disabled" }
     */
    readReplication?: {
        mode: "auto" | "disabled";
    };
    /**
     * Jurisdiction in which the database data is guaranteed to be stored.
     * Cannot be changed after creation.
     *
     * @default "default"
     */
    jurisdiction?: Jurisdiction;
    /**
     * SQL migrations to apply on deploy. Accepts a directory path, a
     * `Drizzle.Schema` resource, or a `{ dir, table? }` object.
     *
     * Bookkeeping always lives in Alchemy's `__alchemy_migrations` table. A
     * database previously migrated with `drizzle-kit migrate` or
     * `wrangler d1 migrations apply` is adopted by a ONE-WAY conversion on
     * first deploy: the old tool's applied history is copied into Alchemy's
     * table (validated against the local files) and the old table is left
     * frozen — never written, never dropped. From then on Alchemy owns the
     * migration state.
     *
     * Pending migrations are detected on each deploy and applied in order as
     * part of `update`.
     */
    migrations?: MigrationsInput;
    /**
     * Paths to additional `.sql` files to import after migrations are
     * applied. Each file is uploaded via Cloudflare's D1 import API and
     * hashed; only files whose contents change are re-imported on subsequent
     * deploys.
     *
     * @see https://developers.cloudflare.com/d1/best-practices/import-export-data/
     */
    importFiles?: string[];
    /**
     * Clone data from an existing database during creation by exporting the
     * source and importing it into the new database. Only applied during the
     * `create` phase.
     *
     * Accepts:
     * - another `D1Database` resource (uses its `databaseId`)
     * - `{ databaseId }` — clone by explicit UUID
     * - `{ name }` — look up the source by name and clone it
     */
    clone?: CloneSource;
};
export type Database = Resource<"Cloudflare.D1Database", DatabaseProps, {
    databaseId: string;
    databaseName: string;
    jurisdiction: Jurisdiction;
    readReplication: {
        mode: "auto" | "disabled";
    } | undefined;
    accountId: string;
    migrationsDir: string | undefined;
    migrationsTable: string | undefined;
    migrationsHashes: Record<string, string>;
    importHashes: Record<string, string>;
}, never, Providers>;
/**
 * A Cloudflare D1 serverless SQL database built on SQLite.
 *
 * D1 is a serverless relational database that runs at the edge. Create a
 * database as a resource, then bind it to a Worker to run SQL queries.
 * ### Creating a Database
 * **Example:** Basic database
 * ```typescript
 * const db = yield* Cloudflare.D1.Database("my-db");
 * ```
 *
 * **Example:** Database with location hint
 * The primary copy of the data is stored in the chosen region; reads can be
 * served closer to users when read replication is enabled.
 * ```typescript
 * const db = yield* Cloudflare.D1.Database("my-db", {
 *   primaryLocationHint: "wnam",
 * });
 * ```
 *
 * **Example:** Database with read replication
 * Read replication is the only mutable property after creation — toggling it
 * triggers an update rather than a replacement.
 * ```typescript
 * const db = yield* Cloudflare.D1.Database("my-db", {
 *   readReplication: { mode: "auto" },
 * });
 * ```
 *
 * **Example:** Database in a specific jurisdiction
 * ```typescript
 * const db = yield* Cloudflare.D1.Database("my-db", {
 *   jurisdiction: "eu",
 * });
 * ```
 *
 * ### Migrations
 * Point `migrations` at a folder of migration files. Already-applied
 * migrations are skipped on subsequent deploys; new files are detected
 * automatically and applied as part of the next update.
 *
 * Bookkeeping always lives in Alchemy's `__alchemy_migrations` table —
 * one format, owned by Alchemy. A database previously migrated with
 * drizzle-kit, Prisma, or wrangler is adopted by a one-way conversion on
 * first deploy: the old tool's applied history is copied into Alchemy's
 * table and the old table is left frozen (never written, never dropped).
 * No baselining required. Legacy Alchemy tracking tables are detected by
 * column shape and upgraded in place.
 *
 * **Example:** Apply migrations from a directory
 * ```typescript
 * const db = yield* Cloudflare.D1.Database("my-db", {
 *   migrations: "./migrations",
 * });
 * ```
 *
 * **Example:** Drizzle migrations (adopts an existing drizzle-kit-migrated database)
 * ```typescript
 * const schema = yield* Drizzle.Schema("app-schema", {
 *   schema: "./src/schema.ts",
 *   dialect: "sqlite",
 * });
 * const db = yield* Cloudflare.D1.Database("my-db", {
 *   migrations: schema,
 * });
 * ```
 *
 * **Example:** Custom bookkeeping table name
 * ```typescript
 * const db = yield* Cloudflare.D1.Database("my-db", {
 *   migrations: { dir: "./migrations", table: "my_migrations" },
 * });
 * ```
 *
 * ### Importing SQL
 * Use `importFiles` to seed the database with raw `.sql` files via Cloudflare's
 * D1 import API. Each file is hashed; only files whose contents change are
 * re-imported on subsequent deploys.
 *
 * **Example:** Seed a database with SQL files
 * ```typescript
 * const db = yield* Cloudflare.D1.Database("my-db", {
 *   importFiles: ["./seed/users.sql", "./seed/posts.sql"],
 * });
 * ```
 *
 * ### Cloning a Database
 * `clone` performs a full export → import from a source database during
 * creation. It accepts a `D1Database` resource, a `{ databaseId }`, or a
 * `{ name }` to look up by name.
 *
 * **Example:** Clone by passing the source resource directly
 * ```typescript
 * const source = yield* Cloudflare.D1.Database("source-db");
 * const cloned = yield* Cloudflare.D1.Database("cloned-db", {
 *   clone: source,
 * });
 * ```
 *
 * **Example:** Clone by databaseId
 * ```typescript
 * const cloned = yield* Cloudflare.D1.Database("cloned-db", {
 *   clone: { databaseId: "abcdef12-3456-7890-abcd-ef1234567890" },
 * });
 * ```
 *
 * **Example:** Clone by name
 * ```typescript
 * const cloned = yield* Cloudflare.D1.Database("cloned-db", {
 *   clone: { name: "source-db" },
 * });
 * ```
 *
 * ### Binding to a Worker
 * **Example:** Using D1 inside a Worker
 * ```typescript
 * const db = yield* Cloudflare.D1.QueryDatabase(MyDatabase);
 *
 * // Run a query
 * const results = yield* db.prepare("SELECT * FROM users WHERE id = ?")
 *   .bind(userId)
 *   .all();
 *
 * // Execute a mutation
 * yield* db.prepare("INSERT INTO users (id, name) VALUES (?, ?)")
 *   .bind(newId, name)
 *   .run();
 * ```
 *
 * @see https://developers.cloudflare.com/d1/
 *
 * @resource
 * @product D1
 * @category Storage & Databases
 */
export declare const Database: import("../../Resource.ts").ResourceClass<Database>;
export declare const ProviderLive: () => Layer.Layer<Provider.Provider<Database>, never, CloudflareEnvironment | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | d1.CloudflareOpContext>;
/**
 * Local (dev) provider — the database is purely virtual: a `dev:` id keyed
 * into the local workerd D1 simulator (DO SQLite under `.alchemy/local/d1`).
 * `toRuntimeBinding` lowers a `d1` binding whose id is `dev:`-prefixed onto
 * the local D1 service.
 *
 * Migrations ARE applied locally: reconcile boots an ephemeral gateway
 * workerd (see `LocalD1Gateway.ts`) and drives the same executor-agnostic
 * migration flow the live provider uses, against the simulator's storage.
 *
 * RPC-backed: under `alchemy dev` (an `RpcProviderProxy` in context) the
 * whole lifecycle runs in the Cloudflare sidecar process — where
 * `localRuntimeServices()` is real and shared with the Worker/Queue/
 * Container local providers — instead of in the user's process where that
 * layer is gated empty (the root cause of #1007). In-process runs (no
 * proxy: `sidecar: false` tests, a plain deploy deleting a local-mode row)
 * build the provider directly with the un-gated runtime from the `dual`
 * registration.
 */
export declare const ProviderLocal: () => Layer.Layer<Provider.Provider<Database>, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | CloudflareEnvironment | import("effect/FileSystem").FileSystem | HttpClient.HttpClient | import("effect/Path").Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | RuntimeServices>;
export declare const DatabaseProvider: () => Layer.Layer<Provider.Provider<Database>, import("effect/Config").ConfigError | import("@alchemy.run/cloudflare-runtime/core").ConfigError | import("effect/PlatformError").PlatformError | import("@alchemy.run/cloudflare-runtime/core").SystemError, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CloudflareEnvironment | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | d1.CloudflareOpContext>;
//# sourceMappingURL=Database.d.ts.map