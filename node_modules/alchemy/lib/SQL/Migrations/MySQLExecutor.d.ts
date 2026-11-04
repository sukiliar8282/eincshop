import type { Connection } from "mysql2/promise";
import { type SqlExecutor } from "./Format.ts";
/**
 * Adapt an open `mysql2` connection into the registry's
 * {@link SqlExecutor}. Batches run in a transaction (MySQL DDL
 * auto-commits regardless, matching the previous statement-by-statement
 * behavior).
 *
 * The `mysql2` import is type-only — how the connection is opened stays
 * with the database provider.
 */
export declare const makeMySQLMigrationExecutor: (connection: Connection) => SqlExecutor;
//# sourceMappingURL=MySQLExecutor.d.ts.map