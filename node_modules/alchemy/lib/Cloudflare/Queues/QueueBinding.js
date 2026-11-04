import * as Effect from "effect/Effect";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { maybeQueueShim } from "./QueueShim.js";
import { SendError } from "./QueueTypes.js";
/**
 * Shared scaffolding for the Worker-binding implementations of the Queue
 * services.
 *
 * Resolves the {@link WorkerEnvironment} and host {@link Worker}, registers
 * the `queue` binding at deploy time, then delegates to `makeClient` with the
 * shared {@link makeQueueHelpers} to build the producer client.
 */
export const makeQueueBinding = (options) => Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    // Deploy-time ambient context (providers, stack). Captured at layer
    // init so the shim registration below can run inside the callable —
    // whose contract requires `R = never` — without leaking engine
    // requirements into the binding's public type. Only dereferenced under
    // the `__ALCHEMY_RUNTIME__` guard, where the context is the stack
    // eval's (at runtime the captured context lacks providers, but the
    // guarded branch never runs there).
    const context = yield* Effect.context();
    return Effect.fn(function* (queue) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            // A LOCAL host binding a LIVE queue needs the dev-mode
            // remote-producer shim (see `QueueShim.ts`) — registered here as
            // ordinary engine-managed resources, like the `AccountApiToken`
            // the HTTP capability layers mint.
            const shim = yield* maybeQueueShim(queue, host).pipe(Effect.provideContext(context));
            yield* host.bind `${queue}`({
                bindings: [
                    {
                        type: "queue",
                        name: queue.LogicalId,
                        queueName: queue.queueName,
                        // Alchemy-only mode discriminator for dev (stripped before
                        // upload): a `dev:` id keeps the local broker, a real id
                        // (Alchemy.remote()) routes through the deployed shim.
                        queueId: queue.queueId,
                        ...(shim ? { shim } : {}),
                    },
                ],
            });
        }
        return options.makeClient(makeQueueHelpers(env, queue));
    });
});
/** Primitives shared by the Worker-binding producer clients. */
export const makeQueueHelpers = (env, queue) => {
    const raw = Effect.sync(() => env[queue.LogicalId]);
    const tryPromise = (fn) => Effect.tryPromise({
        try: fn,
        catch: (error) => new SendError({
            message: error?.message ?? "Unknown queue error",
            cause: error,
        }),
    });
    const use = (fn) => raw.pipe(Effect.flatMap((raw) => tryPromise(() => fn(raw))));
    return { raw, use, tryPromise };
};
//# sourceMappingURL=QueueBinding.js.map