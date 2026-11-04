/** @effect-diagnostics anyUnknownInErrorContext:off */
import * as ConfigError from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Effectable from "effect/Effectable";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";
import { Scope } from "effect/Scope";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as Output from "./Output.js";
import { ALCHEMY_PHASE } from "./Phase.js";
import { Resource } from "./Resource.js";
import { CurrentRuntimeContext, RuntimeContext, sanitizeKey, } from "./RuntimeContext.js";
import { Self } from "./Self.js";
import { ServerHost } from "./Server/Process.js";
import { effectClass } from "./Util/effect.js";
/**
 * Provide the platform class's layer (`cls.make(props, impl)`) with a
 * lifetime that matches the phase.
 *
 * **At runtime** (`__ALCHEMY_RUNTIME__`, folded to `true` in every bundled
 * artifact) the layer builds against the AMBIENT scope. `Effect.provide` is
 * implemented with `scopedWith`, so its transient region scope would tear
 * the layer down — firing init-level finalizers and releasing
 * `Layer.scoped` services — the moment init completes. The runtime bridges
 * evaluate the entrypoint under the instance-lifetime build scope (closed
 * at instance shutdown where the platform offers one — Lambda's SIGTERM
 * window — and never on workerd), so building against it keeps instance
 * services alive for the instance.
 *
 * **At plan/deploy** it stays `Effect.provide`: the transient region evicts
 * the layer's memo entry when each `yield*` of the class completes, so
 * every deploy in a session re-evaluates the resource and re-registers its
 * Output sources. Building on the session scope would keep the memo alive
 * across deploys and a second `stack.deploy` would skip source
 * registration (`MissingSourceError`).
 */
const provideClassLayer = (layer) => (self) => (globalThis.__ALCHEMY_RUNTIME__
    ? Effect.flatMap(Effect.scope, (scope) => Effect.flatMap(Layer.buildWithScope(layer, scope), (context) => Effect.provideContext(self, context)))
    : Effect.provide(self, layer));
export const Platform = (type, hooks, methods) => {
    // Platform registrations must have resolved props by plan time: every
    // legitimate construction (a `.make(props, impl)` Layer build, a tag
    // declared with props, a plain call) produces them, so props still
    // `undefined` at plan can only be a bare-tag forward reference whose
    // `.make` Layer was never provided — `Plan.make` fails fast naming the
    // class and its Layer (#1054).
    const resource = Resource(type, {
        aliases: hooks.aliases,
        requiresImplementation: true,
    });
    const PlatformContext = RuntimeContext;
    // Apply the optional `transformProps` hook to a (possibly Effect-valued)
    // props argument. Returns the props untouched when no hook is installed so
    // the plain-object fast paths below keep working.
    const applyTransformProps = (id, props) => hooks.transformProps === undefined
        ? props
        : Effect.flatMap(Effect.isEffect(props)
            ? props
            : Effect.succeed(props ?? {}), (resolved) => hooks.transformProps(id, resolved));
    const constructor = (id, props, impl, isTag = false) => {
        if (!id) {
            // impl was not provided inline, this is a tagged instance
            // e.g.
            // export class Sandbox extends Cloudflare.Container<Sandbox>()(..) {}
            //
            // export const SandboxLive = Sandbox.make(..)
            return (id, props, impl) => constructor(id, props, impl, true);
        }
        else if (!impl) {
            const cls = makeClass(id);
            // A resource declared without an inline impl is "external": there is
            // no Effect-native entry to inject (an ordinary bundled worker, or an
            // assets-only worker with no script at all).
            const externalProps = () => {
                const transformed = applyTransformProps(id, props);
                return Effect.isEffect(transformed)
                    ? Effect.map(transformed, (p) => ({
                        ...p,
                        isExternal: true,
                    }))
                    : {
                        ...transformed,
                        isExternal: true,
                    };
            };
            const evaluate = () => (!isTag
                ? // this is a non-tagged resource yielded without providing an implementation
                    // e.g.
                    // yield* Cloudflare.Worker("id", { main: "./src/worker.ts" })
                    //
                    // This is where we bridge to non-effect, e.g. bundling an ordinary worker
                    // export default {
                    //   fetch: (request: Request) => {
                    //     return new Response("Hello, world!");
                    //   }
                    // }
                    resource(id, externalProps())
                : Effect.flatMap(
                // this is a tagged resource
                Effect.serviceOption(cls.Self), Option.match({
                    // we are likely running at runtime, so we create.
                    // A tagged class WITH props and no impl is the class form of
                    // the external resource above (e.g.
                    // `class Site extends Worker<Site>()("Site", { assets }) {}`)
                    // — same isExternal marking; without props, this is a bare
                    // tag whose props/impl arrive later via `.make`.
                    onNone: () => 
                    // Without props this is a bare-tag FORWARD REFERENCE: its
                    // `.make(props, impl)` Layer may build before or after
                    // this yield (e.g. a worker tag bound in another worker's
                    // `env` — the #874 circular-binding pattern — resolves
                    // during that worker's async-binding pass, outside the
                    // Layer's own context). Register with `undefined` props;
                    // the Layer's build repairs them, and `Plan.make` fails
                    // fast on any platform registration whose props are still
                    // `undefined` after the whole program evaluated (see
                    // `requiresImplementation` above).
                    resource(id, props === undefined
                        ? applyTransformProps(id, props)
                        : externalProps()),
                    onSome: Effect.succeed,
                }))).pipe(Effect.tap((resource) => hooks.onCreate
                ? Effect.flatMap(
                // `props` may itself be an Effect (e.g. when wrapped by
                // `Cloudflare.Website.Vite` via `Effect.map`); resolve it before
                // handing it to the hook so `onCreate` always sees the
                // plain props object — the second call site (in
                // `cls.make`) already does this.
                Effect.isEffect(props) ? props : Effect.succeed(props ?? {}), (resolved) => hooks.onCreate(resource, resolved))
                : Effect.void));
            return Object.assign(function (props, impl) {
                return cls.Self.pipe(provideClassLayer(cls.make(props, impl)));
            }, 
            // we splice in the Effect so this can be yielded to indicate a non-Effect native instance
            // e.g. here, we yield it - in this case we don't want to provide an implementation
            // const worker = yield* Cloudflare.Worker("id", {
            //  main: "./src/worker.ts"
            // });
            cls, 
            // Spread the Effect prototype LAST so it overrides the evaluate copied
            // from `cls`: yielding this no-impl form bridges to the (possibly
            // non-Effect-native) resource rather than resolving the Self tag.
            Effectable.Prototype({
                label: `${type}<${id}>`,
                evaluate,
            }));
        }
        else {
            // impl was provided inline, this is a non-tagged eager instance
            // e.g.
            // export default Cloudflare.Worker("id", { main: "./src/worker.ts" }, Effect.gen(function* () { .. })
            const cls = makeClass(id);
            return Object.assign(cls.Self.pipe(provideClassLayer(cls.make(props, impl)), effectClass), 
            // Expose the logical id statically (mirrors `makeClass`) so a class
            // reference identifies its resource without being yielded.
            { LogicalId: id });
        }
    };
    const makeClass = (id) => {
        class Platform {
            /**
             * Logical id of the resource this class declares. Statically readable
             * — e.g. `DurableObjectProps.transferredFrom` accepts a Worker class
             * and takes its identity from here without yielding it (yielding
             * would add a dependency edge on the referenced resource).
             */
            static LogicalId = id;
            static Self = Self(`${type}<${id}>`);
            static Platform = Context.Service(`Platform<${type}<${id}>>`);
            static of = (shape) => shape;
            static make = (props, impl) => {
                // build the Layer once for the root Self
                const SelfLayer = Layer.effect(Self, Effect.flatMap(Effect.all([
                    (() => {
                        const transformed = applyTransformProps(id, props);
                        return Effect.isEffect(transformed)
                            ? transformed
                            : Effect.succeed(transformed ?? {});
                    })(),
                    Effect.sync(() => hooks.createRuntimeContext(id)),
                    Effect.context(),
                ]), Effect.fn(function* ([props, runtimeContext, outerServices]) {
                    // The init effect (`impl`) is evaluated inside an
                    // `Effect.provide(...)` region below, whose implementation
                    // (`scopedWith`) would otherwise shadow the ambient `Scope`
                    // with a transient one that closes the moment init returns.
                    // Pin init's ambient scope to this layer's build scope
                    // instead: under the runtime bridges that scope belongs to
                    // the instance-lifetime build, so init-level finalizers run
                    // at instance shutdown or not at all — never per event
                    // (workerd never closes it; the Lambda entry closes it in the
                    // SIGTERM window). Request-coupled cleanup belongs in
                    // handlers, where the bridge provides a per-event scope.
                    const buildScope = yield* Effect.scope;
                    const instance = Object.assign(yield* resource(id, props).pipe(Effect.flatMap((resource) => hooks
                        .onCreate?.(resource, props)
                        .pipe(Effect.map(() => resource)) ??
                        Effect.succeed(resource))), runtimeContext);
                    yield* impl.pipe(Effect.flatMap((impl) => {
                        if (!impl)
                            return Effect.void;
                        const shape = impl;
                        // Serve when there's a `fetch` handler OR any RPC shape
                        // methods. A pure-RPC impl (methods, no `fetch`) still needs
                        // the server to boot — hand `serveRpc` a default 404 fallback
                        // so `/__rpc__/*` is dispatched to the shape methods and
                        // everything else 404s.
                        // May be an `HttpEffect` or an Effect resolving to one (the
                        // `Main.fetch` shape); `serve` accepts both.
                        const fetch = shape.fetch;
                        const hasRpcMethods = Object.keys(shape).some((key) => key !== "fetch");
                        if (!fetch && !hasRpcMethods)
                            return Effect.void;
                        // Hand the full impl to `serve` so the runtime can expose any
                        // non-handler methods on the impl shape (RPC methods)
                        // alongside the standard `fetch` handler.
                        return (runtimeContext.serve?.(fetch ??
                            Effect.succeed(HttpServerResponse.text("Not Found", { status: 404 })), { shape }) ?? Effect.die("No serve handler"));
                    }), Effect.provide(Layer.effect(ConfigProvider.ConfigProvider, Effect.gen(function* () {
                        // a Config Provider that we use to intercept config lookups and bind them to the RuntimeContext
                        const configProvider = yield* ConfigProvider.ConfigProvider;
                        const phase = yield* ALCHEMY_PHASE;
                        return ConfigProvider.make(Effect.fn(function* (path) {
                            const ctx = yield* CurrentRuntimeContext;
                            // `set`/`get` store keys verbatim, so canonicalize the
                            // logical config path here (the caller's job) before
                            // handing it to the RuntimeContext.
                            const key = sanitizeKey(path.map((p) => p.toString()).join("_"));
                            const node = yield* configProvider.load(path);
                            if (phase === "plan" && node) {
                                // bind it to the RuntimeContext if running in plan phase
                                const output = Output.literal(Redacted.make(node.value));
                                yield* ctx?.set(key, output) ?? Effect.void;
                                return node;
                            }
                            else if (phase === "runtime" && ctx) {
                                // retrieve from the RuntimeContext if running in runtime phase
                                const value = yield* ctx.get(key);
                                if (value) {
                                    return ConfigProvider.makeValue(Redacted.isRedacted(value)
                                        ? Redacted.value(value)
                                        : value);
                                }
                            }
                            // fallback to the config provider otherwise
                            return node;
                        }));
                    })).pipe(Layer.provideMerge(Layer.mergeAll(
                    // Pin init's ambient `Scope` to this layer's build
                    // scope. `Effect.provide` (`scopedWith`) would
                    // otherwise shadow it with a transient scope that
                    // closes the moment init returns; the build scope
                    // lives for the instance under the runtime bridges,
                    // so init-level finalizers run at instance shutdown
                    // (Lambda's SIGTERM window) or never (workerd) —
                    // request-coupled cleanup belongs in handlers, where
                    // the bridge provides a per-event scope. It also
                    // wins over any `Scope` captured in `outerServices`
                    // below.
                    Layer.succeed(Scope, buildScope), Layer.succeed(Platform.Platform, runtimeContext), Layer.succeed(PlatformContext, runtimeContext), Layer.succeed(RuntimeContext, runtimeContext), 
                    // Host contexts (EC2 instances, ECS tasks, processes)
                    // carry a `run` for registering long-running loops.
                    // Expose it as `ServerHost` so an inline program can
                    // `yield* ServerHost` during plan/deploy without the
                    // caller providing the layer itself.
                    "run" in runtimeContext &&
                        typeof runtimeContext.run ===
                            "function"
                        ? Layer.succeed(ServerHost, {
                            run: runtimeContext.run,
                        })
                        : Layer.empty, Layer.succeed(resource.Self, instance), Layer.succeed(Platform.Self, instance), Layer.succeed(Self, instance), runtimeContext.planServices
                        ? Layer.unwrap(ALCHEMY_PHASE.pipe(Effect.map((phase) => phase === "plan"
                            ? runtimeContext.planServices
                            : Layer.empty)))
                        : Layer.empty)), Layer.provideMerge(Layer.succeedContext(outerServices)))));
                    instance.Props = {
                        ...props,
                        env: {
                            ...props?.env,
                            ...runtimeContext.env,
                        },
                        exports: runtimeContext.exports
                            ? yield* runtimeContext.exports
                            : undefined,
                    };
                    return Object.assign(instance, {
                        RuntimeContext: runtimeContext,
                    });
                })));
                const self = Self; // TODO(sam): why do we need to cast?
                return Layer.provideMerge(Layer.mergeAll(
                // sets the Context for all self-hierarchies
                // Self
                // Self<Cloudflare.Worker>
                // Self<Cloudflare.Worker<Api>>
                Layer.effect(Self(type), self), Layer.effect(Self(`${type}<${id}>`), self)), 
                // provide here so we build once and just mirror
                SelfLayer);
            };
        }
        // Make the platform class itself a real Effect: `yield* MyWorker` resolves
        // the Self tag. Replaces the hand-rolled asEffect/pipe/[Symbol.iterator].
        return Object.assign(Platform, Effectable.Prototype({
            label: `${type}<${id}>`,
            evaluate: () => Platform.Self,
        }));
    };
    const instance = Object.assign(constructor, resource, 
    // Spread the Effect prototype LAST so it overrides any evaluate inherited
    // from `resource`; `yield* Cloudflare.Worker` resolves the resource Self.
    Effectable.Prototype({
        label: `${type}`,
        evaluate: () => resource.Self,
    }), {
        Platform: Platform,
        ...methods,
    });
    return instance;
};
//# sourceMappingURL=Platform.js.map