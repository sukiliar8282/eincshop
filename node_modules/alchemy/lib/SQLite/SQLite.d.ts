import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type { SQLiteConnection } from "./SQLiteConnection.ts";
import type { SQLiteErrorType } from "./SQLiteError.ts";
declare const SQLite_base: Context.ServiceClass<SQLite, "SQLite", SQLiteService>;
export declare class SQLite extends SQLite_base {
}
/**
 * SQLite service that provides database connection factory.
 */
export interface SQLiteService {
    /**
     * Open a SQLite database at the given path.
     */
    open(path: string): Effect.Effect<SQLiteConnection, SQLiteErrorType>;
}
export {};
//# sourceMappingURL=SQLite.d.ts.map