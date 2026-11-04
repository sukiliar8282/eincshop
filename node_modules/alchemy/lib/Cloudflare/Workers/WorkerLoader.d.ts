import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { type Fetcher } from "../Fetcher.ts";
import { Worker, WorkerEnvironment } from "./Worker.ts";
type WorkerLoaderTypeId = "Cloudflare.DynamicWorker";
declare const WorkerLoaderTypeId: WorkerLoaderTypeId;
export interface WorkerLoaderWorkerCode {
    compatibilityDate: string;
    compatibilityFlags?: string[];
    allowExperimental?: boolean;
    limits?: workerdResourceLimits;
    mainModule: string;
    modules: Record<string, WorkerLoaderModule | string>;
    env?: any;
    globalOutbound?: Fetcher | null;
    tails?: Fetcher[];
    streamingTails?: Fetcher[];
}
export type DynamicWorkerEntrypoint<Shape = unknown> = Fetcher & {
    [K in keyof Shape]: Shape[K];
};
export interface WorkerStub extends Fetcher {
    getEntrypoint<Shape = unknown>(name?: string): DynamicWorkerEntrypoint<Shape>;
}
export type WorkerLoader = {
    Type: WorkerLoaderTypeId;
    name: string;
    get<Err = never, Req = never>(name: string | null, getCode: () => WorkerLoaderWorkerCode | Effect.Effect<WorkerLoaderWorkerCode, Err, Req>): Effect.Effect<WorkerStub, Err, Req>;
    load(code: WorkerLoaderWorkerCode): Effect.Effect<WorkerStub, never, RuntimeContext>;
};
/**
 * Effect returned by `WorkerLoader(name)`.
 *
 * It is a real `Effect` — `yield* WorkerLoader(name)` inside a Worker init
 * attaches the binding and resolves the runtime handle — but it also carries
 * the `~alchemy/Kind` marker statically, so when it is declared on a Worker's
 * `env` the binding machinery recognises it as a `worker_loader` binding
 * (`isWorkerLoader`) instead of running it. Every env-resolution site that
 * branches on "is this a runnable Effect?" therefore checks `~alchemy/Kind`
 * (via `isWorkerLoader` or `isYieldableEffectLike`) before `Effect.isEffect`.
 */
export interface WorkerLoaderEffect extends Effect.Effect<WorkerLoader, never, WorkerEnvironment | Worker> {
    "~alchemy/Kind": WorkerLoaderTypeId;
    "~alchemy/Name": string;
    name: string;
}
export declare const isWorkerLoader: (value: unknown) => value is WorkerLoader;
export interface WorkerLoaderClass extends Context.Service<WorkerLoader, WorkerLoader> {
    (name?: string): WorkerLoaderEffect;
    layer(loader: WorkerLoader): Layer.Layer<WorkerLoader>;
    layer(id: string): Layer.Layer<WorkerLoader>;
}
/**
 * Load and run ephemeral Workers at runtime from inline JavaScript
 * modules.
 *
 * `WorkerLoader` registers a `worker_loader` binding on the
 * parent Worker at deploy time. At runtime you call `.load()` with
 * inline module source code and get back a fully typed Worker
 * instance you can `fetch` or call RPC methods on. Each loaded
 * Worker runs in its own isolate with full sandboxing.
 *
 * This is useful for evaluating user-provided code, running
 * untrusted plugins, or dynamically generating Workers from
 * templates.
 *
 *
 * ### Creating a Loader
 * Yield `Cloudflare.WorkerLoader(name)` in your Worker's init
 * phase to register the binding and get back a runtime handle. The
 * string argument becomes the binding name on the deployed Worker.
 *
 * **Example:** Registering a loader (effect-native Worker)
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 * import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
 *
 * export default class EvalWorker extends Cloudflare.Worker<EvalWorker>()(
 *   "EvalWorker",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     // Registers the `worker_loader` binding on this Worker
 *     const loader = yield* Cloudflare.WorkerLoader("LOADER");
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const request = yield* HttpServerRequest;
 *         const code = yield* request.text;
 *
 *         // Spin up an isolated, sandboxed Worker from inline source.
 *         const worker = yield* loader.load({
 *           compatibilityDate: "2026-08-31",
 *           mainModule: "worker.js",
 *           modules: {
 *             "worker.js": `export default {
 *               async fetch(req) {
 *                 const result = (0, eval)(await req.text());
 *                 return new Response(String(result));
 *               }
 *             }`,
 *           },
 *           globalOutbound: null, // block outbound network access
 *         });
 *
 *         // Call the loaded Worker over Effect-native HTTP.
 *         const response = yield* worker.fetch(
 *           HttpClientRequest.post("https://worker/").pipe(
 *             HttpClientRequest.bodyText(code),
 *           ),
 *         );
 *         return HttpServerResponse.fromClientResponse(response);
 *       }),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * **Example:** Declaring on env (async Worker)
 * ```typescript
 * export const Worker = Cloudflare.Worker("Worker", {
 *   main: "./src/worker.ts",
 *   env: { LOADER: Cloudflare.WorkerLoader() },
 * });
 *
 * export type WorkerEnv = Cloudflare.InferEnv<typeof Worker>;
 *
 * // worker.ts
 * export default {
 *   async fetch(req: Request, env: WorkerEnv) {
 *     const worker = env.LOADER.load({
 *       compatibilityDate: "2026-08-31",
 *       mainModule: "worker.js",
 *       modules: { "worker.js": "export default { fetch: () => new Response('ok') }" },
 *     });
 *     return worker.getEntrypoint().fetch(req);
 *   },
 * };
 * ```
 *
 * ### Loading a Worker
 * Call `loader.load()` with a compatibility date, a main module
 * name, and a map of module names to source code strings. The
 * returned instance exposes `.fetch()` for HTTP and RPC methods
 * for named entrypoints.
 *
 * **Example:** Loading and calling a dynamic Worker
 * ```typescript
 * const worker = loader.load({
 *   compatibilityDate: "2026-08-31",
 *   mainModule: "worker.js",
 *   modules: {
 *     "worker.js": `export default {
 *       async fetch(request) {
 *         return new Response("Hello from dynamic worker!");
 *       }
 *     }`,
 *   },
 * });
 *
 * const response = yield* worker.fetch(
 *   HttpClientRequest.get("https://worker/"),
 * );
 * ```
 *
 * ### Caching a Worker
 * Call `loader.get(id, getCode)` to address a dynamic Worker by
 * name. If an isolate with that id is already warm it is reused;
 * `getCode` runs only on a cold start. The returned stub is a
 * `WorkerStub`: call `.fetch()` on it directly, or
 * `.getEntrypoint()` for a named export.
 *
 * **Example:** Loading a cached dynamic Worker
 * ```typescript
 * const worker = yield* loader.get("eval", () => ({
 *   compatibilityDate: "2026-08-31",
 *   mainModule: "worker.js",
 *   modules: {
 *     "worker.js": `export default {
 *       async fetch() {
 *         return new Response("cached");
 *       }
 *     }`,
 *   },
 * }));
 *
 * const response = yield* worker.fetch(
 *   HttpClientRequest.get("https://worker/"),
 * );
 * ```
 *
 * ### Sandboxing
 * Set `globalOutbound` to `null` to block all outbound network
 * access from the dynamic Worker, or pass an RPC stub to intercept
 * and proxy outbound requests.
 *
 * **Example:** Blocking outbound access
 * ```typescript
 * const worker = loader.load({
 *   compatibilityDate: "2026-08-31",
 *   mainModule: "worker.js",
 *   modules: {
 *     "worker.js": `export default {
 *       async fetch(req) {
 *         // fetch() calls from here will fail
 *         return new Response("sandboxed");
 *       }
 *     }`,
 *   },
 *   globalOutbound: null,
 * });
 * ```
 *
 * ### Named Entrypoints
 * If the dynamic Worker exports named entrypoints, use
 * `.getEntrypoint(name)` to get a typed stub for calling its
 * methods.
 *
 * **Example:** Calling a named entrypoint
 * ```typescript
 * const worker = loader.load({ ... });
 * const api = worker.getEntrypoint<{ greet: (name: string) => Effect.Effect<string> }>("api");
 * const greeting = yield* api.greet("world");
 * ```
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export declare const WorkerLoader: WorkerLoaderClass;
export {};
//# sourceMappingURL=WorkerLoader.d.ts.map