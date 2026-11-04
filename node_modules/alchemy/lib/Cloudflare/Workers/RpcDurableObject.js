import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as RpcClient from "effect/unstable/rpc/RpcClient";
import * as RpcClientError from "effect/unstable/rpc/RpcClientError";
import { effectClass, taggedFunction } from "../../Util/effect.js";
import { DurableObject, } from "./DurableObject.js";
import { bindEffectRpc } from "./Rpc.js";
// Context tag carrying the surrounding `RpcDurableObject`
// inside an rpc DO impl. Yield it from within a DO handler to refer
// back to the surrounding namespace (e.g. to fan a call out to
// sibling instances). Documented as part of the main
// `RpcDurableObject` JSDoc below.
export class RpcDurableObjectScope extends Context.Service()("Cloudflare.RpcDurableObject") {
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
export const RpcDurableObject = taggedFunction(RpcDurableObjectScope, (...args) => {
    // Class-form: zero args returns the inner builder. Inner-arg arity
    // distinguishes modular (`(name, { schema })`, no impl — `static
    // from`/`static make` provide the runtime) from inline-impl
    // (`(name, { schema }, impl)`).
    if (args.length === 0) {
        return (...inner) => {
            if (inner.length === 2) {
                const [name, props] = inner;
                return buildModular(name, props.schema);
            }
            const [name, props, impl] = inner;
            return build(name, props, impl);
        };
    }
    // Descriptor-only form: `(name, { schema })` — no impl.
    if (args.length === 2) {
        const [name, props] = args;
        return {
            kind: "Cloudflare.DurableObject",
            name,
            className: props?.className,
        };
    }
    // Bare form: `(name, { schema }, impl)`.
    const [name, props, impl] = args;
    return build(name, props, impl);
});
// Wrap a raw `DurableObject` so its `getByName` returns a typed
// Effect `RpcClient` (via `bindEffectRpc`) instead of the built-in
// method-bridge stub. Used in every branch that produces a yieldable
// `RpcDurableObject` value.
const rpcWrap = (rawNs, schema) => {
    const rpcView = bindEffectRpc(rawNs, schema);
    return Object.assign({}, rawNs, {
        getByName: rpcView.getByName,
    });
};
// The user's inner Effect resolves to `Effect<HttpEffect>`; the
// underlying `DurableObject` expects `Effect<{ fetch:
// HttpEffect }>` (a `DurableObjectShape`). Map through both layers to
// box the http effect in the `{ fetch }` shape.
const wrapImpl = (impl) => impl.pipe(Effect.map((inner) => inner.pipe(Effect.map((fetch) => ({ fetch })))));
const build = (name, props, impl) => {
    // Inline-impl class form: delegate to `DurableObject`'s
    // inline class form, then expose the rpc-wrapped view at yield
    // time. No `static from`/`static make` because the impl is provided
    // eagerly here (consumers wanting cross-script binding use the
    // modular form below).
    const underlying = DurableObject()(name, wrapImpl(impl));
    // `underlying` is itself an Effect now, no `.asEffect()` hop required.
    const underlyingEff = underlying;
    const rpcBound = underlyingEff.pipe(Effect.map((rawNs) => rpcWrap(rawNs, props.schema)));
    return effectClass(rpcBound);
};
const buildModular = (name, schema) => {
    // Delegate to `DurableObject<Self>()(name)` (no-impl class
    // form) so we inherit its Self-tag plumbing for free:
    //   - yielding the class resolves to the live namespace via the tag
    //     (populated by `static make(impl)`'s Layer)
    //   - `static from(scriptName | Worker)` registers a foreign-script
    //     binding on the surrounding worker and yields a fresh handle
    // We just rpc-wrap each output so consumers see a typed `getByName`.
    const Underlying = DurableObject()(name);
    // `Underlying` is itself an Effect now, no `.asEffect()` hop required.
    const underlyingEff = Underlying;
    return class extends effectClass(underlyingEff.pipe(Effect.map((rawNs) => rpcWrap(rawNs, schema)))) {
        static make = (impl) => Underlying.make(wrapImpl(impl));
        static from = (worker) => Underlying.from(worker).pipe(Effect.map((rawNs) => rpcWrap(rawNs, schema)));
    };
};
//# sourceMappingURL=RpcDurableObject.js.map