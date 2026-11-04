import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
/**
 * Internal service that wraps the AWS Durable Execution SDK's
 * `DurableContext`. Not accessed directly by users — use {@link step},
 * {@link sleep}, and {@link waitForCallback} instead.
 */
export class DurableStep extends Context.Service()("AWS.Lambda.DurableStep") {
}
/**
 * Runtime information about the current durable execution.
 * `yield* DurableExecutionContext` inside a durable function body.
 */
export class DurableExecutionContext extends Context.Service()("AWS.Lambda.DurableExecutionContext") {
}
/**
 * Execute a named, durable step. The effect runs inside the AWS Durable
 * Execution checkpoint protocol: its result is persisted after first
 * completion and replayed (without re-executing) on every subsequent
 * invocation of the execution.
 *
 * Any services the inner effect requires (e.g. binding clients resolved in
 * the durable function's init phase) are threaded through automatically by
 * capturing the surrounding body's context and providing it to the inner
 * effect before it is handed to the SDK.
 *
 * Determinism law: all effectful/non-deterministic work (time, randomness,
 * I/O, SDK calls) must live INSIDE a step — code between steps re-runs on
 * every replay and must be a pure function of the input and prior step
 * results.
 */
export function step(name, effect, config) {
    return Effect.gen(function* () {
        const durable = yield* DurableStep;
        const context = yield* Effect.context();
        return yield* durable.step({
            ...config,
            name,
            effect: effect.pipe(Effect.provide(context)),
        });
    });
}
/**
 * Pause the durable execution for the given duration. The invocation is
 * checkpointed and terminated — no compute is billed while suspended — and
 * Lambda re-invokes the function when the timer fires.
 */
export const sleep = (name, duration) => Effect.gen(function* () {
    const durable = yield* DurableStep;
    yield* durable.wait(name, duration);
});
/**
 * Suspend the durable execution until an external system completes the
 * callback via `SendDurableExecutionCallbackSuccess` (or fails it via
 * `...Failure`). The `submitter` effect runs exactly once (checkpointed) and
 * receives the callback id to hand to the external system.
 */
export const waitForCallback = (name, submitter, config) => Effect.gen(function* () {
    const durable = yield* DurableStep;
    const context = yield* Effect.context();
    return yield* durable.waitForCallback({
        ...config,
        name,
        submitter: (callbackId) => submitter(callbackId).pipe(Effect.provide(context)),
    });
});
//# sourceMappingURL=Durable.js.map