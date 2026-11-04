import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Sink from "effect/Sink";
declare const BatchRetryExhaustedError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "BatchRetryExhaustedError";
} & Readonly<A>;
/**
 * Raised when a batch API keeps reporting entries as unprocessed after the
 * bounded retry schedule is exhausted. Carries the stranded entries (in input
 * order) so callers can decide what to do with them (DLQ, die, drop).
 */
export declare class BatchRetryExhaustedError<In> extends BatchRetryExhaustedError_base<{
    /** The entries that were still unprocessed when retries ran out, in input order. */
    readonly entries: readonly In[];
}> {
}
export interface BatchedSinkOptions<In, Out, Err> {
    /**
     * API max records per call (10 for SQS `SendMessageBatch` / SNS
     * `PublishBatch`, 25 for `BatchWriteItem`, 500 for Kinesis `PutRecords`,
     * 500 for Firehose, 10 for EventBridge, ...).
     */
    readonly maxRecords: number;
    /** API max payload bytes per call; entries are greedily packed. */
    readonly maxBytes?: number;
    /** Approximate wire size of one record; required for `maxBytes` packing. */
    readonly sizeOf?: (record: In) => number;
    /** One API call per packed batch. Receives entries in input order. */
    readonly send: (batch: readonly In[]) => Effect.Effect<Out, Err>;
    /**
     * Extract entries the API reports as *transiently* unprocessed (returned in
     * input order). These are re-submitted on the bounded `retrySchedule`.
     */
    readonly unprocessed?: (out: Out, batch: readonly In[]) => readonly In[];
    /**
     * Extract entries the API reports as *permanently* rejected (returned in
     * input order). Distinct from `unprocessed`: rejected entries are never
     * retried — they are dropped and surfaced via `onRejected`.
     */
    readonly rejected?: (out: Out, batch: readonly In[]) => readonly In[];
    /**
     * Invoked with permanently-rejected entries before they are dropped.
     * @default logs a warning with the rejected entry count
     */
    readonly onRejected?: (entries: readonly In[]) => Effect.Effect<void>;
    /**
     * Bounded retry for the unprocessed subset.
     * @default Schedule.recurs(5) ∩ Schedule.exponential("200 millis")
     */
    readonly retrySchedule?: Schedule.Schedule<unknown>;
}
/**
 * The shared engine behind every AWS batch-API sink (`SQS.QueueSink`,
 * `SNS.TopicSink`, `Kinesis.StreamSink`, ...).
 *
 * Semantics:
 * - each upstream chunk is split into `<= maxRecords` / `<= maxBytes` batches
 *   **preserving input order**;
 * - batches are sent **sequentially** (order-preservation is the default);
 * - after each `send`, the `rejected` subset is surfaced via `onRejected` and
 *   dropped, and the `unprocessed` subset is re-submitted (in order) on the
 *   bounded `retrySchedule`;
 * - exhausting retries fails the sink with a typed
 *   {@link BatchRetryExhaustedError} carrying the stranded entries.
 *
 * Internal — NOT exported from the `AWS` barrel.
 */
export declare const makeBatchedSink: <In, Out, Err>(options: BatchedSinkOptions<In, Out, Err>) => Sink.Sink<void, In, never, Err | BatchRetryExhaustedError<In>>;
export {};
//# sourceMappingURL=BatchedSink.d.ts.map