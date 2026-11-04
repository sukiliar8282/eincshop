import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SQLite } from "./SQLite.js";
import { parseError } from "./SQLiteError.js";
/**
 * Layer that provides the SQLite service using libsql.
 *
 * Note: This layer requires the @libsql/client package to be installed.
 * Install with: bun add @libsql/client
 */
export const libSQL = Layer.sync(SQLite, () => ({
    open: (path) => Effect.tryPromise({
        try: async () => {
            const { createClient } = await import("@libsql/client");
            const url = path.startsWith("file:") ? path : `file:${path}`;
            const client = createClient({ url });
            // Enable WAL mode for better concurrent read performance
            await client.execute("PRAGMA journal_mode = WAL;");
            // Wait up to 30 seconds when database is locked before returning SQLITE_BUSY
            await client.execute("PRAGMA busy_timeout = 30000;");
            return fromClient(client);
        },
        catch: (e) => parseError(extractErrorCode(e), `Failed to open libsql database: ${e}`, e),
    }),
}));
/**
 * Create a SQLiteConnection from a libsql Client.
 *
 * @param executor - The executor to use for operations. In a transaction context,
 *                   this should be the transaction object to avoid deadlocks.
 */
export const fromClient = (client, executor = client) => ({
    prepare: (sql) => Effect.succeed(wrapStatement(executor, sql)),
    exec: (sql) => Effect.tryPromise({
        try: () => executor.execute(sql),
        catch: (e) => parseError(extractErrorCode(e), `Failed to execute SQL: ${e}`, e),
    }),
    transaction: (fn) => Effect.tryPromise({
        try: async () => {
            const tx = await client.transaction("write");
            try {
                // Create a connection that uses the transaction for all operations
                const txConn = fromClient(client, tx);
                const result = await Effect.runPromise(fn(txConn));
                await tx.commit();
                return result;
            }
            catch (e) {
                await tx.rollback();
                throw e;
            }
        },
        catch: (e) => parseError(extractErrorCode(e), `Transaction failed: ${e}`, e),
    }),
    batch: (statements) => Effect.tryPromise({
        try: async () => {
            // Use client.batch directly - it creates its own atomic transaction
            await client.batch(statements.map((stmt) => ({
                sql: stmt.sql,
                args: (stmt.params ?? []),
            })), "write");
        },
        catch: (e) => parseError(extractErrorCode(e), `Batch execution failed: ${e}`, e),
    }),
});
/**
 * Wrap a libsql statement in the SQLiteStatement interface.
 *
 * Unlike bun:sqlite, libsql doesn't have a prepared statement object.
 * Instead, we store the SQL and execute it with parameters each time.
 *
 * @param executor - The executor to use (Client or Transaction)
 * @param sql - The SQL query string
 */
const wrapStatement = (executor, sql) => ({
    all: (...params) => Effect.tryPromise({
        try: async () => {
            const result = await executor.execute({
                sql,
                args: params,
            });
            return resultSetToRows(result);
        },
        catch: (e) => parseError(extractErrorCode(e), `Failed to execute statement.all: ${e}`, e),
    }),
    get: (...params) => Effect.tryPromise({
        try: async () => {
            const result = await executor.execute({
                sql,
                args: params,
            });
            const rows = resultSetToRows(result);
            return rows[0];
        },
        catch: (e) => parseError(extractErrorCode(e), `Failed to execute statement.get: ${e}`, e),
    }),
    run: (...params) => Effect.tryPromise({
        try: async () => {
            await executor.execute({
                sql,
                args: params,
            });
        },
        catch: (e) => parseError(extractErrorCode(e), `Failed to execute statement.run: ${e}`, e),
    }),
});
/**
 * Extract error code from libsql's LibsqlError.
 * Prefers extendedCode if available for more specific error types.
 */
const extractErrorCode = (e) => {
    const libsqlError = e;
    const code = libsqlError?.extendedCode ?? libsqlError?.code;
    if (code) {
        return code;
    }
    // Match and parse the tag after "LibsqlError:"
    const match = e.message.match(/LibsqlError:\s*([A-Z_]+):/);
    const tag = match ? match[1] : undefined;
    if (tag) {
        return tag;
    }
    return tag;
};
/**
 * Convert a libsql ResultSet to an array of row objects.
 */
function resultSetToRows(result) {
    const columns = result.columns;
    return result.rows.map((row) => {
        const obj = {};
        for (let i = 0; i < columns.length; i++) {
            obj[columns[i]] = row[i];
        }
        return obj;
    });
}
//# sourceMappingURL=libSQL.js.map