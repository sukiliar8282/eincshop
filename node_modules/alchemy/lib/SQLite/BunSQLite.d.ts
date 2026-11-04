import type { Database } from "bun:sqlite";
import * as Layer from "effect/Layer";
import { SQLite } from "./SQLite.ts";
import type { SQLiteConnection } from "./SQLiteConnection.ts";
/**
 * Layer that provides the SQLite service using Bun's native SQLite.
 */
export declare const BunSQLite: Layer.Layer<SQLite>;
/**
 * Create a SQLiteConnection from a Bun SQLite Database.
 */
export declare const fromDatabase: (db: Database) => SQLiteConnection;
//# sourceMappingURL=BunSQLite.d.ts.map