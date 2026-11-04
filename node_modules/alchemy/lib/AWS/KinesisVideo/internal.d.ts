import * as kv from "@distilled.cloud/aws/kinesis-video";
import * as Effect from "effect/Effect";
declare const KinesisVideoNotConverged_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "KinesisVideoNotConverged";
} & Readonly<A>;
/**
 * Raised when a Kinesis Video stream or signaling channel fails to reach
 * `ACTIVE` within the bounded polling budget after a create/update.
 */
export declare class KinesisVideoNotConverged extends KinesisVideoNotConverged_base<{
    readonly resource: string;
    readonly status: string | undefined;
}> {
}
declare const SignalingEndpointUnavailable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SignalingEndpointUnavailable";
} & Readonly<A>;
/**
 * Raised when `GetSignalingChannelEndpoint` returns no endpoint for the
 * requested protocol.
 */
export declare class SignalingEndpointUnavailable extends SignalingEndpointUnavailable_base<{
    readonly channelArn: string;
    readonly protocol: string;
}> {
}
/**
 * Bounded retry through transient `ResourceInUseException` states — e.g.
 * deleting a stream or channel that is still `CREATING`/`UPDATING`, or
 * re-creating one whose previous incarnation is still `DELETING`.
 *
 * Expressed as an explicitly-typed module-scope helper: inlining
 * `Effect.retry` in lifecycle code leaves its conditional return type
 * unresolved in the provider's declaration emit, which widens the
 * `AWS.providers()` layer type for every downstream consumer.
 */
export declare const retryWhileResourceInUse: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry through the transient states a mutation can hit while a
 * previous async transition settles: `ResourceInUseException` and the
 * synthetic `StreamNotActive` (Kinesis Video overloads
 * `ResourceNotFoundException` with "not found or not active" while a
 * stream/channel is CREATING/UPDATING — patched into a typed tag in
 * distilled). Explicitly typed for the declaration-emit reason above.
 */
export declare const retryWhileSettling: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Bounded retry through `ResourceNotFoundException` — a freshly-created
 * stream/channel can be invisible to `Describe*` for a few seconds
 * (eventual consistency). Explicitly typed for the same declaration-emit
 * reason as above.
 */
export declare const retryWhileNotFound: <A, E extends {
    _tag: string;
}, R>(self: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
/**
 * Poll `DescribeStream` until the stream is `ACTIVE`. Tolerates the brief
 * post-create window where the stream is not yet describable.
 *
 * Mutations (`UpdateStream`/`UpdateDataRetention`) are asynchronous AND bump
 * the stream version — a describe issued immediately after can still show
 * the pre-mutation `ACTIVE` state with the stale version. Pass
 * `previousVersion` after a mutation to also wait for the version bump, so
 * the returned `Version` is safe to use in the next versioned call.
 */
export declare const waitForStreamActive: (streamName: string, previousVersion?: string | undefined) => Effect.Effect<kv.StreamInfo, KinesisVideoNotConverged | kv.DescribeStreamError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Poll `DescribeSignalingChannel` until the channel is `ACTIVE`. Tolerates
 * the brief post-create window where the channel is not yet describable.
 * Pass `previousVersion` after `UpdateSignalingChannel` to also wait for the
 * version bump (see {@link waitForStreamActive}).
 */
export declare const waitForChannelActive: (channelName: string, previousVersion?: string | undefined) => Effect.Effect<kv.ChannelInfo, KinesisVideoNotConverged | kv.DescribeSignalingChannelError, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Poll `DescribeStream` until the stream is fully purged (NotFound).
 * A stream in `DELETING` blocks re-creation of the same name with
 * `ResourceInUseException`, so reconcilers wait it out before recreating.
 */
export declare const waitForStreamGone: (streamName: string) => Effect.Effect<undefined, kv.ClientLimitExceededException | kv.InvalidArgumentException | KinesisVideoNotConverged | kv.NotAuthorizedException | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Poll `DescribeSignalingChannel` until the channel is fully purged
 * (NotFound) — see {@link waitForStreamGone}.
 */
export declare const waitForChannelGone: (channelName: string) => Effect.Effect<undefined, kv.AccessDeniedException | kv.ClientLimitExceededException | kv.InvalidArgumentException | KinesisVideoNotConverged | import("@distilled.cloud/aws/Errors").CommonErrors, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Drop `undefined` values from a distilled tag map (`{ [key]: string |
 * undefined }`) so it can be diffed as a plain `Record<string, string>`.
 */
export declare const compactTags: (tags: {
    [key: string]: string | undefined;
} | undefined) => Record<string, string>;
/**
 * Discover (and cache) the per-stream data endpoint for `apiName`.
 * Parameterized over the `GetDataEndpoint` operation so binding layers can
 * pass an operation captured via yield-first (`yield* op`) whose calls are
 * requirement-free.
 */
export declare const discoverDataEndpoint: <E, R>(streamArn: string, apiName: kv.APIName, getDataEndpoint: (input: kv.GetDataEndpointInput) => Effect.Effect<kv.GetDataEndpointOutput, E, R>) => Effect.Effect<string, E, R>;
/**
 * Discover (and cache) the per-channel signaling endpoint for `protocol` +
 * `role` via `GetSignalingChannelEndpoint`. Parameterized over the operation
 * for the same yield-first reason as {@link discoverDataEndpoint}.
 */
export declare const discoverSignalingEndpoint: <E, R>(channelArn: string, protocol: kv.ChannelProtocol, role: kv.ChannelRole, getSignalingChannelEndpoint: (input: kv.GetSignalingChannelEndpointInput) => Effect.Effect<kv.GetSignalingChannelEndpointOutput, E, R>) => Effect.Effect<string, E | SignalingEndpointUnavailable, R>;
export {};
//# sourceMappingURL=internal.d.ts.map