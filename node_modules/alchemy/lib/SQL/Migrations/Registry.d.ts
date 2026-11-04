import * as Effect from "effect/Effect";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";
import { MigrationError, type DrizzleV0LayoutError, type MigrationHistoryConflictError, type SqlExecutor } from "./Format.ts";
/**
 * The migrations input surface shared by every SQL database resource.
 * A plain string is a directory; the object form overrides the
 * applied-migrations table name. A `Drizzle.Schema` resource's attributes
 * satisfy the `{ out }` shape structurally, so `migrations: schema` works
 * without importing the Drizzle module.
 *
 * There is exactly ONE bookkeeping format — Alchemy's `__alchemy_migrations`
 * table. A database previously migrated with drizzle-kit, Prisma, or
 * wrangler is adopted by a one-way conversion: the foreign table's history
 * is copied into Alchemy's table once and the foreign table is left frozen
 * (never written, never dropped). From then on Alchemy's table is the only
 * bookkeeping.
 */
export type MigrationsInput = string | {
    /** Directory containing the migration files. */
    dir: string;
    /** Override the applied-migrations table name. */
    table?: string;
} | {
    /** A `Drizzle.Schema`-shaped resource output. */
    out: string;
};
export interface NormalizedMigrationsInput {
    dir: string;
    table?: string;
}
export declare const normalizeMigrationsInput: (input: MigrationsInput) => NormalizedMigrationsInput;
/**
 * Normalize a resource's `migrations` prop into the registry input shape.
 * Shared by every SQL database resource.
 */
export declare const migrationsInputOf: (props: {
    migrations?: MigrationsInput;
}) => NormalizedMigrationsInput | undefined;
/**
 * What prior state remembers about migrations — the bookkeeping table a
 * previous deploy used. Rows written by pre-registry Alchemy persisted
 * their table name (`d1_migrations`, `neon_migrations`, custom names), and
 * honoring it keeps them converging against the same table (upgraded in
 * place to the current column shape) instead of starting a new one.
 */
export interface StampedMigrationsState {
    table?: string | undefined;
}
export declare const stampedOf: (output: {
    migrationsTable: string | undefined;
} | undefined) => StampedMigrationsState;
export interface ResolvedMigrations {
    dir: string;
    table: string;
}
/**
 * Resolve where this deploy's bookkeeping lives. Precedence: explicit
 * `table` on the input, then the table persisted by a prior deploy, then
 * the default `__alchemy_migrations`.
 */
export declare const resolveMigrations: (options: {
    input: NormalizedMigrationsInput;
    stamped: StampedMigrationsState;
}) => ResolvedMigrations;
/**
 * Apply pending migrations. The directory layout only selects how records
 * are read and keyed (drizzle-kit/Prisma dirs by directory name, flat dirs
 * by file path) — the bookkeeping is always Alchemy's table, converting
 * foreign or legacy history on first contact (see `AlchemyFormat.ts`).
 */
export declare const applyMigrations: (options: {
    resolved: ResolvedMigrations;
    executor: SqlExecutor;
}) => Effect.Effect<void, MigrationError | MigrationHistoryConflictError | DrizzleV0LayoutError, FileSystem.FileSystem | Path.Path>;
/** The result of one migration sync, ready to stamp into attributes. */
export interface MigrationRun {
    resolved: ResolvedMigrations;
    hashes: Record<string, string>;
}
/**
 * The whole per-deploy migration pipeline: hash the directory (for state
 * drift tracking), resolve the bookkeeping table, and — when the directory
 * is non-empty — apply pending migrations. The database provider supplies
 * only `withExecutor`, a bracket that acquires its target's
 * {@link SqlExecutor} (a D1 HTTP handle, a pg client over a Neon URI or
 * PlanetScale temp role, a mysql2 connection) around the apply.
 */
export declare const runMigrations: <E, R>(options: {
    input: NormalizedMigrationsInput;
    stamped: StampedMigrationsState;
    withExecutor: (apply: (executor: SqlExecutor) => Effect.Effect<void, MigrationError | MigrationHistoryConflictError | DrizzleV0LayoutError, FileSystem.FileSystem | Path.Path>) => Effect.Effect<void, E, R>;
}) => Effect.Effect<MigrationRun, MigrationError | E, R | FileSystem.FileSystem | Path.Path>;
/**
 * The shared migration half of a provider `diff`: true when pending file
 * changes or a bookkeeping-table move require an update. Callers decide the
 * action shape (`{ action: "update" }`, with or without stables).
 */
export declare const diffMigrations: (options: {
    news: {
        migrations?: MigrationsInput;
    };
    output: {
        migrationsTable: string | undefined;
        migrationsHashes: Record<string, string>;
    } | undefined;
}) => Effect.Effect<boolean, MigrationError, FileSystem.FileSystem | Path.Path>;
/**
 * The migration attributes every SQL database resource persists, threaded
 * uniformly: the run's results when migrations ran, otherwise the prior
 * state (so removing `migrations` keeps the stamp and hashes for a later
 * re-add).
 */
export declare const migrationsAttrs: (options: {
    input: NormalizedMigrationsInput | undefined;
    run: MigrationRun | undefined;
    output: {
        migrationsTable: string | undefined;
        migrationsHashes: Record<string, string>;
    } | undefined;
}) => {
    migrationsDir: string | undefined;
    migrationsTable: string | undefined;
    migrationsHashes: Record<string, string>;
};
//# sourceMappingURL=Registry.d.ts.map