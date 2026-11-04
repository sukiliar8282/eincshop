import * as Data from "effect/Data";
/** A migration failed to read, convert, or apply. */
export class MigrationError extends Data.TaggedError("MigrationError") {
}
/**
 * The migrations directory uses drizzle-kit's pre-v1 layout
 * (`meta/_journal.json`). The fix is upstream: `drizzle-kit up`.
 */
export class DrizzleV0LayoutError extends Data.TaggedError("DrizzleV0LayoutError") {
}
/**
 * A row recorded in an applied-migrations table (ours, or a foreign one
 * being converted) matches no local migration file. Guessing would corrupt
 * history, so this is a hard error — migrations were applied to the
 * database that the local environment does not have.
 */
export class MigrationHistoryConflictError extends Data.TaggedError("MigrationHistoryConflictError") {
}
//# sourceMappingURL=Format.js.map