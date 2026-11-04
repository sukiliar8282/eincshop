import type { Pipeable } from "effect/Pipeable";
import type { Expr, UnwrapExpr } from "./Jsonata.ts";
import type { AslNode } from "./Node.ts";
/** Brand distinguishing `SfnEffect` from `Effect` (and everything else). */
export declare const SfnTypeId: unique symbol;
export type SfnTypeId = typeof SfnTypeId;
/**
 * A typed Step Functions program producing `A` or failing with a tagged
 * error `E`. Build with `Sfn.gen` and the `Sfn.*` combinators; compile with
 * `StateMachine.fromProgram` (or `compileProgram`); run locally with
 * `simulate`.
 */
export interface SfnEffect<out A, out E = never> extends Pipeable {
    readonly [SfnTypeId]: {
        readonly _A: (_: never) => A;
        readonly _E: (_: never) => E;
    };
    /** The program AST node this effect wraps. */
    readonly node: AslNode;
    /**
     * `yield*` protocol for `Sfn.gen`: yields this program once and resumes
     * with a typed {@link Expr} reference to its result.
     */
    [Symbol.iterator](): Generator<SfnEffect<A, E>, Expr<A>, any>;
}
/** The success type of an {@link SfnEffect}. */
export type Success<T> = T extends SfnEffect<infer A, any> ? A : never;
/** The error type of an {@link SfnEffect}. */
export type Error<T> = T extends SfnEffect<any, infer E> ? E : never;
/** Construct an {@link SfnEffect} from an AST node. */
export declare const make: <A, E = never>(node: AslNode) => SfnEffect<A, E>;
/** Runtime guard for {@link SfnEffect} values. */
export declare const isSfnEffect: (value: unknown) => value is SfnEffect<any, any>;
/**
 * Write a Step Functions program with generator syntax — the `Sfn`
 * counterpart of `Effect.gen`. Each `yield*` of an `SfnEffect` resumes with
 * a **typed reference** ({@link Expr}) to that step's result, usable in
 * later payloads and conditions; the compiler turns the sequence into
 * `Next`-chained ASL states.
 *
 * The body receives a typed reference to the execution input. Annotate the
 * parameter to type it:
 *
 * ```typescript
 * const program = Sfn.gen(function* (input: Sfn.Expr<{ orderId: string }>) {
 *   const order = yield* Sfn.invoke<Order>(getOrder, { id: input.orderId });
 *   return { total: order.total };
 * });
 * ```
 *
 * The generator is a *trace*, not a running program: it executes at compile
 * time with placeholder references, so data-dependent JS control flow over
 * step results is unsound — use `Sfn.when` / `Sfn.match` for branching.
 * Yielding a real `Effect` is a type error by design.
 */
export declare const gen: <Y extends SfnEffect<any, any>, R, In = any>(body: (input: Expr<In>) => Generator<Y, R, any>) => SfnEffect<UnwrapExpr<R>, [Y] extends [never] ? never : Error<Y>>;
//# sourceMappingURL=Program.d.ts.map