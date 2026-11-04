import * as mediapackagev2 from "@distilled.cloud/aws/mediapackagev2";
import * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface OriginEndpointProps {
    /**
     * Name of the channel group the endpoint belongs to. Changing it replaces
     * the endpoint.
     */
    channelGroupName: string;
    /**
     * Name of the channel the endpoint packages content from. Changing it
     * replaces the endpoint.
     */
    channelName: string;
    /**
     * Name of the origin endpoint. Must be unique within the channel and match
     * `^[a-zA-Z0-9_-]+$`. If omitted, a unique name is generated. Changing the
     * name replaces the endpoint.
     */
    originEndpointName?: string;
    /**
     * The container format packaged for the endpoint's manifests: `TS`,
     * `CMAF`, or `ISM`. Immutable — changing it replaces the endpoint.
     */
    containerType: mediapackagev2.ContainerType;
    /**
     * Segment settings: duration, name, SCTE-35 ad-marker filtering, and DRM
     * encryption (SPEKE key provider).
     */
    segment?: mediapackagev2.Segment;
    /**
     * Optional description of the origin endpoint (up to 1024 characters).
     */
    description?: string;
    /**
     * The size of the window (1 minute - 14 days, e.g. `"1 hour"` or
     * `Duration.hours(1)`) from which viewers can start over or catch up on
     * previously streamed content. Sent to the API in whole seconds.
     */
    startoverWindow?: Duration.Input;
    /**
     * HLS manifest configurations served by the endpoint.
     */
    hlsManifests?: mediapackagev2.CreateHlsManifestConfiguration[];
    /**
     * Low-latency HLS manifest configurations served by the endpoint.
     */
    lowLatencyHlsManifests?: mediapackagev2.CreateLowLatencyHlsManifestConfiguration[];
    /**
     * DASH manifest configurations served by the endpoint.
     */
    dashManifests?: mediapackagev2.CreateDashManifestConfiguration[];
    /**
     * Microsoft Smooth Streaming (MSS) manifest configurations served by the
     * endpoint. Requires the `ISM` container type.
     */
    mssManifests?: mediapackagev2.CreateMssManifestConfiguration[];
    /**
     * Conditions (stale manifest, missing DRM key, ...) under which the
     * endpoint deliberately serves errors, for testing player behavior.
     */
    forceEndpointErrorConfiguration?: mediapackagev2.ForceEndpointErrorConfiguration;
    /**
     * The separator (`UNDERSCORE` or `HYPHEN`) inserted into manifest and
     * segment URIs.
     */
    uriSeparator?: mediapackagev2.UriSeparator;
    /**
     * IAM resource policy (JSON) attached to the origin endpoint, controlling
     * which principals may retrieve content from it
     * (`mediapackagev2:GetObject` / `mediapackagev2:GetHeadObject`). Omitting
     * it removes any existing policy.
     */
    policy?: string;
    /**
     * CDN authorization for the endpoint policy: the Secrets Manager secrets
     * holding the CDN identifier and the role MediaPackage assumes to read
     * them. Only applied together with {@link OriginEndpointProps.policy}.
     */
    cdnAuthConfiguration?: mediapackagev2.CdnAuthConfiguration;
    /**
     * User-defined tags for the origin endpoint. Merged with internal Alchemy
     * tags.
     */
    tags?: Record<string, string>;
}
interface ManifestRef {
    /** Name of the manifest. */
    manifestName: string;
    /** Playback URL of the manifest on the group's egress domain. */
    url: string;
}
export interface OriginEndpoint extends Resource<"AWS.MediaPackageV2.OriginEndpoint", OriginEndpointProps, {
    /** Name of the channel group the endpoint belongs to. */
    channelGroupName: string;
    /** Name of the channel the endpoint packages content from. */
    channelName: string;
    /** Name of the origin endpoint. */
    originEndpointName: string;
    /** ARN of the origin endpoint. */
    originEndpointArn: string;
    /** Output container type (`TS`, `CMAF`, or `ISM`). */
    containerType: string;
    /** HLS manifests served by the endpoint. */
    hlsManifests: ManifestRef[];
    /** Low-latency HLS manifests served by the endpoint. */
    lowLatencyHlsManifests: ManifestRef[];
    /** DASH manifests served by the endpoint. */
    dashManifests: ManifestRef[];
    /** Microsoft Smooth Streaming manifests served by the endpoint. */
    mssManifests: ManifestRef[];
}, never, Providers> {
}
/**
 * An AWS Elemental MediaPackage v2 origin endpoint — the output side of a
 * channel. The endpoint packages the channel's ingested content into HLS,
 * low-latency HLS, DASH, and/or MSS manifests and serves them to downstream
 * devices (players or CDNs) on the channel group's egress domain.
 *
 * ### Creating an Origin Endpoint
 * **Example:** HLS Endpoint on a Channel
 * ```typescript
 * import * as MediaPackageV2 from "alchemy/AWS/MediaPackageV2";
 *
 * const group = yield* MediaPackageV2.ChannelGroup("Live");
 * const channel = yield* MediaPackageV2.Channel("Feed", {
 *   channelGroupName: group.channelGroupName,
 * });
 * const endpoint = yield* MediaPackageV2.OriginEndpoint("Playback", {
 *   channelGroupName: group.channelGroupName,
 *   channelName: channel.channelName,
 *   containerType: "TS",
 *   hlsManifests: [{ ManifestName: "index" }],
 * });
 * ```
 *
 * **Example:** CMAF Endpoint with DASH and Low-Latency HLS
 * ```typescript
 * const endpoint = yield* MediaPackageV2.OriginEndpoint("Playback", {
 *   channelGroupName: group.channelGroupName,
 *   channelName: channel.channelName,
 *   containerType: "CMAF",
 *   segment: { SegmentDurationSeconds: 4 },
 *   dashManifests: [{ ManifestName: "dash" }],
 *   lowLatencyHlsManifests: [{ ManifestName: "ll-hls" }],
 * });
 * ```
 *
 * ### Startover Window
 * **Example:** Allow viewers to catch up on the last hour
 * ```typescript
 * const endpoint = yield* MediaPackageV2.OriginEndpoint("Playback", {
 *   channelGroupName: group.channelGroupName,
 *   channelName: channel.channelName,
 *   containerType: "TS",
 *   startoverWindow: "1 hour",
 *   hlsManifests: [{ ManifestName: "index" }],
 * });
 * ```
 *
 * ### Resource Policy
 * **Example:** Restrict playback to a CDN principal
 * ```typescript
 * const endpoint = yield* MediaPackageV2.OriginEndpoint("Playback", {
 *   channelGroupName: group.channelGroupName,
 *   channelName: channel.channelName,
 *   containerType: "TS",
 *   hlsManifests: [{ ManifestName: "index" }],
 *   policy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { AWS: "arn:aws:iam::111122223333:root" },
 *       Action: ["mediapackagev2:GetObject", "mediapackagev2:GetHeadObject"],
 *       Resource: "arn:aws:mediapackagev2:us-east-1:111122223333:channelGroup/live/channel/feed/originEndpoint/playback",
 *     }],
 *   }),
 * });
 * ```
 *
 * ### Playback URLs
 * **Example:** Read the served manifest URLs
 * ```typescript
 * const playbackUrl = endpoint.hlsManifests.map((m) => m.url);
 * ```
 *
 * @resource
 */
export declare const OriginEndpoint: import("../../Resource.ts").ResourceClass<OriginEndpoint>;
export declare const OriginEndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<OriginEndpoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=OriginEndpoint.d.ts.map