import type * as cf from "@cloudflare/workers-types";
import * as Context from "effect/Context";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { Worker } from "../Workers/Worker.ts";
import type { Queue } from "./Queue.ts";
/**
 * Subscriber settings — the same shape Cloudflare's `Consumer`
 * accepts. `consumeQueueMessages(queue, props, handler)` passes these
 * through to the auto-created `Cloudflare.Queues.Consumer` so a single
 * call captures both runtime and deploy-time intent.
 */
export interface MessagesProps {
    /** Maximum messages per batch. */
    batchSize?: number;
    /** Maximum concurrent invocations. */
    maxConcurrency?: number;
    /** Maximum delivery attempts before dead-lettering. */
    maxRetries?: number;
    /**
     * Wait time before flushing a partial batch. Rounded up to whole
     * milliseconds when forwarded to Cloudflare.
     */
    maxWaitTime?: Duration.Input;
    /**
     * Backoff applied to a retry. Rounded up to whole seconds when
     * forwarded to Cloudflare.
     */
    retryDelay?: Duration.Input;
    /** Optional dead-letter queue name. */
    deadLetterQueue?: string;
}
/**
 * Convert a {@link MessagesProps} (with `Duration.Input` time fields)
 * into the numeric settings shape Cloudflare's `Consumer` API
 * expects. `maxWaitTime` is rounded up to whole milliseconds and
 * `retryDelay` to whole seconds.
 *
 * Exposed for testing and for callers that want to mirror the
 * conversion when wiring `Consumer` directly.
 */
export declare const toConsumerSettings: (props: MessagesProps) => {
    batchSize: number | undefined;
    maxConcurrency: number | undefined;
    maxRetries: number | undefined;
    maxWaitTimeMs: number | undefined;
    retryDelay: number | undefined;
};
/**
 * A single queue message handed to the subscribe handler. Mirrors
 * Cloudflare's runtime `Message<Body>` shape so per-message
 * `ack()` / `retry()` semantics match the platform docs.
 */
export type Message<Body = unknown> = cf.Message<Body>;
/**
 * Subscribe to a Cloudflare Queue with an Effect stream handler.
 *
 * Mirrors `AWS.SQS.consumeQueueMessages(queue, handler)` on the
 * Cloudflare side. Wires both halves of the consumer in one call:
 *
 * - **Runtime**: registers a `queue` event listener on the Worker.
 *   Each batch is piped through `process` as a `Stream.Stream`.
 * - **Deploy-time**: yields a `Cloudflare.Queues.Consumer` resource
 *   so Cloudflare actually dispatches messages from `queue` to
 *   this Worker. No manual `Consumer` wiring needed in
 *   `alchemy.run.ts`.
 *
 * Acking semantics: if `process` succeeds, every message in the
 * batch is `ack()`ed; if it fails, every message is `retry()`ed
 * and Cloudflare applies `maxRetries` / `retryDelay` from the
 * settings before dead-lettering. Per-message control is still
 * available by calling `msg.ack()` / `msg.retry()` inside the
 * handler.
 * **Example:** Example
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Duration from "effect/Duration";
 * import * as Effect from "effect/Effect";
 * import * as Stream from "effect/Stream";
 *
 * yield* Cloudflare.Queues.consumeQueueMessages<MyEvent>(
 *   queueResource,
 *   {
 *     batchSize: 25,
 *     maxRetries: 3,
 *     maxWaitTime: "5 seconds",
 *     retryDelay: Duration.seconds(30),
 *   },
 *   (stream) =>
 *     Stream.runForEach(stream, (msg) =>
 *       Effect.log(`event ${msg.body.id}`),
 *     ),
 * );
 * ```
 *
 * **Example:** Example
 * ```typescript
 * // Without options — handler is the second argument.
 * yield* Cloudflare.Queues.consumeQueueMessages<MyEvent>(queueResource, (stream) =>
 *   Stream.runForEach(stream, (msg) => Effect.log(`event ${msg.body.id}`)),
 * );
 * ```
 *
 * @binding
 * @product Queues
 * @category Storage & Databases
 */
export declare function consumeQueueMessages<Body = unknown>(queue: Queue, process: (stream: Stream.Stream<Message<Body>>) => Effect.Effect<void, unknown, any>): Effect.Effect<void, never, EventSource>;
export declare function consumeQueueMessages<Body = unknown>(queue: Queue, props: MessagesProps, process: (stream: Stream.Stream<Message<Body>>) => Effect.Effect<void, unknown, any>): Effect.Effect<void, never, EventSource>;
export type EventSourceService = <Body = unknown>(queue: Queue, props: MessagesProps, process: (stream: Stream.Stream<Message<Body>>) => Effect.Effect<void, unknown, any>) => Effect.Effect<void, never, never>;
declare const EventSource_base: Context.ServiceClass<EventSource, "Cloudflare.Queues.EventSource", EventSourceService>;
/**
 * Service tag for the Cloudflare Queue event source. Provided by
 * {@link EventSourceLive} on the Worker's runtime layer.
 */
export declare class EventSource extends EventSource_base {
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
export declare const EventSourceLive: Layer.Layer<EventSource, never, Worker<any>>;
export {};
//# sourceMappingURL=EventSource.d.ts.map