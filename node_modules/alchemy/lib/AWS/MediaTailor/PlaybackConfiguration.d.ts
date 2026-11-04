import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * CDN routing configuration for ad and content segment delivery.
 */
export interface PlaybackConfigurationCdn {
    /**
     * A non-default content delivery network (CDN) prefix that MediaTailor
     * routes ad segment requests through, e.g. a CloudFront distribution in
     * front of `ads.mediatailor.<region>.amazonaws.com`.
     */
    adSegmentUrlPrefix?: string;
    /**
     * A content delivery network (CDN) prefix that content segment URLs in
     * manifests are rewritten to, so players request content through the CDN.
     */
    contentSegmentUrlPrefix?: string;
}
/**
 * DASH manifest handling configuration.
 */
export interface PlaybackConfigurationDash {
    /**
     * Where the `Location` element is placed in the DASH manifest.
     * @default "EMT_DEFAULT"
     */
    mpdLocation?: string;
    /**
     * Whether the origin server produces single-period or multi-period DASH
     * manifests. One of `SINGLE_PERIOD` or `MULTI_PERIOD`.
     * @default "MULTI_PERIOD"
     */
    originManifestType?: "SINGLE_PERIOD" | "MULTI_PERIOD";
}
/**
 * Controls how MediaTailor suppresses ad insertion near the live edge.
 */
export interface PlaybackConfigurationAvailSuppression {
    /**
     * `BEHIND_LIVE_EDGE` suppresses ads behind the configured point in the
     * stream; `AFTER_LIVE_EDGE` suppresses ads after it.
     * @default "OFF"
     */
    mode?: "OFF" | "BEHIND_LIVE_EDGE" | "AFTER_LIVE_EDGE";
    /**
     * A live-edge offset timestamp (HH:MM:SS) that defines the suppression
     * boundary.
     */
    value?: string;
    /**
     * `PARTIAL_AVAIL` fills partial ad breaks; `FULL_AVAIL_ONLY` only fills
     * complete ad breaks.
     */
    fillPolicy?: "FULL_AVAIL_ONLY" | "PARTIAL_AVAIL";
}
/**
 * Bumpers are short branded videos played before and after ad breaks.
 */
export interface PlaybackConfigurationBumper {
    /** URL of the bumper asset played before each ad break. */
    startUrl?: string;
    /** URL of the bumper asset played after each ad break. */
    endUrl?: string;
}
/**
 * Configuration for pre-roll ad insertion on live streams.
 */
export interface PlaybackConfigurationLivePreRoll {
    /** The ad decision server URL used for live pre-roll ads. */
    adDecisionServerUrl?: string;
    /**
     * Maximum allowed duration for the pre-roll ad avail, e.g. `"30 seconds"`.
     * Sent to the API in whole seconds (`MaxDurationSeconds`).
     */
    maxDuration?: Duration.Input;
}
/**
 * CloudWatch log configuration for the playback configuration
 * (`ConfigureLogsForPlaybackConfiguration`).
 */
export interface PlaybackConfigurationLogs {
    /**
     * The percentage of session logs MediaTailor sends to CloudWatch Logs
     * (0–100). Session logs land in the `MediaTailor/PlaybackConfiguration`
     * log group (legacy) or the vended-log delivery you configure.
     */
    percentEnabled: number;
    /**
     * The method MediaTailor uses to deliver the logs:
     * `LEGACY_CLOUDWATCH` (direct to CloudWatch Logs) and/or `VENDED_LOGS`
     * (CloudWatch vended log delivery to CloudWatch/S3/Firehose).
     */
    enabledLoggingStrategies?: ("LEGACY_CLOUDWATCH" | "VENDED_LOGS")[];
}
/**
 * Rules that customize how MediaTailor processes the origin manifest.
 */
export interface PlaybackConfigurationManifestProcessingRules {
    /**
     * When enabled, `EXT-X-CUE-IN`/`EXT-X-CUE-OUT` (and other ad markers) from
     * the origin manifest pass through into the personalized manifest.
     * @default false
     */
    adMarkerPassthroughEnabled?: boolean;
}
export interface PlaybackConfigurationProps {
    /**
     * The identifier for the playback configuration. Maximum 64 characters,
     * letters, digits, hyphens, and underscores.
     *
     * Changing the name replaces the configuration.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The URL for the ad decision server (ADS). This includes the
     * specification of static parameters and placeholders for dynamic
     * parameters, e.g. `https://ads.example.com/vast?ip=[client_ip]`.
     * Maximum 25,000 characters.
     */
    adDecisionServerUrl: string;
    /**
     * The URL prefix for the source of the content stream (the origin server),
     * minus the asset ID. Maximum 512 characters.
     */
    videoContentSourceUrl: string;
    /**
     * The URL for a video asset to transcode and use to fill in time that's
     * not used by ads. MediaTailor shows the slate when there is no ad to
     * fill an avail.
     */
    slateAdUrl?: string;
    /**
     * Defines the maximum duration of underfilled ad time (e.g. `"2 seconds"`)
     * allowed in an ad break. Underfilled time beyond the threshold is not
     * filled with slate. Sent to the API in whole seconds
     * (`PersonalizationThresholdSeconds`).
     */
    personalizationThreshold?: Duration.Input;
    /**
     * The name that is used to associate this playback configuration with a
     * custom transcode profile (set up with AWS Support).
     */
    transcodeProfileName?: string;
    /**
     * The setting that controls whether players can use stitched or guided ad
     * insertion. One of `STITCHED_ONLY` or `PLAYER_SELECT`.
     * @default "STITCHED_ONLY"
     */
    insertionMode?: "STITCHED_ONLY" | "PLAYER_SELECT";
    /**
     * CDN prefixes for routing ad and content segment requests.
     */
    cdnConfiguration?: PlaybackConfigurationCdn;
    /**
     * DASH manifest configuration.
     */
    dashConfiguration?: PlaybackConfigurationDash;
    /**
     * Ad suppression behavior near the live edge.
     */
    availSuppression?: PlaybackConfigurationAvailSuppression;
    /**
     * Bumper videos played before and after ad breaks.
     */
    bumper?: PlaybackConfigurationBumper;
    /**
     * Pre-roll ad insertion for live streams.
     */
    livePreRollConfiguration?: PlaybackConfigurationLivePreRoll;
    /**
     * Origin-manifest processing rules (e.g. ad marker passthrough).
     */
    manifestProcessingRules?: PlaybackConfigurationManifestProcessingRules;
    /**
     * CloudWatch session-log configuration. Omit (or set `percentEnabled: 0`)
     * to disable session logging.
     */
    logConfiguration?: PlaybackConfigurationLogs;
    /**
     * Tags to apply to the playback configuration. Merged with internal
     * Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface PlaybackConfiguration extends Resource<"AWS.MediaTailor.PlaybackConfiguration", PlaybackConfigurationProps, {
    /** The identifier for the playback configuration. */
    name: string;
    /** The ARN of the playback configuration. */
    playbackConfigurationArn: string;
    /** The URL that the player accesses to get a manifest from MediaTailor. */
    playbackEndpointPrefix: string;
    /** The URL that the player uses to initialize a session that uses client-side reporting. */
    sessionInitializationEndpointPrefix: string;
    /** The HLS manifest endpoint prefix, if HLS is configured. */
    hlsManifestEndpointPrefix: string | undefined;
    /** The DASH manifest endpoint prefix, if DASH is configured. */
    dashManifestEndpointPrefix: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Elemental MediaTailor playback configuration for server-side ad
 * insertion (SSAI) into HLS and DASH video streams.
 *
 * ### Creating Playback Configurations
 * **Example:** Basic ad-inserted stream
 * ```typescript
 * import * as MediaTailor from "alchemy/AWS/MediaTailor";
 *
 * const config = yield* MediaTailor.PlaybackConfiguration("Ads", {
 *   adDecisionServerUrl: "https://ads.example.com/vast?ip=[client_ip]",
 *   videoContentSourceUrl: "https://origin.example.com/live",
 * });
 * ```
 *
 * **Example:** Slate fill and personalization threshold
 * ```typescript
 * const config = yield* MediaTailor.PlaybackConfiguration("Ads", {
 *   adDecisionServerUrl: "https://ads.example.com/vast",
 *   videoContentSourceUrl: "https://origin.example.com/vod",
 *   slateAdUrl: "https://origin.example.com/slate.mp4",
 *   personalizationThreshold: "2 seconds",
 * });
 * ```
 *
 * ### Manifest Behavior
 * **Example:** Ad marker passthrough and avail suppression
 * ```typescript
 * const config = yield* MediaTailor.PlaybackConfiguration("Live", {
 *   adDecisionServerUrl: "https://ads.example.com/vast",
 *   videoContentSourceUrl: "https://origin.example.com/live",
 *   manifestProcessingRules: { adMarkerPassthroughEnabled: true },
 *   availSuppression: { mode: "BEHIND_LIVE_EDGE", value: "00:00:30" },
 * });
 * ```
 *
 * ### Session Logging
 * **Example:** Send 10% of session logs to CloudWatch
 * ```typescript
 * const config = yield* MediaTailor.PlaybackConfiguration("Logged", {
 *   adDecisionServerUrl: "https://ads.example.com/vast",
 *   videoContentSourceUrl: "https://origin.example.com/live",
 *   logConfiguration: { percentEnabled: 10 },
 * });
 * ```
 *
 * @resource
 */
export declare const PlaybackConfiguration: import("../../Resource.ts").ResourceClass<PlaybackConfiguration>;
declare const MediaTailorIncompletePlaybackConfiguration_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MediaTailorIncompletePlaybackConfiguration";
} & Readonly<A>;
/**
 * Raised when MediaTailor returns a playback configuration without the
 * attributes the provider needs (ARN and playback endpoints). This indicates
 * an unexpected API response rather than a user error.
 */
export declare class MediaTailorIncompletePlaybackConfiguration extends MediaTailorIncompletePlaybackConfiguration_base<{
    message: string;
}> {
}
export declare const PlaybackConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<PlaybackConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=PlaybackConfiguration.d.ts.map