import * as mediapackagev2 from "@distilled.cloud/aws/mediapackagev2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ChannelProps {
    /**
     * Name of the channel group the channel belongs to. Changing it replaces
     * the channel.
     */
    channelGroupName: string;
    /**
     * Name of the channel. Must be unique within the channel group and match
     * `^[a-zA-Z0-9_-]+$`. If omitted, a unique name is generated. Changing the
     * name replaces the channel.
     */
    channelName?: string;
    /**
     * The input type of content the channel receives: `HLS` or `CMAF`.
     * Immutable — changing it replaces the channel.
     * @default "HLS"
     */
    inputType?: mediapackagev2.InputType;
    /**
     * Optional description of the channel (up to 1024 characters).
     */
    description?: string;
    /**
     * Input-switching behavior between the channel's redundant ingest inputs
     * (e.g. switch based on the media quality confidence score).
     */
    inputSwitchConfiguration?: mediapackagev2.InputSwitchConfiguration;
    /**
     * Settings for what common media server data (CMSD) headers AWS Elemental
     * MediaPackage includes in responses to the CDN.
     */
    outputHeaderConfiguration?: mediapackagev2.OutputHeaderConfiguration;
    /**
     * IAM resource policy (JSON) attached to the channel, controlling which
     * principals may push content to it (`mediapackagev2:PutObject`).
     * Omitting it removes any existing policy.
     */
    policy?: string;
    /**
     * User-defined tags for the channel. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Channel extends Resource<"AWS.MediaPackageV2.Channel", ChannelProps, {
    /** Name of the channel group the channel belongs to. */
    channelGroupName: string;
    /** Name of the channel. */
    channelName: string;
    /** ARN of the channel. */
    channelArn: string;
    /** Ingest container type (`HLS` or `CMAF`). */
    inputType: string | undefined;
    /** Redundant ingest endpoints the encoder pushes content to. */
    ingestEndpoints: {
        /** Ingest endpoint id (e.g. `"1"`, `"2"`). */
        id: string | undefined;
        /** Ingest URL the encoder pushes to. */
        url: string | undefined;
    }[];
}, never, Providers> {
}
/**
 * An AWS Elemental MediaPackage v2 channel — the entry point for live
 * content into MediaPackage. An encoder (such as AWS Elemental MediaLive)
 * pushes an HLS or CMAF stream to the channel's ingest endpoints; origin
 * endpoints then package and serve that content downstream.
 *
 * ### Creating a Channel
 * **Example:** Basic Channel in a Group
 * ```typescript
 * import * as MediaPackageV2 from "alchemy/AWS/MediaPackageV2";
 *
 * const group = yield* MediaPackageV2.ChannelGroup("Live");
 * const channel = yield* MediaPackageV2.Channel("Feed", {
 *   channelGroupName: group.channelGroupName,
 * });
 * ```
 *
 * **Example:** CMAF Ingest Channel
 * ```typescript
 * const channel = yield* MediaPackageV2.Channel("Feed", {
 *   channelGroupName: group.channelGroupName,
 *   inputType: "CMAF",
 *   description: "CMAF contribution feed",
 * });
 * ```
 *
 * ### Resource Policy
 * **Example:** Allow a Principal to Push Content
 * ```typescript
 * const channel = yield* MediaPackageV2.Channel("Feed", {
 *   channelGroupName: group.channelGroupName,
 *   policy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { AWS: "arn:aws:iam::111122223333:root" },
 *       Action: "mediapackagev2:PutObject",
 *       Resource: "arn:aws:mediapackagev2:us-east-1:111122223333:channelGroup/live/channel/feed",
 *     }],
 *   }),
 * });
 * ```
 *
 * ### Ingest Endpoints
 * **Example:** Point the encoder at the ingest URLs
 * ```typescript
 * const channel = yield* MediaPackageV2.Channel("Feed", {
 *   channelGroupName: group.channelGroupName,
 * });
 * // Two redundant ingest endpoints for the encoder to push to.
 * const urls = channel.ingestEndpoints;
 * ```
 *
 * @resource
 */
export declare const Channel: import("../../Resource.ts").ResourceClass<Channel>;
export declare const ChannelProvider: () => import("effect/Layer").Layer<Provider.Provider<Channel>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Channel.d.ts.map