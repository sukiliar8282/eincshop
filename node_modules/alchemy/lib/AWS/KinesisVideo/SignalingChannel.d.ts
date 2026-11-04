import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SignalingChannelProps {
    /**
     * Name of the signaling channel. Changing the name replaces the channel.
     * Must be unique per account and region.
     * @default a generated physical name
     */
    channelName?: string;
    /**
     * The type of the channel. `SINGLE_MASTER` is the only fully supported
     * type. Changing the type replaces the channel.
     * @default "SINGLE_MASTER"
     */
    type?: "SINGLE_MASTER" | "FULL_MESH";
    /**
     * How long an undelivered signaling message is retained (5–120 seconds).
     * Accepts any `Duration.Input` (e.g. `"30 seconds"`, `Duration.seconds(30)`;
     * a bare number is milliseconds); the wire unit is whole seconds. Updated
     * in place.
     * @default 60 seconds
     */
    messageTtl?: Duration.Input;
    /**
     * Tags to apply to the channel. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface SignalingChannel extends Resource<"AWS.KinesisVideo.SignalingChannel", SignalingChannelProps, {
    channelName: string;
    channelArn: string;
}, {}, Providers> {
}
/**
 * An Amazon Kinesis Video Streams WebRTC signaling channel — the rendezvous
 * point that WebRTC master and viewer peers use to exchange SDP offers,
 * answers, and ICE candidates.
 *
 * `messageTtl` is updated in place; changing `channelName` or `type`
 * replaces the channel.
 * ### Creating Channels
 * **Example:** Basic Signaling Channel
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const channel = yield* AWS.KinesisVideo.SignalingChannel("Doorbell");
 * ```
 *
 * **Example:** Channel with Message TTL
 * ```typescript
 * const channel = yield* AWS.KinesisVideo.SignalingChannel("Doorbell", {
 *   messageTtl: "30 seconds",
 *   tags: { Environment: "production" },
 * });
 * ```
 *
 * ### WebRTC Connectivity
 * **Example:** ICE Server Configuration
 * ```typescript
 * // init
 * const getIceServers = yield* AWS.KinesisVideo.GetIceServerConfig(channel);
 *
 * // runtime — TURN URIs + short-lived credentials for a WebRTC peer
 * const { IceServerList } = yield* getIceServers({ ClientId: "viewer-1" });
 * ```
 *
 * @resource
 */
export declare const SignalingChannel: import("../../Resource.ts").ResourceClass<SignalingChannel>;
export declare const SignalingChannelProvider: () => import("effect/Layer").Layer<Provider.Provider<SignalingChannel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SignalingChannel.d.ts.map