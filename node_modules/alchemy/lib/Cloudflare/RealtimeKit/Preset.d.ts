import * as realtimeKit from "@distilled.cloud/cloudflare/realtime-kit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.RealtimeKit.Preset";
type TypeId = typeof TypeId;
/**
 * Media quality tier for video / screenshare streams.
 */
export type MediaQuality = "hd" | "vga" | "qvga";
/**
 * Meeting layout the preset applies to.
 */
export type ViewType = "GROUP_CALL" | "WEBINAR" | "AUDIO_ROOM";
/**
 * Whether a participant may produce a media kind.
 */
export type CanProduce = "ALLOWED" | "NOT_ALLOWED" | "CAN_REQUEST";
/**
 * What a participant joining with this preset records as.
 */
export type RecorderType = "RECORDER" | "LIVESTREAMER" | "NONE";
/**
 * Waiting-room behavior for participants joining with this preset.
 */
export type WaitingRoomType = "SKIP" | "ON_PRIVILEGED_USER_ENTRY" | "SKIP_ON_ACCEPT";
/**
 * Media configuration of a preset (stream counts, quality, frame rates).
 */
export type PresetConfig = {
    /**
     * Maximum number of simultaneous screenshares.
     */
    maxScreenshareCount: number;
    /**
     * Maximum simultaneous video streams per device class.
     */
    maxVideoStreams: {
        desktop: number;
        mobile: number;
    };
    /**
     * Quality / frame-rate settings for each media kind.
     */
    media: {
        screenshare: {
            frameRate: number;
            quality: MediaQuality;
        };
        video: {
            frameRate: number;
            quality: MediaQuality;
        };
        audio?: {
            enableHighBitrate?: boolean;
            enableStereo?: boolean;
        };
    };
    /**
     * Meeting layout this preset applies to.
     */
    viewType: ViewType;
};
/**
 * UI design tokens of a preset (colors, logo, spacing).
 */
/** Corner rounding of UI elements. */
export type BorderRadius = "sharp" | "rounded" | "extra-rounded" | "circular";
/** Border width of UI elements. */
export type BorderWidth = "none" | "thin" | "fat";
/** Base color theme of the meeting UI. */
export type Theme = "darkest" | "dark" | "light";
export type PresetUi = {
    designTokens: {
        borderRadius: BorderRadius;
        borderWidth: BorderWidth;
        colors: {
            background: {
                "600": string;
                "700": string;
                "800": string;
                "900": string;
                "1000": string;
            };
            brand: {
                "300": string;
                "400": string;
                "500": string;
                "600": string;
                "700": string;
            };
            danger: string;
            success: string;
            text: string;
            textOnBrand: string;
            videoBg: string;
            warning: string;
        };
        logo: string;
        spacingBase: number;
        theme: Theme;
    };
    /**
     * Raw UI-kit config diff applied on top of the design tokens. Required by
     * the live API (defaulted to `{}` when omitted).
     * @default {}
     */
    configDiff?: unknown;
};
/**
 * Participant permissions granted by a preset.
 */
export type PresetPermissions = {
    acceptWaitingRequests: boolean;
    canAcceptProductionRequests: boolean;
    canChangeParticipantPermissions: boolean;
    canEditDisplayName: boolean;
    canLivestream: boolean;
    canRecord: boolean;
    canSpotlight: boolean;
    chat: {
        private: {
            canReceive: boolean;
            canSend: boolean;
            files: boolean;
            text: boolean;
        };
        public: {
            canSend: boolean;
            files: boolean;
            text: boolean;
        };
    };
    connectedMeetings: {
        canAlterConnectedMeetings: boolean;
        canSwitchConnectedMeetings: boolean;
        canSwitchToParentMeeting: boolean;
    };
    disableParticipantAudio: boolean;
    disableParticipantScreensharing: boolean;
    disableParticipantVideo: boolean;
    hiddenParticipant: boolean;
    kickParticipant: boolean;
    media: {
        audio: {
            canProduce: CanProduce;
        };
        screenshare: {
            canProduce: CanProduce;
        };
        video: {
            canProduce: CanProduce;
        };
    };
    pinParticipant: boolean;
    plugins: {
        canClose: boolean;
        canEditConfig: boolean;
        canStart: boolean;
        /**
         * Per-plugin access config keyed by plugin UUID.
         * @default {}
         */
        config?: unknown;
    };
    polls: {
        canCreate: boolean;
        canView: boolean;
        canVote: boolean;
    };
    recorderType: RecorderType;
    showParticipantList: boolean;
    waitingRoomType: WaitingRoomType;
    isRecorder?: boolean;
};
export type PresetProps = {
    /**
     * The RealtimeKit app the preset belongs to. Changing the app triggers a
     * replacement.
     */
    appId: string;
    /**
     * Human readable preset name (e.g. `host`, `guest`). If omitted, a unique
     * name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Media configuration (stream counts, quality, frame rates).
     * @default a group-call config (hd video at 30fps, hd screenshare at 5fps, 9 desktop / 4 mobile streams)
     */
    config?: PresetConfig;
    /**
     * UI design tokens.
     * @default RealtimeKit's dark theme defaults
     */
    ui?: PresetUi;
    /**
     * Participant permissions. The API requires the full object on create, so
     * unspecified permissions fall back to conservative attendee defaults
     * (chat and polls allowed, no recording / livestreaming / moderation).
     * @default conservative attendee defaults
     */
    permissions?: PresetPermissions;
};
export type PresetAttributes = {
    /**
     * Server-generated preset identifier. Stable across updates.
     */
    presetId: string;
    /**
     * The Cloudflare account the preset belongs to.
     */
    accountId: string;
    /**
     * The RealtimeKit app the preset belongs to.
     */
    appId: string;
    /**
     * Human readable preset name.
     */
    name: string;
    /**
     * Media configuration as stored by Cloudflare.
     */
    config: PresetConfig;
    /**
     * UI design tokens as stored by Cloudflare.
     */
    ui: PresetUi;
    /**
     * Participant permissions as stored by Cloudflare.
     */
    permissions: PresetPermissions | undefined;
};
export type Preset = Resource<TypeId, PresetProps, PresetAttributes, never, Providers>;
/**
 * A Cloudflare RealtimeKit preset — a named participant role (e.g. `host`,
 * `guest`) bundling permissions, media quality, and UI design tokens for a
 * RealtimeKit app.
 *
 * Name, config, UI, and permissions are all mutable in place; only moving
 * the preset to a different app forces a replacement. The create API
 * requires the full config / UI / permissions objects, so the resource fills
 * unspecified sections with sensible defaults.
 * ### Creating a Preset
 * **Example:** Default group-call preset
 * ```typescript
 * const app = yield* Cloudflare.RealtimeKit.App("Meetings", {});
 *
 * const guest = yield* Cloudflare.RealtimeKit.Preset("Guest", {
 *   appId: app.appId,
 *   name: "guest",
 * });
 * ```
 *
 * **Example:** Host preset with moderation permissions
 * ```typescript
 * const host = yield* Cloudflare.RealtimeKit.Preset("Host", {
 *   appId: app.appId,
 *   name: "host",
 *   permissions: {
 *     ...Cloudflare.RealtimeKit.defaultRealtimeKitPresetPermissions(),
 *     canRecord: true,
 *     kickParticipant: true,
 *     pinParticipant: true,
 *     acceptWaitingRequests: true,
 *   },
 * });
 * ```
 *
 * ### Updating a Preset
 * **Example:** Switch to a webinar layout
 * ```typescript
 * const preset = yield* Cloudflare.RealtimeKit.Preset("Guest", {
 *   appId: app.appId,
 *   name: "guest",
 *   config: {
 *     ...Cloudflare.RealtimeKit.defaultRealtimeKitPresetConfig(),
 *     viewType: "WEBINAR",
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/realtime/realtimekit/
 *
 * @resource
 * @product Realtime Kit
 * @category Media
 */
export declare const Preset: import("../../Resource.ts").ResourceClass<Preset>;
/**
 * Returns true if the given value is a Preset resource.
 */
export declare const isPreset: (value: unknown) => value is Preset;
/**
 * The default media configuration used when `config` is omitted: a group
 * call with hd video at 30fps, hd screenshare at 5fps, and 9 desktop /
 * 4 mobile video streams.
 */
export declare const defaultRealtimeKitPresetConfig: () => PresetConfig;
/**
 * The default UI design tokens used when `ui` is omitted: RealtimeKit's
 * dark theme.
 */
export declare const defaultRealtimeKitPresetUi: () => PresetUi;
/**
 * The default permissions used when `permissions` is omitted: a conservative
 * attendee role — chat, polls, and media production allowed; recording,
 * livestreaming, and moderation denied.
 */
export declare const defaultRealtimeKitPresetPermissions: () => PresetPermissions;
export declare const PresetProvider: () => import("effect/Layer").Layer<Provider.Provider<Preset>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | realtimeKit.CloudflareOpContext>;
export {};
//# sourceMappingURL=Preset.d.ts.map