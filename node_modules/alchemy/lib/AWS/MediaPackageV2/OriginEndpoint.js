import * as mediapackagev2 from "@distilled.cloud/aws/mediapackagev2";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { listAllChannelGroups, listChannelEndpoints, listGroupChannels, matchesDesired, policiesEqual, retryWhileMpConflict, syncMpTags, toMpTagRecord, } from "./internal.js";
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
export const OriginEndpoint = Resource("AWS.MediaPackageV2.OriginEndpoint");
export const OriginEndpointProvider = () => Provider.effect(OriginEndpoint, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.originEndpointName ??
            (yield* createPhysicalName({ id, maxLength: 256 })));
    });
    const manifestRefs = (manifests) => (manifests ?? []).map((m) => ({
        manifestName: m.ManifestName,
        url: m.Url,
    }));
    const toAttrs = (endpoint) => ({
        channelGroupName: endpoint.ChannelGroupName,
        channelName: endpoint.ChannelName,
        originEndpointName: endpoint.OriginEndpointName,
        originEndpointArn: endpoint.Arn,
        containerType: endpoint.ContainerType,
        hlsManifests: manifestRefs(endpoint.HlsManifests),
        lowLatencyHlsManifests: manifestRefs(endpoint.LowLatencyHlsManifests),
        dashManifests: manifestRefs(endpoint.DashManifests),
        mssManifests: manifestRefs(endpoint.MssManifests),
    });
    /** Get an origin endpoint; typed not-found → undefined. */
    const getEndpoint = Effect.fn(function* (channelGroupName, channelName, originEndpointName) {
        return yield* mediapackagev2
            .getOriginEndpoint({
            ChannelGroupName: channelGroupName,
            ChannelName: channelName,
            OriginEndpointName: originEndpointName,
        })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return {
        stables: [
            "channelGroupName",
            "channelName",
            "originEndpointName",
            "originEndpointArn",
            "containerType",
        ],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            // Group, channel, name, and container type are the endpoint's
            // identity.
            if (olds.channelGroupName !== news.channelGroupName) {
                return { action: "replace" };
            }
            if (olds.channelName !== news.channelName) {
                return { action: "replace" };
            }
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
            if (olds.containerType !== news.containerType) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const channelGroupName = output?.channelGroupName ?? olds?.channelGroupName;
            const channelName = output?.channelName ?? olds?.channelName;
            if (channelGroupName === undefined || channelName === undefined) {
                return undefined;
            }
            const name = output?.originEndpointName ?? (yield* createName(id, olds ?? {}));
            const endpoint = yield* getEndpoint(channelGroupName, channelName, name);
            if (endpoint === undefined)
                return undefined;
            const attrs = toAttrs(endpoint);
            return (yield* hasAlchemyTags(id, toMpTagRecord(endpoint.Tags)))
                ? attrs
                : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const channelGroupName = news.channelGroupName;
            const channelName = news.channelName;
            // The wire field is whole seconds.
            const startoverWindowSeconds = toWireSeconds(news.startoverWindow);
            const name = output?.originEndpointName ?? (yield* createName(id, news));
            // 1. Observe — cloud state is authoritative; output is an id cache.
            let endpoint = yield* getEndpoint(channelGroupName, channelName, name);
            // 2. Ensure — create if missing; a Conflict means a peer created it
            //    concurrently, so fall through to observing the winner.
            if (endpoint === undefined) {
                endpoint = yield* mediapackagev2
                    .createOriginEndpoint({
                    ChannelGroupName: channelGroupName,
                    ChannelName: channelName,
                    OriginEndpointName: name,
                    ContainerType: news.containerType,
                    Segment: news.segment,
                    Description: news.description,
                    StartoverWindowSeconds: startoverWindowSeconds,
                    HlsManifests: news.hlsManifests,
                    LowLatencyHlsManifests: news.lowLatencyHlsManifests,
                    DashManifests: news.dashManifests,
                    MssManifests: news.mssManifests,
                    ForceEndpointErrorConfiguration: news.forceEndpointErrorConfiguration,
                    UriSeparator: news.uriSeparator,
                    Tags: desiredTags,
                })
                    .pipe(Effect.catchTag("ConflictException", () => mediapackagev2.getOriginEndpoint({
                    ChannelGroupName: channelGroupName,
                    ChannelName: channelName,
                    OriginEndpointName: name,
                })));
            }
            else {
                // 3. Sync — the update is a full PUT of the mutable aspects, so
                //    apply it only when the observed state has drifted from the
                //    desired subset. Manifest arrays are compared by length and
                //    by the fields the desired config specifies, so server-side
                //    defaults never register as drift.
                const desired = {
                    Segment: news.segment,
                    Description: news.description ?? "",
                    StartoverWindowSeconds: startoverWindowSeconds,
                    HlsManifests: news.hlsManifests ?? [],
                    LowLatencyHlsManifests: news.lowLatencyHlsManifests ?? [],
                    DashManifests: news.dashManifests ?? [],
                    MssManifests: news.mssManifests ?? [],
                    ForceEndpointErrorConfiguration: news.forceEndpointErrorConfiguration,
                    UriSeparator: news.uriSeparator,
                };
                const observed = {
                    Segment: endpoint.Segment,
                    Description: endpoint.Description ?? "",
                    StartoverWindowSeconds: endpoint.StartoverWindowSeconds,
                    HlsManifests: endpoint.HlsManifests ?? [],
                    LowLatencyHlsManifests: endpoint.LowLatencyHlsManifests ?? [],
                    DashManifests: endpoint.DashManifests ?? [],
                    MssManifests: endpoint.MssManifests ?? [],
                    ForceEndpointErrorConfiguration: endpoint.ForceEndpointErrorConfiguration,
                    UriSeparator: endpoint.UriSeparator,
                };
                if (!matchesDesired(desired, observed)) {
                    endpoint = yield* mediapackagev2.updateOriginEndpoint({
                        ChannelGroupName: channelGroupName,
                        ChannelName: channelName,
                        OriginEndpointName: name,
                        ContainerType: news.containerType,
                        Segment: news.segment,
                        Description: news.description,
                        StartoverWindowSeconds: startoverWindowSeconds,
                        HlsManifests: news.hlsManifests,
                        LowLatencyHlsManifests: news.lowLatencyHlsManifests,
                        DashManifests: news.dashManifests,
                        MssManifests: news.mssManifests,
                        ForceEndpointErrorConfiguration: news.forceEndpointErrorConfiguration,
                        UriSeparator: news.uriSeparator,
                    });
                }
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncMpTags(endpoint.Arn, toMpTagRecord(endpoint.Tags), desiredTags);
            // 3c. Sync the resource policy — observe the live policy (absent
            //     policy is the typed not-found) and apply only the delta.
            const observedPolicy = yield* mediapackagev2
                .getOriginEndpointPolicy({
                ChannelGroupName: channelGroupName,
                ChannelName: channelName,
                OriginEndpointName: name,
            })
                .pipe(Effect.map((response) => ({
                policy: response.Policy,
                cdnAuth: response.CdnAuthConfiguration,
            })), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({
                policy: undefined,
                cdnAuth: undefined,
            })));
            if (news.policy !== undefined) {
                const cdnDrift = news.cdnAuthConfiguration === undefined
                    ? observedPolicy.cdnAuth !== undefined
                    : !matchesDesired(news.cdnAuthConfiguration, observedPolicy.cdnAuth);
                if (!policiesEqual(observedPolicy.policy, news.policy) ||
                    cdnDrift) {
                    yield* mediapackagev2.putOriginEndpointPolicy({
                        ChannelGroupName: channelGroupName,
                        ChannelName: channelName,
                        OriginEndpointName: name,
                        Policy: news.policy,
                        CdnAuthConfiguration: news.cdnAuthConfiguration,
                    });
                }
            }
            else if (observedPolicy.policy !== undefined) {
                yield* mediapackagev2.deleteOriginEndpointPolicy({
                    ChannelGroupName: channelGroupName,
                    ChannelName: channelName,
                    OriginEndpointName: name,
                });
            }
            yield* session.note(name);
            return toAttrs(endpoint);
        }),
        delete: Effect.fn(function* ({ output }) {
            // MediaPackage v2 deletes are idempotent (deleting a missing
            // endpoint succeeds); a Conflict from a concurrent mutation is
            // transient.
            yield* mediapackagev2
                .deleteOriginEndpoint({
                ChannelGroupName: output.channelGroupName,
                ChannelName: output.channelName,
                OriginEndpointName: output.originEndpointName,
            })
                .pipe(retryWhileMpConflict);
        }),
        // Origin endpoints are keyed by their parent channel, so enumerate
        // groups → channels → endpoints.
        list: () => Effect.gen(function* () {
            const groups = yield* listAllChannelGroups();
            const channels = yield* Effect.forEach(groups, (group) => listGroupChannels(group.ChannelGroupName), { concurrency: 5 }).pipe(Effect.map((nested) => nested.flat()));
            const items = yield* Effect.forEach(channels, (channel) => listChannelEndpoints(channel.ChannelGroupName, channel.ChannelName), { concurrency: 5 }).pipe(Effect.map((nested) => nested.flat()));
            // Hydrate each item via get so the attributes carry the manifest
            // URLs; an endpoint can vanish between enumeration and hydration.
            const endpoints = yield* Effect.forEach(items, (item) => getEndpoint(item.ChannelGroupName, item.ChannelName, item.OriginEndpointName).pipe(Effect.map((endpoint) => endpoint === undefined ? undefined : toAttrs(endpoint))), { concurrency: 5 });
            return endpoints.filter(Predicate.isNotUndefined);
        }),
    };
}));
//# sourceMappingURL=OriginEndpoint.js.map