import * as kv from "@distilled.cloud/cloudflare/kv";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { makeHttpKVNamespaceBinding, makeKVAuth, makeKVHttpScope, toKVNamespaceError, } from "./NamespaceHttp.js";
import { ReadNamespace } from "./ReadNamespace.js";
/**
 * HTTP-backed implementation of the {@link ReadNamespace} binding.
 *
 * It creates a scoped {@link AccountApiToken} with the `Workers KV Storage
 * Read` permission and reads values via the Cloudflare KV HTTP API.
 */
export const ReadNamespaceHttp = Layer.effect(ReadNamespace, Effect.suspend(() => makeHttpKVNamespaceBinding({
    permissionGroups: ["Workers KV Storage Read"],
    makeClient: (token, namespaceId) => makeReadKVHttpClient(makeKVAuth(token), namespaceId),
})));
export const makeReadKVHttpClient = (auth, namespaceId) => {
    const { authorize } = auth;
    const scope = makeKVHttpScope(auth, namespaceId);
    const getOne = (key, type) => scope.pipe(Effect.flatMap(({ accountId, namespaceId }) => authorize(kv.getNamespaceValue({ accountId, namespaceId, keyName: key })).pipe(Effect.flatMap((res) => materializeBody(res.body, type)), Effect.catchTag("KeyNotFound", () => Effect.succeed(null)))), Effect.mapError(toKVNamespaceError));
    const getMany = (keys, type) => scope.pipe(Effect.flatMap(({ accountId, namespaceId }) => authorize(kv.bulkGetNamespaceKeys({
        accountId,
        namespaceId,
        keys,
        type: type === "json" ? "json" : "text",
    }))), Effect.mapError(toKVNamespaceError), Effect.map((res) => {
        const values = (res.values ?? {});
        const map = new Map();
        for (const key of keys) {
            map.set(key, key in values ? decodeValue(values[key], type) : null);
        }
        return map;
    }));
    const getWithMetadataOne = (key, type) => scope.pipe(Effect.flatMap(({ accountId, namespaceId }) => Effect.all({
        value: authorize(kv.getNamespaceValue({ accountId, namespaceId, keyName: key })).pipe(Effect.flatMap((res) => materializeBody(res.body, type)), Effect.catchTag("KeyNotFound", () => Effect.succeed(null))),
        metadata: authorize(kv.getNamespaceMetadata({ accountId, namespaceId, keyName: key })).pipe(Effect.catchTag(["KeyNotFound", "NamespaceNotFound"], () => Effect.succeed(null))),
    })), Effect.mapError(toKVNamespaceError), Effect.map(({ value, metadata }) => ({
        value,
        metadata: metadata ?? null,
        cacheStatus: null,
    })));
    return {
        raw: Effect.die(new (class extends Error {
        })("KV HTTP client does not expose a native Namespace binding; use get/list/getWithMetadata.")),
        get: ((key, typeOrOptions) => Array.isArray(key)
            ? getMany(key, readType(typeOrOptions))
            : getOne(key, readType(typeOrOptions))),
        getWithMetadata: ((key, typeOrOptions) => {
            const type = readType(typeOrOptions);
            if (Array.isArray(key)) {
                return getMany(key, type).pipe(Effect.map((values) => {
                    const map = new Map();
                    for (const [k, value] of values) {
                        map.set(k, { value, metadata: null, cacheStatus: null });
                    }
                    return map;
                }));
            }
            return getWithMetadataOne(key, type);
        }),
        list: ((options) => scope.pipe(Effect.flatMap(({ accountId, namespaceId }) => authorize(kv.listNamespaceKeys({
            accountId,
            namespaceId,
            prefix: options?.prefix ?? undefined,
            limit: options?.limit ?? undefined,
            cursor: options?.cursor ?? undefined,
        }))), Effect.mapError(toKVNamespaceError), Effect.map((res) => {
            const keys = res.result.map((k) => ({
                name: k.name,
                expiration: k.expiration ?? undefined,
                metadata: k.metadata ?? undefined,
            }));
            const cursor = res.resultInfo?.cursor ?? undefined;
            return (cursor
                ? { keys, list_complete: false, cursor, cacheStatus: null }
                : { keys, list_complete: true, cacheStatus: null });
        }))),
    };
};
/**
 * Materialize the raw value byte stream according to the requested type
 * ("text" | "json" | "arrayBuffer" | "stream").
 */
const materializeBody = (body, type) => type === "stream"
    ? Effect.sync(() => Stream.toReadableStream(body))
    : Effect.tryPromise(() => {
        const response = new Response(Stream.toReadableStream(body));
        return type === "arrayBuffer"
            ? response.arrayBuffer()
            : type === "json"
                ? response.json()
                : response.text();
    });
/** Resolve the requested decode type from the overloaded second argument. */
const readType = (typeOrOptions) => typeof typeOrOptions === "string"
    ? typeOrOptions
    : (typeOrOptions?.type ?? "text");
/** Decode a raw KV value according to the requested type. */
const decodeValue = (value, type) => {
    if (value === null || value === undefined)
        return null;
    if (type === "json") {
        return typeof value === "string" ? JSON.parse(value) : value;
    }
    return typeof value === "string" ? value : String(value);
};
//# sourceMappingURL=ReadNamespaceHttp.js.map