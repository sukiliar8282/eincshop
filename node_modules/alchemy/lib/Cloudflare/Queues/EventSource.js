import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as Namespace from "../../Namespace.js";
import { RuntimeContext } from "../../RuntimeContext.js";
import * as DurationUtil from "../../Util/Duration.js";
import { isWorkerEvent, Worker } from "../Workers/Worker.js";
import { Consumer } from "./Consumer.js";
/**
 * Convert a {@link MessagesProps} (with `Duration.Input` time fields)
 * into the numeric settings shape Cloudflare's `Consumer` API
 * expects. `maxWaitTime` is rounded up to whole milliseconds and
 * `retryDelay` to whole seconds.
 *
 * Exposed for testing and for callers that want to mirror the
 * conversion when wiring `Consumer` directly.
 */
export const toConsumerSettings = (props) => ({
    batchSize: props.batchSize,
    maxConcurrency: props.maxConcurrency,
    maxRetries: props.maxRetries,
    maxWaitTimeMs: DurationUtil.toMillis(props.maxWaitTime),
    retryDelay: DurationUtil.toSeconds(props.retryDelay),
});
export function consumeQueueMessages(queue, propsOrProcess, maybeProcess) {
    const [props, process] = typeof propsOrProcess === "function"
        ? [{}, propsOrProcess]
        : [propsOrProcess, maybeProcess];
    return EventSource.use((source) => source(queue, props, process));
}
/**
 * Service tag for the Cloudflare Queue event source. Provided by
 * {@link EventSourceLive} on the Worker's runtime layer.
 */
export class EventSource extends Context.Service()("Cloudflare.Queues.EventSource") {
}
/**
 * Runtime layer for {@link consumeQueueMessages}. Wires each
 * `consumeQueueMessages(queue, handler)` call in the Worker init phase to
 * a `queue` event listener on the runtime context, and (at deploy
 * time) yields the matching `Cloudflare.Queues.Consumer` resource so
 * Cloudflare dispatches messages from the queue to this Worker.
 *
 * Provide alongside other Cloudflare runtime layers (e.g.
 * `WriteQueueBinding`) on the Worker effect.
 */
export const EventSourceLive = Layer.effect(EventSource, Effect.gen(function* () {
    const host = yield* Worker;
    return Effect.fn(function* (queue, props, process) {
        // Deploy-time: yield the Consumer resource as a sibling of the
        // Worker so Cloudflare dispatches messages from the queue to it.
        // Skipped once running inside the deployed Worker (the global
        // guard), where the only work is registering the runtime handler
        // below. Namespaced under the host so the Consumer's logical
        // identity matches the previous Binding.Policy.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* Namespace.push(host.LogicalId, Effect.gen(function* () {
                // The engine creates / updates / destroys the Consumer
                // alongside the Worker's lifecycle; the consumer's
                // reconciler waits for the Worker upload to expose the
                // `queue` handler before completing (see PR #257 for the
                // 11001 retry).
                yield* Consumer(`${queue.LogicalId}Consumer`, {
                    queueId: queue.queueId,
                    scriptName: host.workerName,
                    settings: toConsumerSettings(props),
                    deadLetterQueue: props.deadLetterQueue,
                });
            }));
        }
        // Resolve the runtime context per-call rather than at layer
        // construction. Capturing it on the layer would leak the
        // requirement past `PlatformServices` exclusion when the
        // Worker typechecks its init effect.
        const ctx = (yield* RuntimeContext);
        // Capture the queue-name accessor once; the listener body
        // re-resolves it per event via `yield* QueueName`. A worker
        // can consume multiple queues — each subscribe registers its
        // own listener and they all see every queue event, so the
        // queue-name match is what scopes the handler.
        const QueueName = yield* queue.queueName;
        yield* ctx.listen((event) => {
            if (!isWorkerEvent(event) || event.type !== "queue")
                return;
            const batch = event.input;
            return Effect.gen(function* () {
                const queueName = yield* QueueName;
                if (batch.queue !== queueName)
                    return;
                yield* process(Stream.fromIterable(batch.messages)).pipe(Effect.tap(() => Effect.sync(() => {
                    for (const msg of batch.messages)
                        msg.ack();
                })), Effect.onError((cause) => Effect.sync(() => {
                    // Surface the failure so the operator sees what
                    // tripped the retry path; without this the only
                    // signal is the message reappearing on the next
                    // attempt.
                    console.error(`[EventSource] handler failed on queue ` +
                        `"${queueName}": ${Cause.pretty(cause)}`);
                    for (const msg of batch.messages)
                        msg.retry();
                })), Effect.catchCause(() => Effect.void));
            });
        });
    });
}));
//# sourceMappingURL=EventSource.js.map