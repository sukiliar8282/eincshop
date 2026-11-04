import * as Effect from "effect/Effect";
import { command, commandPipeline } from "./Protocol.js";
const asString = (value) => {
    if (typeof value === "string")
        return value;
    if (value == null)
        return "";
    return String(value);
};
const asNullableString = (value) => {
    if (value == null)
        return null;
    return asString(value);
};
const asNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "bigint")
        return Number(value);
    const parsed = Number(asString(value));
    return Number.isFinite(parsed) ? parsed : 0;
};
const asBoolean = (value) => asNumber(value) !== 0;
const asStringArray = (value) => {
    if (!Array.isArray(value))
        return [];
    return value.map(asString);
};
const asNullableStringArray = (value) => {
    if (!Array.isArray(value))
        return [];
    return value.map(asNullableString);
};
const asHash = (value) => {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const out = {};
        for (const [key, item] of Object.entries(value)) {
            out[key] = asString(item);
        }
        return out;
    }
    if (!Array.isArray(value))
        return {};
    const out = {};
    for (let i = 0; i + 1 < value.length; i += 2) {
        out[asString(value[i])] = asString(value[i + 1]);
    }
    return out;
};
const setArgs = (key, value, options) => {
    const args = [key, value];
    if (options?.nx)
        args.push("NX");
    if (options?.xx)
        args.push("XX");
    if (options?.ex !== undefined)
        args.push("EX", options.ex);
    if (options?.px !== undefined)
        args.push("PX", options.px);
    if (options?.exAt !== undefined)
        args.push("EXAT", options.exAt);
    if (options?.pxAt !== undefined)
        args.push("PXAT", options.pxAt);
    if (options?.keepTtl)
        args.push("KEEPTTL");
    return args;
};
/**
 * Read-only client over a runtime Redis URL.
 */
export const makeRead = (url) => ({
    get: (key) => command(url, "GET", [key]).pipe(Effect.map(asNullableString)),
    mget: (...keys) => command(url, "MGET", keys).pipe(Effect.map(asNullableStringArray)),
    ping: (message) => command(url, "PING", message === undefined ? [] : [message]).pipe(Effect.map(asString)),
    echo: (message) => command(url, "ECHO", [message]).pipe(Effect.map(asString)),
    exists: (...keys) => command(url, "EXISTS", keys).pipe(Effect.map(asNumber)),
    ttl: (key) => command(url, "TTL", [key]).pipe(Effect.map(asNumber)),
    pttl: (key) => command(url, "PTTL", [key]).pipe(Effect.map(asNumber)),
    type: (key) => command(url, "TYPE", [key]).pipe(Effect.map(asString)),
    hget: (key, field) => command(url, "HGET", [key, field]).pipe(Effect.map(asNullableString)),
    hmget: (key, ...fields) => command(url, "HMGET", [key, ...fields]).pipe(Effect.map(asNullableStringArray)),
    hgetall: (key) => command(url, "HGETALL", [key]).pipe(Effect.map(asHash)),
    hexists: (key, field) => command(url, "HEXISTS", [key, field]).pipe(Effect.map(asBoolean)),
    hkeys: (key) => command(url, "HKEYS", [key]).pipe(Effect.map(asStringArray)),
    hvals: (key) => command(url, "HVALS", [key]).pipe(Effect.map(asStringArray)),
    hlen: (key) => command(url, "HLEN", [key]).pipe(Effect.map(asNumber)),
    llen: (key) => command(url, "LLEN", [key]).pipe(Effect.map(asNumber)),
    lrange: (key, start, stop) => command(url, "LRANGE", [key, start, stop]).pipe(Effect.map(asStringArray)),
    lindex: (key, index) => command(url, "LINDEX", [key, index]).pipe(Effect.map(asNullableString)),
    scard: (key) => command(url, "SCARD", [key]).pipe(Effect.map(asNumber)),
    sismember: (key, member) => command(url, "SISMEMBER", [key, member]).pipe(Effect.map(asBoolean)),
    smembers: (key) => command(url, "SMEMBERS", [key]).pipe(Effect.map(asStringArray)),
    zscore: (key, member) => command(url, "ZSCORE", [key, member]).pipe(Effect.map(asNullableString)),
    zcard: (key) => command(url, "ZCARD", [key]).pipe(Effect.map(asNumber)),
    zrange: (key, start, stop) => command(url, "ZRANGE", [key, start, stop]).pipe(Effect.map(asStringArray)),
});
/**
 * Write client over a runtime Redis URL.
 */
export const makeWrite = (url) => ({
    set: (key, value, options) => command(url, "SET", setArgs(key, value, options)).pipe(Effect.asVoid),
    mset: (values) => {
        const args = [];
        for (const [key, value] of Object.entries(values)) {
            args.push(key, value);
        }
        return command(url, "MSET", args).pipe(Effect.asVoid);
    },
    del: (...keys) => command(url, "DEL", keys).pipe(Effect.map(asNumber)),
    unlink: (...keys) => command(url, "UNLINK", keys).pipe(Effect.map(asNumber)),
    expire: (key, seconds) => command(url, "EXPIRE", [key, seconds]).pipe(Effect.map(asBoolean)),
    persist: (key) => command(url, "PERSIST", [key]).pipe(Effect.map(asBoolean)),
    incr: (key) => command(url, "INCR", [key]).pipe(Effect.map(asNumber)),
    incrBy: (key, amount) => command(url, "INCRBY", [key, amount]).pipe(Effect.map(asNumber)),
    decr: (key) => command(url, "DECR", [key]).pipe(Effect.map(asNumber)),
    hset: (key, field, value) => {
        const args = [key];
        if (typeof field === "string") {
            args.push(field, value ?? "");
        }
        else {
            for (const [name, item] of Object.entries(field)) {
                args.push(name, item);
            }
        }
        return command(url, "HSET", args).pipe(Effect.map(asNumber));
    },
    hdel: (key, ...fields) => command(url, "HDEL", [key, ...fields]).pipe(Effect.map(asNumber)),
    hincrBy: (key, field, amount) => command(url, "HINCRBY", [key, field, amount]).pipe(Effect.map(asNumber)),
    lpush: (key, ...values) => command(url, "LPUSH", [key, ...values]).pipe(Effect.map(asNumber)),
    rpush: (key, ...values) => command(url, "RPUSH", [key, ...values]).pipe(Effect.map(asNumber)),
    lpop: (key) => command(url, "LPOP", [key]).pipe(Effect.map(asNullableString)),
    rpop: (key) => command(url, "RPOP", [key]).pipe(Effect.map(asNullableString)),
    sadd: (key, ...members) => command(url, "SADD", [key, ...members]).pipe(Effect.map(asNumber)),
    srem: (key, ...members) => command(url, "SREM", [key, ...members]).pipe(Effect.map(asNumber)),
    zadd: (key, score, member) => command(url, "ZADD", [key, score, member]).pipe(Effect.map(asNumber)),
    zrem: (key, ...members) => command(url, "ZREM", [key, ...members]).pipe(Effect.map(asNumber)),
});
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
export const make = (url) => ({
    ...makeRead(url),
    ...makeWrite(url),
    send: (name, args = []) => command(url, name, args),
    pipeline: (commands) => commandPipeline(url, commands),
});
/**
 * Read + write client over a runtime Redis URL. Alias of {@link make}.
 */
export const makeReadWrite = (url) => make(url);
//# sourceMappingURL=Client.js.map