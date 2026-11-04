import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import type { Pipeable } from "effect/Pipeable";
import { type Ref } from "./Ref.ts";
import { type Resource, type ResourceLike } from "./Resource.ts";
import { RuntimeContext } from "./RuntimeContext.ts";
import * as State from "./State/State.ts";
import { type Primitive } from "./Util/data.ts";
declare const inspect: unique symbol;
export declare const of: <R extends ResourceLike>(resource: Ref<R> | R) => R extends ResourceLike ? ResourceExpr<R["Attributes"]> : RefExpr<R["Attributes"]>;
export declare const asOutput: <T>(t: T | Output<T> | Effect.Effect<T>) => Output<T>;
/**
 * Lift a plan-time Effect into an {@link Output}.
 *
 * The effect runs when the stack resolves the Output during plan/deploy —
 * with the stack's services (cloud credentials, region, ...) provided — and
 * never inside a deployed runtime: constructing the Output is inert, so
 * helpers built on `fromEffect` (e.g. AMI lookups) are safe to call from
 * composition code that is re-executed inside a Function/Worker/Instance
 * bundle.
 *
 * The effect must not fail (`E = never`) — die with a descriptive error for
 * unresolvable lookups.
 */
export declare const fromEffect: <A, Req = never>(effect: Effect.Effect<A, never, Req>) => ToOutput<A, Req>;
export declare const isOutput: (value: any) => value is Output<any>;
export interface Output<A = any, Req = any> extends Pipeable {
    /** @internal phantom */
    readonly kind: string;
    /** @internal phantom */
    readonly A: A;
    /** @internal phantom */
    readonly req: Req;
    /** @internal phantom */
    [Symbol.iterator](): Iterator<Effect.Effect<void, never, Req>, Accessor<A>, void>;
    bind(id: string): Effect.Effect<Effect.Effect<A>, never, RuntimeContext>;
    asEffect(): Effect.Effect<Accessor<A>, never, Req>;
    as<T>(): Output<T, Req>;
}
export interface Accessor<A> extends Effect.Effect<A> {
}
export type ToOutput<A, Req = never> = [
    A
] extends [Primitive | Date] ? Output<A, Req> : [Extract<A, object>] extends [never] ? Output<A, Req> : [Extract<A, any[]>] extends [never] ? ObjectExpr<{
    [attr in keyof A]: A[attr];
}, Req> : ArrayExpr<Extract<A, any[]>, Req>;
export declare const ExprSymbol: unique symbol;
export declare const isExpr: (value: any) => value is Expr<any>;
export type Expr<A = any, Req = any> = AllExpr<Expr<A, Req>[]> | ApplyExpr<any, A, Req> | EffectExpr<any, A, Req> | FlatMapExpr<any, A, Req> | LiteralExpr<A> | NamedExpr<A, Req> | PropExpr<A, keyof A, Req> | ResourceExpr<A, Req> | RefExpr<A> | StackRefExpr<A>;
export declare abstract class BaseExpr<A = any, Req = any> implements Output<A, Req> {
    readonly kind: any;
    readonly A: A;
    readonly src: ResourceLike;
    readonly req: Req;
    constructor();
    as<T>(): Output<T, Req>;
    [Symbol.iterator](): Iterator<Effect.Effect<void, never, Req>, Accessor<A>, void>;
    asEffect(): any;
    bind(id: string): any;
    pipe(...fns: any[]): any;
    abstract [inspect](): string;
    toString(): string;
}
export type ObjectExpr<A, Req = any> = Output<A, Req> & {
    [Prop in keyof Exclude<A, undefined>]-?: ToOutput<Exclude<A, undefined>[Prop] | Extract<A, undefined>, Req>;
};
export type ArrayExpr<A extends any[], Req = any> = Output<A, Req> & {
    [i in Extract<keyof A, number>]: ToOutput<A[i], Req>;
};
export declare const isResourceExpr: <Value = any, Req = any>(node: Expr<Value, Req> | any) => node is ResourceExpr<Value, Req>;
export declare class ResourceExpr<Value, Req = never> extends BaseExpr<Value, Req> {
    readonly src: ResourceLike;
    readonly stables?: Record<string, any> | undefined;
    readonly kind = "ResourceExpr";
    constructor(src: ResourceLike, stables?: Record<string, any> | undefined);
    [inspect](): string;
}
export declare const isPropExpr: <A = any, Prop extends keyof A = keyof A, Req = any>(node: any) => node is PropExpr<A, Prop, Req>;
export declare class PropExpr<A = any, Id extends keyof A = keyof A, Req = any> extends BaseExpr<A[Id], Req> {
    readonly expr: Expr<A, Req>;
    readonly identifier: Id;
    readonly kind = "PropExpr";
    constructor(expr: Expr<A, Req>, identifier: Id);
    [inspect](): string;
}
export declare const literal: <A>(value: A) => LiteralExpr<A>;
export declare const isLiteralExpr: <A = any>(node: any) => node is LiteralExpr<A>;
export declare class LiteralExpr<A> extends BaseExpr<A, never> {
    readonly value: A;
    readonly kind = "LiteralExpr";
    constructor(value: A);
    [inspect](): string;
}
export declare const VoidExpr: LiteralExpr<undefined>;
export declare const map: {
    <A, B>(fn: (value: A) => B): <Req>(output: Output<A, Req>) => ToOutput<B, Req>;
    <A, B, Req>(output: Output<A, Req>, fn: (value: A) => B): ToOutput<B, Req>;
};
export declare const isApplyExpr: <In = any, Out = any, Req = any>(node: Output<Out, Req>) => node is ApplyExpr<In, Out, Req>;
export declare class ApplyExpr<A, B, Req = never> extends BaseExpr<B, Req> {
    readonly expr: Expr<A, Req>;
    readonly f: (value: A) => B;
    readonly kind = "ApplyExpr";
    constructor(expr: Expr<A, Req>, f: (value: A) => B);
    [inspect](): string;
}
export declare const mapEffect: <A, B, Req2>(fn: (value: A) => Effect.Effect<B, never, Req2>) => <Req>(output: Output<A, Req>) => ToOutput<B, Req | Req2>;
export declare const flatMap: {
    <A, B, Req2>(fn: (value: A) => Output<B, Req2>): <Req>(output: Output<A, Req>) => ToOutput<B, Req | Req2>;
    <A, B, Req, Req2>(output: Output<A, Req>, fn: (value: A) => Output<B, Req2>): ToOutput<B, Req | Req2>;
};
export declare const isFlatMapExpr: <In = any, Out = any, Req = any, Req2 = any>(node: any) => node is FlatMapExpr<In, Out, Req, Req2>;
export declare class FlatMapExpr<A, B, Req = never, Req2 = never> extends BaseExpr<B, Req | Req2> {
    readonly expr: Expr<A, Req>;
    readonly f: (value: A) => Output<B, Req2>;
    readonly kind = "FlatMapExpr";
    constructor(expr: Expr<A, Req>, f: (value: A) => Output<B, Req2>);
    [inspect](): string;
}
export declare const isEffectExpr: <In = any, Out = any, Req = any, Req2 = any>(node: any) => node is EffectExpr<In, Out, Req, Req2>;
export declare class EffectExpr<A, B, Req = never, Req2 = never> extends BaseExpr<B, Req> {
    readonly expr: Expr<A, Req>;
    readonly f: (value: A) => Effect.Effect<B, never, Req2>;
    readonly kind = "EffectExpr";
    constructor(expr: Expr<A, Req>, f: (value: A) => Effect.Effect<B, never, Req2>);
    [inspect](): string;
}
export declare const isNamedExpr: <A = any, Req = any>(node: any) => node is NamedExpr<A, Req>;
/**
 * Wraps another `Expr` and overrides its `toString()` / inspect output.
 *
 * `BaseExpr` derives the binding id from `this.toString()`, so
 * wrapping an expression in `NamedExpr` makes that derived id stable and
 * caller-controlled (e.g. an env var name like `"API_KEY"`).
 */
export declare class NamedExpr<A, Req = never> extends BaseExpr<A, Req> {
    readonly expr: Expr<A, Req>;
    readonly bindingName: string;
    readonly kind = "NamedExpr";
    constructor(expr: Expr<A, Req>, bindingName: string);
    [inspect](): string;
}
export declare const named: <A, Req>(expr: Output<A, Req>, name: string) => Output<A, Req>;
export declare const all: <Outs extends (Output | Expr)[]>(...outs: Outs) => All<Outs>;
export type All<Outs extends (Output | Expr)[]> = number extends Outs["length"] ? [Outs[number]] extends [
    Output<infer V, infer Req> | Expr<infer V, infer Req>
] ? Output<V, Req> : never : Tuple<Outs>;
type Tuple<Outs extends (Output | Expr)[], Values extends any[] = [], Req = never> = Outs extends [infer H, ...infer Tail extends (Output | Expr)[]] ? H extends Output<infer V, infer Req2> ? Tuple<Tail, [...Values, V], Req | Req2> : never : Output<Values, Req>;
export declare const isAllExpr: <Outs extends Expr[] = Expr[]>(node: any) => node is AllExpr<Outs>;
export declare class AllExpr<Outs extends Expr[]> extends BaseExpr<Outs> {
    readonly outs: Outs;
    readonly kind = "AllExpr";
    constructor(outs: Outs);
    [inspect](): string;
}
export declare const isRefExpr: <A = any>(node: any) => node is RefExpr<A>;
export declare class RefExpr<A> extends BaseExpr<A, never> {
    readonly stack: string | undefined;
    readonly stage: string | undefined;
    readonly resourceId: string;
    /**
     * Statically-known properties of the ref's target (currently its
     * resource `Type`), served as literals by the proxy instead of
     * `PropExpr`s — mirrors {@link ResourceExpr}'s `stables`.
     */
    readonly stables?: Record<string, any> | undefined;
    readonly kind = "RefExpr";
    constructor(stack: string | undefined, stage: string | undefined, resourceId: string, 
    /**
     * Statically-known properties of the ref's target (currently its
     * resource `Type`), served as literals by the proxy instead of
     * `PropExpr`s — mirrors {@link ResourceExpr}'s `stables`.
     */
    stables?: Record<string, any> | undefined);
    [inspect](): string;
}
export declare const isStackRefExpr: <A = any>(node: any) => node is StackRefExpr<A>;
/**
 * A reference to the persisted output of a Stack at `(stack, stage)`.
 *
 * Resolved at evaluation time by reading `state.getOutput({ stack,
 * stage })`. Distinct from {@link RefExpr}, which references a
 * single resource's attributes within a stack/stage. `stage` may be
 * `undefined`, in which case it falls back to the current stage.
 */
export declare class StackRefExpr<A> extends BaseExpr<A, never> {
    readonly stack: string;
    readonly stage: string | undefined;
    readonly kind = "StackRefExpr";
    constructor(stack: string, stage: string | undefined);
    [inspect](): string;
}
/**
 * Build an `Output<A>` referencing the persisted output of another
 * Stack. The returned Effect resolves to a lazy `Output<A>` whose
 * value is read from the state store at plan/apply time.
 *
 * Returns `Effect<Output<A>>` (not `Output<A>` directly) so that
 * `yield* Output.stackRef(...)` reads ergonomically inside an Effect
 * generator and lines up with `Resource.ref` and `Stack.stage.<name>`.
 */
export declare const stackRef: <A>(stack: string, options?: {
    stage?: string;
}) => Effect.Effect<Output<A, never>>;
export declare const filter: <Outs extends any[]>(...outs: Outs) => Filter<Outs>;
export type Filter<Outs extends any[]> = number extends Outs["length"] ? Output<Extract<Outs[number], Output>["value"], Extract<Outs[number], Output>["req"]> : FilterTuple<Outs>;
export type FilterTuple<Outs extends (Output | Expr)[], Values extends any[] = []> = Outs extends [infer H, ...infer Tail extends (Output | Expr)[]] ? H extends Output<infer V> ? FilterTuple<Tail, [...Values, V]> : FilterTuple<Tail, Values> : Output<Values>;
export declare const interpolate: <Args extends any[]>(template: TemplateStringsArray, ...args: Args) => All<Args> extends Output<any, infer Req> ? Output<string, Req> : never;
declare const MissingSourceError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MissingSourceError";
} & Readonly<A>;
export declare class MissingSourceError extends MissingSourceError_base<{
    message: string;
    srcId: string;
}> {
}
declare const InvalidReferenceError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "InvalidReferenceError";
} & Readonly<A>;
export declare class InvalidReferenceError extends InvalidReferenceError_base<{
    message: string;
    stack: string;
    stage: string;
    resourceId: string;
}> {
}
export declare const evaluate: <A, Req = never>(expr: Output<A, Req> | A, upstream: {
    [Id in string]: any;
}, ancestors?: ReadonlySet<object>) => Effect.Effect<A, InvalidReferenceError | MissingSourceError | Config.ConfigError, State.State | Req>;
export declare const hasOutputs: (value: any) => value is Output<any, any>;
export declare const upstreamAny: (value: any, seen?: WeakSet<object>) => { [ID in string]: Resource; };
export declare const upstream: <E extends Output<any, any>>(expr: E, seen?: WeakSet<object>) => any;
export declare const resolveUpstream: <const A>(value: A, seen?: WeakSet<object>) => any;
export declare const log: <A>(_value: A) => Effect.Effect<void, never, never>;
export declare const toEnvKey: <const ID extends string, const Suffix extends string>(id: ID, suffix: Suffix) => `${Replace<string extends ID ? ID : Uppercase<ID>, "">}_${Replace<string extends Suffix ? Suffix : Uppercase<Suffix>, "">}`;
export declare const toUpper: <const S extends string>(str: S) => string extends S ? S : Uppercase<S>;
type Replace<S extends string, Accum extends string = ""> = string extends S ? S : S extends "" ? Accum : S extends `${infer S}${infer Rest}` ? S extends "-" ? Replace<Rest, `${Accum}_`> : Replace<Rest, `${Accum}${S}`> : Accum;
export {};
//# sourceMappingURL=Output.d.ts.map