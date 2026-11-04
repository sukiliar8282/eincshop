import * as Effect from "effect/Effect";
import type { SqlExecutor } from "./Format.ts";
export interface TableColumn {
    name: string;
    type: string;
}
/**
 * List a table's columns (empty when the table doesn't exist), normalized
 * across dialects. `schema` defaults to the connection's current/default
 * schema.
 */
export declare const tableColumns: (executor: SqlExecutor, table: string, schema?: string) => Effect.Effect<TableColumn[], never, never>;
/**
 * Classify an existing applied-migrations table by column set — the same
 * versioning trick drizzle uses (there is deliberately no version column):
 *
 * - `absent`         — no table
 * - `drizzle-shaped` — has `hash` (drizzle v1 / alchemy current)
 * - `legacy-alchemy` — `name` + `applied_at`, no `hash` (pre-registry Alchemy)
 * - `legacy-2col`    — two columns, no `name`/`hash` (oldest Alchemy shape,
 *   where the primary column carried the migration name)
 * - `wrangler`       — `id`/`name`/`applied_at` with an INTEGER id (already
 *   wrangler's real shape)
 * - `unknown`        — anything else
 */
export type TableShape = "absent" | "drizzle-shaped" | "legacy-alchemy" | "legacy-2col" | "wrangler" | "unknown";
export declare const classifyTable: (columns: TableColumn[]) => TableShape;
//# sourceMappingURL=Introspect.d.ts.map