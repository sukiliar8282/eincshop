import * as Effect from "effect/Effect";
import type { Stream } from "./Stream.ts";
import type { StreamConsumer } from "./StreamConsumer.ts";
/**
 * Shared scaffolding for AWS Kinesis HTTP bindings.
 *
 * NOT exported from `index.ts` — every near-identical `{Op}Http.ts` in this
 * service is a thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of
 * the builders below. Everything except the operation, the IAM action list,
 * and the injected identifier is boilerplate. Genuinely-different bindings
 * (the batched `StreamSink`, the `Stream | StreamConsumer` polymorphic
 * `ListTagsForResource`) stay bespoke.
 */
/**
 * Build the impl Effect for an account-level operation (`ListStreams`,
 * `DescribeLimits`, `DescribeAccountSettings`): the runtime callable passes
 * the caller's request through unchanged and the deploy-time half grants
 * `actions` on `*` (these Kinesis actions do not support resource-level
 * permissions).
 */
export declare const makeKinesisAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Kinesis.ListStreams`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a stream-scoped operation: the runtime callable
 * injects the bound {@link Stream}'s identity under `key` (`StreamARN` for
 * the describe/shard APIs, `StreamName` for the producer APIs, `ResourceARN`
 * for the policy APIs) and the deploy-time half grants `actions` on the
 * stream's ARN.
 */
export declare const makeStreamHttpBinding: <K extends "StreamARN" | "StreamName" | "ResourceARN", I extends { [P in K]?: string; }, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Kinesis.DescribeStream`. */
    tag: string;
    /** The distilled operation; the stream identity is injected under `key`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the stream ARN. */
    actions: readonly string[];
    /** The request field the stream identity is injected under. */
    key: K;
}) => Effect.Effect<(stream: Stream) => Effect.Effect<(request?: Omit<I, K> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a consumer-scoped operation
 * (`DescribeStreamConsumer`, `SubscribeToShard`): the runtime callable
 * injects the bound {@link StreamConsumer}'s ARN as `ConsumerARN` and the
 * deploy-time half grants `actions` on the consumer ARN.
 */
export declare const makeConsumerHttpBinding: <I extends {
    ConsumerARN?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Kinesis.SubscribeToShard`. */
    tag: string;
    /** The distilled operation; `ConsumerARN` is injected from the consumer. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the consumer ARN. */
    actions: readonly string[];
}) => Effect.Effect<(consumer: StreamConsumer) => Effect.Effect<(request?: Omit<I, "ConsumerARN"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map