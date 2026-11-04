import * as mediatailor from "@distilled.cloud/aws/mediatailor";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
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
export const PlaybackConfiguration = Resource("AWS.MediaTailor.PlaybackConfiguration");
/**
 * Raised when MediaTailor returns a playback configuration without the
 * attributes the provider needs (ARN and playback endpoints). This indicates
 * an unexpected API response rather than a user error.
 */
export class MediaTailorIncompletePlaybackConfiguration extends Data.TaggedError("MediaTailorIncompletePlaybackConfiguration") {
}
export const PlaybackConfigurationProvider = () => Provider.effect(PlaybackConfiguration, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        // MediaTailor playback configuration names max out at 64 characters.
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 64 }));
    });
    const toAttributes = Effect.fn(function* (config) {
        if (config.Name === undefined ||
            config.PlaybackConfigurationArn === undefined ||
            config.PlaybackEndpointPrefix === undefined ||
            config.SessionInitializationEndpointPrefix === undefined) {
            return yield* new MediaTailorIncompletePlaybackConfiguration({
                message: `playback configuration '${config.Name}' is missing its ARN or endpoint prefixes`,
            });
        }
        return {
            name: config.Name,
            playbackConfigurationArn: config.PlaybackConfigurationArn,
            playbackEndpointPrefix: config.PlaybackEndpointPrefix,
            sessionInitializationEndpointPrefix: config.SessionInitializationEndpointPrefix,
            hlsManifestEndpointPrefix: config.HlsConfiguration?.ManifestEndpointPrefix,
            dashManifestEndpointPrefix: config.DashConfiguration?.ManifestEndpointPrefix,
        };
    });
    const observe = (name) => mediatailor.getPlaybackConfiguration({ Name: name }).pipe(Effect.map((config) => config), 
    // Typed synthetic tag for a missing playback configuration.
    Effect.catchTag("PlaybackConfigurationNotFound", () => Effect.succeed(undefined)));
    const desiredRequest = (name, props) => ({
        Name: name,
        AdDecisionServerUrl: props.adDecisionServerUrl,
        VideoContentSourceUrl: props.videoContentSourceUrl,
        SlateAdUrl: props.slateAdUrl,
        PersonalizationThresholdSeconds: toWireSeconds(props.personalizationThreshold),
        TranscodeProfileName: props.transcodeProfileName,
        InsertionMode: props.insertionMode,
        CdnConfiguration: props.cdnConfiguration && {
            AdSegmentUrlPrefix: props.cdnConfiguration.adSegmentUrlPrefix,
            ContentSegmentUrlPrefix: props.cdnConfiguration.contentSegmentUrlPrefix,
        },
        DashConfiguration: props.dashConfiguration && {
            MpdLocation: props.dashConfiguration.mpdLocation,
            OriginManifestType: props.dashConfiguration.originManifestType,
        },
        AvailSuppression: props.availSuppression && {
            Mode: props.availSuppression.mode,
            Value: props.availSuppression.value,
            FillPolicy: props.availSuppression.fillPolicy,
        },
        Bumper: props.bumper && {
            StartUrl: props.bumper.startUrl,
            EndUrl: props.bumper.endUrl,
        },
        LivePreRollConfiguration: props.livePreRollConfiguration && {
            AdDecisionServerUrl: props.livePreRollConfiguration.adDecisionServerUrl,
            MaxDurationSeconds: toWireSeconds(props.livePreRollConfiguration.maxDuration),
        },
        ManifestProcessingRules: props.manifestProcessingRules && {
            AdMarkerPassthrough: {
                Enabled: props.manifestProcessingRules.adMarkerPassthroughEnabled,
            },
        },
    });
    return PlaybackConfiguration.Provider.of({
        stables: ["name", "playbackConfigurationArn"],
        list: () => Effect.gen(function* () {
            const items = yield* mediatailor.listPlaybackConfigurations
                .items({})
                .pipe(Stream.runCollect);
            return Array.from(items).flatMap((config) => config.Name !== undefined &&
                config.PlaybackConfigurationArn !== undefined &&
                config.PlaybackEndpointPrefix !== undefined &&
                config.SessionInitializationEndpointPrefix !== undefined
                ? [
                    {
                        name: config.Name,
                        playbackConfigurationArn: config.PlaybackConfigurationArn,
                        playbackEndpointPrefix: config.PlaybackEndpointPrefix,
                        sessionInitializationEndpointPrefix: config.SessionInitializationEndpointPrefix,
                        hlsManifestEndpointPrefix: config.HlsConfiguration?.ManifestEndpointPrefix,
                        dashManifestEndpointPrefix: config.DashConfiguration?.ManifestEndpointPrefix,
                    },
                ]
                : []);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const found = yield* observe(name);
            if (found === undefined)
                return undefined;
            const attrs = yield* toAttributes(found);
            return (yield* hasAlchemyTags(id, tagRecord(found.Tags)))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // fall through: engine default update logic for mutable fields
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. ENSURE + SYNC — PutPlaybackConfiguration is a full-replace
            //    upsert: omitted fields are cleared server-side. Because a
            //    prop the user removed must be un-set on the cloud config,
            //    the put is always applied (a subset comparison against the
            //    observed config cannot see removals, and server-side
            //    defaults make full-equality checks fragile). This one call
            //    converges greenfield, update, and adoption identically.
            const put = yield* mediatailor.putPlaybackConfiguration({
                ...desiredRequest(name, news),
                Tags: desiredTags,
            });
            const attrs = yield* toAttributes(put);
            // 2. SYNC LOGS — ConfigureLogsForPlaybackConfiguration is a
            //    separate API; diff the OBSERVED post-put log configuration
            //    against the desired one and only call the API on a delta.
            //    A removed `logConfiguration` prop converges to percent 0
            //    (session logging disabled).
            const desiredLogs = news.logConfiguration;
            const observedLogs = put.LogConfiguration;
            const observedPercent = observedLogs?.PercentEnabled ?? 0;
            const desiredPercent = desiredLogs?.percentEnabled ?? 0;
            const observedStrategies = [
                ...(observedLogs?.EnabledLoggingStrategies ?? []),
            ].sort();
            const desiredStrategies = desiredLogs === undefined
                ? observedStrategies // nothing desired: only percent converges
                : [...(desiredLogs.enabledLoggingStrategies ?? [])].sort();
            if (observedPercent !== desiredPercent ||
                observedStrategies.join(",") !== desiredStrategies.join(",")) {
                yield* mediatailor.configureLogsForPlaybackConfiguration({
                    PlaybackConfigurationName: name,
                    PercentEnabled: desiredPercent,
                    ...(desiredLogs?.enabledLoggingStrategies
                        ? {
                            EnabledLoggingStrategies: desiredLogs.enabledLoggingStrategies,
                        }
                        : {}),
                });
            }
            // 3. SYNC TAGS — diff against the OBSERVED post-put tags so
            //    adoption (which can bring foreign tags the put may not
            //    remove) converges.
            const currentTags = tagRecord(put.Tags);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* mediatailor.tagResource({
                    ResourceArn: attrs.playbackConfigurationArn,
                    Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* mediatailor.untagResource({
                    ResourceArn: attrs.playbackConfigurationArn,
                    TagKeys: removed,
                });
            }
            yield* session.note(name);
            return attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            // DeletePlaybackConfiguration is idempotent server-side: deleting
            // a configuration that does not exist succeeds with an empty body
            // (verified live), so no not-found handling is required.
            yield* mediatailor.deletePlaybackConfiguration({
                Name: output.name,
            });
        }),
    });
}));
//# sourceMappingURL=PlaybackConfiguration.js.map