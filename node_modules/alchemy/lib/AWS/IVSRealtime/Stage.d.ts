import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface StageAutoParticipantRecordingConfiguration {
    /**
     * ARN of the IVS Real-Time storage configuration recordings are
     * written to.
     */
    storageConfigurationArn: string;
    /**
     * Types of media to record (`AUDIO_VIDEO`, `AUDIO_ONLY`, or `NONE`).
     * @default ["AUDIO_VIDEO"]
     */
    mediaTypes?: string[];
    /**
     * Reconnect window within which a rejoining participant is recorded into
     * the same file set, e.g. `"2 minutes"` or `Duration.seconds(30)` (`0`
     * disables). The API stores whole seconds.
     * @default 0
     */
    recordingReconnectWindow?: Duration.Input;
    /**
     * Whether participant replicas are also recorded.
     * @default true
     */
    recordParticipantReplicas?: boolean;
}
export interface StageProps {
    /**
     * Name of the stage (letters, digits, `-` and `_`; not unique). If
     * omitted, a deterministic physical name is generated. Stage names are
     * mutable — changing the name updates the stage in place.
     */
    stageName?: string;
    /**
     * Configuration for automatic recording of individual stage
     * participants to an S3 storage configuration.
     * @default no automatic recording
     */
    autoParticipantRecordingConfiguration?: StageAutoParticipantRecordingConfiguration;
    /**
     * Tags to apply to the stage. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Stage extends Resource<"AWS.IVSRealtime.Stage", StageProps, {
    /**
     * The stage's physical name.
     */
    stageName: string;
    /**
     * ARN of the stage.
     */
    stageArn: string;
    /**
     * WHIP ingest endpoint for WebRTC publishers.
     */
    whipEndpoint: string | undefined;
    /**
     * Endpoint delivering stage events.
     */
    eventsEndpoint: string | undefined;
    /**
     * RTMP ingest endpoint for broadcast software.
     */
    rtmpEndpoint: string | undefined;
    /**
     * RTMPS (TLS) ingest endpoint for broadcast software.
     */
    rtmpsEndpoint: string | undefined;
}, never, Providers> {
}
/**
 * An Amazon IVS Real-Time stage — a virtual space where participants
 * exchange audio and video in real time (sub-300ms latency).
 *
 * Participants join a stage with participant tokens minted at runtime via
 * `CreateParticipantToken`; publishers can also ingest via the stage's
 * WHIP/RTMP endpoints.
 * ### Creating Stages
 * **Example:** Basic Stage
 * ```typescript
 * import * as IVSRealtime from "alchemy/AWS/IVSRealtime";
 *
 * const stage = yield* IVSRealtime.Stage("VideoRoom");
 * ```
 *
 * **Example:** Named Stage with Tags
 * ```typescript
 * const stage = yield* IVSRealtime.Stage("VideoRoom", {
 *   stageName: "my-video-room",
 *   tags: { team: "media" },
 * });
 * ```
 *
 * @resource
 */
export declare const Stage: import("../../Resource.ts").ResourceClass<Stage>;
declare const IvsRealtimeStageIncomplete_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "IvsRealtimeStageIncomplete";
} & Readonly<A>;
/**
 * Raised when the IVS Real-Time API returns a stage missing its ARN or
 * name.
 */
export declare class IvsRealtimeStageIncomplete extends IvsRealtimeStageIncomplete_base<{
    message: string;
}> {
}
export declare const StageProvider: () => import("effect/Layer").Layer<Provider.Provider<Stage>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Stage.d.ts.map