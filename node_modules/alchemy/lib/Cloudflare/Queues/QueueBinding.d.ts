import type * as runtime from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import { Worker, WorkerEnvironment } from "../Workers/Worker.ts";
import type { Queue } from "./Queue.ts";
import { SendError } from "./QueueTypes.ts";
/**
 * Shared scaffolding for the Worker-binding implementations of the Queue
 * services.
 *
 * Resolves the {@link WorkerEnvironment} and host {@link Worker}, registers
 * the `queue` binding at deploy time, then delegates to `makeClient` with the
 * shared {@link makeQueueHelpers} to build the producer client.
 */
export declare const makeQueueBinding: <Client>(options: {
    makeClient: (helpers: ReturnType<typeof makeQueueHelpers>) => Client;
}) => Effect.Effect<(queue: Queue) => Effect.Effect<Client, never, never>, never, WorkerEnvironment | Worker<any>>;
/** Primitives shared by the Worker-binding producer clients. */
export declare const makeQueueHelpers: (env: Record<string, any>, queue: Queue) => {
    raw: Effect.Effect<runtime.Queue<unknown>, never, never>;
    use: <T>(fn: (raw: runtime.Queue<unknown>) => Promise<T>) => Effect.Effect<T, SendError>;
    tryPromise: <T>(fn: () => Promise<T>) => Effect.Effect<T, SendError>;
};
//# sourceMappingURL=QueueBinding.d.ts.map