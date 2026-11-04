import * as Effect from "effect/Effect";
import { MigrationError, MigrationHistoryConflictError, type MigrationRecord, type SqlExecutor } from "./Format.ts";
export declare const ALCHEMY_DEFAULT_TABLE = "__alchemy_migrations";
/**
 * Apply pending migrations with Alchemy's bookkeeping. Idempotent: each
 * migration's statements and its bookkeeping INSERT go through
 * `executor.batch` as one unit (a transaction on pg/mysql, one batched
 * query on D1, which has no transactions over HTTP).
 *
 * Applied-detection is name-keyed with layout aliasing: pre-registry
 * Alchemy recorded drizzle-layout migrations under `<dir>/migration.sql`
 * while current records key them by `<dir>`, so both keys are honored.
 */
export declare const applyAlchemyFormat: (options: {
    executor: SqlExecutor;
    table: string;
    records: ReadonlyArray<MigrationRecord>;
}) => Effect.Effect<void, MigrationError | MigrationHistoryConflictError>;
//# sourceMappingURL=AlchemyFormat.d.ts.map