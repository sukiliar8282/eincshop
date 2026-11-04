import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface RecordingDestinationConfiguration {
    /**
     * S3 destination for recordings.
     */
    s3?: {
        /**
         * Name of the S3 bucket recordings are written to. Must be in the
         * same region and account as the recording configuration.
         */
        bucketName: string;
    };
}
export interface RecordingThumbnailConfiguration {
    /**
     * Thumbnail recording mode (`DISABLED` or `INTERVAL`).
     * @default "INTERVAL"
     */
    recordingMode?: "DISABLED" | "INTERVAL";
    /**
     * The targeted interval between thumbnails when `recordingMode` is
     * `INTERVAL`. Accepts any `Duration.Input` (e.g. `"60 seconds"`,
     * `Duration.minutes(2)`); converted to whole seconds on the wire.
     * Minimum 1 second, maximum 60 seconds when `storage` includes
     * `LATEST`.
     * @default 60 seconds
     */
    targetInterval?: Duration.Input;
    /**
     * Desired resolution of recorded thumbnails (`SD`, `HD`, `FULL_HD`, or
     * `LOWEST_RESOLUTION`).
     * @default the source resolution
     */
    resolution?: "SD" | "HD" | "FULL_HD" | "LOWEST_RESOLUTION";
    /**
     * Where thumbnails are stored: `SEQUENTIAL` archives all thumbnails,
     * `LATEST` keeps only the most recent (overwritten in place).
     * @default ["SEQUENTIAL"]
     */
    storage?: ("SEQUENTIAL" | "LATEST")[];
}
export interface RecordingRenditionConfiguration {
    /**
     * Which renditions are recorded (`ALL`, `NONE`, or `CUSTOM`).
     * @default "ALL"
     */
    renditionSelection?: "ALL" | "NONE" | "CUSTOM";
    /**
     * The renditions recorded when `renditionSelection` is `CUSTOM` (`SD`,
     * `HD`, `FULL_HD`, `LOWEST_RESOLUTION`).
     */
    renditions?: ("SD" | "HD" | "FULL_HD" | "LOWEST_RESOLUTION")[];
}
export interface RecordingConfigurationProps {
    /**
     * Where recordings are written (an S3 bucket in the same region and
     * account). Changing the destination replaces the recording
     * configuration.
     */
    destinationConfiguration: RecordingDestinationConfiguration;
    /**
     * Name of the recording configuration. If omitted, a deterministic
     * physical name is generated. There is no update operation, so
     * changing the name replaces the recording configuration.
     */
    recordingConfigurationName?: string;
    /**
     * If a broadcast disconnects and reconnects within this window, the
     * multiple streams are considered a single broadcast and merged into a
     * single recording. Accepts any `Duration.Input` (e.g. `"2 minutes"`,
     * `Duration.seconds(30)`); converted to whole seconds on the wire.
     * Maximum 5 minutes. Changing the window replaces the recording
     * configuration.
     * @default 0 seconds (no merge)
     */
    recordingReconnectWindow?: Duration.Input;
    /**
     * Thumbnail generation settings for the recording. Changing them
     * replaces the recording configuration.
     */
    thumbnailConfiguration?: RecordingThumbnailConfiguration;
    /**
     * Which renditions of the live stream are recorded. Changing them
     * replaces the recording configuration.
     */
    renditionConfiguration?: RecordingRenditionConfiguration;
    /**
     * Tags to apply to the recording configuration. Merged with internal
     * Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface RecordingConfiguration extends Resource<"AWS.IVS.RecordingConfiguration", RecordingConfigurationProps, {
    /**
     * ARN of the recording configuration.
     */
    recordingConfigurationArn: string;
    /**
     * The recording configuration's physical name.
     */
    recordingConfigurationName: string | undefined;
    /**
     * Name of the S3 bucket recordings are written to.
     */
    bucketName: string | undefined;
    /**
     * State of the recording configuration (`CREATING`, `ACTIVE`, or
     * `CREATE_FAILED`).
     */
    state: string;
}, never, Providers> {
}
/**
 * An Amazon IVS recording configuration, enabling automatic recording of
 * live broadcasts to Amazon S3.
 *
 * Attach the configuration to a channel via the channel's
 * `recordingConfigurationArn` prop; every broadcast on that channel is
 * then archived to the configured bucket. Recording configurations are
 * immutable — any settings change replaces the resource.
 * ### Recording Broadcasts
 * **Example:** Record a Channel to S3
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 * import * as IVS from "alchemy/AWS/IVS";
 *
 * const archive = yield* AWS.Bucket("StreamArchive");
 * const recording = yield* IVS.RecordingConfiguration("Recording", {
 *   destinationConfiguration: { s3: { bucketName: archive.bucketName } },
 * });
 * const channel = yield* IVS.Channel("LiveChannel", {
 *   recordingConfigurationArn: recording.recordingConfigurationArn,
 * });
 * ```
 *
 * **Example:** Merge Reconnects and Record Thumbnails
 * ```typescript
 * const recording = yield* IVS.RecordingConfiguration("Recording", {
 *   destinationConfiguration: { s3: { bucketName: archive.bucketName } },
 *   recordingReconnectWindow: "2 minutes",
 *   thumbnailConfiguration: {
 *     recordingMode: "INTERVAL",
 *     targetInterval: "30 seconds",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const RecordingConfiguration: import("../../Resource.ts").ResourceClass<RecordingConfiguration>;
declare const IvsRecordingConfigurationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsRecordingConfigurationFailed";
} & Readonly<A>;
/**
 * Raised when the IVS API returns a recording configuration in an
 * unusable shape or state (missing from a create response, or stuck in
 * `CREATE_FAILED`).
 */
export declare class IvsRecordingConfigurationFailed extends IvsRecordingConfigurationFailed_base<{
    message: string;
}> {
}
export declare const RecordingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<RecordingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=RecordingConfiguration.d.ts.map