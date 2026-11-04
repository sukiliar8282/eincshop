import type { ConfigError } from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as Layer from "effect/Layer";
import type { Rpc, RpcGroup } from "effect/unstable/rpc";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import * as RpcClientError from "effect/unstable/rpc/RpcClientError";
import type { Dependencies } from "../../Dependencies.ts";
import type { HttpEffect } from "../../Http.ts";
import type { Input } from "../../Input.ts";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { type DurableObjectGetDurableObjectOptions, type DurableObjectLike, type DurableObjectProps, type DurableObject as DurableObjectType, type DurableObjectServices } from "./DurableObject.ts";
import type { DurableObjectState } from "./DurableObjectState.ts";
import type { Worker as WorkerService } from "./Worker.ts";
/**
 * The runtime value bound to a typed rpc Durable Object namespace.
 * Same shape as the underlying {@link DurableObjectType} for
 * binding metadata (name, namespaceId, kind), but `getByName(id)`
 * returns a typed Effect `RpcClient` over the rpc server living on
 * the DO's `fetch` handler.
 */
export interface RpcDurableObject<Self, Rpcs extends Rpc.Any = Rpc.Any> extends Omit<DurableObjectType<{
    fetch: HttpEffect<DurableObjectState>;
}>, "getByName" | "get" | "Shape"> {
    /** @internal phantom — keeps `Self` reachable through the inferred type */
    Self?: Self;
    readonly getByName: (id: string, options?: DurableObjectGetDurableObjectOptions) => Effect.Effect<RpcClient.RpcClient<Rpcs, RpcClientError.RpcClientError>, never, Rpc.MiddlewareClient<Rpcs>>;
}
declare const RpcDurableObjectScope_base: Context.ServiceClass<RpcDurableObjectScope, "Cloudflare.RpcDurableObject", RpcDurableObject<unknown, Rpc.Any>>;
export declare class RpcDurableObjectScope extends RpcDurableObjectScope_base {
}
export interface RpcDurableObjectClass extends Effect.Effect<RpcDurableObject<unknown>, never, RpcDurableObjectScope> {
    /**
     * Class-based forms: `class Counter extends RpcDurableObject<Counter>()(...)`.
     *
     * Modular (no impl):
     * ```ts
     * class Counter extends RpcDurableObject<Counter>()(
     *   "Counter",
     *   { schema: CounterRpcs },
     * ) {}
     * export const CounterLive = Counter.make(/* impl *\/);
     * ```
     * Inline impl:
     * ```ts
     * class Counter extends RpcDurableObject<Counter>()(
     *   "Counter",
     *   { schema: CounterRpcs },
     *   Effect.gen(function* () { ... }),
     * ) {}
     * ```
     */
    <Self>(): {
        /** Modular form: separate `static make(impl)` + `static from(scriptName | Worker)`. */
        <Rpcs extends Rpc.Any>(name: string, props: {
            readonly schema: RpcGroup.RpcGroup<Rpcs>;
        }): Effect.Effect<RpcDurableObject<Self, Rpcs>, never, WorkerService | Self> & {
            new (_: never): {};
            from(scriptName: Input<string>): Effect.Effect<RpcDurableObject<Self, Rpcs>, never, WorkerService>;
            from<Req = never>(worker: Dependencies<Self> | Effect.Effect<Dependencies<Self>, ConfigError, Req>): Effect.Effect<RpcDurableObject<Self, Rpcs>, never, WorkerService | Req>;
            make<InnerR = never, InitReq = never>(impl: Effect.Effect<Effect.Effect<Effect.Effect<HttpEffect<InnerR>, never, InnerR | RuntimeContext>, never, DurableObjectServices | RuntimeContext>, ConfigError, InitReq>): Layer.Layer<Self, never, WorkerService | Exclude<InitReq | InnerR, DurableObjectServices>>;
        };
        /** Inline-impl form. */
        <Rpcs extends Rpc.Any, InnerR = never, InitReq = never>(name: string, props: {
            readonly schema: RpcGroup.RpcGroup<Rpcs>;
        }, impl: Effect.Effect<Effect.Effect<Effect.Effect<HttpEffect<InnerR>, never, InnerR | RuntimeContext>, never, DurableObjectServices | RuntimeContext>, ConfigError, InitReq>): Effect.Effect<RpcDurableObject<Self, Rpcs>, never, WorkerService | Exclude<InitReq | InnerR, DurableObjectServices>> & {
            new (_: never): {};
        };
    };
    /** Descriptor-only form, for `worker.bind` declarations */
    <Rpcs extends Rpc.Any>(name: string, props: {
        readonly schema: RpcGroup.RpcGroup<Rpcs>;
    } & Partial<DurableObjectProps>): DurableObjectLike<{
        fetch: HttpEffect<DurableObjectState>;
    }>;
    /** Bare form: `(name, { schema }, impl)` */
    <Rpcs extends Rpc.Any, InnerR = never, InitReq = never>(name: string, props: {
        readonly schema: RpcGroup.RpcGroup<Rpcs>;
    }, impl: Effect.Effect<Effect.Effect<Effect.Effect<HttpEffect<InnerR>, never, InnerR>, never, DurableObjectServices>, ConfigError, InitReq>): Effect.Effect<RpcDurableObject<unknown, Rpcs>, never, WorkerService | Exclude<InitReq | InnerR, DurableObjectServices>>;
}
/**
 * `RpcDurableObject` is sugar over {@link DurableObject}
 * for Durable Objects whose surface is a typed Effect `RpcGroup`. The
 * DO serves an `RpcServer.toHttpEffect(group)` on its own `fetch`, and
 * consumers see `namespace.getByName(id)` as a typed `RpcClient`
 * directly — no manual client wiring.
 *
 * Use this over alchemy's built-in DO method bridge whenever values
 * crossing the DO boundary contain `Schema.Class` instances. The
 * built-in bridge `JSON.stringify`s every method return value, which
 * strips class identity (e.g. an `effect/ai` `Response.Usage` instance
 * becomes a plain struct on the consumer side). With
 * `RpcDurableObject`, both ends go through the same
 * `RpcSerialization` codec, so `Schema.decode` reconstructs class
 * instances correctly.
 *
 *
 * ### Defining the rpc group
 * **Example:** DO-scoped rpc schemas
 * The DO instance *is* the session, so the group payloads typically
 * don't include any per-session identifier — only the per-call inputs.
 * ```typescript
 * import * as Schema from "effect/Schema";
 * import { Rpc, RpcGroup } from "effect/unstable/rpc";
 *
 * const setTitle = Rpc.make("setTitle", {
 *   success: Schema.Void,
 *   payload: { title: Schema.String },
 * });
 *
 * const getTitle = Rpc.make("getTitle", {
 *   success: Schema.String,
 *   payload: {},
 * });
 *
 * export class CounterRpcs extends RpcGroup.make(setTitle, getTitle) {}
 * ```
 *
 * ### Implementing the Durable Object
 * **Example:** Class form (recommended)
 * Mirrors `Cloudflare.DurableObject<Self>()(...)` — same
 * outer/inner Effect pattern. The outer Effect resolves shared deps;
 * the per-instance inner Effect returns the
 * `RpcServer.toHttpEffect(schema)`-piped Effect directly.
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 * import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
 * import { CounterRpcs } from "./rpcs.ts";
 *
 * export default class Counter extends Cloudflare.RpcDurableObject<Counter>()(
 *   "Counter",
 *   { schema: CounterRpcs },
 *   Effect.gen(function* () {
 *     // outer init: shared deps + the instance state reference
 *     const state = yield* Cloudflare.DurableObjectState;
 *     return Effect.gen(function* () {
 *       // inner (runtime): state.storage is RuntimeContext-colored, so
 *       // the handler closures that call it live here
 *       const handlers = CounterRpcs.toLayer({
 *         setTitle: ({ title }) => state.storage.put("title", title),
 *         getTitle: () =>
 *           Effect.map(state.storage.get<string>("title"), (t) => t ?? ""),
 *       });
 *       return RpcServer.toHttpEffect(CounterRpcs).pipe(
 *         Effect.provide(Layer.mergeAll(handlers, RpcSerialization.layerNdjson)),
 *       );
 *     });
 *   }),
 * ) {}
 * ```
 *
 * ### Calling the DO from a Worker
 * **Example:** Typed rpc client at the call site
 * `yield* Counter` resolves to a value whose `getByName(id)` returns
 * an `Effect<RpcClient<CounterRpcs>>`. Each rpc method is a typed
 * Effect/Stream factory — no `RpcClient.make` setup needed. Yield
 * the client inside a per-request `Effect.scoped` handler so it's
 * freed with the request.
 * ```typescript
 * import Counter from "./counter.ts";
 *
 * Effect.gen(function* () {
 *   const counters = yield* Counter;
 *   const client = yield* counters.getByName("global");
 *   yield* client.setTitle({ title: "Hello" });
 *   const title = yield* client.getTitle({});
 *   return title;
 * }).pipe(Effect.scoped);
 * ```
 *
 * ### Modular form: separate the class from its runtime
 * **Example:** Class declaration with no impl + `static make(impl)`
 * The inline class form above bundles the runtime into the class
 * declaration. The two-arg form `(name, { schema })` declares the
 * class as a pure tagged identifier; provide the runtime separately
 * via `Class.make(impl)`. Consumer Workers can import the class for
 * binding (`Counter.from(HostWorker)`) without pulling the runtime
 * into their bundle.
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 * import { RpcSerialization, RpcServer } from "effect/unstable/rpc";
 * import { CounterRpcs } from "./rpcs.ts";
 *
 * export class Counter extends Cloudflare.RpcDurableObject<Counter>()(
 *   "Counter",
 *   { schema: CounterRpcs },
 * ) {}
 *
 * // Only the host script imports this default export.
 * export default Counter.make(
 *   Effect.gen(function* () {
 *     const state = yield* Cloudflare.DurableObjectState;
 *     return Effect.gen(function* () {
 *       const handlers = CounterRpcs.toLayer({
 *         setTitle: ({ title }) => state.storage.put("title", title),
 *         getTitle: () =>
 *           Effect.map(state.storage.get<string>("title"), (t) => t ?? ""),
 *       });
 *       return RpcServer.toHttpEffect(CounterRpcs).pipe(
 *         Effect.provide(Layer.mergeAll(handlers, RpcSerialization.layerNdjson)),
 *       );
 *     });
 *   }),
 * );
 * ```
 *
 * ### Cross-script binding via `Counter.from(Worker)`
 * **Example:** Hosting on WorkerA, binding from WorkerB
 * The host Worker declares `Counter` in its `Deps` (third type
 * arg of `Worker<Self, Bindings, Deps>` or second of
 * `RpcWorker<Self, Deps>`) and provides `CounterLive`. Any other
 * Worker uses `Counter.from(HostWorker)` to bind to the same DO
 * instances — writes through `HostWorker.getByName(name)` are
 * visible from `Counter.from(HostWorker).getByName(name)`.
 * ```typescript
 * // host worker (declares + provides Counter)
 * import CounterLive, { Counter } from "./counter.ts";
 *
 * export class WorkerA extends Cloudflare.Worker<WorkerA, {}, Counter>()(
 *   "WorkerA",
 *   { main: import.meta.url },
 * ) {}
 *
 * export default WorkerA.make(
 *   Effect.gen(function* () {
 *     const counters = yield* Counter; // local host binding
 *     // ... fetch handler ...
 *   }).pipe(Effect.provide(CounterLive)),
 * );
 *
 * // consumer worker (binds via .from)
 * export default class WorkerB extends Cloudflare.Worker<WorkerB>()(
 *   "WorkerB",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const counters = yield* Counter.from(WorkerA);
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const client = yield* counters.getByName("shared");
 *         yield* client.setTitle({ title: "via WorkerB" });
 *         return HttpServerResponse.text("ok");
 *       }).pipe(Effect.scoped),
 *     };
 *   }),
 * ) {}
 * ```
 *
 * **Example:** Self-hosted isolated namespace
 * A Worker that declares `Counter` in its own `Deps` and provides
 * `CounterLive` hosts its own isolated namespace — instances under
 * it are separate from any other host's. Use `Counter.from(Self)`
 * inside the host to be explicit about which script's namespace
 * you're binding to.
 * ```typescript
 * export class WorkerC extends Cloudflare.Worker<WorkerC, {}, Counter>()(
 *   "WorkerC",
 *   { main: import.meta.url },
 * ) {}
 *
 * export default WorkerC.make(
 *   Effect.gen(function* () {
 *     const counters = yield* Counter.from(WorkerC); // explicit self
 *     // ... fetch handler ...
 *   }).pipe(Effect.provide(CounterLive)),
 * );
 * ```
 *
 * ### Yielding the surrounding namespace from inside a DO
 * **Example:** `yield* RpcDurableObject` inside the DO impl
 * Lets a DO instance refer to its own namespace — e.g. to fan a call
 * out to sibling instances. Mirrors `yield* DurableObject`
 * on the regular `DurableObject`.
 * ```typescript
 * Effect.gen(function* () {
 *   const self = yield* Cloudflare.RpcDurableObject;
 *   const peer = yield* self.getByName("peer-1");
 *   yield* peer.setTitle({ title: "Sibling call" });
 * }).pipe(Effect.scoped);
 * ```
 *
 * @resource
 * @product Workers
 * @category Workers & Compute
 */
export declare const RpcDurableObject: RpcDurableObjectClass;
export {};
//# sourceMappingURL=RpcDurableObject.d.ts.map