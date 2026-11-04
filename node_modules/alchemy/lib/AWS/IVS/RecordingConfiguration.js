import * as ivs from "@distilled.cloud/aws/ivs";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireSeconds } from "../../Util/Duration.js";
import { retryWhileConflict, retryWhileThrottled, syncIvsTags, toTagRecord, } from "./internal.js";
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
export const RecordingConfiguration = Resource("AWS.IVS.RecordingConfiguration");
/**
 * Raised when the IVS API returns a recording configuration in an
 * unusable shape or state (missing from a create response, or stuck in
 * `CREATE_FAILED`).
 */
export class IvsRecordingConfigurationFailed extends Data.TaggedError("IvsRecordingConfigurationFailed") {
}
export const RecordingConfigurationProvider = () => Provider.effect(RecordingConfiguration, Effect.gen(function* () {
    const toName = (id, props) => props.recordingConfigurationName
        ? Effect.succeed(props.recordingConfigurationName)
        : createPhysicalName({ id, maxLength: 128 });
    const toAttrs = (config) => ({
        recordingConfigurationArn: config.arn,
        recordingConfigurationName: config.name,
        bucketName: config.destinationConfiguration.s3?.bucketName,
        state: config.state,
    });
    const getByArn = Effect.fn(function* (arn) {
        const response = yield* ivs.getRecordingConfiguration({ arn }).pipe(retryWhileThrottled, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.recordingConfiguration;
    });
    /**
     * ListRecordingConfigurations has no name filter — enumerate and
     * match exactly (names are not unique; first hit wins). Used only
     * when the output ARN cache is unavailable.
     */
    const findByName = Effect.fn(function* (name) {
        const summaries = yield* ivs.listRecordingConfigurations.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.recordingConfigurations)), retryWhileThrottled);
        const match = summaries.find((s) => s.name === name);
        return match === undefined ? undefined : yield* getByArn(match.arn);
    });
    /**
     * Wait (bounded) for a freshly created configuration to leave
     * `CREATING`. `CREATE_FAILED` (e.g. the bucket is in another
     * region) is surfaced as a typed failure.
     */
    const awaitActive = Effect.fn(function* (arn) {
        const config = yield* getByArn(arn).pipe(Effect.repeat({
            schedule: Schedule.fixed("3 seconds"),
            until: (c) => c === undefined || c.state !== "CREATING",
            times: 20,
        }));
        if (config === undefined) {
            return yield* Effect.fail(new IvsRecordingConfigurationFailed({
                message: `IVS recording configuration '${arn}' vanished while awaiting ACTIVE`,
            }));
        }
        if (config.state === "CREATE_FAILED") {
            return yield* Effect.fail(new IvsRecordingConfigurationFailed({
                message: `IVS recording configuration '${arn}' entered CREATE_FAILED — is the S3 bucket in the same region and account?`,
            }));
        }
        return config;
    });
    return {
        stables: ["recordingConfigurationArn"],
        read: Effect.fn(function* ({ id, olds, output }) {
            const config = output?.recordingConfigurationArn
                ? yield* getByArn(output.recordingConfigurationArn)
                : yield* findByName(yield* toName(id, olds ?? {}));
            if (config === undefined)
                return undefined;
            const attrs = toAttrs(config);
            return (yield* hasAlchemyTags(id, toTagRecord(config.tags)))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            // There is no UpdateRecordingConfiguration — every setting
            // except tags is immutable and requires a replacement.
            const changed = (yield* toName(id, olds)) !== (yield* toName(id, news)) ||
                olds.destinationConfiguration.s3?.bucketName !==
                    news.destinationConfiguration.s3?.bucketName ||
                toWireSeconds(olds.recordingReconnectWindow) !==
                    toWireSeconds(news.recordingReconnectWindow) ||
                JSON.stringify({
                    ...olds.thumbnailConfiguration,
                    targetInterval: toWireSeconds(olds.thumbnailConfiguration?.targetInterval),
                }) !==
                    JSON.stringify({
                        ...news.thumbnailConfiguration,
                        targetInterval: toWireSeconds(news.thumbnailConfiguration?.targetInterval),
                    }) ||
                JSON.stringify(olds.renditionConfiguration) !==
                    JSON.stringify(news.renditionConfiguration);
            if (changed)
                return { action: "replace" };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* toName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — the live configuration is authoritative; the
            // output ARN is only an identifier cache.
            let observed = output?.recordingConfigurationArn
                ? yield* getByArn(output.recordingConfigurationArn)
                : yield* findByName(name);
            // 2. Ensure — create if missing, then wait for ACTIVE.
            if (observed === undefined) {
                const thumbnail = news.thumbnailConfiguration;
                const created = yield* ivs
                    .createRecordingConfiguration({
                    name,
                    destinationConfiguration: news.destinationConfiguration,
                    recordingReconnectWindowSeconds: toWireSeconds(news.recordingReconnectWindow),
                    thumbnailConfiguration: thumbnail === undefined
                        ? undefined
                        : {
                            recordingMode: thumbnail.recordingMode,
                            targetIntervalSeconds: toWireSeconds(thumbnail.targetInterval),
                            resolution: thumbnail.resolution,
                            storage: thumbnail.storage,
                        },
                    renditionConfiguration: news.renditionConfiguration,
                    tags: desiredTags,
                })
                    .pipe(retryWhileThrottled);
                observed = created.recordingConfiguration;
            }
            if (observed === undefined) {
                return yield* Effect.fail(new IvsRecordingConfigurationFailed({
                    message: "IVS CreateRecordingConfiguration returned no configuration",
                }));
            }
            const arn = observed.arn;
            yield* session.note(arn);
            const active = yield* awaitActive(arn);
            // 3. Sync tags — the only mutable aspect. Diff against OBSERVED
            // cloud tags so adoption converges.
            yield* syncIvsTags(arn, desiredTags);
            // 4. Return fresh attributes.
            return toAttrs(active);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Deleting a configuration still attached to a channel raises
            // ConflictException — retry through a bounded window, then
            // tolerate already-gone.
            yield* ivs
                .deleteRecordingConfiguration({
                arn: output.recordingConfigurationArn,
            })
                .pipe(retryWhileThrottled, retryWhileConflict, Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => ivs.listRecordingConfigurations.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.recordingConfigurations)), Effect.map((summaries) => summaries.map((summary) => toAttrs(summary)))),
    };
}));
//# sourceMappingURL=RecordingConfiguration.js.map