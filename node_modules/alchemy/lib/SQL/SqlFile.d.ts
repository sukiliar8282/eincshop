import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
export interface SqlFile {
    id: string;
    sql: string;
    hash: string;
}
/**
 * Recursively list `.sql` files under `directory`, sorted by their numeric
 * prefix (e.g. `0001_init.sql`) and then by name.
 */
export declare const listSqlFiles: (directory: string) => Effect.Effect<SqlFile[], import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
/**
 * Read a single `.sql` file relative to `directory` and compute its content
 * hash. The `sql` field is marked non-enumerable so it isn't serialized into
 * resource state.
 */
export declare const readSqlFile: (directory: string, name: string) => Effect.Effect<SqlFile, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
export declare const hashMigrations: (migrationsDir: string) => Effect.Effect<Record<string, string>, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
export declare const hashImports: (importFiles: ReadonlyArray<string>, rootDir: string) => Effect.Effect<Record<string, string>, import("effect/PlatformError").PlatformError, FileSystem.FileSystem | Path.Path>;
/**
 * Split a migration file into individual statements on its
 * `--> statement-breakpoint` markers. MySQL engines need this: they only
 * treat `--` as a comment when followed by whitespace, so the `-->` token is
 * a syntax error ("syntax error at position 2" on Vitess). Postgres and
 * sqlite comment on `--` regardless of the next character, so their runners
 * send files whole.
 */
export declare const splitSqlStatements: (sql: string) => string[];
//# sourceMappingURL=SqlFile.d.ts.map