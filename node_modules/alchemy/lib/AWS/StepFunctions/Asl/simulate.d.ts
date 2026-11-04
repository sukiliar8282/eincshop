import * as Effect from "effect/Effect";
import { type SfnEffect } from "./Program.ts";
declare const SimulateError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SimulateError";
} & Readonly<A>;
/**
 * The simulation itself went wrong — a missing handler, an unsupported raw
 * JSONata expression, or a structurally invalid program. Distinct from the
 * program's own typed failures, which flow through the `E` channel.
 */
export declare class SimulateError extends SimulateError_base<{
    readonly message: string;
}> {
}
/**
 * Handler stubs for the program's Task states, keyed by:
 * - the function's `LogicalId` for `Sfn.invoke` states,
 * - the integration resource ARN (including any `.waitForTaskToken`
 *   suffix) for `Sfn.integrate` / `Sfn.waitForTaskToken` states.
 */
export interface SimulateHandlers {
    readonly [key: string]: (payload: unknown) => Effect.Effect<any, any>;
}
export interface SimulateOptions {
    /** Task handler stubs. @default {} */
    readonly handlers?: SimulateHandlers;
    /** The task token exposed as `Sfn.taskToken`. @default "SIMULATED_TASK_TOKEN" */
    readonly taskToken?: string;
}
/**
 * Run a Step Functions program in-process as an `Effect` — same AST the
 * cloud executes, interpreted locally for unit tests.
 *
 * ```typescript
 * const result = yield* simulate(program, { value: 6, items: [1, 2, 3] }, {
 *   handlers: {
 *     Doubler: (payload) =>
 *       Effect.succeed({ doubled: (payload as { value: number }).value * 2 }),
 *   },
 * });
 * ```
 */
export declare const simulate: <A, E>(program: SfnEffect<A, E>, input: unknown, options?: SimulateOptions) => Effect.Effect<A, E | SimulateError>;
export {};
//# sourceMappingURL=simulate.d.ts.map