import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
/**
 * A scheduled scaling action that changes an Auto Scaling Group's capacity on a
 * recurring cron schedule or at a single future time.
 *
 * ### Creating a Scheduled Action
 * **Example:** Scale up every weekday morning
 * ```typescript
 * const action = yield* ScheduledAction("MorningScaleUp", {
 *   autoScalingGroup: group,
 *   recurrence: "0 9 * * MON-FRI",
 *   timeZone: "America/New_York",
 *   minSize: 2,
 *   maxSize: 10,
 *   desiredCapacity: 4,
 * });
 * ```
 *
 * **Example:** One-time capacity change
 * ```typescript
 * const action = yield* ScheduledAction("BlackFriday", {
 *   autoScalingGroup: group,
 *   startTime: "2026-11-27T00:00:00Z",
 *   desiredCapacity: 20,
 * });
 * ```
 *
 * @resource
 */
export const ScheduledAction = Resource("AWS.AutoScaling.ScheduledAction");
// A whole AutoScalingGroup resource resolves to its bare Attributes before
// reaching the provider — narrow on the attributes shape, never on `Type`.
const toAutoScalingGroupName = (input) => typeof input === "string"
    ? input
    : typeof input
        ?.autoScalingGroupName === "string"
        ? input
            .autoScalingGroupName
        : undefined;
export const ScheduledActionProvider = () => Provider.effect(ScheduledAction, Effect.gen(function* () {
    const toName = (id, props = {}) => props.scheduledActionName
        ? Effect.succeed(props.scheduledActionName)
        : createPhysicalName({ id, maxLength: 255, lowercase: true });
    const describeAction = ({ autoScalingGroupName, scheduledActionName, }) => autoscaling
        .describeScheduledActions({
        AutoScalingGroupName: autoScalingGroupName,
        ScheduledActionNames: [scheduledActionName],
    })
        .pipe(Effect.map((result) => result.ScheduledUpdateGroupActions?.[0]), 
    // A deleted/absent Auto Scaling Group surfaces as
    // `ValidationError: AutoScalingGroup ... not found` (typed
    // `AutoScalingGroupNotFound` via the auto-scaling patch); treat it
    // as "action gone" so refresh/read converge instead of failing.
    Effect.catchTag("AutoScalingGroupNotFound", () => Effect.succeed(undefined)));
    const toAttributes = (action) => ({
        scheduledActionName: action.ScheduledActionName,
        scheduledActionARN: action.ScheduledActionARN,
        autoScalingGroupName: action.AutoScalingGroupName,
        recurrence: action.Recurrence,
        startTime: action.StartTime
            ? new Date(action.StartTime).toISOString()
            : undefined,
        endTime: action.EndTime
            ? new Date(action.EndTime).toISOString()
            : undefined,
        timeZone: action.TimeZone,
        minSize: action.MinSize,
        maxSize: action.MaxSize,
        desiredCapacity: action.DesiredCapacity,
    });
    return {
        stables: [
            "scheduledActionName",
            "scheduledActionARN",
            "autoScalingGroupName",
        ],
        // `describeScheduledActions` enumerates scheduled actions across every
        // Auto Scaling Group in the account/region when no AutoScalingGroupName
        // filter is supplied, so no parent enumeration is needed.
        list: () => autoscaling.describeScheduledActions.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.ScheduledUpdateGroupActions ?? []).map(toAttributes)))),
        diff: Effect.fn(function* ({ id, olds, news: _news }) {
            if (!isResolved(_news))
                return undefined;
            const news = _news;
            const oldName = yield* toName(id, olds ?? {});
            const newName = yield* toName(id, news ?? {});
            const oldGroup = toAutoScalingGroupName(olds.autoScalingGroup);
            const newGroup = toAutoScalingGroupName(news.autoScalingGroup);
            if (oldName !== newName ||
                (oldGroup !== undefined &&
                    newGroup !== undefined &&
                    oldGroup !== newGroup)) {
                return { action: "replace" };
            }
            if (!deepEqual(olds, news)) {
                return {
                    action: "update",
                    stables: [
                        "scheduledActionName",
                        "scheduledActionARN",
                        "autoScalingGroupName",
                    ],
                };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const autoScalingGroupName = output?.autoScalingGroupName ??
                toAutoScalingGroupName(olds?.autoScalingGroup);
            const scheduledActionName = output?.scheduledActionName ?? (yield* toName(id, olds ?? {}));
            const action = yield* describeAction({
                autoScalingGroupName,
                scheduledActionName,
            });
            return action ? toAttributes(action) : undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const autoScalingGroupName = output?.autoScalingGroupName ??
                toAutoScalingGroupName(news.autoScalingGroup);
            if (!autoScalingGroupName) {
                return yield* Effect.die(new Error("ScheduledAction requires a resolvable autoScalingGroup name"));
            }
            const scheduledActionName = output?.scheduledActionName ?? (yield* toName(id, news));
            // Ensure + Sync — `putScheduledUpdateGroupAction` is the single
            // create-or-update API. It overwrites the whole action, so we issue
            // it unconditionally (idempotent on matching params).
            yield* autoscaling.putScheduledUpdateGroupAction({
                AutoScalingGroupName: autoScalingGroupName,
                ScheduledActionName: scheduledActionName,
                Recurrence: news.recurrence,
                StartTime: news.startTime ? new Date(news.startTime) : undefined,
                EndTime: news.endTime ? new Date(news.endTime) : undefined,
                TimeZone: news.timeZone,
                MinSize: news.minSize,
                MaxSize: news.maxSize,
                DesiredCapacity: news.desiredCapacity,
            });
            const action = yield* describeAction({
                autoScalingGroupName,
                scheduledActionName,
            }).pipe(Effect.flatMap((action) => action
                ? Effect.succeed(action)
                : Effect.fail(new Error(`Scheduled action '${scheduledActionName}' was not readable after reconcile`))));
            yield* session.note(scheduledActionName);
            return toAttributes(action);
        }),
        delete: Effect.fn(function* ({ output }) {
            // `deleteScheduledAction` is idempotent — a missing action returns
            // success. Retry only the transient contention fault.
            yield* autoscaling
                .deleteScheduledAction({
                AutoScalingGroupName: output.autoScalingGroupName,
                ScheduledActionName: output.scheduledActionName,
            })
                .pipe(Effect.retry({
                while: (error) => error._tag === "ResourceContentionFault",
                schedule: Schedule.max([
                    Schedule.recurs(5),
                    Schedule.exponential("250 millis"),
                ]),
            }));
        }),
    };
}));
//# sourceMappingURL=ScheduledAction.js.map