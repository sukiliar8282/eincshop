import * as Effect from "effect/Effect";
import type { RuntimeContext } from "../RuntimeContext.ts";
import type { CommandError, UrlMissing } from "./Errors.ts";
import type { Arg, Reply } from "./Resp.ts";
/**
 * A Redis URL that resolves from the Function/Service environment at
 * runtime (`REDIS_URL`).
 */
export type Url = Effect.Effect<string, UrlMissing, RuntimeContext>;
export type RuntimeError = CommandError | UrlMissing;
export interface SetOptions {
    readonly ex?: number;
    readonly px?: number;
    readonly exAt?: number;
    readonly pxAt?: number;
    readonly nx?: boolean;
    readonly xx?: boolean;
    readonly keepTtl?: boolean;
}
/**
 * Read-only Redis client. Any Redis command is available via {@link Client.send}
 * on the read/write client.
 */
export interface ReadClient {
    get(key: string): Effect.Effect<string | null, RuntimeError, RuntimeContext>;
    mget(...keys: string[]): Effect.Effect<Array<string | null>, RuntimeError, RuntimeContext>;
    ping(message?: string): Effect.Effect<string, RuntimeError, RuntimeContext>;
    echo(message: string): Effect.Effect<string, RuntimeError, RuntimeContext>;
    exists(...keys: string[]): Effect.Effect<number, RuntimeError, RuntimeContext>;
    ttl(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    pttl(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    type(key: string): Effect.Effect<string, RuntimeError, RuntimeContext>;
    hget(key: string, field: string): Effect.Effect<string | null, RuntimeError, RuntimeContext>;
    hmget(key: string, ...fields: string[]): Effect.Effect<Array<string | null>, RuntimeError, RuntimeContext>;
    hgetall(key: string): Effect.Effect<Record<string, string>, RuntimeError, RuntimeContext>;
    hexists(key: string, field: string): Effect.Effect<boolean, RuntimeError, RuntimeContext>;
    hkeys(key: string): Effect.Effect<string[], RuntimeError, RuntimeContext>;
    hvals(key: string): Effect.Effect<string[], RuntimeError, RuntimeContext>;
    hlen(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    llen(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    lrange(key: string, start: number, stop: number): Effect.Effect<string[], RuntimeError, RuntimeContext>;
    lindex(key: string, index: number): Effect.Effect<string | null, RuntimeError, RuntimeContext>;
    scard(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    sismember(key: string, member: string): Effect.Effect<boolean, RuntimeError, RuntimeContext>;
    smembers(key: string): Effect.Effect<string[], RuntimeError, RuntimeContext>;
    zscore(key: string, member: string): Effect.Effect<string | null, RuntimeError, RuntimeContext>;
    zcard(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    zrange(key: string, start: number, stop: number): Effect.Effect<string[], RuntimeError, RuntimeContext>;
}
/**
 * Write Redis client.
 */
export interface WriteClient {
    set(key: string, value: string | Uint8Array, options?: SetOptions): Effect.Effect<void, RuntimeError, RuntimeContext>;
    mset(values: Record<string, string | Uint8Array>): Effect.Effect<void, RuntimeError, RuntimeContext>;
    del(...keys: string[]): Effect.Effect<number, RuntimeError, RuntimeContext>;
    unlink(...keys: string[]): Effect.Effect<number, RuntimeError, RuntimeContext>;
    expire(key: string, seconds: number): Effect.Effect<boolean, RuntimeError, RuntimeContext>;
    persist(key: string): Effect.Effect<boolean, RuntimeError, RuntimeContext>;
    incr(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    incrBy(key: string, amount: number): Effect.Effect<number, RuntimeError, RuntimeContext>;
    decr(key: string): Effect.Effect<number, RuntimeError, RuntimeContext>;
    hset(key: string, field: string | Record<string, string | Uint8Array>, value?: string | Uint8Array): Effect.Effect<number, RuntimeError, RuntimeContext>;
    hdel(key: string, ...fields: string[]): Effect.Effect<number, RuntimeError, RuntimeContext>;
    hincrBy(key: string, field: string, amount: number): Effect.Effect<number, RuntimeError, RuntimeContext>;
    lpush(key: string, ...values: Array<string | Uint8Array>): Effect.Effect<number, RuntimeError, RuntimeContext>;
    rpush(key: string, ...values: Array<string | Uint8Array>): Effect.Effect<number, RuntimeError, RuntimeContext>;
    lpop(key: string): Effect.Effect<string | null, RuntimeError, RuntimeContext>;
    rpop(key: string): Effect.Effect<string | null, RuntimeError, RuntimeContext>;
    sadd(key: string, ...members: Array<string | Uint8Array>): Effect.Effect<number, RuntimeError, RuntimeContext>;
    srem(key: string, ...members: Array<string | Uint8Array>): Effect.Effect<number, RuntimeError, RuntimeContext>;
    zadd(key: string, score: number, member: string | Uint8Array): Effect.Effect<number, RuntimeError, RuntimeContext>;
    zrem(key: string, ...members: Array<string | Uint8Array>): Effect.Effect<number, RuntimeError, RuntimeContext>;
}
/**
 * Read + write Redis client. {@link send} is the total command surface —
 * every Redis command is an array of bulk strings on the wire.
 */
export interface Client extends ReadClient, WriteClient {
    send(name: string, args?: readonly Arg[]): Effect.Effect<Reply, RuntimeError, RuntimeContext>;
    pipeline(commands: ReadonlyArray<readonly [string, ...Arg[]]>): Effect.Effect<readonly Reply[], RuntimeError, RuntimeContext>;
}
export interface ReadWriteClient extends Client {
}
/**
 * Read-only client over a runtime Redis URL.
 */
export declare const makeRead: (url: Url) => ReadClient;
/**
 * Write client over a runtime Redis URL.
 */
export declare const makeWrite: (url: Url) => WriteClient;
/**
 * Full Redis client over a runtime Redis URL.
 *
 * Fly and Railway `*RedisHttp` layers pass this (or {@link makeRead} /
 * {@link makeWrite}) as `makeClient`. Tests can also drive RESP
 * directly via `command` / `run` / `connect`.
 *
 * ```typescript
 * import * as Redis from "alchemy/Redis";
 *
 * const cache = Redis.make(url);
 * yield* cache.set("marker", "hello");
 * const value = yield* cache.get("marker");
 * const echoed = yield* cache.send("ECHO", ["hi"]);
 * ```
 */
export declare const make: (url: Url) => Client;
/**
 * Read + write client over a runtime Redis URL. Alias of {@link make}.
 */
export declare const makeReadWrite: (url: Url) => ReadWriteClient;
//# sourceMappingURL=Client.d.ts.map