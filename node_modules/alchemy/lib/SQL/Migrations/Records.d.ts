import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import { MigrationError, type MigrationDialect, type MigrationRecord } from "./Format.ts";
/** Map filesystem failures into the migration error channel. */
export declare const mapPlatformError: <A, E, R>(effect: Effect.Effect<A, E, R>, context: string) => Effect.Effect<A, MigrationError, R>;
/** Matches drizzle-kit v1 migration directories: `YYYYMMDDHHMMSS_name`. */
export declare const DRIZZLE_DIR_PATTERN: RegExp;
/**
 * Parse a 14-digit `YYYYMMDDHHMMSS` prefix into UTC millis (drizzle's
 * `formatToMillis`). Returns undefined when the name has no such prefix.
 */
export declare const timestampPrefixMillis: (name: string) => number | undefined;
/**
 * Read a drizzle-v1-layout directory (`{ts}_{name}/migration.sql`) into
 * records keyed the way drizzle keys them: `name` = the directory name,
 * sorted by name (drizzle's own sort), hash = sha256 of `migration.sql`.
 */
export declare const readDrizzleDirRecords: (dir: string) => Effect.Effect<MigrationRecord[], MigrationError, FileSystem.FileSystem | Path.Path>;
/**
 * Read a flat directory of `.sql` files into records keyed by relative file
 * path — the convention wrangler and legacy Alchemy state share. Nested
 * `dir/migration.sql` paths are included (via `listSqlFiles`'s recursive
 * listing) so legacy state written against drizzle-layout dirs keeps
 * resolving.
 */
export declare const readFlatRecords: (dir: string) => Effect.Effect<MigrationRecord[], MigrationError, FileSystem.FileSystem | Path.Path>;
/**
 * Render a parameter as a SQL literal. Only used for Alchemy's own
 * bookkeeping queries (names, hashes, millis, ISO dates) against executors
 * without native parameter support (the D1 HTTP API and the local workerd
 * tunnel).
 */
export declare const sqlLiteral: (value: unknown) => string;
/**
 * Inline `?` (sqlite/mysql) or `$n` (postgres) placeholders as SQL
 * literals. String scanning respects quoted spans so literal `?`s inside
 * strings survive.
 */
export declare const inlineSqlParams: (sql: string, params: ReadonlyArray<unknown>, dialect: MigrationDialect) => string;
/** Quote an identifier for the given dialect. */
export declare const quoteIdentifier: (identifier: string, dialect: MigrationDialect) => string;
//# sourceMappingURL=Records.d.ts.map