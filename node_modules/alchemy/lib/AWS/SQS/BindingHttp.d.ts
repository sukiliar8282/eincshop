import * as Effect from "effect/Effect";
import type { Queue } from "./Queue.ts";
/**
 * Build the impl Effect for a queue-scoped operation whose request carries
 * the queue identity as `QueueUrl` (`SendMessage`, `ReceiveMessage`,
 * `PurgeQueue`, …): the runtime callable injects the bound {@link Queue}'s
 * URL and the deploy-time half grants `actions` on the queue's ARN.
 */
export declare const makeQueueUrlHttpBinding: <I extends {
    QueueUrl?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SQS.SendMessage`. */
    tag: string;
    /** The distilled operation; the queue URL is injected as `QueueUrl`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the queue ARN. */
    actions: readonly string[];
}) => Effect.Effect<(queue: Queue) => Effect.Effect<(request?: Omit<I, "QueueUrl"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a dead-letter-queue-scoped message-move-task
 * operation whose request carries the queue identity as `SourceArn`
 * (`ListMessageMoveTasks`): the runtime callable injects the bound
 * {@link Queue}'s ARN and the deploy-time half grants `actions` on it.
 */
export declare const makeQueueArnHttpBinding: <I extends {
    SourceArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SQS.ListMessageMoveTasks`. */
    tag: string;
    /** The distilled operation; the queue ARN is injected as `SourceArn`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the queue ARN. */
    actions: readonly string[];
}) => Effect.Effect<(queue: Queue) => Effect.Effect<(request?: Omit<I, "SourceArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a queue-scoped operation whose request carries
 * no queue identity at all (`CancelMessageMoveTask`): the runtime callable
 * passes the caller's request through unchanged while the deploy-time half
 * still grants `actions` on the bound {@link Queue}'s ARN.
 */
export declare const makeQueueGrantHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SQS.CancelMessageMoveTask`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the queue ARN. */
    actions: readonly string[];
}) => Effect.Effect<(queue: Queue) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map