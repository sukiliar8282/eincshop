/**
 * Local interpreter for Step Functions programs — the payoff of the AST.
 *
 * `simulate` runs the *same* `SfnEffect` a `StateMachine.fromProgram`
 * deploys, in-process, as a real `Effect`: Task states dispatch to
 * caller-provided handler stubs, Choice conditions evaluate against the
 * live variable environment, `catchTag`/`retry` follow the exact ASL error
 * semantics (`{ Error, Cause }` error output, `States.ALL` matching), and
 * `Wait` states are skipped (simulations are instantaneous).
 */
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import { inputExpr, isExpr, nodeOf, variableExpr, } from "./Jsonata.js";
import { isSfnEffect } from "./Program.js";
/**
 * The simulation itself went wrong — a missing handler, an unsupported raw
 * JSONata expression, or a structurally invalid program. Distinct from the
 * program's own typed failures, which flow through the `E` channel.
 */
export class SimulateError extends Data.TaggedError("SimulateError") {
}
/**
 * Internal failure wrapper preserving the exact ASL `Error`/`Cause` pair a
 * `Fail` state declares, so `catch` handlers observe the same
 * `$states.errorOutput` the cloud would produce. Unwrapped back to the
 * user's typed failure at the simulation boundary.
 */
class FailStateFailure {
    error;
    cause;
    failure;
    _sim = "FailStateFailure";
    constructor(error, cause, failure) {
        this.error = error;
        this.cause = cause;
        this.failure = failure;
    }
}
const isFailStateFailure = (value) => value instanceof FailStateFailure;
/** The ASL error name of a simulated failure (`_tag` convention). */
const errorNameOf = (failure) => {
    if (isFailStateFailure(failure))
        return failure.error;
    if (typeof failure === "object" &&
        failure !== null &&
        "_tag" in failure &&
        typeof failure._tag === "string") {
        return failure._tag;
    }
    return "States.TaskFailed";
};
const causeOf = (failure) => {
    if (isFailStateFailure(failure))
        return failure.cause;
    if (typeof failure === "object" && failure !== null) {
        const message = failure.message;
        if (typeof message === "string" && message.length > 0)
            return message;
        try {
            return JSON.stringify(failure);
        }
        catch {
            return errorNameOf(failure);
        }
    }
    return String(failure);
};
const evalExprNode = (node, env) => {
    switch (node._) {
        case "root":
            switch (node.root.kind) {
                case "input":
                    return env.input;
                case "variable":
                    return env.vars[node.root.name];
                case "token":
                    return env.taskToken;
            }
        // eslint-disable-next-line no-fallthrough
        case "prop": {
            const parent = evalExprNode(node.parent, env);
            return parent == null ? undefined : parent[node.name];
        }
        case "literal":
            return node.value;
        case "binop": {
            const left = evalExprNode(node.left, env);
            const right = evalExprNode(node.right, env);
            switch (node.op) {
                case "=":
                    return left === right;
                case "!=":
                    return left !== right;
                case ">":
                    return left > right;
                case ">=":
                    return left >= right;
                case "<":
                    return left < right;
                case "<=":
                    return left <= right;
                case "and":
                    return Boolean(left) && Boolean(right);
                case "or":
                    return Boolean(left) || Boolean(right);
            }
        }
        // eslint-disable-next-line no-fallthrough
        case "not":
            return !evalExprNode(node.inner, env);
        case "raw":
            throw new SimulateError({
                message: `raw JSONata expressions are not supported by simulate: ${node.jsonata}`,
            });
    }
};
/** Deep-evaluate a payload value: `Expr` references resolve against `env`. */
const evalValue = (value, env) => {
    if (value === undefined)
        return null;
    if (isExpr(value))
        return evalExprNode(nodeOf(value), env);
    if (Array.isArray(value))
        return value.map((entry) => evalValue(entry, env));
    if (typeof value === "object" && value !== null) {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, evalValue(entry, env)]));
    }
    return value;
};
const evalExpr = (value, env) => Effect.try({
    try: () => evalValue(value, env),
    catch: (error) => error instanceof SimulateError
        ? error
        : new SimulateError({ message: String(error) }),
});
const allocVar = (env) => `sim${env.counter.n++}`;
/** Child scope with an ASL scope barrier (Parallel branch / Map iteration). */
const childEnv = (env) => ({
    ...env,
    vars: Object.create(env.vars),
});
const runNode = (node, env) => {
    switch (node.kind) {
        case "invoke": {
            const handler = env.handlers[node.fn.LogicalId];
            if (handler === undefined) {
                return Effect.fail(new SimulateError({
                    message: `no simulate handler for function "${node.fn.LogicalId}"`,
                }));
            }
            return evalExpr(node.payload, env).pipe(Effect.flatMap(handler));
        }
        case "integrate": {
            const key = node.waitForTaskToken
                ? `${node.options.resource}.waitForTaskToken`
                : node.options.resource;
            const handler = env.handlers[key];
            if (handler === undefined) {
                return Effect.fail(new SimulateError({
                    message: `no simulate handler for integration "${key}"`,
                }));
            }
            return evalExpr(node.options.arguments, env).pipe(Effect.flatMap(handler));
        }
        case "all":
            return Effect.forEach(node.branches, (branch) => runNode(branch.node, childEnv(env)));
        case "forEach":
            return evalExpr(node.items, env).pipe(Effect.flatMap((items) => {
                if (!Array.isArray(items)) {
                    return Effect.fail(new SimulateError({
                        message: "Sfn.forEach items did not evaluate to an array",
                    }));
                }
                return Effect.forEach(items, (item) => {
                    // mirror compile: the item is bound to a fresh variable scoped
                    // to the iteration
                    const scope = childEnv(env);
                    const itemVar = allocVar(scope);
                    scope.vars[itemVar] = item;
                    const body = node.body(variableExpr(itemVar));
                    if (!isSfnEffect(body)) {
                        return Effect.fail(new SimulateError({
                            message: "Sfn.forEach body must return an Sfn effect",
                        }));
                    }
                    return runNode(body.node, scope);
                });
            }));
        case "sleep":
            // simulations are instantaneous — Wait states are skipped
            return Effect.succeed(null);
        case "when":
            return evalExpr(node.condition, env).pipe(Effect.flatMap((condition) => condition
                ? runNode(node.onTrue.node, env)
                : node.onFalse !== undefined
                    ? runNode(node.onFalse.node, env)
                    : Effect.succeed(null)));
        case "match":
            return evalExpr(node.value, env).pipe(Effect.flatMap((value) => {
                const program = node.cases[String(value)] ?? node.otherwise;
                if (program === undefined) {
                    return Effect.fail(new SimulateError({
                        message: `States.NoChoiceMatched: no case for ${JSON.stringify(value)}`,
                    }));
                }
                return runNode(program.node, env);
            }));
        case "succeed":
            return evalExpr(node.value, env);
        case "fail":
            return Effect.fail(new FailStateFailure(node.error, node.cause, node.failure));
        case "retry": {
            const tags = node.options.while === undefined
                ? ["States.ALL"]
                : typeof node.options.while === "string"
                    ? [node.options.while]
                    : [...node.options.while];
            const maxAttempts = node.options.maxAttempts ?? 3;
            const attempt = (retriesLeft) => Effect.result(runNode(node.inner.node, env)).pipe(Effect.flatMap((result) => {
                if (Result.isSuccess(result))
                    return Effect.succeed(result.success);
                const failure = result.failure;
                const retryable = !(failure instanceof SimulateError) &&
                    (tags.includes("States.ALL") ||
                        tags.includes(errorNameOf(failure)));
                return retryable && retriesLeft > 0
                    ? attempt(retriesLeft - 1)
                    : Effect.fail(failure);
            }));
            return attempt(maxAttempts);
        }
        case "catch":
            return Effect.result(runNode(node.inner.node, env)).pipe(Effect.flatMap((result) => {
                if (Result.isSuccess(result))
                    return Effect.succeed(result.success);
                const failure = result.failure;
                const matches = !(failure instanceof SimulateError) &&
                    (node.tags.includes("States.ALL") ||
                        node.tags.includes(errorNameOf(failure)));
                if (!matches)
                    return Effect.fail(failure);
                const errorVar = allocVar(env);
                env.vars[errorVar] = {
                    Error: errorNameOf(failure),
                    Cause: causeOf(failure),
                };
                const handler = node.handler(variableExpr(errorVar));
                if (!isSfnEffect(handler)) {
                    return Effect.fail(new SimulateError({
                        message: "Sfn.catchTag/catchAll handler must return an Sfn effect",
                    }));
                }
                return runNode(handler.node, env);
            }));
        case "gen":
            return Effect.gen(function* () {
                const iterator = node.body(inputExpr());
                let step = iterator.next();
                while (!step.done) {
                    const program = step.value;
                    if (!isSfnEffect(program)) {
                        return yield* Effect.fail(new SimulateError({
                            message: "Sfn.gen may only yield Sfn effects",
                        }));
                    }
                    const value = yield* runNode(program.node, env);
                    const name = allocVar(env);
                    env.vars[name] = value;
                    step = iterator.next(variableExpr(name));
                }
                return yield* evalExpr(step.value, env);
            });
    }
};
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
export const simulate = (program, input, options) => {
    const env = {
        input,
        vars: Object.create(null),
        taskToken: options?.taskToken ?? "SIMULATED_TASK_TOKEN",
        handlers: options?.handlers ?? {},
        counter: { n: 0 },
    };
    return runNode(program.node, env).pipe(Effect.mapError((failure) => isFailStateFailure(failure) ? failure.failure : failure));
};
//# sourceMappingURL=simulate.js.map