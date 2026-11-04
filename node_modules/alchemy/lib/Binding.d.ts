import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type { Input } from "./Input.ts";
import * as Output from "./Output.ts";
import { type ResourceLike } from "./Resource.ts";
export interface ServiceLike {
    kind: "Service";
}
export interface ServiceShape<Identifier extends string, Shape extends (...args: any[]) => Effect.Effect<any, any, any>> extends Context.ServiceClass.Shape<Identifier, Shape>, ServiceLike {
}
type BindParameters<Parameters extends any[], Req = never> = Parameters extends [] ? [] : number extends Parameters["length"] ? Parameters extends [infer First, ...infer Rest] ? [
    Input<First> | Effect.Effect<First, never, Req>,
    ...Array<Input<Rest[number]> | Effect.Effect<Rest[number], never, Req>>
] : Array<Input<Parameters[number]> | Effect.Effect<Parameters[number], never, Req>> : Parameters extends [infer First, ...infer Rest] ? [
    Input<First> | Effect.Effect<First, never, Req>,
    ...BindParameters<Rest, Req>
] : Parameters extends [(infer First)?, ...infer Rest] ? [
    (Input<First> | Effect.Effect<First, never, Req>)?,
    ...BindParameters<Rest, Req>
] : [];
/**
 * The combined tag + callable + type form of a binding (the `Resource.ts`-style
 * single-identifier pattern). `interface X extends Binding.Service<X, Id, Shape>`
 * declares the type; `const X = Binding.Service<X>(id)` produces a value that is at
 * once the Context tag (usable in `Layer.effect(X, …)` / `Effect.provide`), the
 * callable (`X(resource)`), and carries the type.
 */
export interface Service<Self, Identifier extends string, Shape extends (...args: any[]) => Effect.Effect<any, any, any>> extends Context.Service<Self, Shape>, ServiceLike {
    readonly key: Identifier;
    new (_: never): ServiceShape<Identifier, Shape>;
    <Req = never>(...args: BindParameters<Parameters<Shape>, Req>): Effect.Effect<Effect.Success<ReturnType<Shape>>, Effect.Error<ReturnType<Shape>>, Self | Effect.Services<ReturnType<Shape>> | Req>;
    /**
     * Invoke this capability at plan/deploy time as a **data source** — the
     * Terraform data-source / Pulumi invoke shape — and get an
     * {@link Output.Output} of the result.
     *
     * The returned Output is inert until the planner resolves it (with the
     * stack's services provided), so `execute` is safe to call from
     * composition code that is re-executed inside a deployed runtime bundle.
     * The capability's implementation layer must be registered on the stack
     * (cloud `providers()` layers include their plan-executable capabilities).
     *
     * Execution is hostless — {@link Host} resolves `undefined`, so
     * implementations skip their `host.bind` IAM/env wiring and only the read
     * runs. Failures die and fail the plan.
     *
     * Only capabilities whose runtime client is nullary (`() => Effect<A>`)
     * are executable; parameterized clients type as `never` here.
     */
    execute<Req = never>(...args: BindParameters<Parameters<Shape>, Req>): Effect.Success<ReturnType<Shape>> extends () => Effect.Effect<infer A, infer _E, infer R2> ? Output.ToOutput<A, Self | Effect.Services<ReturnType<Shape>> | R2 | Req> : never;
}
/**
 * Build a combined tag+callable binding (see {@link Service}). The returned
 * value forwards the Effect/Tag protocol to its Context tag (via `taggedFunction`)
 * so `Layer.effect`/`provide` work, while being directly callable to bind a
 * resource at the call site.
 */
export declare const Service: <Self extends ServiceLike & {
    readonly key: string;
}>(id: Self["key"]) => Self;
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
export declare const Host: Effect.Effect<ResourceLike | undefined>;
export {};
//# sourceMappingURL=Binding.d.ts.map