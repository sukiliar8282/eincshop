import * as Effect from "effect/Effect";
import type { Thing } from "./Thing.ts";
/**
 * Build the impl Effect for an account-level operation (`DescribeEndpoint`,
 * `ListThings`, `ListRetainedMessages`): the runtime callable passes the
 * caller's request through unchanged and the deploy-time half grants
 * `actions` on `*` (these IoT actions do not support resource-level
 * permissions).
 */
export declare const makeIotAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IoT.DescribeEndpoint`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a thing-scoped operation (device shadows,
 * `DescribeThing`): the runtime callable injects the bound {@link Thing}'s
 * physical name as `thingName` and the deploy-time half grants `actions` on
 * the thing ARN.
 */
export declare const makeIotThingHttpBinding: <I extends {
    thingName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IoT.GetThingShadow`. */
    tag: string;
    /** The distilled operation; `thingName` is injected from the thing. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the thing ARN. */
    actions: readonly string[];
}) => Effect.Effect<(thing: Thing) => Effect.Effect<(request?: Omit<I, "thingName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a topic-scoped operation (`Publish`,
 * `GetRetainedMessage`): the binding takes an MQTT topic filter, the
 * deploy-time half grants `actions` on the matching topic ARN
 * (`arn:aws:iot:{region}:{account}:topic/{filter}`, or all topics when the
 * filter is omitted), and the runtime callable passes the caller's request
 * (which carries the concrete `topic`) through unchanged.
 */
export declare const makeIotTopicHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IoT.Publish`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the topic-filter ARN. */
    actions: readonly string[];
}) => Effect.Effect<(topicFilter?: string | undefined) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a client-scoped MQTT connection operation
 * (`GetConnection`, `DeleteConnection`, `ListSubscriptions`,
 * `SendDirectMessage`): the binding takes a client id filter, the
 * deploy-time half grants `actions` on the matching client ARN
 * (`arn:aws:iot:{region}:{account}:client/{filter}`, or all clients when the
 * filter is omitted), and the runtime callable passes the caller's request
 * (which carries the concrete `clientId`) through unchanged.
 */
export declare const makeIotClientHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.IoT.GetConnection`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the client-filter ARN. */
    actions: readonly string[];
}) => Effect.Effect<(clientIdFilter?: string | undefined) => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map