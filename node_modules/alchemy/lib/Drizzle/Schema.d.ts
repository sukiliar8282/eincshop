import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type Dialect = "postgres" | "mysql" | "sqlite";
export type SchemaProps = {
    /**
     * Path to the schema module, relative to the current working directory.
     * The module is loaded via dynamic `import()` so drizzle-kit can introspect
     * the table definitions, then diffed against the latest snapshot under
     * `out` to detect changes.
     *
     * @example "./src/schema.ts"
     */
    schema: string;
    /**
     * Output directory for generated migrations. Each migration is written as
     * `{out}/{timestamp}_migration/{migration.sql, snapshot.json}`. Pass this
     * through as a database resource's `migrations` prop (`Neon.Branch`,
     * `Fly.Postgres`, `Cloudflare.D1.Database`, …) to apply pending
     * migrations on deploy.
     *
     * @default "./migrations"
     */
    out?: string;
    /**
     * SQL dialect to generate migrations for. Selects which `drizzle-kit/api-*`
     * module is loaded.
     *
     * @default "postgres"
     */
    dialect?: Dialect;
};
export type Schema = Resource<"Drizzle.Schema", SchemaProps, {
    /** Path to the migrations directory, relative to the current working directory. */
    out: string;
    /**
     * sha256 of the latest snapshot.json. Stable across deploys when the
     * schema is unchanged; bumps trigger an update which regenerates pending
     * migration SQL. Downstream `migrationsDir` consumers read this to
     * detect drift and reapply.
     */
    snapshotHash: string;
    /** Names of all migration directories under `out`, in order. */
    migrations: string[];
}, never, Providers>;
/**
 * A Drizzle schema managed as an Alchemy resource.
 *
 * Wraps drizzle-kit's programmatic API (`generateDrizzleJson` /
 * `generateMigration`) so migration SQL is regenerated as part of `alchemy
 * deploy` whenever the source schema changes. The output directory is
 * intended to be passed straight to a database resource's `migrations`
 * prop, giving you a single deploy-driven flow:
 *
 * ```typescript
 * const schema = yield* Drizzle.Schema("app-schema", {
 *   schema: "./src/schema.ts",
 * });
 *
 * const branch = yield* Neon.Branch("app-branch", {
 *   project,
 *   migrations: schema,
 * });
 *
 * const db = yield* Fly.Postgres("Db", {
 *   region: "iad",
 *   migrations: schema,
 * });
 * ```
 *
 * `Drizzle.Schema` runs first (because the database resource depends
 * on its `out` output), regenerates pending migration files, and the
 * database resource then applies them.
 *
 * The resource is delete-safe: removing it from the stack does **not** wipe
 * the migrations directory, since migration files are typically checked in
 * and shared with other environments.
 *
 * @resource
 */
export declare const Schema: import("../Resource.ts").ResourceClass<Schema>;
export declare const SchemaProvider: () => import("effect/Layer").Layer<Provider.Provider<Schema>, never, import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | FileSystem.FileSystem | Path.Path | import("effect/Scope").Scope>;
//# sourceMappingURL=Schema.d.ts.map