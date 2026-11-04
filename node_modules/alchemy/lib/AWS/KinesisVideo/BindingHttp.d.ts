import * as kv from "@distilled.cloud/aws/kinesis-video";
import * as Effect from "effect/Effect";
import type { SignalingChannel } from "./SignalingChannel.ts";
import type { Stream } from "./Stream.ts";
/**
 * Shared scaffolding for AWS Kinesis Video HTTP bindings.
 *
 * NOT exported from `index.ts` — every near-identical `{Op}Http.ts` in this
 * service is a thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of
 * the builders below. Kinesis Video data-plane calls are two-step: discover
 * the per-stream data endpoint (`GetDataEndpoint`) or per-channel signaling
 * endpoint (`GetSignalingChannelEndpoint`), then issue the signed data-plane
 * call against that endpoint. Everything except the operation, the endpoint
 * `APIName`/protocol, and the IAM action is boilerplate.
 */
/**
 * Build the impl Effect for a stream-scoped media/archived-media operation:
 * the runtime callable resolves the per-stream data endpoint for `apiName`
 * (cached), injects the bound {@link Stream}'s ARN as `StreamARN`, and the
 * deploy-time half grants `kinesisvideo:GetDataEndpoint` + `actions` on the
 * stream's ARN.
 */
export declare const makeStreamMediaHttpBinding: <I extends {
    StreamARN?: string;
    StreamName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.KinesisVideo.GetClip`. */
    tag: string;
    /** The `GetDataEndpoint` API name the operation is served under. */
    apiName: kv.APIName;
    /** IAM actions granted on the stream ARN (GetDataEndpoint is implied). */
    actions: readonly string[];
    /** The distilled operation; `StreamARN` is injected from the stream. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(stream: Stream) => Effect.Effect<(request?: Omit<I, "StreamARN" | "StreamName"> | undefined) => Effect.Effect<A, E | kv.GetDataEndpointError, never>, never, never>, never, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
/**
 * Build the impl Effect for a channel-scoped signaling/WebRTC-storage
 * operation: the runtime callable resolves the per-channel endpoint for
 * `protocol` + `role` (cached), injects the bound {@link SignalingChannel}'s
 * ARN under `key`, and the deploy-time half grants
 * `kinesisvideo:GetSignalingChannelEndpoint` + `actions` on the channel ARN.
 */
export declare const makeChannelSignalingHttpBinding: <K extends "ChannelARN" | "channelArn", I extends { [P in K]?: string; }, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.KinesisVideo.JoinStorageSession`. */
    tag: string;
    /** The signaling endpoint protocol the operation is served under. */
    protocol: kv.ChannelProtocol;
    /** The peer role the endpoint is resolved for. */
    role: kv.ChannelRole;
    /**
     * IAM actions granted on the channel ARN (GetSignalingChannelEndpoint is
     * implied).
     */
    actions: readonly string[];
    /** The request field the channel ARN is injected under. */
    key: K;
    /** The distilled operation; the channel ARN is injected under `key`. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<(channel: SignalingChannel) => Effect.Effect<(request?: Omit<I, K> | undefined) => Effect.Effect<A, E | import("./internal.ts").SignalingEndpointUnavailable | kv.GetSignalingChannelEndpointError, never>, never, never>, never, R | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BindingHttp.d.ts.map