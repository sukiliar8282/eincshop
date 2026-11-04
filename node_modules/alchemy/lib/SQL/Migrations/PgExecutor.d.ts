import type { Client } from "pg";
import { type SqlExecutor } from "./Format.ts";
/**
 * Adapt an open `pg` client into the registry's {@link SqlExecutor}.
 * Batches run in a transaction so a migration and its bookkeeping INSERT
 * commit (or roll back) together.
 *
 * The `pg` import is type-only — how the client is opened (Neon connection
 * URI, PlanetScale temporary role, …) stays with the database provider.
 */
export declare const makePgMigrationExecutor: (client: Client) => SqlExecutor;
//# sourceMappingURL=PgExecutor.d.ts.map