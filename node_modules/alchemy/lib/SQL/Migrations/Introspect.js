import * as Effect from "effect/Effect";
import { quoteIdentifier, sqlLiteral } from "./Records.js";
/**
 * List a table's columns (empty when the table doesn't exist), normalized
 * across dialects. `schema` defaults to the connection's current/default
 * schema.
 */
export const tableColumns = (executor, table, schema) => {
    switch (executor.dialect) {
        case "sqlite":
            return executor
                .query(`PRAGMA table_info(${quoteIdentifier(table, "sqlite")});`)
                .pipe(Effect.map((rows) => rows.map((row) => ({
                name: String(row.name),
                type: String(row.type ?? "").toUpperCase(),
            }))), 
            // A missing table yields an empty PRAGMA result, not an error, but
            // some tunnels surface it as one — treat both as "absent".
            Effect.catch(() => Effect.succeed([])));
        case "postgres":
            return executor
                .query(`SELECT column_name AS name, data_type AS type
             FROM information_schema.columns
            WHERE table_name = ${sqlLiteral(table)}
              AND table_schema = ${schema ? sqlLiteral(schema) : "current_schema()"}
            ORDER BY ordinal_position;`)
                .pipe(Effect.map((rows) => rows.map((row) => ({
                name: String(row.name),
                type: String(row.type ?? "").toUpperCase(),
            }))), Effect.catch(() => Effect.succeed([])));
        case "mysql":
            return executor
                .query(`SELECT COLUMN_NAME AS name, DATA_TYPE AS type
             FROM information_schema.columns
            WHERE table_name = ${sqlLiteral(table)}
              AND table_schema = ${schema ? sqlLiteral(schema) : "DATABASE()"}
            ORDER BY ORDINAL_POSITION;`)
                .pipe(Effect.map((rows) => rows.map((row) => ({
                name: String(row.name),
                type: String(row.type ?? "").toUpperCase(),
            }))), Effect.catch(() => Effect.succeed([])));
    }
};
export const classifyTable = (columns) => {
    if (columns.length === 0)
        return "absent";
    const names = new Set(columns.map((c) => c.name));
    if (names.has("hash"))
        return "drizzle-shaped";
    if (names.has("name") && names.has("applied_at")) {
        const id = columns.find((c) => c.name === "id");
        return id && /INT/.test(id.type) ? "wrangler" : "legacy-alchemy";
    }
    if (columns.length === 2 && !names.has("name"))
        return "legacy-2col";
    return "unknown";
};
//# sourceMappingURL=Introspect.js.map