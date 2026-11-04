import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface StreamProps {
    /**
     * Name of the video stream. Changing the name replaces the stream.
     * Must be unique per account and region.
     * @default a generated physical name
     */
    streamName?: string;
    /**
     * Name of the device that writes to the stream. Kinesis Video Streams
     * does not currently use this name, but it is stored with the stream
     * metadata and can be updated in place.
     */
    deviceName?: string;
    /**
     * Media type of the stream as a MIME type (e.g. `video/h264`). Consumers
     * can use it to determine how to process the stream. Updated in place.
     */
    mediaType?: string;
    /**
     * The ID (or alias/ARN) of the KMS key used to encrypt stream data.
     * Changing the key replaces the stream.
     * @default the AWS-managed `aws/kinesisvideo` key
     */
    kmsKeyId?: string;
    /**
     * How long stream data is retained. Zero duration means no retention —
     * data is only available live. Accepts any `Duration.Input` (e.g.
     * `"24 hours"`, `Duration.hours(24)`; a bare number is milliseconds); the
     * wire unit is whole hours. Adjusted in place via `UpdateDataRetention`.
     * @default 0
     */
    dataRetention?: Duration.Input;
    /**
     * Tags to apply to the stream. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Stream extends Resource<"AWS.KinesisVideo.Stream", StreamProps, {
    streamName: string;
    streamArn: string;
}, {}, Providers> {
}
/**
 * An Amazon Kinesis Video Stream for ingesting, storing, and consuming
 * live video.
 *
 * Stream creation is asynchronous — the provider waits (bounded) for the
 * stream to become `ACTIVE` before returning. `deviceName` and `mediaType`
 * are updated in place; `dataRetention` converges via `UpdateDataRetention`;
 * changing `streamName` or `kmsKeyId` replaces the stream.
 * ### Creating Streams
 * **Example:** Basic Video Stream
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const stream = yield* AWS.KinesisVideo.Stream("Camera");
 * ```
 *
 * **Example:** Stream with Retention and Media Type
 * ```typescript
 * const stream = yield* AWS.KinesisVideo.Stream("Camera", {
 *   mediaType: "video/h264",
 *   dataRetention: "24 hours",
 *   tags: { Environment: "production" },
 * });
 * ```
 *
 * ### Reading Media
 * Bind data-plane read operations in the init phase and use them in
 * runtime handlers. The bindings resolve the per-stream data endpoint
 * (`GetDataEndpoint`) automatically.
 *
 * **Example:** HLS Playback URL
 * ```typescript
 * // init
 * const getHls = yield* AWS.KinesisVideo.GetHLSStreamingSessionURL(stream);
 *
 * // runtime
 * const { HLSStreamingSessionURL } = yield* getHls({ PlaybackMode: "LIVE" });
 * ```
 *
 * **Example:** Raw Media
 * ```typescript
 * // init
 * const getMedia = yield* AWS.KinesisVideo.GetMedia(stream);
 *
 * // runtime
 * const media = yield* getMedia({
 *   StartSelector: { StartSelectorType: "EARLIEST" },
 * });
 * ```
 *
 * @resource
 */
export declare const Stream: import("../../Resource.ts").ResourceClass<Stream>;
export declare const StreamProvider: () => import("effect/Layer").Layer<Provider.Provider<Stream>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Stream.d.ts.map