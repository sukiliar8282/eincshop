import type * as Effect from "effect/Effect";
import type * as Stream from "effect/Stream";
import type { Rpc } from "../../Rpc.ts";
export type RpcAsync<Shape> = {
    [K in keyof Shape as K extends "fetch" ? never : K]: Shape[K] extends (...args: infer A) => Effect.Effect<infer T, any, any> ? (...args: A) => Promise<T> : Shape[K] extends (...args: infer A) => Stream.Stream<any, any, any> ? (...args: A) => Promise<ReadableStream<Uint8Array>> : Shape[K] extends Effect.Effect<infer T, any, any> ? Promise<T> : Shape[K] extends Stream.Stream<any, any, any> ? Promise<ReadableStream<Uint8Array>> : Shape[K] extends (...args: infer A) => infer R ? (...args: A) => Promise<Awaited<R>> : Promise<Shape[K]>;
};
/**
 * Wrap a Cloudflare Worker RPC stub in a `Promise<T>`-shaped proxy so callers
 * outside the Effect runtime (TanStack Start route handlers, plain Workers,
 * test code) can `await` RPC methods directly.
 *
 * The proxy:
 * - leaves `fetch` / `connect` / `Symbol.dispose` and other non-string keys
 *   passing through to the underlying binding unchanged,
 * - turns each `Effect<T>` / `Stream<T>` method into a `Promise<T>` /
 *   `Promise<ReadableStream<Uint8Array>>`,
 * - unwraps the wire envelopes produced by the Effect-side RPC bridge:
 *   `RpcErrorEnvelope` is rethrown via {@link decodeRpcThrowable} so
 *   `try/catch` sees an `Error` (or a tagged error object), and
 *   `RpcStreamEnvelope` is flattened to its `ReadableStream` body.
 *
 * @example Three ways to reach a value from a plain Worker — direct binding, fetch, RPC
 * ```ts
 * import { toRpcAsync } from "alchemy/Cloudflare/Bridge";
 * import type Backend from "./backend.ts";
 *
 * interface Env {
 *   BUCKET: Bucket;
 *   BACKEND: Service<Backend>;
 * }
 *
 * export default {
 *   async fetch(request: Request, env: Env): Promise<Response> {
 *     const url = new URL(request.url);
 *     const key = url.searchParams.get("key");
 *     const via = url.searchParams.get("via") ?? "binding";
 *     if (!key) return new Response("Missing 'key'", { status: 400 });
 *
 *     // option 1 — use the async binding directly
 *     if (via === "binding") {
 *       const object = await env.BUCKET.get(key);
 *       if (!object) return new Response("Not found", { status: 404 });
 *       return new Response(object.body);
 *     }
 *
 *     // option 2 — call the Effect worker's fetch handler
 *     if (via === "fetch") {
 *       return env.BACKEND.fetch(
 *         `https://backend/?key=${encodeURIComponent(key)}`,
 *       );
 *     }
 *
 *     // option 3 — call an Effect worker RPC method as a Promise
 *     const backend = toRpcAsync<Backend>(env.BACKEND);
 *     const value = await backend.hello(key);
 *     if (value === null) return new Response("Not found", { status: 404 });
 *     return new Response(value);
 *   },
 * };
 * ```
 */
export declare const toRpcAsync: <W>(stub: any) => RpcAsync<Rpc.Shape<W>> & Service;
//# sourceMappingURL=RpcAsync.d.ts.map