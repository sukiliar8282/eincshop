import * as Effect from "effect/Effect";
import type { Channel } from "./Channel.ts";
import type { Input } from "./Input.ts";
/**
 * Shared scaffolding for AWS Elemental MediaLive HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service
 * is a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the three
 * builders below. Everything except the operation and the IAM action list
 * is boilerplate: channel-scoped bindings inject the bound channel's
 * server-assigned id as the request's `ChannelId` and grant `actions` on
 * the channel ARN; input-scoped bindings do the same with `InputId` and
 * the input ARN; account-scoped bindings pass the request through and
 * grant `actions` on `*`.
 */
/**
 * Build the impl Effect for a MediaLive operation scoped to a
 * {@link Channel}: the deploy-time half grants `actions` on the bound
 * channel's ARN, and the runtime half injects the channel's id into every
 * request as `ChannelId`.
 */
export declare const makeMediaLiveChannelHttpBinding: <I extends {
    ChannelId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaLive.StartChannel`. */
    tag: string;
    /** The distilled operation; `ChannelId` is injected from the channel. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the channel ARN. */
    actions: readonly string[];
}) => Effect.Effect<(channel: Channel) => Effect.Effect<(request?: Omit<I, "ChannelId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a MediaLive operation scoped to an
 * {@link Input}: the deploy-time half grants `actions` on the bound
 * input's ARN, and the runtime half injects the input's id into every
 * request as `InputId`.
 */
export declare const makeMediaLiveInputHttpBinding: <I extends {
    InputId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaLive.DescribeInput`. */
    tag: string;
    /** The distilled operation; `InputId` is injected from the input. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the input ARN. */
    actions: readonly string[];
}) => Effect.Effect<(input: Input) => Effect.Effect<(request?: Omit<I, "InputId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level MediaLive operation (e.g.
 * enumerating the account's channels or inputs). The deploy-time half
 * grants `actions` on `*` — these list operations are not scoped to a
 * single resource.
 */
export declare const makeMediaLiveAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaLive.ListChannels`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map