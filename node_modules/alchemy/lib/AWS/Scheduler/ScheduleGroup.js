import * as scheduler from "@distilled.cloud/aws/scheduler";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasTags, } from "../../Tags.js";
export const ScheduleGroup = Resource("AWS.Scheduler.ScheduleGroup");
export const ScheduleGroupProvider = () => Provider.effect(ScheduleGroup, Effect.gen(function* () {
    const toName = (id, props) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 64 });
    return {
        stables: ["scheduleGroupArn", "scheduleGroupName"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !==
                (yield* toName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const scheduleGroupName = output?.scheduleGroupName ?? (yield* toName(id, olds));
            const described = yield* scheduler
                .getScheduleGroup({
                Name: scheduleGroupName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (!described?.Arn || !described.Name) {
                return undefined;
            }
            return {
                scheduleGroupArn: described.Arn,
                scheduleGroupName: described.Name,
                state: described.State,
            };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const scheduleGroupName = output?.scheduleGroupName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — fetch live group; gracefully handle missing.
            let observed = yield* scheduler
                .getScheduleGroup({ Name: scheduleGroupName })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            // Ensure — create if missing. Tolerate `ConflictException` as a
            // race or adoption case: verify ownership via tags before
            // continuing.
            if (!observed?.Arn) {
                yield* scheduler
                    .createScheduleGroup({
                    Name: scheduleGroupName,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.catchTag("ConflictException", () => scheduler.getScheduleGroup({ Name: scheduleGroupName }).pipe(Effect.flatMap((existing) => existing.Arn
                    ? scheduler
                        .listTagsForResource({ ResourceArn: existing.Arn })
                        .pipe(Effect.filterOrFail(({ Tags }) => hasTags(internalTags, Tags), () => new Error(`ScheduleGroup '${scheduleGroupName}' already exists and is not managed by alchemy`)), Effect.asVoid)
                    : Effect.fail(new Error(`ScheduleGroup '${scheduleGroupName}' already exists but could not be described`))))));
                observed = yield* scheduler
                    .getScheduleGroup({ Name: scheduleGroupName })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            }
            if (!observed?.Arn) {
                return yield* Effect.fail(new Error(`Failed to read created ScheduleGroup '${scheduleGroupName}'`));
            }
            const groupArn = observed.Arn;
            // Sync tags — diff observed cloud tags against desired so
            // adoption rewrites ownership tags.
            const observedTagsResp = yield* scheduler
                .listTagsForResource({ ResourceArn: groupArn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({ Tags: [] })));
            const observedTags = Object.fromEntries((observedTagsResp.Tags ?? []).map((t) => [t.Key, t.Value]));
            const { removed, upsert } = diffTags(observedTags, desiredTags);
            if (removed.length > 0) {
                yield* scheduler.untagResource({
                    ResourceArn: groupArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* scheduler.tagResource({
                    ResourceArn: groupArn,
                    Tags: upsert,
                });
            }
            yield* session.note(groupArn);
            return {
                scheduleGroupArn: groupArn,
                scheduleGroupName,
                state: observed?.State,
            };
        }),
        list: () => Effect.gen(function* () {
            // Enumerate every schedule group in the account/region,
            // paginated.
            const summaries = yield* scheduler.listScheduleGroups
                .pages({})
                .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.ScheduleGroups ?? []).filter((g) => g.Name != null))));
            // Hydrate each summary via GetScheduleGroup into the exact
            // `read` shape. Skip groups deleted between list and get.
            const rows = yield* Effect.forEach(summaries, (summary) => scheduler.getScheduleGroup({ Name: summary.Name }).pipe(Effect.map((described) => described.Arn && described.Name
                ? {
                    scheduleGroupArn: described.Arn,
                    scheduleGroupName: described.Name,
                    state: described.State,
                }
                : undefined), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined))), { concurrency: 10 });
            return rows.filter((row) => row !== undefined);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* scheduler
                .deleteScheduleGroup({
                Name: output.scheduleGroupName,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=ScheduleGroup.js.map