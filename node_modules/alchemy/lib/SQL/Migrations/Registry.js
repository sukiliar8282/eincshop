import * as Effect from "effect/Effect";
import { hashMigrations } from "../SqlFile.js";
import { recordsEqual } from "../../Util/equal.js";
import { ALCHEMY_DEFAULT_TABLE, applyAlchemyFormat } from "./AlchemyFormat.js";
import { detectLayout } from "./Detect.js";
import { MigrationError, } from "./Format.js";
import { readDrizzleDirRecords, readFlatRecords } from "./Records.js";
export const normalizeMigrationsInput = (input) => {
    if (typeof input === "string")
        return { dir: input };
    if ("out" in input)
        return { dir: input.out };
    return input;
};
/**
 * Normalize a resource's `migrations` prop into the registry input shape.
 * Shared by every SQL database resource.
 */
export const migrationsInputOf = (props) => props.migrations ? normalizeMigrationsInput(props.migrations) : undefined;
export const stampedOf = (output) => ({ table: output?.migrationsTable });
/**
 * Resolve where this deploy's bookkeeping lives. Precedence: explicit
 * `table` on the input, then the table persisted by a prior deploy, then
 * the default `__alchemy_migrations`.
 */
export const resolveMigrations = (options) => ({
    dir: options.input.dir,
    table: options.input.table ?? options.stamped.table ?? ALCHEMY_DEFAULT_TABLE,
});
/**
 * Apply pending migrations. The directory layout only selects how records
 * are read and keyed (drizzle-kit/Prisma dirs by directory name, flat dirs
 * by file path) — the bookkeeping is always Alchemy's table, converting
 * foreign or legacy history on first contact (see `AlchemyFormat.ts`).
 */
export const applyMigrations = (options) => Effect.gen(function* () {
    const { resolved, executor } = options;
    const layout = yield* detectLayout(resolved.dir);
    const records = layout === "flat"
        ? yield* readFlatRecords(resolved.dir)
        : yield* readDrizzleDirRecords(resolved.dir);
    yield* applyAlchemyFormat({
        executor,
        table: resolved.table,
        records,
    });
});
const hashMigrationsDir = (dir) => hashMigrations(dir).pipe(Effect.mapError((cause) => new MigrationError({
    message: `Failed to read migrations from ${dir}: ${String(cause)}`,
    cause,
})));
/**
 * The whole per-deploy migration pipeline: hash the directory (for state
 * drift tracking), resolve the bookkeeping table, and — when the directory
 * is non-empty — apply pending migrations. The database provider supplies
 * only `withExecutor`, a bracket that acquires its target's
 * {@link SqlExecutor} (a D1 HTTP handle, a pg client over a Neon URI or
 * PlanetScale temp role, a mysql2 connection) around the apply.
 */
export const runMigrations = (options) => Effect.gen(function* () {
    const hashes = yield* hashMigrationsDir(options.input.dir);
    const resolved = resolveMigrations(options);
    if (Object.keys(hashes).length > 0) {
        yield* options.withExecutor((executor) => applyMigrations({ resolved, executor }));
    }
    return { resolved, hashes };
});
/**
 * The shared migration half of a provider `diff`: true when pending file
 * changes or a bookkeeping-table move require an update. Callers decide the
 * action shape (`{ action: "update" }`, with or without stables).
 */
export const diffMigrations = (options) => Effect.gen(function* () {
    const input = migrationsInputOf(options.news);
    if (!input)
        return false;
    const newHashes = yield* hashMigrationsDir(input.dir);
    if (!recordsEqual(newHashes, options.output?.migrationsHashes ?? {})) {
        return true;
    }
    const resolved = resolveMigrations({
        input,
        stamped: stampedOf(options.output),
    });
    return (resolved.table !== (options.output?.migrationsTable ?? resolved.table));
});
/**
 * The migration attributes every SQL database resource persists, threaded
 * uniformly: the run's results when migrations ran, otherwise the prior
 * state (so removing `migrations` keeps the stamp and hashes for a later
 * re-add).
 */
export const migrationsAttrs = (options) => ({
    migrationsDir: options.input?.dir,
    migrationsTable: options.run?.resolved.table ?? options.output?.migrationsTable,
    migrationsHashes: options.run?.hashes ?? options.output?.migrationsHashes ?? {},
});
//# sourceMappingURL=Registry.js.map