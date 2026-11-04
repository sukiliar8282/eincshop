import type * as cf from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import type { RuntimeContext } from "../../RuntimeContext.ts";
export type SqlStorageValue = cf.SqlStorageValue;
export interface SqlCursor<T extends Record<string, SqlStorageValue>> extends Stream.Stream<T> {
    next(): Effect.Effect<{
        done?: false;
        value: T;
    } | {
        done: true;
        value?: never;
    }, never, RuntimeContext>;
    toArray(): Effect.Effect<T[], never, RuntimeContext>;
    one(): Effect.Effect<T, never, RuntimeContext>;
    raw<U extends SqlStorageValue[]>(): Stream.Stream<U, never, RuntimeContext>;
    readonly columnNames: string[];
    readonly rowsRead: Effect.Effect<number, never, RuntimeContext>;
    readonly rowsWritten: Effect.Effect<number, never, RuntimeContext>;
}
export interface SqlStorage {
    /**
     * The raw underlying Cloudflare SqlStorage binding.
     *
     * Use this when you need direct access for libraries that already support
     * Cloudflare Durable Object SQLite storage.
     */
    readonly raw: cf.SqlStorage;
    exec<T extends Record<string, SqlStorageValue>>(query: string, ...bindings: any[]): Effect.Effect<SqlCursor<T>, never, RuntimeContext>;
    readonly databaseSize: number;
}
export interface DurableObjectTransaction {
    get<T = unknown>(key: string, options?: cf.DurableObjectGetOptions): Effect.Effect<T | undefined, never, RuntimeContext>;
    get<T = unknown>(keys: string[], options?: cf.DurableObjectGetOptions): Effect.Effect<Map<string, T>, never, RuntimeContext>;
    list<T = unknown>(options?: cf.DurableObjectListOptions): Effect.Effect<Map<string, T>, never, RuntimeContext>;
    put<T>(key: string, value: T, options?: cf.DurableObjectPutOptions): Effect.Effect<void, never, RuntimeContext>;
    put<T>(entries: Record<string, T>, options?: cf.DurableObjectPutOptions): Effect.Effect<void, never, RuntimeContext>;
    delete(key: string, options?: cf.DurableObjectPutOptions): Effect.Effect<boolean, never, RuntimeContext>;
    delete(keys: string[], options?: cf.DurableObjectPutOptions): Effect.Effect<number, never, RuntimeContext>;
    rollback(): Effect.Effect<void, never, RuntimeContext>;
    getAlarm(options?: cf.DurableObjectGetAlarmOptions): Effect.Effect<number | null, never, RuntimeContext>;
    setAlarm(scheduledTime: number | Date, options?: cf.DurableObjectSetAlarmOptions): Effect.Effect<void, never, RuntimeContext>;
    deleteAlarm(options?: cf.DurableObjectSetAlarmOptions): Effect.Effect<void, never, RuntimeContext>;
}
export interface DurableObjectStorage {
    get<T = unknown>(key: string, options?: cf.DurableObjectGetOptions): Effect.Effect<T | undefined, never, RuntimeContext>;
    get<T = unknown>(keys: string[], options?: cf.DurableObjectGetOptions): Effect.Effect<Map<string, T>, never, RuntimeContext>;
    list<T = unknown>(options?: cf.DurableObjectListOptions): Effect.Effect<Map<string, T>, never, RuntimeContext>;
    put<T>(key: string, value: T, options?: cf.DurableObjectPutOptions): Effect.Effect<void, never, RuntimeContext>;
    put<T>(entries: Record<string, T>, options?: cf.DurableObjectPutOptions): Effect.Effect<void, never, RuntimeContext>;
    delete(key: string, options?: cf.DurableObjectPutOptions): Effect.Effect<boolean, never, RuntimeContext>;
    delete(keys: string[], options?: cf.DurableObjectPutOptions): Effect.Effect<number, never, RuntimeContext>;
    deleteAll(options?: cf.DurableObjectPutOptions): Effect.Effect<void, never, RuntimeContext>;
    /**
     * Run `closure` inside a storage transaction. The closure runs with the
     * caller's full context (services, tracing), as `waitUntil` does, so a
     * service provided to the calling fiber is visible inside the transaction.
     * A defect in the closure rolls the transaction back.
     */
    transaction<T, R = never>(closure: (txn: DurableObjectTransaction) => Effect.Effect<T, never, R>): Effect.Effect<T, never, R | RuntimeContext>;
    getAlarm(options?: cf.DurableObjectGetAlarmOptions): Effect.Effect<number | null, never, RuntimeContext>;
    setAlarm(scheduledTime: number | Date, options?: cf.DurableObjectSetAlarmOptions): Effect.Effect<void, never, RuntimeContext>;
    deleteAlarm(options?: cf.DurableObjectSetAlarmOptions): Effect.Effect<void, never, RuntimeContext>;
    sync(): Effect.Effect<void, never, RuntimeContext>;
    sql: SqlStorage;
    kv: cf.SyncKvStorage;
    getCurrentBookmark(): Effect.Effect<string, never, RuntimeContext>;
    getBookmarkForTime(timestamp: number | Date): Effect.Effect<string, never, RuntimeContext>;
    onNextSessionRestoreBookmark(bookmark: string): Effect.Effect<string, never, RuntimeContext>;
}
export declare const fromDurableObjectTransaction: (txn: cf.DurableObjectTransaction) => DurableObjectTransaction;
export declare const fromDurableObjectStorage: (storage: cf.DurableObjectStorage) => DurableObjectStorage;
//# sourceMappingURL=DurableObjectStorage.d.ts.map