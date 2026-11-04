import * as Effect from "effect/Effect";
import { consumeBusEvents, } from "../EventBridge/EventSource.js";
import { LifecycleHook, normalizeTransition, } from "./LifecycleHook.js";
const detailTypeFor = (transition) => transition === "autoscaling:EC2_INSTANCE_LAUNCHING"
    ? "EC2 Instance-launch Lifecycle Action"
    : "EC2 Instance-terminate Lifecycle Action";
/**
 * Pause an Auto Scaling instance transition and deliver the lifecycle event to
 * the host Function. Creates the backing {@link LifecycleHook} on `group` (so
 * instances actually pause) and subscribes the Function to the matching
 * `aws.autoscaling` EventBridge events. Pair with
 * {@link CompleteLifecycleAction} to signal `CONTINUE` / `ABANDON` from the
 * handler.
 *
 * The EventBridge pattern matches every lifecycle action of this transition in
 * the account; inspect `event.detail.AutoScalingGroupName` /
 * `event.detail.LifecycleHookName` in the handler if multiple groups share the
 * Function.
 *
 * ### Draining Instances
 * **Example:** Signal CONTINUE when an instance is about to terminate
 * ```typescript
 * const lifecycle = yield* CompleteLifecycleAction(group);
 * yield* consumeLifecycleActions(
 *   group,
 *   { lifecycleTransition: "TERMINATING", heartbeatTimeout: "300 seconds" },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       lifecycle
 *         .complete({
 *           LifecycleHookName: event.detail.LifecycleHookName,
 *           LifecycleActionToken: event.detail.LifecycleActionToken,
 *           LifecycleActionResult: "CONTINUE",
 *         })
 *         .pipe(Effect.orDie),
 *     ),
 * );
 * ```
 *
 * **Example:** Register the event source inside a Lambda Function
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 * import {
 *   CompleteLifecycleAction,
 *   CompleteLifecycleActionHttp,
 *   consumeLifecycleActions,
 * } from "alchemy/AWS/AutoScaling";
 *
 * export class DrainFunction extends AWS.Lambda.Function<AWS.Lambda.Function>()(
 *   "DrainFunction",
 * ) {}
 *
 * export default DrainFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const lifecycle = yield* CompleteLifecycleAction(group);
 *
 *     // creates the LifecycleHook on the group and subscribes this Function
 *     // to the matching EventBridge lifecycle events
 *     yield* consumeLifecycleActions(
 *       group,
 *       { lifecycleTransition: "TERMINATING" },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           lifecycle
 *             .complete({
 *               LifecycleHookName: event.detail.LifecycleHookName,
 *               LifecycleActionToken: event.detail.LifecycleActionToken,
 *               LifecycleActionResult: "CONTINUE",
 *             })
 *             .pipe(Effect.orDie),
 *         ),
 *     );
 *
 *     return {};
 *   }).pipe(
 *     Effect.provide(
 *       Layer.mergeAll(AWS.Lambda.EventSource, CompleteLifecycleActionHttp),
 *     ),
 *   ),
 * );
 * ```
 */
export const consumeLifecycleActions = (group, props, process) => Effect.gen(function* () {
    const transition = normalizeTransition(props.lifecycleTransition);
    const idPrefix = props.id ?? group.LogicalId;
    // Create the hook so instances actually pause and emit lifecycle events.
    const hook = yield* LifecycleHook(`${idPrefix}-LifecycleHook`, {
        autoScalingGroup: group,
        lifecycleHookName: props.lifecycleHookName,
        lifecycleTransition: props.lifecycleTransition,
        heartbeatTimeout: props.heartbeatTimeout,
        defaultResult: props.defaultResult,
        notificationMetadata: props.notificationMetadata,
    });
    // Subscribe the host Function to the matching lifecycle events. The pattern
    // uses only literal `source` + `detail-type` so it round-trips through both
    // the deploy-time rule and the runtime matcher (Output values cannot appear
    // in the pattern — they don't resolve inside the deployed bundle).
    yield* consumeBusEvents(`${idPrefix}-LifecycleEvents`, {
        source: ["aws.autoscaling"],
        "detail-type": [detailTypeFor(transition)],
    }, process);
    return hook;
});
//# sourceMappingURL=LifecycleHookEventSource.js.map