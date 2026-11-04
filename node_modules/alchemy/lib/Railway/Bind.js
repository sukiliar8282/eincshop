import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Binding from "../Binding.js";
import { unpackEnvValue } from "../RuntimeContext.js";
import { isYieldableEffectLike } from "../Util/effect.js";
import { isRailwayHost } from "./MountVolume.js";
import { DEFAULT_RPC_PORT, RPC_ERROR_TAG, RPC_PATH_PREFIX, RPC_TOKEN_HEADER, rpcEnvKeys, } from "./rpc-token.js";
export class RpcCallError extends Data.TaggedError("Railway.RpcCallError") {
}
export class RpcUnauthorized extends Data.TaggedError("Railway.RpcUnauthorized") {
}
const fromProcessEnv = (key) => {
    const unpacked = unpackEnvValue(process.env[key]);
    if (typeof unpacked === "string")
        return unpacked;
    return "";
};
const resolveTarget = (targetEff) => isYieldableEffectLike(targetEff)
    ? targetEff
    : Effect.succeed(targetEff);
/** Logical id without yielding the Resource (runtime has no engine). */
const logicalIdOf = (target) => {
    if (target !== null && typeof target === "object" && "LogicalId" in target) {
        const id = target.LogicalId;
        if (typeof id === "string" && id.length > 0)
            return id;
    }
    if (typeof target === "function") {
        const named = target.name;
        if (typeof named === "string" && named.length > 0)
            return named;
    }
    return "";
};
const makeStub = (options) => {
    const { baseUrl, token } = options;
    return new Proxy({}, {
        get: (_obj, prop) => {
            if (typeof prop !== "string")
                return undefined;
            return (...args) => Effect.gen(function* () {
                if (!baseUrl || !token) {
                    return yield* new RpcCallError({
                        method: prop,
                        cause: !baseUrl ? "missing host" : "missing token",
                    });
                }
                const response = yield* Effect.tryPromise({
                    try: () => fetch(`${baseUrl}${RPC_PATH_PREFIX}${encodeURIComponent(prop)}`, {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                            [RPC_TOKEN_HEADER]: token,
                        },
                        body: JSON.stringify(args),
                        signal: AbortSignal.timeout(25_000),
                    }),
                    catch: (cause) => new RpcCallError({ method: prop, cause }),
                });
                if (response.status === 401) {
                    return yield* new RpcUnauthorized({ method: prop });
                }
                const value = yield* Effect.tryPromise({
                    try: () => response.json(),
                    catch: (cause) => new RpcCallError({ method: prop, cause }),
                });
                if (typeof value === "object" &&
                    value !== null &&
                    value._tag === RPC_ERROR_TAG &&
                    "error" in value) {
                    return yield* Effect.fail(value.error);
                }
                return value;
            });
        },
    });
};
const bindRpc = (targetEff) => Effect.gen(function* () {
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        const target = yield* resolveTarget(targetEff);
        const keys = rpcEnvKeys(target.LogicalId);
        const host = yield* Binding.Host;
        if (isRailwayHost(host)) {
            yield* host.bind `${target}`({
                env: {
                    [keys.host]: target.dnsName,
                    [keys.port]: target.port ?? DEFAULT_RPC_PORT,
                    [keys.token]: target.rpcToken,
                },
            });
        }
    }
    const keys = rpcEnvKeys(logicalIdOf(targetEff));
    const hostName = fromProcessEnv(keys.host);
    const port = fromProcessEnv(keys.port);
    const token = fromProcessEnv(keys.token);
    const baseUrl = hostName.length > 0
        ? `http://${hostName}:${port.length > 0 ? port : String(DEFAULT_RPC_PORT)}`
        : "";
    return makeStub({ baseUrl, token });
});
/**
 * Bind a {@link Function} and return a typed schemaless RPC stub.
 * Calls go to `{dnsName}:{port}/__rpc__/{method}` on the private mesh
 * with a shared token — not the public `*.up.railway.app` URL.
 *
 * @example
 * ```typescript
 * const query = yield* Railway.bindFunction(Query);
 * const greeting = yield* query.greet("sam");
 * ```
 */
export const bindFunction = bindRpc;
/**
 * Bind a {@link Service} and return a typed schemaless RPC stub.
 * Same private-mesh + token path as {@link bindFunction}.
 *
 * @example
 * ```typescript
 * const api = yield* Railway.bindService(Api);
 * const greeting = yield* api.greet("sam");
 * ```
 */
export const bindService = bindRpc;
//# sourceMappingURL=Bind.js.map