import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Output from "./Output.js";
import { describeDataPlane } from "./Provider.js";
import { isResource } from "./Resource.js";
import { Self } from "./Self.js";
import { taggedFunction } from "./Util/effect.js";
/**
 * Build a combined tag+callable binding (see {@link Service}). The returned
 * value forwards the Effect/Tag protocol to its Context tag (via `taggedFunction`)
 * so `Layer.effect`/`provide` work, while being directly callable to bind a
 * resource at the call site.
 */
export const Service = (id) => {
    const tag = Context.Service(id);
    const callable = (...args) => tag.use((f) => Effect.all(args.map((arg) => (Effect.isEffect(arg) ? arg : Effect.succeed(arg))), { concurrency: "unbounded" }).pipe(Effect.flatMap((resolved) => f(...resolved).pipe(
    // Deploy-time data-plane routing: the client's calls must target
    // whatever data plane the bound resource actually lives on. In an
    // `alchemy dev` run a local-mode resource exists only on the
    // emulator, so invoking its client against the ambient (live)
    // cloud environment would miss it — or worse, mutate the real
    // cloud. See {@link routeClientDataPlane}.
    Effect.flatMap((client) => routeClientDataPlane(resolved, client))))));
    // Plan-time invoke (see the `execute` doc on `Service`): bind hostless —
    // `Binding.Host` is total and resolves `undefined`, so impls skip their
    // `host.bind` wiring — run the nullary client, and lift the result into an
    // Output the planner resolves with the stack's services.
    callable.execute = (...args) => Output.fromEffect(callable(...args).pipe(Effect.flatMap((client) => client()), Effect.orDie));
    return taggedFunction(tag, callable);
};
/**
 * Route a binding client's invocations to the data plane its bound
 * resource(s) actually live on.
 *
 * A dual-provider resource in an `alchemy dev` run resolves to its LOCAL
 * provider (unless pinned live via `Alchemy.remote()`), so the physical
 * resource exists only on the local emulator. A client invoked at deploy
 * time — inside an {@link ../Action.ts Action} body or a plan-time
 * {@link Service.execute} — would otherwise resolve the ambient (live)
 * cloud environment and miss it, or mutate the real cloud. The bound
 * resource's provider registers the emulator context as
 * {@link ProviderService.localDataPlane} (e.g. AWS's `flociServices()`);
 * this wrapper provides it *closest* around every invocation, so it wins
 * over the ambient environment exactly like the local provider's lifecycle
 * override does.
 *
 * Resolution happens once per bind, in the same context the bind step ran
 * in (the Provider registry and `AlchemyContext` are ambient during stack
 * evaluation and apply). At runtime inside a deployed Function/Worker there
 * is no registry and no engine — the wrapper is skipped entirely.
 */
const routeClientDataPlane = (resolvedArgs, client) => Effect.suspend(() => {
    if (globalThis.__ALCHEMY_RUNTIME__)
        return Effect.succeed(client);
    // Bind arguments are the capability's target resources by convention —
    // scan the top level plus one array level (multi-resource bindings like
    // ExecuteTransaction take tuples of resources).
    const resources = resolvedArgs.flatMap((arg) => Array.isArray(arg)
        ? arg.filter(isResource)
        : isResource(arg)
            ? [arg]
            : []);
    // Account-scoped clients (no resource among the args) need no routing:
    // the ambient environment is already mode-aware — a dev run's ambient IS
    // the emulator (see AWS/Providers.ts), a deploy's is the live chain.
    if (resources.length === 0)
        return Effect.succeed(client);
    return Effect.gen(function* () {
        const planes = [];
        for (const resource of resources) {
            planes.push(yield* describeDataPlane(resource));
        }
        const local = [
            ...new Set(planes.flatMap((p) => (p.kind === "local" ? [p.layer] : []))),
        ];
        if (local.length > 0) {
            if (local.length > 1 || planes.some((p) => p.kind !== "local")) {
                // Say exactly where each resource lands: a dual provider that never
                // registered a data plane is the usual culprit, and it would
                // otherwise read as "live" — the report that sent a user chasing a
                // `remote()` they never wrote.
                const where = resources
                    .map((r, i) => `${r.FQN} → ${describeResolution(planes[i])}`)
                    .join("; ");
                return yield* Effect.die(`Binding client spans mixed data planes: ${where}. A single API ` +
                    "call cannot span the local emulator and the real cloud. If a " +
                    "resource above is meant to be emulated, its provider must " +
                    "declare `dataPlane` on its ProviderLayer.dual registration; " +
                    "otherwise make the bound resources' modes agree (e.g. pipe them " +
                    "all through Alchemy.remote(), or none).");
            }
            return wrapClientInvocations(client, local[0]);
        }
        // Live-mode / `Alchemy.remote()`: ambient in a `dev` run is the
        // emulator, so provide the registration-captured live environment
        // closest (the inverse of the local wrap above).
        const live = [
            ...new Set(planes.flatMap((p) => p.kind === "live" && p.layer !== undefined ? [p.layer] : [])),
        ];
        if (live.length === 1)
            return wrapClientInvocations(client, live[0]);
        return client;
    });
});
const describeResolution = (plane) => {
    switch (plane.kind) {
        case "local":
            return "local emulator";
        case "live":
            return "real cloud (live mode)";
        case "undeclared":
            return `real cloud (its provider ${plane.providerType} is dual-mode but registers no local data plane)`;
        case "agnostic":
            return "real cloud (mode-agnostic provider)";
        case "unregistered":
            return "real cloud (no provider registered)";
    }
};
/**
 * Wrap every invocation surface of a binding client so its returned Effects
 * run with `layer` provided closest. Handles the client shapes bindings
 * return: a callable (the common per-operation client), an object of
 * methods/Effects (multi-method clients), or a bare Effect. Anything else
 * passes through untouched. Proxies preserve identity, extra properties,
 * and method names.
 */
const wrapClientInvocations = (client, layer) => {
    const provide = (value) => Effect.isEffect(value)
        ? Effect.provide(value, layer)
        : value;
    if (Effect.isEffect(client))
        return provide(client);
    if (typeof client === "function") {
        return new Proxy(client, {
            apply: (target, thisArg, argArray) => provide(Reflect.apply(target, thisArg, argArray)),
        });
    }
    if (typeof client === "object" && client !== null) {
        return new Proxy(client, {
            get: (target, prop, receiver) => {
                const value = Reflect.get(target, prop, receiver);
                if (typeof value === "function") {
                    return (...args) => provide(Reflect.apply(value, target, args));
                }
                return provide(value);
            },
        });
    }
    return client;
};
/**
 * Resolves the host resource a binding is attaching to (the Worker / Lambda
 * Function), i.e. `Self`. It is typed WITHOUT a Context requirement because it
 * is only ever read at DEPLOY time, inside the `if (!globalThis.__ALCHEMY_RUNTIME__)`
 * guard of a binding's impl layer — at runtime the host is absent and the guard
 * skips it, so leaking a `Self` requirement onto the runtime client would be
 * wrong.
 *
 * Total: resolves to `undefined` when no host is ambient — a plan-time
 * {@link Service.execute} invoke, or a binding client provided directly in a
 * script/test outside any Function. Narrow it with `isWorker`/`isFunction`/
 * `isBindingHost` before calling `host.bind`; the guards reject `undefined`.
 */
export const Host = Effect.serviceOption(Self).pipe(Effect.map(Option.getOrUndefined));
//# sourceMappingURL=Binding.js.map