import * as stream from "@distilled.cloud/cloudflare/stream";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Stream.LiveInputOutput";
type TypeId = typeof TypeId;
export type LiveInputOutputProps = {
    /**
     * The unique identifier (`uid`) of the live input the output restreams
     * from. Usually a reference to a `LiveInput`'s `liveInputId`
     * attribute.
     *
     * Immutable — an output belongs to exactly one live input, so changing
     * it triggers a replacement.
     */
    liveInputId: string;
    /**
     * The URL the output restreams to, e.g.
     * `rtmps://a.rtmps.youtube.com/live2`.
     *
     * Immutable — Cloudflare's update endpoint only toggles `enabled`, so
     * changing the URL triggers a replacement.
     */
    url: string;
    /**
     * The streamKey used to authenticate against the output's target.
     *
     * Immutable — Cloudflare's update endpoint only toggles `enabled`, so
     * changing the streamKey triggers a replacement.
     */
    streamKey: string;
    /**
     * When enabled, live video streamed to the associated live input is
     * sent to the output URL. When disabled, live video is not sent to the
     * output URL, even while streaming to the associated live input.
     * Mutable.
     * @default true
     */
    enabled?: boolean;
};
export type LiveInputOutputAttributes = {
    /**
     * The unique identifier for the output (Cloudflare `uid`).
     */
    outputId: string;
    /**
     * The unique identifier of the live input the output belongs to.
     */
    liveInputId: string;
    /**
     * The Cloudflare account the output belongs to.
     */
    accountId: string;
    /**
     * The URL the output restreams to.
     */
    url: string;
    /**
     * The streamKey used to authenticate against the output's target.
     */
    streamKey: string;
    /**
     * Whether live video is sent to the output URL while streaming to the
     * associated live input.
     */
    enabled: boolean;
};
export type LiveInputOutput = Resource<TypeId, LiveInputOutputProps, LiveInputOutputAttributes, never, Providers>;
/**
 * A Cloudflare Stream live input output — restreams (simulcasts) live
 * video received by a `LiveInput` to another RTMP(S) destination
 * such as YouTube Live or Twitch.
 *
 * The destination (`url` + `streamKey`) is immutable: Cloudflare's update
 * endpoint only toggles `enabled`, so changing the destination replaces
 * the output. Toggling `enabled` updates the output in place.
 *
 * Requires the Stream subscription to be enabled on the account.
 * ### Creating an output
 * **Example:** Restream a live input to YouTube
 * ```typescript
 * const input = yield* Cloudflare.Stream.LiveInput("Broadcast", {});
 *
 * const youtube = yield* Cloudflare.Stream.LiveInputOutput("YouTube", {
 *   liveInputId: input.liveInputId,
 *   url: "rtmps://a.rtmps.youtube.com/live2",
 *   streamKey: youtubeStreamKey,
 * });
 * ```
 *
 * ### Managing an output
 * **Example:** Pause restreaming without deleting the output
 * ```typescript
 * const youtube = yield* Cloudflare.Stream.LiveInputOutput("YouTube", {
 *   liveInputId: input.liveInputId,
 *   url: "rtmps://a.rtmps.youtube.com/live2",
 *   streamKey: youtubeStreamKey,
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/stream/stream-live/simulcasting/
 *
 * @resource
 * @product Stream
 * @category Media
 */
export declare const LiveInputOutput: import("../../Resource.ts").ResourceClass<LiveInputOutput>;
/**
 * Returns true if the given value is a LiveInputOutput resource.
 */
export declare const isLiveInputOutput: (value: unknown) => value is LiveInputOutput;
export declare const LiveInputOutputProvider: () => import("effect/Layer").Layer<Provider.Provider<LiveInputOutput>, never, CloudflareEnvironment | stream.CloudflareOpContext>;
export {};
//# sourceMappingURL=LiveInputOutput.d.ts.map