import * as Effect from "effect/Effect";
import type { PlatformApplication } from "./PlatformApplication.ts";
import type { Subscription } from "./Subscription.ts";
import type { Topic } from "./Topic.ts";
/**
 * Shared scaffolding for AWS SNS HTTP bindings.
 *
 * NOT exported from `index.ts` — every near-identical `{Op}Http.ts` in this
 * service is a thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of
 * the builders below. Everything except the operation, the IAM action list,
 * and the injected identifier is boilerplate. Genuinely-different bindings
 * (the batched `TopicSink`) stay bespoke.
 */
/**
 * Build the impl Effect for an account-level operation (`ListTopics`,
 * `ListSubscriptions`, the SMS/sandbox APIs): the runtime callable passes
 * the caller's request through unchanged and the deploy-time half grants
 * `actions` on `*` (these SNS actions do not support resource-level
 * permissions — only topic-scoped actions do).
 */
export declare const makeSnsAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SNS.ListTopics`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a topic-scoped operation: the runtime callable
 * injects the bound {@link Topic}'s ARN under `key` (`TopicArn` for the
 * pub/sub and attribute APIs, `ResourceArn` for the tagging and
 * data-protection-policy APIs) and the deploy-time half grants `actions` on
 * the topic's ARN.
 */
export declare const makeSnsTopicHttpBinding: <K extends "TopicArn" | "ResourceArn", I extends { [P in K]?: string; }, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SNS.Publish`. */
    tag: string;
    /** The distilled operation; the topic ARN is injected under `key`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the topic ARN. */
    actions: readonly string[];
    /** The request field the topic ARN is injected under. */
    key: K;
}) => Effect.Effect<(topic: Topic) => Effect.Effect<(request?: Omit<I, K> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a subscription-scoped operation: the runtime
 * callable injects the bound {@link Subscription}'s identity under `key`
 * (`SubscriptionArn` for the attribute APIs, `TopicArn` for
 * `ConfirmSubscription`) and the deploy-time half grants `actions` on the
 * subscription's parent topic ARN (SNS checks subscription actions against
 * the topic resource).
 */
export declare const makeSnsSubscriptionHttpBinding: <K extends "SubscriptionArn" | "TopicArn", I extends { [P in K]?: string; }, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SNS.GetSubscriptionAttributes`. */
    tag: string;
    /** The distilled operation; the subscription identity is injected under `key`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the subscription's topic ARN. */
    actions: readonly string[];
    /** The request field the subscription identity is injected under. */
    key: K;
}) => Effect.Effect<(subscription: Subscription) => Effect.Effect<(request?: Omit<I, K> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a platform-application-scoped mobile-push
 * operation whose request accepts `PlatformApplicationArn`
 * (`CreatePlatformEndpoint`, `ListEndpointsByPlatformApplication`): the
 * runtime callable injects the bound {@link PlatformApplication}'s ARN and
 * the deploy-time half grants `actions` on `*` (SNS mobile-push actions do
 * not support resource-level permissions).
 */
export declare const makeSnsPlatformHttpBinding: <I extends {
    PlatformApplicationArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SNS.CreatePlatformEndpoint`. */
    tag: string;
    /** The distilled operation; the application ARN is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*` (no resource-level support). */
    actions: readonly string[];
}) => Effect.Effect<(application: PlatformApplication) => Effect.Effect<(request?: Omit<I, "PlatformApplicationArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an endpoint-scoped mobile-push operation
 * (`GetEndpointAttributes`, `SetEndpointAttributes`, `DeleteEndpoint`,
 * publish-to-endpoint): the caller's request already carries the endpoint
 * identity (`EndpointArn`/`TargetArn`) and is passed through unchanged; the
 * binding is still scoped to a {@link PlatformApplication} for IAM naming
 * and grants `actions` on `*` (SNS mobile-push actions do not support
 * resource-level permissions).
 */
export declare const makeSnsEndpointHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SNS.DeleteEndpoint`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*` (no resource-level support). */
    actions: readonly string[];
}) => Effect.Effect<(application: PlatformApplication) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map