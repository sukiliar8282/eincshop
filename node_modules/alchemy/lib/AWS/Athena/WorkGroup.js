import * as athena from "@distilled.cloud/aws/athena";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Amazon Athena workgroup — an isolation boundary for queries that pins the
 * S3 result-output location, result encryption, a bytes-scanned cutoff, and
 * whether that configuration is enforced over per-query client settings.
 *
 * ### Creating Workgroups
 * **Example:** Workgroup with an enforced result location
 * ```typescript
 * const results = yield* AWS.S3.Bucket("AthenaResults", {});
 * const wg = yield* AWS.Athena.WorkGroup("Analytics", {
 *   outputLocation: results.bucketName.pipe(
 *     Output.map((b) => `s3://${b}/results/`),
 *   ),
 *   enforceWorkGroupConfiguration: true,
 * });
 * ```
 *
 * **Example:** Workgroup with a bytes-scanned cost guardrail
 * ```typescript
 * const wg = yield* AWS.Athena.WorkGroup("Guarded", {
 *   outputLocation: "s3://my-results-bucket/prefix/",
 *   bytesScannedCutoffPerQuery: 10_000_000, // 10 MB per query
 *   publishCloudWatchMetricsEnabled: true,
 * });
 * ```
 *
 * @resource
 */
export const WorkGroup = Resource("AWS.Athena.WorkGroup");
const observedTagsOf = (tags) => Object.fromEntries((tags ?? []).flatMap((t) => t.Key !== undefined && t.Value !== undefined ? [[t.Key, t.Value]] : []));
const outputLocationOf = (wg) => wg?.Configuration?.ResultConfiguration?.OutputLocation;
export const WorkGroupProvider = () => Provider.effect(WorkGroup, Effect.gen(function* () {
    const toName = (id, props = {}) => props.workGroupName
        ? Effect.succeed(props.workGroupName)
        : createPhysicalName({ id, maxLength: 128 });
    const getOne = (name) => athena.getWorkGroup({ WorkGroup: name }).pipe(Effect.map((res) => res.WorkGroup), Effect.catchTag("WorkGroupNotFound", () => Effect.succeed(undefined)));
    const fetchTags = (arn) => athena.listTagsForResource.items({ ResourceARN: arn }).pipe(Stream.runCollect, Effect.map((chunk) => observedTagsOf(Array.from(chunk))), Effect.catch(() => Effect.succeed({})));
    return {
        stables: ["workGroupName", "workGroupArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.workGroupName ?? (yield* toName(id, olds ?? {}));
            const wg = yield* getOne(name);
            if (!wg)
                return undefined;
            const arn = `arn:aws:athena:${region}:${accountId}:workgroup/${name}`;
            return {
                workGroupName: name,
                workGroupArn: arn,
                state: (wg.State ?? "ENABLED"),
                outputLocation: outputLocationOf(wg),
                tags: yield* fetchTags(arn),
            };
        }),
        list: () => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            const pages = yield* athena.listWorkGroups
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.WorkGroups ?? [])
                .flatMap((wg) => 
            // `primary` is the account's built-in default workgroup;
            // DeleteWorkGroup always rejects it, so keep it out of
            // enumeration for account-wide teardown (nuke).
            wg.Name && wg.Name !== "primary"
                ? [
                    {
                        workGroupName: wg.Name,
                        workGroupArn: `arn:aws:athena:${region}:${accountId}:workgroup/${wg.Name}`,
                        state: (wg.State ?? "ENABLED"),
                        outputLocation: undefined,
                        tags: {},
                    },
                ]
                : []);
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.workGroupName ?? (yield* toName(id, news));
            const arn = `arn:aws:athena:${region}:${accountId}:workgroup/${name}`;
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const desiredState = news.state ?? "ENABLED";
            const enforce = news.enforceWorkGroupConfiguration ?? true;
            const encryption = news.encryptionOption
                ? {
                    EncryptionOption: news.encryptionOption,
                    KmsKey: news.kmsKey,
                }
                : undefined;
            // Observe — cloud state is authoritative.
            let wg = yield* getOne(name);
            // Ensure — create if missing.
            if (!wg) {
                yield* athena.createWorkGroup({
                    Name: name,
                    Description: news.description,
                    Configuration: {
                        ResultConfiguration: news.outputLocation
                            ? {
                                OutputLocation: news.outputLocation,
                                EncryptionConfiguration: encryption,
                            }
                            : undefined,
                        EnforceWorkGroupConfiguration: enforce,
                        PublishCloudWatchMetricsEnabled: news.publishCloudWatchMetricsEnabled,
                        BytesScannedCutoffPerQuery: news.bytesScannedCutoffPerQuery,
                        RequesterPaysEnabled: news.requesterPaysEnabled,
                        EngineVersion: news.engineVersion
                            ? { SelectedEngineVersion: news.engineVersion }
                            : undefined,
                    },
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                });
                wg = yield* getOne(name);
            }
            else {
                // Sync — diff observed configuration against desired, apply the
                // delta via UpdateWorkGroup (which takes a ConfigurationUpdates
                // shape distinct from CreateWorkGroup's Configuration).
                const cfg = wg.Configuration;
                const updates = {};
                let dirty = false;
                if ((cfg?.EnforceWorkGroupConfiguration ?? false) !== enforce) {
                    updates.EnforceWorkGroupConfiguration = enforce;
                    dirty = true;
                }
                if (news.outputLocation !== undefined &&
                    cfg?.ResultConfiguration?.OutputLocation !== news.outputLocation) {
                    updates.ResultConfigurationUpdates = {
                        ...updates.ResultConfigurationUpdates,
                        OutputLocation: news.outputLocation,
                    };
                    dirty = true;
                }
                if (encryption &&
                    cfg?.ResultConfiguration?.EncryptionConfiguration
                        ?.EncryptionOption !== encryption.EncryptionOption) {
                    updates.ResultConfigurationUpdates = {
                        ...updates.ResultConfigurationUpdates,
                        EncryptionConfiguration: encryption,
                    };
                    dirty = true;
                }
                if ((cfg?.PublishCloudWatchMetricsEnabled ?? false) !==
                    (news.publishCloudWatchMetricsEnabled ?? false)) {
                    updates.PublishCloudWatchMetricsEnabled =
                        news.publishCloudWatchMetricsEnabled ?? false;
                    dirty = true;
                }
                if ((cfg?.RequesterPaysEnabled ?? false) !==
                    (news.requesterPaysEnabled ?? false)) {
                    updates.RequesterPaysEnabled = news.requesterPaysEnabled ?? false;
                    dirty = true;
                }
                if ((cfg?.BytesScannedCutoffPerQuery ?? undefined) !==
                    news.bytesScannedCutoffPerQuery) {
                    if (news.bytesScannedCutoffPerQuery === undefined) {
                        updates.RemoveBytesScannedCutoffPerQuery = true;
                    }
                    else {
                        updates.BytesScannedCutoffPerQuery =
                            news.bytesScannedCutoffPerQuery;
                    }
                    dirty = true;
                }
                if (news.engineVersion !== undefined &&
                    cfg?.EngineVersion?.SelectedEngineVersion !== news.engineVersion) {
                    updates.EngineVersion = {
                        SelectedEngineVersion: news.engineVersion,
                    };
                    dirty = true;
                }
                const stateChange = (wg.State ?? "ENABLED") !== desiredState
                    ? desiredState
                    : undefined;
                const descChange = news.description !== undefined &&
                    wg.Description !== news.description
                    ? news.description
                    : undefined;
                if (dirty || stateChange || descChange) {
                    yield* athena.updateWorkGroup({
                        WorkGroup: name,
                        Description: descChange,
                        State: stateChange,
                        ConfigurationUpdates: dirty ? updates : undefined,
                    });
                }
            }
            // Sync tags — diff against OBSERVED cloud tags.
            const observed = yield* fetchTags(arn);
            const { upsert, removed } = diffTags(observed, desiredTags);
            if (upsert.length > 0) {
                yield* athena.tagResource({
                    ResourceARN: arn,
                    Tags: upsert.map((t) => ({ Key: t.Key, Value: t.Value })),
                });
            }
            if (removed.length > 0) {
                yield* athena.untagResource({ ResourceARN: arn, TagKeys: removed });
            }
            const final = (yield* getOne(name)) ?? wg;
            yield* session.note(arn);
            return {
                workGroupName: name,
                workGroupArn: arn,
                state: (final?.State ?? desiredState),
                outputLocation: outputLocationOf(final) ?? news.outputLocation,
                tags: desiredTags,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // Idempotent: DeleteWorkGroup succeeds (no error) when the workgroup
            // is already gone. RecursiveDeleteOption tears down any named
            // queries / prepared statements still saved in it.
            yield* athena.deleteWorkGroup({
                WorkGroup: output.workGroupName,
                RecursiveDeleteOption: true,
            });
        }),
    };
}));
//# sourceMappingURL=WorkGroup.js.map