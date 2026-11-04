import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as crypto from "node:crypto";
import { listSqlFiles, splitSqlStatements } from "../SqlFile.js";
import { MigrationError, } from "./Format.js";
/** Map filesystem failures into the migration error channel. */
export const mapPlatformError = (effect, context) => effect.pipe(Effect.mapError((cause) => new MigrationError({
    message: `${context}: ${String(cause)}`,
    cause,
})));
/** Matches drizzle-kit v1 migration directories: `YYYYMMDDHHMMSS_name`. */
export const DRIZZLE_DIR_PATTERN = /^\d{14}_.+/;
/**
 * Parse a 14-digit `YYYYMMDDHHMMSS` prefix into UTC millis (drizzle's
 * `formatToMillis`). Returns undefined when the name has no such prefix.
 */
export const timestampPrefixMillis = (name) => {
    const prefix = name.slice(0, 14);
    if (!/^\d{14}$/.test(prefix))
        return undefined;
    const year = Number.parseInt(prefix.slice(0, 4), 10);
    const month = Number.parseInt(prefix.slice(4, 6), 10) - 1;
    const day = Number.parseInt(prefix.slice(6, 8), 10);
    const hour = Number.parseInt(prefix.slice(8, 10), 10);
    const minute = Number.parseInt(prefix.slice(10, 12), 10);
    const second = Number.parseInt(prefix.slice(12, 14), 10);
    return Date.UTC(year, month, day, hour, minute, second);
};
const sha256 = (content) => Effect.sync(() => crypto.createHash("sha256").update(content).digest("hex"));
/**
 * Read a drizzle-v1-layout directory (`{ts}_{name}/migration.sql`) into
 * records keyed the way drizzle keys them: `name` = the directory name,
 * sorted by name (drizzle's own sort), hash = sha256 of `migration.sql`.
 */
export const readDrizzleDirRecords = (dir) => mapPlatformError(Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const entries = yield* fs.readDirectory(dir);
    const names = [];
    for (const entry of entries) {
        if (!DRIZZLE_DIR_PATTERN.test(entry))
            continue;
        const sqlPath = path.join(dir, entry, "migration.sql");
        if (yield* fs.exists(sqlPath))
            names.push(entry);
    }
    names.sort((a, b) => a.localeCompare(b));
    const records = [];
    for (const name of names) {
        const sql = yield* fs.readFileString(path.join(dir, name, "migration.sql"));
        records.push({
            name,
            hash: yield* sha256(sql),
            createdAtMillis: timestampPrefixMillis(name),
            sql,
            statements: splitSqlStatements(sql),
        });
    }
    return records;
}), `Failed to read drizzle migrations from ${dir}`);
/**
 * Read a flat directory of `.sql` files into records keyed by relative file
 * path — the convention wrangler and legacy Alchemy state share. Nested
 * `dir/migration.sql` paths are included (via `listSqlFiles`'s recursive
 * listing) so legacy state written against drizzle-layout dirs keeps
 * resolving.
 */
export const readFlatRecords = (dir) => mapPlatformError(listSqlFiles(dir).pipe(Effect.map((files) => files.map((file) => ({
    name: file.id,
    hash: file.hash,
    createdAtMillis: timestampPrefixMillis(file.id),
    sql: file.sql,
    statements: splitSqlStatements(file.sql),
})))), `Failed to read migrations from ${dir}`);
/**
 * Render a parameter as a SQL literal. Only used for Alchemy's own
 * bookkeeping queries (names, hashes, millis, ISO dates) against executors
 * without native parameter support (the D1 HTTP API and the local workerd
 * tunnel).
 */
export const sqlLiteral = (value) => {
    if (value === null || value === undefined)
        return "NULL";
    if (typeof value === "number" || typeof value === "bigint") {
        return String(value);
    }
    if (typeof value === "boolean")
        return value ? "1" : "0";
    if (value instanceof Date)
        return `'${value.toISOString()}'`;
    return `'${String(value).replaceAll("'", "''")}'`;
};
/**
 * Inline `?` (sqlite/mysql) or `$n` (postgres) placeholders as SQL
 * literals. String scanning respects quoted spans so literal `?`s inside
 * strings survive.
 */
export const inlineSqlParams = (sql, params, dialect) => {
    if (params.length === 0)
        return sql;
    if (dialect === "postgres") {
        return sql.replace(/\$(\d+)/g, (match, n) => {
            const index = Number.parseInt(n, 10) - 1;
            return index >= 0 && index < params.length
                ? sqlLiteral(params[index])
                : match;
        });
    }
    let out = "";
    let paramIndex = 0;
    let quote;
    for (let i = 0; i < sql.length; i++) {
        const ch = sql[i];
        if (quote) {
            out += ch;
            if (ch === quote)
                quote = undefined;
            continue;
        }
        if (ch === "'" || ch === '"' || ch === "`") {
            quote = ch;
            out += ch;
            continue;
        }
        if (ch === "?" && paramIndex < params.length) {
            out += sqlLiteral(params[paramIndex++]);
            continue;
        }
        out += ch;
    }
    return out;
};
/** Quote an identifier for the given dialect. */
export const quoteIdentifier = (identifier, dialect) => dialect === "mysql"
    ? `\`${identifier.replaceAll("`", "``")}\``
    : `"${identifier.replaceAll('"', '""')}"`;
//# sourceMappingURL=Records.js.map