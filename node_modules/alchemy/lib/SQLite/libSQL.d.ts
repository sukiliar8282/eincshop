import type { Client } from "@libsql/client";
import * as Layer from "effect/Layer";
import { SQLite } from "./SQLite.ts";
import type { SQLiteConnection } from "./SQLiteConnection.ts";
/**
 * Layer that provides the SQLite service using libsql.
 *
 * Note: This layer requires the @libsql/client package to be installed.
 * Install with: bun add @libsql/client
 */
export declare const libSQL: Layer.Layer<SQLite>;
/**
 * Create a SQLiteConnection from a libsql Client.
 *
 * @param executor - The executor to use for operations. In a transaction context,
 *                   this should be the transaction object to avoid deadlocks.
 */
export declare const fromClient: (client: Client, executor?: {
    execute: Client["execute"];
}) => SQLiteConnection;
//# sourceMappingURL=libSQL.d.ts.map