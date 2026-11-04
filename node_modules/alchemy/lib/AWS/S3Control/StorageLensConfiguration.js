import * as s3control from "@distilled.cloud/aws/s3-control";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createTagsList, createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Amazon S3 Storage Lens configuration — an account-wide (or
 * organization-wide) storage analytics dashboard aggregating usage and
 * activity metrics across buckets, with optional daily export to S3 or
 * CloudWatch.
 * ### Creating Dashboards
 * **Example:** Free-metrics dashboard over the whole account
 * ```typescript
 * import * as S3Control from "alchemy/AWS/S3Control";
 *
 * const lens = yield* S3Control.StorageLensConfiguration("account-lens", {});
 * ```
 *
 * **Example:** Dashboard scoped to specific buckets
 * ```typescript
 * const lens = yield* S3Control.StorageLensConfiguration("data-lens", {
 *   include: {
 *     Buckets: [bucket.bucketArn],
 *   },
 * });
 * ```
 *
 * **Example:** Advanced metrics with S3 export
 * ```typescript
 * const lens = yield* S3Control.StorageLensConfiguration("advanced-lens", {
 *   accountLevel: {
 *     ActivityMetrics: { IsEnabled: true },
 *     BucketLevel: {
 *       ActivityMetrics: { IsEnabled: true },
 *     },
 *   },
 *   dataExport: {
 *     S3BucketDestination: {
 *       Format: "CSV",
 *       OutputSchemaVersion: "V_1",
 *       AccountId: accountId,
 *       Arn: reportBucket.bucketArn,
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Disable a dashboard without deleting it
 * ```typescript
 * const lens = yield* S3Control.StorageLensConfiguration("account-lens", {
 *   isEnabled: false,
 * });
 * ```
 *
 * @resource
 */
export const StorageLensConfiguration = Resource("AWS.S3Control.StorageLensConfiguration");
/**
 * Retry while a freshly-written Storage Lens configuration has not
 * propagated to reads yet.
 *
 * Explicitly typed at module scope — inlining `Effect.retry` in a lifecycle
 * op leaks `Retry.Return`'s conditional type into declaration emit, widening
 * the provider layer to `unknown` and poisoning `AWS.providers()`.
 */
const retryWhileConfigurationPropagates = (self) => Effect.retry(self, {
    while: (e) => e._tag === "NoSuchConfiguration",
    schedule: Schedule.max([Schedule.fixed("1 second"), Schedule.recurs(10)]),
});
export const StorageLensConfigurationProvider = () => Provider.effect(StorageLensConfiguration, Effect.gen(function* () {
    const createConfigId = Effect.fn(function* (id, props) {
        // Config IDs allow [a-zA-Z0-9-_.], 1-64 characters.
        return (props.configId ?? (yield* createPhysicalName({ id, maxLength: 64 })));
    });
    const observeConfiguration = (accountId, configId) => s3control
        .getStorageLensConfiguration({
        AccountId: accountId,
        ConfigId: configId,
    })
        .pipe(Effect.map((r) => r.StorageLensConfiguration), Effect.catchTag("NoSuchConfiguration", () => Effect.succeed(undefined)));
    const observedTags = (accountId, configId) => s3control
        .getStorageLensConfigurationTagging({
        AccountId: accountId,
        ConfigId: configId,
    })
        .pipe(Effect.map((r) => Object.fromEntries((r.Tags ?? []).map((t) => [t.Key, t.Value]))), Effect.catchTag("NoSuchConfiguration", () => Effect.succeed({})));
    const desiredConfiguration = (configId, props) => ({
        Id: configId,
        AccountLevel: props.accountLevel ?? { BucketLevel: {} },
        Include: props.include,
        Exclude: props.exclude,
        DataExport: props.dataExport,
        IsEnabled: props.isEnabled ?? true,
        AwsOrg: props.awsOrg ? { Arn: props.awsOrg } : undefined,
    });
    // Canonical form for observed-vs-desired comparison: only the members
    // we manage, with `undefined` members normalized away.
    const canon = (cfg) => JSON.stringify({
        id: cfg.Id,
        // AWS omits an empty <BucketLevel/> from GET responses, so
        // normalize it to {} to avoid perpetual drift.
        accountLevel: {
            ...cfg.AccountLevel,
            BucketLevel: cfg.AccountLevel?.BucketLevel ?? {},
        },
        include: cfg.Include ?? null,
        exclude: cfg.Exclude ?? null,
        dataExport: cfg.DataExport ?? null,
        isEnabled: cfg.IsEnabled,
        awsOrg: cfg.AwsOrg ?? null,
    });
    return StorageLensConfiguration.Provider.of({
        stables: ["configId", "storageLensArn"],
        list: () => Effect.gen(function* () {
            const { accountId } = yield* AWSEnvironment.current;
            const pages = yield* s3control.listStorageLensConfigurations
                .pages({ AccountId: accountId })
                .pipe(Stream.runCollect);
            return Array.from(pages).flatMap((page) => (page.StorageLensConfigurationList ?? []).map((entry) => ({
                configId: entry.Id,
                storageLensArn: entry.StorageLensArn,
            })));
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const { accountId } = yield* AWSEnvironment.current;
            const configId = output?.configId ?? (yield* createConfigId(id, olds ?? {}));
            const observed = yield* observeConfiguration(accountId, configId);
            if (observed?.StorageLensArn === undefined)
                return undefined;
            const attrs = {
                configId,
                storageLensArn: observed.StorageLensArn,
            };
            const tags = yield* observedTags(accountId, configId);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldConfigId = yield* createConfigId(id, olds ?? {});
            const newConfigId = yield* createConfigId(id, news);
            if (oldConfigId !== newConfigId) {
                return { action: "replace" };
            }
            // fall through: everything else converges via PUT (upsert)
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId } = yield* AWSEnvironment.current;
            const configId = output?.configId ?? (yield* createConfigId(id, news));
            // 1. OBSERVE — cloud state is authoritative.
            const observed = yield* observeConfiguration(accountId, configId);
            // 2. ENSURE + SYNC — PutStorageLensConfiguration is a true upsert;
            //    write only when the observed configuration differs.
            const desired = desiredConfiguration(configId, news);
            if (observed === undefined || canon(observed) !== canon(desired)) {
                yield* s3control.putStorageLensConfiguration({
                    AccountId: accountId,
                    ConfigId: configId,
                    StorageLensConfiguration: desired,
                });
            }
            // 3. SYNC TAGS — PutStorageLensConfigurationTagging replaces the
            //    whole tag set, so diff against OBSERVED tags only to decide
            //    whether a write is needed.
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const currentTags = yield* observedTags(accountId, configId);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0 || removed.length > 0) {
                yield* retryWhileConfigurationPropagates(s3control.putStorageLensConfigurationTagging({
                    AccountId: accountId,
                    ConfigId: configId,
                    Tags: createTagsList(desiredTags),
                }));
            }
            // 4. RETURN — re-read for the service-assigned ARN.
            const final = yield* retryWhileConfigurationPropagates(s3control.getStorageLensConfiguration({
                AccountId: accountId,
                ConfigId: configId,
            }));
            yield* session.note(configId);
            return {
                configId,
                storageLensArn: final.StorageLensConfiguration?.StorageLensArn ??
                    output?.storageLensArn ??
                    "",
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            const { accountId } = yield* AWSEnvironment.current;
            yield* s3control
                .deleteStorageLensConfiguration({
                AccountId: accountId,
                ConfigId: output.configId,
            })
                .pipe(
            // Idempotent delete — already gone is success.
            Effect.catchTag("NoSuchConfiguration", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=StorageLensConfiguration.js.map