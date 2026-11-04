import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PresetProps {
    /**
     * Name of the preset. Must be unique within the account/region and match
     * `^[\w-]+$`. If omitted, a unique name is generated. Changing the name
     * replaces the preset.
     */
    presetName?: string;
    /**
     * Optional description of the preset.
     */
    description?: string;
    /**
     * Optional category used to group presets in the MediaConvert console.
     */
    category?: string;
    /**
     * The transcode output settings this preset applies — audio descriptions,
     * caption descriptions, container settings, and the video description
     * (codec, resolution, bitrate, …). Required.
     */
    settings: mediaconvert.PresetSettings;
    /**
     * User-defined tags for the preset.
     */
    tags?: Record<string, string>;
}
export interface Preset extends Resource<"AWS.MediaConvert.Preset", PresetProps, {
    presetName: string;
    presetArn: string;
    type: string | undefined;
    category: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Elemental MediaConvert output preset — a reusable, named bundle of
 * output settings (container, video codec/resolution/bitrate, audio, and
 * captions) that job templates and jobs reference to produce one output.
 *
 * ### Creating a Preset
 * **Example:** MP4 / H.264 Preset
 * ```typescript
 * const preset = yield* MediaConvert.Preset("Mp4", {
 *   description: "1080p H.264 MP4",
 *   settings: {
 *     ContainerSettings: { Container: "MP4" },
 *     VideoDescription: {
 *       Width: 1920,
 *       Height: 1080,
 *       CodecSettings: {
 *         Codec: "H_264",
 *         H264Settings: { RateControlMode: "QVBR", MaxBitrate: 5000000 },
 *       },
 *     },
 *     AudioDescriptions: [
 *       {
 *         CodecSettings: {
 *           Codec: "AAC",
 *           AacSettings: {
 *             Bitrate: 96000,
 *             CodingMode: "CODING_MODE_2_0",
 *             SampleRate: 48000,
 *           },
 *         },
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Preset: import("../../Resource.ts").ResourceClass<Preset>;
export declare const PresetProvider: () => import("effect/Layer").Layer<Provider.Provider<Preset>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Preset.d.ts.map