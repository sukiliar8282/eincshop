import * as TSQ from "@distilled.cloud/aws/timestream-query";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
import { withQueryEndpoint } from "./internal.js";
/**
 * An Amazon Timestream for LiveAnalytics scheduled query — a SQL query
 * Timestream runs on a cron/rate schedule, materializing results into a
 * target table and notifying an SNS topic after each run.
 *
 * Only the `state` (ENABLED/DISABLED) is mutable in place; changing the
 * query, schedule, notification topic, role, target, error report location,
 * or KMS key replaces the scheduled query. Tags sync in place.
 *
 * :::note
 * Timestream for LiveAnalytics is closed to new AWS customers. Accounts that
 * were not already onboarded receive `TimestreamNotOnboarded` (a specialized
 * `AccessDenied`) on every operation.
 * :::
 * ### Creating Scheduled Queries
 * **Example:** Hourly Rollup
 * ```typescript
 * import * as Timestream from "alchemy/AWS/Timestream";
 *
 * const rollup = yield* Timestream.ScheduledQuery("HourlyRollup", {
 *   queryString: `SELECT host, AVG(measure_value::double) AS avg_cpu
 *                 FROM "metrics"."cpu"
 *                 WHERE time > ago(1h) GROUP BY host`,
 *   scheduleExpression: "rate(1 hour)",
 *   notificationTopicArn: topic.topicArn,
 *   executionRoleArn: role.roleArn,
 *   errorReportS3: { bucketName: bucket.bucketName },
 *   targetConfiguration: {
 *     TimestreamConfiguration: {
 *       DatabaseName: database.databaseName,
 *       TableName: rollupTable.tableName,
 *       TimeColumn: "time",
 *       DimensionMappings: [{ Name: "host", DimensionValueType: "VARCHAR" }],
 *       MultiMeasureMappings: {
 *         TargetMultiMeasureName: "cpu_rollup",
 *         MultiMeasureAttributeMappings: [
 *           { SourceColumn: "avg_cpu", MeasureValueType: "DOUBLE" },
 *         ],
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Pausing a Schedule
 * ```typescript
 * const rollup = yield* Timestream.ScheduledQuery("HourlyRollup", {
 *   // ... unchanged configuration ...
 *   state: "DISABLED",
 * });
 * ```
 *
 * @resource
 */
export const ScheduledQuery = Resource("AWS.Timestream.ScheduledQuery");
const createScheduledQueryName = (id, props) => Effect.gen(function* () {
    if (props.name) {
        return props.name;
    }
    return yield* createPhysicalName({ id, maxLength: 64 });
});
const toTagRecord = (tags) => Object.fromEntries((tags ?? []).map((tag) => [tag.Key, tag.Value]));
const readScheduledQuery = Effect.fn(function* (scheduledQueryArn) {
    const response = yield* withQueryEndpoint(TSQ.describeScheduledQuery({ ScheduledQueryArn: scheduledQueryArn })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!response?.ScheduledQuery) {
        return undefined;
    }
    const scheduledQuery = response.ScheduledQuery;
    const tags = yield* withQueryEndpoint(TSQ.listTagsForResource.items({ ResourceARN: scheduledQuery.Arn }).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk)))).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!tags) {
        return undefined;
    }
    return {
        scheduledQueryArn: scheduledQuery.Arn,
        name: scheduledQuery.Name,
        state: scheduledQuery.State,
        tags: toTagRecord(tags),
    };
});
const findScheduledQueryByName = Effect.fn(function* (name) {
    const match = yield* withQueryEndpoint(TSQ.listScheduledQueries.pages({}).pipe(EffectStream.map((page) => page.ScheduledQueries ?? []), EffectStream.flattenIterable, EffectStream.filter((summary) => summary.Name === name), EffectStream.runHead)).pipe(Effect.map(Option.getOrUndefined));
    if (!match)
        return undefined;
    return yield* readScheduledQuery(match.Arn);
});
export const ScheduledQueryProvider = () => Provider.effect(ScheduledQuery, Effect.gen(function* () {
    return {
        stables: ["scheduledQueryArn", "name"],
        list: () => Effect.gen(function* () {
            const summaries = yield* withQueryEndpoint(TSQ.listScheduledQueries.pages({}).pipe(EffectStream.runCollect)).pipe(Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.ScheduledQueries ?? [])));
            const hydrated = yield* Effect.forEach(summaries, (summary) => readScheduledQuery(summary.Arn), { concurrency: 5 });
            return hydrated.filter((attrs) => attrs !== undefined);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const state = output?.scheduledQueryArn
                ? yield* readScheduledQuery(output.scheduledQueryArn)
                : yield* findScheduledQueryByName(yield* createScheduledQueryName(id, olds ?? {}));
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.tags))
                ? state
                : Unowned(state);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news) || olds === undefined)
                return;
            const oldName = yield* createScheduledQueryName(id, olds);
            const newName = yield* createScheduledQueryName(id, news);
            // Only State is mutable via UpdateScheduledQuery — every other
            // aspect requires a replacement.
            const changed = (a, b) => JSON.stringify(a ?? null) !== JSON.stringify(b ?? null);
            if (oldName !== newName ||
                olds.queryString !== news.queryString ||
                olds.scheduleExpression !== news.scheduleExpression ||
                olds.notificationTopicArn !== news.notificationTopicArn ||
                olds.executionRoleArn !== news.executionRoleArn ||
                olds.kmsKeyId !== news.kmsKeyId ||
                changed(olds.targetConfiguration, news.targetConfiguration) ||
                changed(olds.errorReportS3, news.errorReportS3)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("Timestream ScheduledQuery requires props"));
            }
            const name = output?.name ?? (yield* createScheduledQueryName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the cached ARN; fall back to a name lookup so a
            // create whose state failed to persist is adopted, not duplicated.
            let state = output?.scheduledQueryArn
                ? yield* readScheduledQuery(output.scheduledQueryArn)
                : yield* findScheduledQueryByName(name);
            // Ensure — create if missing; tolerate a ConflictException race.
            if (state === undefined) {
                yield* withQueryEndpoint(TSQ.createScheduledQuery({
                    Name: name,
                    QueryString: news.queryString,
                    ScheduleConfiguration: {
                        ScheduleExpression: news.scheduleExpression,
                    },
                    NotificationConfiguration: {
                        SnsConfiguration: { TopicArn: news.notificationTopicArn },
                    },
                    ScheduledQueryExecutionRoleArn: news.executionRoleArn,
                    TargetConfiguration: news.targetConfiguration,
                    ErrorReportConfiguration: {
                        S3Configuration: {
                            BucketName: news.errorReportS3.bucketName,
                            ObjectKeyPrefix: news.errorReportS3.objectKeyPrefix,
                            EncryptionOption: news.errorReportS3.encryptionOption,
                        },
                    },
                    KmsKeyId: news.kmsKeyId,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })).pipe(Effect.catchTag("ConflictException", () => Effect.void));
                yield* session.note(`Creating scheduled query ${name}...`);
                state = yield* findScheduledQueryByName(name);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created scheduled query ${name}`));
                }
            }
            // Sync state — the only in-place mutable aspect.
            const desiredState = news.state ?? "ENABLED";
            if (state.state !== desiredState) {
                yield* withQueryEndpoint(TSQ.updateScheduledQuery({
                    ScheduledQueryArn: state.scheduledQueryArn,
                    State: desiredState,
                }));
                yield* session.note(`Updated scheduled query ${name} state to ${desiredState}`);
            }
            // Sync tags — diff against observed cloud tags.
            const { removed, upsert } = diffTags(state.tags, desiredTags);
            if (removed.length > 0) {
                yield* withQueryEndpoint(TSQ.untagResource({
                    ResourceARN: state.scheduledQueryArn,
                    TagKeys: removed,
                }));
            }
            if (upsert.length > 0) {
                yield* withQueryEndpoint(TSQ.tagResource({
                    ResourceARN: state.scheduledQueryArn,
                    Tags: upsert.map(({ Key, Value }) => ({ Key, Value })),
                }));
            }
            yield* session.note(state.scheduledQueryArn);
            const final = yield* readScheduledQuery(state.scheduledQueryArn);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled scheduled query ${name}`));
            }
            return final;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* withQueryEndpoint(TSQ.deleteScheduledQuery({
                ScheduledQueryArn: output.scheduledQueryArn,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=ScheduledQuery.js.map