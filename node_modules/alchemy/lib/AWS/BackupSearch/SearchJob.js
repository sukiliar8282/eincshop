import * as backupsearch from "@distilled.cloud/aws/backupsearch";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readBackupSearchTags, syncBackupSearchTags } from "./internal.js";
/**
 * An AWS Backup Search job — a data-plane search over AWS Backup recovery
 * points (S3 and EBS) whose backup indexes are active. A search job is
 * immutable once started: it runs to completion, retains its results for
 * seven days, and can only be stopped while `RUNNING` (destroying the
 * resource stops a running job; completed jobs age out server-side).
 *
 * ### Creating a Search Job
 * **Example:** Search All S3 Backups
 * ```typescript
 * const search = yield* BackupSearch.SearchJob("FindReports", {
 *   searchScope: { backupResourceTypes: ["S3"] },
 *   itemFilters: {
 *     s3ItemFilters: [
 *       { objectKeys: [{ value: "reports/", operator: "BEGINS_WITH" }] },
 *     ],
 *   },
 * });
 * ```
 *
 * **Example:** Search Specific Recovery Points
 * ```typescript
 * const search = yield* BackupSearch.SearchJob("AuditSearch", {
 *   searchScope: {
 *     backupResourceTypes: ["EBS"],
 *     backupResourceArns: [recoveryPointArn],
 *     backupResourceCreationTime: { createdAfter: "2026-01-01T00:00:00Z" },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const SearchJob = Resource("AWS.BackupSearch.SearchJob");
const encodeTimeCondition = (condition) => ({
    Value: new Date(condition.value),
    Operator: condition.operator,
});
const encodeStringCondition = (condition) => ({
    Value: condition.value,
    Operator: condition.operator,
});
const encodeLongCondition = (condition) => ({
    Value: condition.value,
    Operator: condition.operator,
});
const encodeSearchScope = (scope) => ({
    BackupResourceTypes: scope.backupResourceTypes,
    BackupResourceCreationTime: scope.backupResourceCreationTime
        ? {
            CreatedAfter: scope.backupResourceCreationTime.createdAfter
                ? new Date(scope.backupResourceCreationTime.createdAfter)
                : undefined,
            CreatedBefore: scope.backupResourceCreationTime.createdBefore
                ? new Date(scope.backupResourceCreationTime.createdBefore)
                : undefined,
        }
        : undefined,
    SourceResourceArns: scope.sourceResourceArns,
    BackupResourceArns: scope.backupResourceArns,
    BackupResourceTags: scope.backupResourceTags,
});
const encodeItemFilters = (filters) => ({
    S3ItemFilters: filters.s3ItemFilters?.map((filter) => ({
        ObjectKeys: filter.objectKeys?.map(encodeStringCondition),
        Sizes: filter.sizes?.map(encodeLongCondition),
        CreationTimes: filter.creationTimes?.map(encodeTimeCondition),
        VersionIds: filter.versionIds?.map(encodeStringCondition),
        ETags: filter.etags?.map(encodeStringCondition),
    })),
    EBSItemFilters: filters.ebsItemFilters?.map((filter) => ({
        FilePaths: filter.filePaths?.map(encodeStringCondition),
        Sizes: filter.sizes?.map(encodeLongCondition),
        CreationTimes: filter.creationTimes?.map(encodeTimeCondition),
        LastModificationTimes: filter.lastModificationTimes?.map(encodeTimeCondition),
    })),
});
export const SearchJobProvider = () => Provider.effect(SearchJob, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 60 }));
    });
    const get = Effect.fn(function* (searchJobIdentifier) {
        return yield* backupsearch
            .getSearchJob({ SearchJobIdentifier: searchJobIdentifier })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttrs = (job) => ({
        searchJobIdentifier: job.SearchJobIdentifier,
        searchJobArn: job.SearchJobArn,
        name: job.Name,
        status: job.Status,
    });
    return {
        stables: ["searchJobIdentifier", "searchJobArn", "name"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName ||
                (olds.encryptionKeyArn ?? undefined) !==
                    (news.encryptionKeyArn ?? undefined) ||
                JSON.stringify(olds.searchScope ?? null) !==
                    JSON.stringify(news.searchScope ?? null) ||
                JSON.stringify(olds.itemFilters ?? null) !==
                    JSON.stringify(news.itemFilters ?? null)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, output }) {
            if (!output?.searchJobIdentifier)
                return undefined;
            const job = yield* get(output.searchJobIdentifier);
            if (job === undefined)
                return undefined;
            const attrs = toAttrs(job);
            const tags = yield* readBackupSearchTags(job.SearchJobArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // OBSERVE — output is only an identifier cache; the job may be gone.
            let job = output?.searchJobIdentifier !== undefined
                ? yield* get(output.searchJobIdentifier)
                : undefined;
            // ENSURE — a search job is immutable once started; start it if
            // missing. Any change to the scope/filters is a replacement (diff).
            if (job === undefined) {
                const started = yield* backupsearch.startSearchJob({
                    Name: name,
                    EncryptionKeyArn: news.encryptionKeyArn,
                    SearchScope: encodeSearchScope(news.searchScope),
                    ItemFilters: news.itemFilters
                        ? encodeItemFilters(news.itemFilters)
                        : undefined,
                    Tags: desiredTags,
                });
                job = yield* backupsearch.getSearchJob({
                    SearchJobIdentifier: started.SearchJobIdentifier,
                });
            }
            else {
                // SYNC — tags are the only mutable aspect; diff against OBSERVED.
                yield* syncBackupSearchTags(job.SearchJobArn, desiredTags);
            }
            yield* session.note(job.SearchJobIdentifier);
            return toAttrs(job);
        }),
        delete: Effect.fn(function* ({ output }) {
            // A search job cannot be deleted — results age out after 7 days.
            // Stop it if it is still RUNNING; stopping a job in any other
            // state is a ConflictException and means there is nothing to do.
            yield* backupsearch
                .stopSearchJob({
                SearchJobIdentifier: output.searchJobIdentifier,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.catchTag("ConflictException", () => Effect.void));
        }),
        list: () => backupsearch.listSearchJobs.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            .flatMap((page) => page.SearchJobs ?? [])
            .map((summary) => ({
            searchJobIdentifier: summary.SearchJobIdentifier,
            searchJobArn: summary.SearchJobArn,
            name: summary.Name,
            status: (summary.Status ?? "UNKNOWN"),
        })))),
    };
}));
//# sourceMappingURL=SearchJob.js.map