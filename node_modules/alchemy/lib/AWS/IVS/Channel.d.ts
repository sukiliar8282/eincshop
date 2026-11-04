import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ChannelProps {
    /**
     * Name of the channel (letters, digits, `-` and `_`; not unique across
     * channels). If omitted, a deterministic physical name is generated.
     * Channel names are mutable — changing the name updates the channel in
     * place.
     */
    channelName?: string;
    /**
     * Channel latency mode. `LOW` enables low-latency live video (~3s);
     * `NORMAL` broadcasts at higher latency for a lower cost.
     * @default "LOW"
     */
    latencyMode?: "NORMAL" | "LOW";
    /**
     * Channel type, which determines the allowable resolution and bitrate
     * of the delivered video (e.g. `STANDARD`, `BASIC`, `ADVANCED_SD`,
     * `ADVANCED_HD`).
     * @default "STANDARD"
     */
    type?: string;
    /**
     * Whether the channel is private (viewers require a playback
     * authorization token generated with a `PlaybackKeyPair`).
     * @default false
     */
    authorized?: boolean;
    /**
     * ARN of a recording configuration to record live broadcasts to S3.
     * @default no recording
     */
    recordingConfigurationArn?: string;
    /**
     * Whether the channel allows insecure RTMP ingest.
     * @default false
     */
    insecureIngest?: boolean;
    /**
     * Optional transcode preset for `ADVANCED_SD`/`ADVANCED_HD` channel
     * types (`HIGHER_BANDWIDTH_DELIVERY` or `CONSTRAINED_BANDWIDTH_DELIVERY`).
     */
    preset?: string;
    /**
     * ARN of a playback restriction policy constraining playback by
     * country and/or origin.
     */
    playbackRestrictionPolicyArn?: string;
    /**
     * Tags to apply to the channel. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Channel extends Resource<"AWS.IVS.Channel", ChannelProps, {
    /**
     * The channel's physical name.
     */
    channelName: string;
    /**
     * ARN of the channel.
     */
    channelArn: string;
    /**
     * RTMPS ingest endpoint broadcast software sends video to
     * (authenticated with a `StreamKey`).
     */
    ingestEndpoint: string;
    /**
     * Playback URL viewers use to watch the channel's live stream.
     */
    playbackUrl: string;
    /**
     * Channel type (resolution/bitrate tier) reported by IVS.
     */
    type: string | undefined;
    /**
     * Latency mode reported by IVS (`LOW` or `NORMAL`).
     */
    latencyMode: string | undefined;
    /**
     * Whether playback requires a signed authorization token.
     */
    authorized: boolean | undefined;
}, never, Providers> {
}
/**
 * An Amazon IVS (Interactive Video Service) channel for low-latency live
 * video streaming.
 *
 * A channel stores configuration for broadcasting live streams: broadcast
 * software sends video to the channel's `ingestEndpoint` (authenticated
 * with a `StreamKey`) and viewers watch via the channel's `playbackUrl`.
 * ### Creating Channels
 * **Example:** Basic Channel
 * ```typescript
 * import * as IVS from "alchemy/AWS/IVS";
 *
 * const channel = yield* IVS.Channel("LiveChannel");
 * ```
 *
 * **Example:** Basic Low-Cost Channel
 * ```typescript
 * const channel = yield* IVS.Channel("LiveChannel", {
 *   type: "BASIC",
 *   latencyMode: "NORMAL",
 * });
 * ```
 *
 * ### Private Channels
 * **Example:** Channel with Playback Authorization
 * ```typescript
 * const channel = yield* IVS.Channel("PrivateChannel", {
 *   authorized: true,
 * });
 * ```
 *
 * ### Streaming
 * **Example:** Channel with a Stream Key
 * ```typescript
 * const channel = yield* IVS.Channel("LiveChannel");
 * const streamKey = yield* IVS.StreamKey("LiveKey", {
 *   channelArn: channel.channelArn,
 * });
 * // broadcast to rtmps://{channel.ingestEndpoint}:443/app/ with streamKey.value
 * ```
 *
 * @resource
 */
export declare const Channel: import("../../Resource.ts").ResourceClass<Channel>;
declare const IvsChannelIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsChannelIncomplete";
} & Readonly<A>;
/**
 * Raised when the IVS API returns a channel that is missing its ARN, name,
 * ingest endpoint, or playback URL.
 */
export declare class IvsChannelIncomplete extends IvsChannelIncomplete_base<{
    message: string;
}> {
}
export declare const ChannelProvider: () => import("effect/Layer").Layer<Provider.Provider<Channel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Channel.d.ts.map