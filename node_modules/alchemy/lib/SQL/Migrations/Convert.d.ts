import * as Effect from "effect/Effect";
import { MigrationError, MigrationHistoryConflictError, type MigrationRecord, type SqlExecutor } from "./Format.ts";
/**
 * A row of applied history harvested from a foreign migration tool's table,
 * normalized for insertion into `__alchemy_migrations`.
 */
export interface ConvertedRow {
    name: string;
    hash: string | undefined;
    createdAtMillis: number | undefined;
    appliedAt: string | undefined;
}
export interface ForeignHistory {
    /** Which tool's bookkeeping this history came from. */
    tool: "drizzle" | "prisma" | "wrangler" | "legacy-alchemy";
    /** Display name of the source table (schema-qualified where relevant). */
    source: string;
    rows: ConvertedRow[];
}
/**
 * Normalize a timestamp-ish column value for re-insertion as a SQL
 * literal. Drivers differ: pg hands back JS Dates (whose default
 * stringification pg itself cannot parse — "GMT-0700 (…)"), sqlite hands
 * back strings.
 */
export declare const toTimestampString: (value: unknown) => string | undefined;
/**
 * Discover applied-migration history left behind by the tool a user is
 * migrating FROM — drizzle-kit, Prisma, or wrangler — so it can be copied
 * into Alchemy's own table once. This is a ONE-WAY migration: the foreign
 * table is read but never written or dropped (it is simply frozen), and
 * from that point on Alchemy's table is the only bookkeeping.
 *
 * Sources probed, most-specific first:
 * - drizzle: `__drizzle_migrations` (in the `drizzle` schema on Postgres) —
 *   drizzle's columns are Alchemy's columns, so rows copy verbatim.
 * - prisma: `_prisma_migrations` — `migration_name`/`checksum` map to
 *   `name`/`hash` (both are sha256 of `migration.sql`). A failed migration
 *   (`finished_at IS NULL`, not rolled back) aborts the conversion: it must
 *   be repaired with `prisma migrate resolve` first. Rolled-back rows are
 *   skipped.
 * - wrangler (sqlite): `d1_migrations` in wrangler's shape — names carry
 *   over; hashes backfill from local records.
 */
export declare const findForeignHistory: (options: {
    executor: SqlExecutor;
    /** The resolved Alchemy table — a source with this name is not foreign. */
    table: string;
}) => Effect.Effect<ForeignHistory | undefined, MigrationError>;
/**
 * Validate foreign history against the local migrations directory and fill
 * in missing hashes. Every foreign row must match a local record by name
 * (or by the `<dir>/migration.sql` ⇄ `<dir>` aliasing between flat and
 * directory layouts) — an unmatched row means migrations were applied that
 * this checkout does not have.
 */
export declare const matchForeignRows: (options: {
    history: ForeignHistory;
    records: ReadonlyArray<MigrationRecord>;
}) => Effect.Effect<ConvertedRow[], MigrationHistoryConflictError>;
/** Render an INSERT for a converted history row into Alchemy's table. */
export declare const convertedRowInsertSql: (table: string, dialect: SqlExecutor["dialect"], row: ConvertedRow) => string;
//# sourceMappingURL=Convert.d.ts.map