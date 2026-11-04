import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import type { HttpClientResponse } from "effect/unstable/http/HttpClientResponse";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";
declare const WorkerNotReady_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "WorkerNotReady";
} & Readonly<A>;
/**
 * A freshly-deployed Cloudflare Worker is not instantly reachable over HTTP.
 * Its `workers.dev` route, the script, and each binding (R2 / D1 / DO / Secrets
 * Store) propagate to the edge independently and asynchronously, so the first
 * requests to a new URL can transiently return:
 *
 *  - `404` while the `workers.dev` subdomain / route is still propagating
 *    (Cloudflare serves its "There is nothing here yet" placeholder), or
 *  - `5xx` while the script is up but a binding it depends on isn't ready yet.
 *
 * This is ordinary eventual consistency that belongs at the call site, not in
 * the resource provider — the provider returning before every edge PoP has
 * converged is correct. Consumers ride out the window by retrying the request.
 */
export declare class WorkerNotReady extends WorkerNotReady_base<{
    status: number;
}> {
}
export interface WhenReadyOptions {
    /** Max retry attempts before surfacing {@link WorkerNotReady}. Default `20`. */
    times?: number;
}
/**
 * Execute an arbitrary {@link HttpClientRequest.HttpClientRequest}, retrying
 * through the Cloudflare cold-start window ({@link isColdStartStatus}) until the
 * Worker serves a non-transient response. The returned response can carry any
 * non-cold-start status (e.g. `200`, `202`, `401`) for the caller to assert on.
 */
export declare const executeWhenReady: (request: HttpClientRequest.HttpClientRequest, options?: WhenReadyOptions) => Effect.Effect<HttpClientResponse, unknown, HttpClient.HttpClient>;
/**
 * Convenience wrapper over {@link executeWhenReady} for a plain `GET`.
 */
export declare const getWhenReady: (url: string, options?: WhenReadyOptions) => Effect.Effect<HttpClientResponse, unknown, HttpClient.HttpClient>;
/**
 * Options for the edge-transient response guard applied by
 * {@link guardContentType} / {@link rpcClientLayer}. Pass per suite via
 * `Test.make({ http: { ... } })` or per call site.
 */
export interface EdgeGuardOptions {
    /**
     * Retry schedule for edge-transient responses (and transport errors).
     * Default: exponential from 500ms capped at 3s.
     */
    schedule?: Schedule.Schedule<unknown, unknown>;
    /** Max transport-level retry attempts. Default `5`. */
    times?: number;
}
/**
 * Guard an `HttpClient` against edge-generated bodies on a freshly deployed
 * Worker URL.
 *
 * Protocol clients like effect RPC's `layerProtocolHttp` never inspect the
 * response status or content-type — they pipe the raw body straight into the
 * serialization parser, so every edge-generated HTML page (the workers.dev
 * placeholder, which serves with HTTP **200**; 1101/1102 error pages;
 * 429/1015 rate limits) surfaces as an opaque decode defect (e.g.
 * `RpcClientDefect: Error decoding HTTP response`).
 *
 * This transform rejects any response whose `content-type` doesn't match the
 * expected one as a typed `HttpClientError` that records the status + a body
 * snippet — so a failure names its cause — and retries the request through a
 * bounded schedule so callers ride out the cold-start window
 * ({@link WorkerNotReady} documents why this belongs at the call site).
 */
export declare const guardContentType: (contentType: string, options?: EdgeGuardOptions) => (client: HttpClient.HttpClient) => HttpClient.HttpClient;
/**
 * A fetch-backed `HttpClient` layer wrapped with {@link guardContentType}.
 *
 * Deliberately a standalone layer rather than a transform of the ambient
 * test `HttpClient`: the ambient client also serves the engine's own cloud
 * API calls during `deploy`/`destroy` and distilled SDK calls in
 * `test.provider` bodies, which must NOT be subjected to this guard.
 */
export declare const guardedFetchLayer: (contentType: string, options?: EdgeGuardOptions) => Layer.Layer<HttpClient.HttpClient>;
/**
 * Complete RPC-over-HTTP client transport for driving a deployed Worker:
 * `RpcClient.layerProtocolHttp` + the given serialization (ndjson by
 * default) + a {@link guardedFetchLayer} expecting that serialization's
 * content-type.
 *
 * ```ts
 * const client = yield* RpcClient.make(WorkerRpcs);
 * // ...
 * }).pipe(Effect.scoped, Effect.provide(Test.Http.rpcClientLayer(url)));
 * ```
 */
export declare const rpcClientLayer: (url: string, options?: EdgeGuardOptions & {
    /** RPC wire serialization. Default {@link RpcSerialization.ndjson}. */
    serialization?: RpcSerialization.RpcSerialization["Service"];
    /**
     * Set `false` to skip the edge guard entirely and use a plain fetch
     * transport — e.g. for a test that asserts on the raw edge behavior
     * itself. Default `true`.
     */
    guard?: boolean;
}) => Layer.Layer<RpcClient.Protocol>;
export {};
//# sourceMappingURL=Http.d.ts.map