import type * as Duration from "effect/Duration";
import type { Input } from "../../../Input.ts";
import type { PolicyStatement } from "../../IAM/Policy.ts";
import type { AslNode } from "./Node.ts";
import { type SfnEffect } from "./Program.ts";
declare const SfnCompileError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SfnCompileError";
} & Readonly<A>;
/**
 * A program failed to compile to ASL — e.g. yielding a non-`Sfn` value
 * inside `Sfn.gen`, or unreachable steps after an unconditional `Sfn.fail`.
 */
export declare class SfnCompileError extends SfnCompileError_base<{
    readonly message: string;
}> {
}
/** The result of {@link compileProgram}. */
export interface CompiledProgram {
    /**
     * The ASL definition (JSONata query language). A plain object with
     * embedded `Output`s — exactly what `StateMachineProps.definition`
     * accepts.
     */
    readonly definition: Record<string, unknown>;
    /**
     * IAM policy statements collected from `Sfn.invoke` / `Sfn.integrate`
     * task states, for the state machine's execution role.
     */
    readonly policyStatements: Input<PolicyStatement>[];
}
interface Ctx {
    readonly nameCounters: Record<string, number>;
    varCounter: number;
    readonly policyStatements: Input<PolicyStatement>[];
    readonly invokedFunctions: Set<string>;
}
type State = Record<string, any>;
/**
 * A partially-built subgraph: its entry state, its states, and the names of
 * states whose `Next`/`End` is still open (patched when the fragment is
 * chained to a successor or sealed).
 */
interface Fragment {
    readonly startAt: string;
    readonly states: Record<string, State>;
    readonly terminals: readonly string[];
}
/**
 * Convert a `Duration.Input` to ASL whole seconds (normalizing any
 * persisted-state `Duration` JSON via the central util). ASL second fields
 * (`TimeoutSeconds`, `IntervalSeconds`, `Seconds`) must be positive
 * integers, so sub-second durations round up to 1.
 */
export declare const aslSeconds: (input: Duration.Input) => number;
export declare const compileNode: (ctx: Ctx, node: AslNode, v: string) => Fragment;
/**
 * Compile a typed Step Functions program to a plain ASL definition object
 * (JSONata query language, embedded `Output`s intact) plus the IAM policy
 * statements its task states require. Pure and deterministic; throws
 * {@link SfnCompileError} on structurally invalid programs.
 *
 * This is sugar over the raw path: feed the result straight into the
 * existing `StateMachine` resource (`StateMachine.fromProgram` does exactly
 * that), or inspect/extend the definition first — the raw
 * `definition: Record<string, unknown>` escape hatch stays first-class.
 */
export declare const compileProgram: (program: SfnEffect<any, any>) => CompiledProgram;
export {};
//# sourceMappingURL=compile.d.ts.map