/**
 * `SfnEffect<A, E>` — the yieldable, pipeable Step Functions program type.
 *
 * It mirrors Effect's `<A, E>` channels (there is deliberately no `R`
 * channel: an ASL program cannot require services — its "requirements" are
 * the resources its Task states reference, collected structurally at
 * compile). It is **not** an `Effect`: it is a shallow-embedded AST that
 * *feels* like Effect (generator syntax, `catchTag` narrowing `E`) but
 * constructs a data structure that `compile.ts` turns into ASL JSON.
 *
 * Yielding a real `Effect` inside `Sfn.gen` is a **type error** — only
 * `SfnEffect`s (branded with {@link SfnTypeId}) are yieldable.
 */
import { pipeArguments } from "effect/Pipeable";
/** Brand distinguishing `SfnEffect` from `Effect` (and everything else). */
export const SfnTypeId = Symbol.for("alchemy/AWS/StepFunctions/SfnEffect");
const variance = {
    _A: undefined,
    _E: undefined,
};
class SfnEffectImpl {
    node;
    [SfnTypeId] = variance;
    constructor(node) {
        this.node = node;
    }
    pipe() {
        // eslint-disable-next-line prefer-rest-params
        return pipeArguments(this, arguments);
    }
    *[Symbol.iterator]() {
        // yield this program once; the tracer (compile/simulate) resumes the
        // generator with a typed variable reference to its result
        return yield this;
    }
}
/** Construct an {@link SfnEffect} from an AST node. */
export const make = (node) => new SfnEffectImpl(node);
/** Runtime guard for {@link SfnEffect} values. */
export const isSfnEffect = (value) => (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    SfnTypeId in value;
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
export const gen = (body) => make({ kind: "gen", body: body });
//# sourceMappingURL=Program.js.map