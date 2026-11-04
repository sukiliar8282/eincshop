import type { ConfigError } from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { type Rpc, RpcClient, type RpcGroup } from "effect/unstable/rpc";
import type * as RpcClientError from "effect/unstable/rpc/RpcClientError";
import type { Dependencies } from "../../Dependencies.ts";
import type { HttpEffect } from "../../Http.ts";
import type { InputProps } from "../../Input.ts";
import type { Named } from "../../Named.ts";
import type { Rpc as RpcShape } from "../../Rpc.ts";
import type { Worker, WorkerProps } from "./Worker.ts";
/**
 * Props for {@link RpcWorker}. Same shape as {@link WorkerProps} with
 * an additional `schema` field carrying the rpc group definition.
 */
export type RpcWorkerProps<Rpcs extends Rpc.Any> = {
    /**
     * The {@link RpcGroup.RpcGroup} served on this worker's `fetch`
     * handler. The same value should be importable by any consumer of
     * the worker (other workers or scripts using `RpcClient.make`).
     */
    readonly schema: RpcGroup.RpcGroup<Rpcs>;
};
declare const RpcWorkerScope_base: Context.ServiceClass<RpcWorkerScope, "Cloudflare.RpcWorker", Worker>;
export declare class RpcWorkerScope extends RpcWorkerScope_base {
}
declare const SchemaSymbol: unique symbol;
export interface RpcWorkerYieldable<Self, Rpcs extends Rpc.Any, Deps = never, Id extends string = string> extends Effect.Effect<Worker<{}> & RpcShape<Self> & Dependencies<Deps>, never, any>, Named<Id> {
    /** @internal */
    readonly [SchemaSymbol]: RpcGroup.RpcGroup<Rpcs>;
    /**
     * Logical id of the Worker this class declares. Copied from the
     * underlying `Cloudflare.Worker` so callers can read it off the
     * class without yielding (e.g. `transferredFrom: TaskWorker`).
     */
    readonly LogicalId: Id;
}
/**
 * Type of the {@link RpcWorker} constructor. Mirrors the class-form
 * signature of {@link Worker} so `class X extends RpcWorker<X>()(...)`
 * works identically and the resulting worker is `Rpc<Self>`-typed for
 * binding consumers.
 */
export interface RpcWorkerClass extends Effect.Effect<Worker, never, RpcWorkerScope> {
    /**
     * Class-based form: `class X extends RpcWorker<X>()(name, props, impl)`.
     *
     * The optional second type argument `Deps` mirrors
     * `Cloudflare.Worker<Self, Bindings, Deps>` — it declares the DOs
     * this Worker publishes for cross-script binding so consumers can
     * write `Counter.from(WorkerA)` and have it type-check. `Rpcs` is
     * always inferred from `props.schema`.
     *
     * Yielding the class in a Stack returns the {@link Worker} resource
     * (so `worker.url`, `worker.workerName`, etc. work as usual). To get
     * a typed `RpcClient` for *this* worker's rpc group from inside
     * another worker's init, call {@link RpcWorker.bind}.
     */
    <Self, Deps = never>(): {
        /**
         * Modular form (no impl). Mirrors `Cloudflare.Worker<Self>()(id, props)`.
         * Use `WorkerClass.make(impl)` to provide the runtime as a
         * `Layer.Layer<Self>` so consumers that don't host the worker can
         * import the class without pulling its runtime into their bundle.
         */
        <const Id extends string, Rpcs extends Rpc.Any>(id: Id, props: RpcWorkerProps<Rpcs>): RpcWorkerYieldable<Self, Rpcs, Deps, Id> & {
            new (_: never): Named<Id>;
            make<InnerR = never, InitReq = never>(props: InputProps<WorkerProps>, impl: Effect.Effect<Effect.Effect<HttpEffect<InnerR>, never, InnerR>, ConfigError, InitReq>): Layer.Layer<Self, never, Exclude<InitReq | InnerR, never>>;
        };
        /** Inline-impl form. */
        <const Id extends string, Rpcs extends Rpc.Any, InnerR = never, InitReq = never>(id: Id, props: RpcWorkerProps<Rpcs> & InputProps<WorkerProps>, impl: Effect.Effect<Effect.Effect<HttpEffect<InnerR>, never, InnerR>, ConfigError, InitReq>): RpcWorkerYieldable<Self, Rpcs, Deps, Id> & {
            new (_: never): Named<Id>;
        };
    };
    /**
     * Bind a typed Effect rpc client to a worker resource, using the
     * worker's declared rpc {@link RpcGroup.RpcGroup} schema. Mirrors
     * `Cloudflare.R2.ReadWriteBucket(MyBucket)` and friends.
     *
     * Yield once at **init** — the result is a normal `RpcClient` you
     * can call directly from any per-request handler. Internally each
     * method invocation builds a fresh underlying `RpcClient` (through
     * a Proxy) because Cloudflare rejects I/O objects created on a
     * previous request; this is hidden from the consumer.
     *
     * Pair with {@link RpcWorker} on the server side; both ends share
     * the same schema so values round-trip through one `Schema` codec.
     *
     * @example
     * ```ts
     * // INIT: register the binding once and get the typed client
     * const tasks = yield* Cloudflare.RpcWorker.bind(TaskWorker);
     *
     * // PER-REQUEST: call methods directly
     * proxyGetTask: ({ id }) => tasks.getTask({ id }),
     * ```
     */
    readonly bind: <Self, Rpcs extends Rpc.Any>(workerEff: RpcWorkerYieldable<Self, Rpcs>) => Effect.Effect<RpcClient.RpcClient<Rpcs, RpcClientError.RpcClientError> & RpcShape<Self>, never, Worker>;
}
/**
 * `RpcWorker` is a thin sugar over {@link Worker} for the common case
 * where a worker's entire `fetch` surface is a typed Effect `RpcGroup`.
 * It takes the rpc `schema` directly in props alongside `main`, and
 * accepts an init Effect that returns the already-piped
 * `RpcServer.toHttpEffect(...)`-producing Effect (no `{ fetch }`
 * wrapper) — the wrapper plugs it into the worker's `fetch` for you.
 *
 * Functionally identical to writing `Cloudflare.Worker(...)` with
 * `return { fetch: RpcServer.toHttpEffect(schema).pipe(...) }`; use
 * whichever style you prefer.
 *
 * The class form (`class X extends Cloudflare.RpcWorker<X>()(...)`)
 * carries `Self` through the result type as `Rpc<Self>`, so other
 * workers binding to this one see the rpc shape pinned to `Self`.
 *
 *
 * ### Defining the rpc group
 * **Example:** Pure schema description
 * The rpc group and its schemas live outside any worker so both the
 * server (`RpcWorker`) and any consumers (`RpcClient.make` /
 * `RpcDurableObject`) import the same value.
 * ```typescript
 * import * as Schema from "effect/Schema";
 * import { Rpc, RpcGroup } from "effect/unstable/rpc";
 *
 * export class TaskNotFound extends Schema.TaggedClass<TaskNotFound>()(
 *   "TaskNotFound",
 *   { id: Schema.String },
 * ) {}
 *
 * const getTask = Rpc.make("getTask", {
 *   payload: { id: Schema.String },
 *   success: Schema.String,
 *   error: TaskNotFound,
 * });
 *
 * export class TaskRpcs extends RpcGroup.make(getTask) {}
 * ```
 *
 * ### Implementing the worker
 * **Example:** Class form (recommended)
 * Mirrors `Cloudflare.Worker<Self>()(...)` — `class X extends ...`
 * works the same. The init Effect builds a handlers `Layer` from the
 * group and returns the `RpcServer.toHttpEffect(schema)`-piped Effect
 * directly.
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 * import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
 * import { TaskRpcs } from "./rpcs.ts";
 *
 * export default class Worker extends Cloudflare.RpcWorker<Worker>()(
 *   "Worker",
 *   { main: import.meta.url, schema: TaskRpcs },
 *   Effect.gen(function* () {
 *     const handlers = TaskRpcs.toLayer({
 *       getTask: ({ id }) => Effect.succeed(`task-${id}`),
 *     });
 *     return RpcServer.toHttpEffect(TaskRpcs).pipe(
 *       Effect.provide(Layer.mergeAll(handlers, RpcSerialization.layerJson)),
 *     );
 *   }),
 * ) {}
 * ```
 *
 * **Example:** NDJSON for streaming rpcs
 * If any rpc in the group is a streaming rpc, the wire serialization
 * must be `RpcSerialization.layerNdjson` — streaming rpcs need
 * newline framing on the wire.
 * ```typescript
 * return RpcServer.toHttpEffect(ChatRpcs).pipe(
 *   Effect.provide(handlers),
 *   Effect.provide(RpcSerialization.layerNdjson),
 * );
 * ```
 *
 * ### Modular form: separate the class from its runtime
 * **Example:** Class declaration with no impl + `static make(impl)`
 * The inline class form above bundles the runtime into the class
 * declaration. The two-arg form `(id, props)` declares the class
 * as a pure tagged identifier; provide the runtime separately via
 * `WorkerClass.make(impl)` so consumers can import the class for
 * binding without pulling the host's runtime into their bundle.
 * ```typescript
 * export class TaskWorker extends Cloudflare.RpcWorker<TaskWorker>()(
 *   "TaskWorker",
 *   { main: import.meta.url, schema: TaskRpcs },
 * ) {}
 *
 * // Only the host script imports this default export; consumers
 * // import the class above for `RpcWorker.bind(TaskWorker)`.
 * export default TaskWorker.make(
 *   Effect.gen(function* () {
 *     const handlers = TaskRpcs.toLayer({
 *       getTask: ({ id }) => Effect.succeed(`task-${id}`),
 *     });
 *     return RpcServer.toHttpEffect(TaskRpcs).pipe(
 *       Effect.provide(Layer.mergeAll(handlers, RpcSerialization.layerJson)),
 *     );
 *   }),
 * );
 * ```
 *
 * ### Hosting a Durable Object for cross-script binding
 * **Example:** `RpcWorker<Self, Deps>()` declares published DOs
 * The optional second type argument `Deps` mirrors
 * `Cloudflare.Worker<Self, Bindings, Deps>` — it declares the DOs
 * this Worker publishes for cross-script binding. With `Counter`
 * named in `Deps`, any other Worker can write
 * `Counter.from(TaskWorker)` and have it type-check.
 * ```typescript
 * import { Counter } from "./counter.ts";
 *
 * export class TaskWorker extends Cloudflare.RpcWorker<TaskWorker, Counter>()(
 *   "TaskWorker",
 *   { main: import.meta.url, schema: TaskRpcs },
 * ) {}
 * ```
 * See {@link RpcDurableObject} for the consumer side
 * (`Counter.from(TaskWorker)`).
 *
 * ### Binding it from another worker
 * **Example:** `Cloudflare.RpcWorker.bind(WorkerClass)`
 * Inside another worker's init, `RpcWorker.bind(WorkerClass)`
 * registers the service binding on the surrounding worker and returns
 * a typed `RpcClient` you can call directly from any per-request
 * handler. Internally each method invocation builds a fresh underlying
 * client (because Cloudflare rejects cross-request reuse of the
 * stub I/O), but that's hidden behind a Proxy so the consumer sees a
 * normal `RpcClient`.
 * ```typescript
 * import TaskWorker from "./task-worker.ts";
 *
 * export default class Caller extends Cloudflare.RpcWorker<Caller>()(
 *   "Caller",
 *   { main: import.meta.url, schema: CallerRpcs },
 *   Effect.gen(function* () {
 *     // INIT: register binding, get the typed client
 *     const tasks = yield* Cloudflare.RpcWorker.bind(TaskWorker);
 *
 *     const handlers = CallerRpcs.toLayer({
 *       // PER-REQUEST: just call methods directly
 *       proxyGetTask: ({ id }) => tasks.getTask({ id }),
 *     });
 *     return RpcServer.toHttpEffect(CallerRpcs).pipe(
 *       Effect.provide(Layer.mergeAll(handlers, RpcSerialization.layerJson)),
 *     );
 *   }),
 * ) {}
 * ```
 *
 * ### Driving it from a test
 * **Example:** `Test.make` + `RpcClient.make`
 * The same `RpcGroup` drives a typed client. `Test.make` deploys the
 * stack once for the file; each test yields the deploy handle for its
 * URL and calls procedures directly.
 * ```typescript
 * import { expect } from "alchemy-test";
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Test from "alchemy/Test/Alchemy";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 * import * as Schedule from "effect/Schedule";
 * import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
 * import * as RpcClient from "effect/unstable/rpc/RpcClient";
 * import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";
 * import Stack from "../alchemy.run.ts";
 * import { TaskRpcs } from "../src/rpcs.ts";
 *
 * const { test, beforeAll, afterAll, deploy, destroy } = Test.make({
 *   providers: Cloudflare.providers(),
 * });
 * const stack = beforeAll(deploy(Stack));
 * afterAll.skipIf(!!process.env.NO_DESTROY)(destroy(Stack));
 *
 * const layer = (url: string) =>
 *   RpcClient.layerProtocolHttp({ url }).pipe(
 *     Layer.provide(FetchHttpClient.layer),
 *     Layer.provide(
 *       Layer.succeed(RpcSerialization.RpcSerialization, RpcSerialization.json),
 *     ),
 *   );
 *
 * test(
 *   "getTask",
 *   Effect.gen(function* () {
 *     const { url } = yield* stack;
 *     yield* Effect.gen(function* () {
 *       const client = yield* RpcClient.make(TaskRpcs);
 *       const result = yield* client
 *         .getTask({ id: "abc" })
 *         .pipe(Effect.retry({ schedule: Schedule.exponential("500 millis"), times: 5 }));
 *       expect(result).toBe("task-abc");
 *     }).pipe(Effect.scoped, Effect.provide(layer(url)));
 *   }),
 * );
 * ```
 *
 * ### Yielding the surrounding worker from inside the impl
 * **Example:** `yield* RpcWorker` inside the init effect
 * Mirrors `yield* DurableObject` — yield the tag to access
 * the surrounding worker.
 * ```typescript
 * Effect.gen(function* () {
 *   const self = yield* Cloudflare.RpcWorker;
 * });
 * ```
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export declare const RpcWorker: RpcWorkerClass;
export {};
//# sourceMappingURL=RpcWorker.d.ts.map