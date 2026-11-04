import * as medialive from "@distilled.cloud/aws/medialive";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const MediaLiveChannelFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "MediaLiveChannelFailed";
} & Readonly<A>;
/**
 * Raised when a MediaLive channel lands in `CREATE_FAILED` or `UPDATE_FAILED`
 * instead of settling into `IDLE`.
 */
export declare class MediaLiveChannelFailed extends MediaLiveChannelFailed_base<{
    message: string;
}> {
}
export interface ChannelProps {
    /**
     * Name of the channel. If omitted, a unique name is generated from the
     * app, stage, and logical ID. Names are mutable — changing the name
     * updates the channel in place.
     */
    name?: string;
    /**
     * The class of the channel. `STANDARD` runs two redundant encoder
     * pipelines; `SINGLE_PIPELINE` runs one. Changing the class replaces the
     * channel.
     * @default "STANDARD"
     */
    channelClass?: medialive.ChannelClass;
    /**
     * ARN of the IAM role MediaLive assumes to read inputs and write outputs
     * (trusts `medialive.amazonaws.com`).
     */
    roleArn?: string;
    /**
     * The inputs attached to this channel.
     */
    inputAttachments?: medialive.InputAttachment[];
    /**
     * The encoder settings — audio/video descriptions, output groups, and
     * timecode configuration.
     */
    encoderSettings?: medialive.EncoderSettings;
    /**
     * Destinations referenced by the output groups in `encoderSettings`.
     */
    destinations?: medialive.OutputDestination[];
    /**
     * Specification of the input codec/resolution/bitrate tier (drives
     * per-hour pricing).
     */
    inputSpecification?: medialive.InputSpecification;
    /**
     * Specification of CDI inputs for this channel.
     */
    cdiInputSpecification?: medialive.CdiInputSpecification;
    /**
     * The CloudWatch log level for the channel.
     * @default "DISABLED"
     */
    logLevel?: medialive.LogLevel;
    /**
     * Maintenance window settings (day + start hour).
     */
    maintenance?: medialive.MaintenanceCreateSettings;
    /**
     * VPC output settings. Changing the VPC settings replaces the channel.
     */
    vpc?: medialive.VpcOutputSettings;
    /**
     * User-defined tags for the channel.
     */
    tags?: Record<string, string>;
}
export interface Channel extends Resource<"AWS.MediaLive.Channel", ChannelProps, {
    /** Server-assigned unique id of the channel. */
    channelId: string;
    /** ARN of the channel. */
    channelArn: string;
    /** Name of the channel. */
    channelName: string | undefined;
    /** Current lifecycle state (e.g. `IDLE`, `RUNNING`). */
    state: medialive.ChannelState | undefined;
    /** Pipeline class (`STANDARD` or `SINGLE_PIPELINE`). */
    channelClass: medialive.ChannelClass | undefined;
    /** Egress endpoints the channel writes output through. */
    egressEndpoints: medialive.ChannelEgressEndpoint[];
}, never, Providers> {
}
/**
 * An AWS Elemental MediaLive channel — the live encoder that reads from
 * attached inputs, transcodes per its encoder settings, and writes to output
 * destinations (HLS, RTMP, MediaPackage, ...).
 *
 * Channels bill per running hour; Alchemy provisions channels in the `IDLE`
 * state and never starts them — start/stop is a runtime operation.
 *
 * ### Creating a Channel
 * **Example:** Single-pipeline HLS channel
 * ```typescript
 * const channel = yield* MediaLive.Channel("Live", {
 *   channelClass: "SINGLE_PIPELINE",
 *   roleArn: role.roleArn,
 *   inputAttachments: [
 *     { InputId: input.inputId, InputAttachmentName: "primary" },
 *   ],
 *   inputSpecification: {
 *     Codec: "AVC",
 *     Resolution: "SD",
 *     MaximumBitrate: "MAX_10_MBPS",
 *   },
 *   destinations,
 *   encoderSettings,
 * });
 * ```
 *
 * **Example:** IAM role for MediaLive
 * ```typescript
 * const role = yield* IAM.Role("MediaLiveRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [
 *       {
 *         Effect: "Allow",
 *         Principal: { Service: "medialive.amazonaws.com" },
 *         Action: ["sts:AssumeRole"],
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Channel: import("../../Resource.ts").ResourceClass<Channel>;
export declare const ChannelProvider: () => import("effect/Layer").Layer<Provider.Provider<Channel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Channel.d.ts.map