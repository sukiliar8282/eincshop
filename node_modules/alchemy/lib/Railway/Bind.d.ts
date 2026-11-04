import * as Effect from "effect/Effect";
import type { Rpc } from "../Rpc.ts";
declare const RpcCallError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.RpcCallError";
} & Readonly<A>;
export declare class RpcCallError extends RpcCallError_base<{
    readonly method: string;
    readonly cause: unknown;
}> {
}
declare const RpcUnauthorized_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Railway.RpcUnauthorized";
} & Readonly<A>;
export declare class RpcUnauthorized extends RpcUnauthorized_base<{
    readonly method: string;
}> {
}
type RpcTarget = {
    readonly Type: string;
    readonly LogicalId: string;
    readonly dnsName?: unknown;
    readonly port?: unknown;
    readonly rpcToken?: unknown;
};
declare const bindRpc: <Shape, Req = never>(targetEff: (RpcTarget & Rpc<Shape>) | Effect.Effect<RpcTarget & Rpc<Shape>, never, Req>) => Effect.Effect<Shape, never, Req>;
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
export declare const bindFunction: typeof bindRpc;
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
export declare const bindService: typeof bindRpc;
export {};
//# sourceMappingURL=Bind.d.ts.map