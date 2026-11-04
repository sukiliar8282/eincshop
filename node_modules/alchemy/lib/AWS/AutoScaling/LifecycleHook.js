import * as autoscaling from "@distilled.cloud/aws/auto-scaling";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { toSeconds } from "../../Util/Duration.js";
export const normalizeTransition = (transition) => transition === "LAUNCHING"
    ? "autoscaling:EC2_INSTANCE_LAUNCHING"
    : transition === "TERMINATING"
        ? "autoscaling:EC2_INSTANCE_TERMINATING"
        : transition;
/**
 * A lifecycle hook that pauses an Auto Scaling instance in a wait state on
 * launch or termination so a handler can drain connections, snapshot state, or
 * warm caches before the transition completes. Pair with
 * {@link consumeLifecycleActions} to receive the transition events and
 * {@link CompleteLifecycleAction} to signal `CONTINUE` / `ABANDON`.
 *
 * ### Creating a Lifecycle Hook
 * **Example:** Drain before termination (EventBridge target)
 * ```typescript
 * const hook = yield* LifecycleHook("Drain", {
 *   autoScalingGroup: group,
 *   lifecycleTransition: "TERMINATING",
 *   heartbeatTimeout: "300 seconds",
 *   defaultResult: "CONTINUE",
 * });
 * ```
 *
 * **Example:** Warm caches before an instance enters service
 * ```typescript
 * const hook = yield* LifecycleHook("Warm", {
 *   autoScalingGroup: group,
 *   lifecycleTransition: "LAUNCHING",
 *   heartbeatTimeout: "2 minutes",
 * });
 * ```
 *
 * @resource
 */
export const LifecycleHook = Resource("AWS.AutoScaling.LifecycleHook");
// Derive the group name from either spelling of `autoScalingGroup`. A whole
// AutoScalingGroup resource resolves to its bare Attributes before reaching the
// provider — the resource `Type` marker does not survive resolution — so narrow
// on the attributes shape, never on `Type`.
const toAutoScalingGroupName = (input) => typeof input === "string"
    ? input
    : typeof input
        ?.autoScalingGroupName === "string"
        ? input
            .autoScalingGroupName
        : undefined;
export const LifecycleHookProvider = () => Provider.effect(LifecycleHook, Effect.gen(function* () {
    const toName = (id, props = {}) => props.lifecycleHookName
        ? Effect.succeed(props.lifecycleHookName)
        : createPhysicalName({ id, maxLength: 255, lowercase: true });
    const describeHook = ({ autoScalingGroupName, lifecycleHookName, }) => autoscaling
        .describeLifecycleHooks({
        AutoScalingGroupName: autoScalingGroupName,
        LifecycleHookNames: [lifecycleHookName],
    })
        .pipe(Effect.map((result) => result.LifecycleHooks?.[0]), 
    // A deleted/absent Auto Scaling Group surfaces as
    // `ValidationError: AutoScalingGroup ... not found` (typed
    // `AutoScalingGroupNotFound` via the auto-scaling patch); treat it
    // as "hook gone" so refresh/read converge instead of failing.
    Effect.catchTag("AutoScalingGroupNotFound", () => Effect.succeed(undefined)));
    const toAttributes = (hook) => ({
        lifecycleHookName: hook.LifecycleHookName,
        autoScalingGroupName: hook.AutoScalingGroupName,
        lifecycleTransition: hook.LifecycleTransition,
        heartbeatTimeout: hook.HeartbeatTimeout ?? 0,
        globalTimeout: hook.GlobalTimeout ?? 0,
        defaultResult: hook.DefaultResult ?? "ABANDON",
        notificationTargetARN: hook.NotificationTargetARN,
        roleARN: hook.RoleARN,
        notificationMetadata: hook.NotificationMetadata,
    });
    return {
        stables: ["lifecycleHookName", "autoScalingGroupName"],
        // A lifecycle hook is a sub-resource of its Auto Scaling Group;
        // `describeLifecycleHooks` requires an AutoScalingGroupName and cannot
        // enumerate account-wide, so there is no parent-free listing.
        list: () => Effect.succeed([]),
        diff: Effect.fn(function* ({ id, olds, news: _news }) {
            if (!isResolved(_news))
                return undefined;
            const news = _news;
            const oldName = yield* toName(id, olds ?? {});
            const newName = yield* toName(id, news ?? {});
            const oldGroup = toAutoScalingGroupName(olds.autoScalingGroup);
            const newGroup = toAutoScalingGroupName(news.autoScalingGroup);
            // Hook name or ASG change → replace (identity fields). Both sides must
            // be known before forcing a replacement; a half-created row may have
            // lost an Output-valued `autoScalingGroup`.
            if (oldName !== newName ||
                (oldGroup !== undefined &&
                    newGroup !== undefined &&
                    oldGroup !== newGroup)) {
                return { action: "replace", deleteFirst: true };
            }
            if (!deepEqual(olds, news)) {
                return {
                    action: "update",
                    stables: ["lifecycleHookName", "autoScalingGroupName"],
                };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const autoScalingGroupName = output?.autoScalingGroupName ??
                toAutoScalingGroupName(olds?.autoScalingGroup);
            const lifecycleHookName = output?.lifecycleHookName ?? (yield* toName(id, olds ?? {}));
            if (!autoScalingGroupName)
                return undefined;
            const hook = yield* describeHook({
                autoScalingGroupName,
                lifecycleHookName,
            });
            return hook ? toAttributes(hook) : undefined;
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const autoScalingGroupName = output?.autoScalingGroupName ??
                toAutoScalingGroupName(news.autoScalingGroup);
            if (!autoScalingGroupName) {
                return yield* Effect.die(new Error("LifecycleHook requires a resolvable autoScalingGroup name"));
            }
            const lifecycleHookName = output?.lifecycleHookName ?? (yield* toName(id, news));
            // Ensure + Sync — `putLifecycleHook` is the single create-or-update
            // API. It overwrites the whole hook configuration, so we issue it
            // unconditionally (idempotent on matching params).
            yield* autoscaling.putLifecycleHook({
                LifecycleHookName: lifecycleHookName,
                AutoScalingGroupName: autoScalingGroupName,
                LifecycleTransition: normalizeTransition(news.lifecycleTransition),
                HeartbeatTimeout: toSeconds(news.heartbeatTimeout),
                DefaultResult: news.defaultResult,
                NotificationTargetARN: news.notificationTargetARN,
                RoleARN: news.roleARN,
                NotificationMetadata: news.notificationMetadata,
            });
            const hook = yield* describeHook({
                autoScalingGroupName,
                lifecycleHookName,
            }).pipe(Effect.flatMap((hook) => hook
                ? Effect.succeed(hook)
                : Effect.fail(new Error(`Lifecycle hook '${lifecycleHookName}' was not readable after reconcile`))));
            yield* session.note(lifecycleHookName);
            return toAttributes(hook);
        }),
        delete: Effect.fn(function* ({ output }) {
            // `deleteLifecycleHook` is idempotent — a missing hook returns
            // success. Retry only the transient contention fault.
            yield* autoscaling
                .deleteLifecycleHook({
                AutoScalingGroupName: output.autoScalingGroupName,
                LifecycleHookName: output.lifecycleHookName,
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
//# sourceMappingURL=LifecycleHook.js.map