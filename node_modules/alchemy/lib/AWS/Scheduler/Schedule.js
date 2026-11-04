import * as scheduler from "@distilled.cloud/aws/scheduler";
import * as Effect from "effect/Effect";
import * as Schedule_ from "effect/Schedule";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * EventBridge Scheduler validates that the target's execution role is
 * assumable by `scheduler.amazonaws.com`. A freshly-created IAM role can take
 * well over a minute to propagate, surfacing as the typed
 * `ExecutionRoleNotAssumable` error ("The execution role you provide must
 * allow AWS EventBridge Scheduler to assume the role"). Retry (bounded) until
 * propagation completes.
 */
const retryUntilRoleAssumable = (effect) => Effect.retry(effect, {
    while: (e) => e._tag === "ExecutionRoleNotAssumable",
    schedule: Schedule_.spaced("5 seconds"),
    times: 24,
});
export const Schedule = Resource("AWS.Scheduler.Schedule");
export const ScheduleProvider = () => Provider.effect(Schedule, Effect.gen(function* () {
    const toName = (id, props) => props.name
        ? Effect.succeed(props.name)
        : createPhysicalName({ id, maxLength: 64 });
    return {
        stables: ["scheduleArn", "scheduleName", "groupName"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
            if ((olds.groupName ?? "default") !== (news.groupName ?? "default")) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const scheduleName = output?.scheduleName ?? (yield* toName(id, olds));
            const groupName = output?.groupName ??
                olds.groupName ??
                "default";
            const described = yield* scheduler
                .getSchedule({
                Name: scheduleName,
                GroupName: groupName !== "default" ? groupName : undefined,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            if (!described?.Arn || !described.Name) {
                return undefined;
            }
            return {
                scheduleArn: described.Arn,
                scheduleName: described.Name,
                groupName: described.GroupName ?? groupName,
                state: described.State,
            };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const scheduleName = output?.scheduleName ?? (yield* toName(id, news));
            const groupName = output?.groupName ??
                news.groupName ??
                "default";
            const groupNameParam = groupName !== "default" ? groupName : undefined;
            const desiredConfig = {
                ScheduleExpression: news.scheduleExpression,
                StartDate: news.startDate,
                EndDate: news.endDate,
                Description: news.description,
                ScheduleExpressionTimezone: news.scheduleExpressionTimezone,
                State: news.state,
                KmsKeyArn: news.kmsKeyArn,
                Target: news.target,
                FlexibleTimeWindow: news.flexibleTimeWindow ?? {
                    Mode: "OFF",
                },
                ActionAfterCompletion: news.actionAfterCompletion,
            };
            // Observe — fetch live schedule.
            let observed = yield* scheduler
                .getSchedule({ Name: scheduleName, GroupName: groupNameParam })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            // Ensure — create if missing. EventBridge Scheduler does not support
            // tagging individual schedules (only schedule groups), so ownership
            // can't be branded/verified via tags. A `ConflictException` means a
            // schedule with this deterministic name already exists; fall through
            // to the sync (`updateSchedule`) path to converge it.
            if (!observed?.Arn) {
                yield* scheduler
                    .createSchedule({
                    Name: scheduleName,
                    GroupName: groupNameParam,
                    ...desiredConfig,
                })
                    .pipe(retryUntilRoleAssumable, Effect.catchTag("ConflictException", () => Effect.void));
                observed = yield* scheduler
                    .getSchedule({ Name: scheduleName, GroupName: groupNameParam })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            }
            if (!observed?.Arn) {
                return yield* Effect.fail(new Error(`Failed to read created Schedule '${scheduleName}'`));
            }
            const scheduleArn = observed.Arn;
            // Sync schedule configuration. Scheduler doesn't support a partial
            // update — `updateSchedule` is a full PUT — so we always send the
            // full desired config. Fields like `state` are reflected in
            // `observed.State`; sending a no-op update is cheap.
            yield* scheduler
                .updateSchedule({
                Name: scheduleName,
                GroupName: groupNameParam,
                ...desiredConfig,
            })
                .pipe(retryUntilRoleAssumable);
            yield* session.note(scheduleArn);
            return {
                scheduleArn,
                scheduleName,
                groupName,
                state: news.state ?? observed.State,
            };
        }),
        list: () => Effect.gen(function* () {
            // Enumerate every schedule in the account/region. Omitting
            // GroupName makes ListSchedules return summaries across all
            // schedule groups, paginated.
            const summaries = yield* scheduler.listSchedules.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.Schedules ?? []).filter((s) => s.Name != null))));
            // Hydrate each summary via GetSchedule into the exact `read`
            // shape. Skip schedules deleted between list and get.
            const rows = yield* Effect.forEach(summaries, (summary) => {
                const groupName = summary.GroupName ?? "default";
                return scheduler
                    .getSchedule({
                    Name: summary.Name,
                    GroupName: groupName !== "default" ? groupName : undefined,
                })
                    .pipe(Effect.map((described) => described.Arn && described.Name
                    ? {
                        scheduleArn: described.Arn,
                        scheduleName: described.Name,
                        groupName: described.GroupName ?? groupName,
                        state: described.State,
                    }
                    : undefined), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
            }, { concurrency: 10 });
            return rows.filter((row) => row !== undefined);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* scheduler
                .deleteSchedule({
                Name: output.scheduleName,
                GroupName: output.groupName !== "default" ? output.groupName : undefined,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Schedule.js.map