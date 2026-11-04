import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Deliver Application Auto Scaling scaling-activity state-change events to
 * the host Function via EventBridge. Application Auto Scaling emits these
 * events when a scale-out pins a scalable target at its maximum capacity
 * (`detail.scaledToMax`), e.g. to alert that demand exceeds the configured
 * ceiling or to raise `maxCapacity` automatically.
 *
 * The EventBridge pattern matches every scaling-activity event in the
 * account; inspect `event.detail.resourceId` / `event.detail.serviceNamespace`
 * in the handler if multiple targets share the Function.
 *
 * ### Reacting to Scaling Activity
 * **Example:** Alert When a Target Is Pinned at Max Capacity
 * ```typescript
 * yield* consumeScalingActivityEvents(target, {}, (events) =>
 *   Stream.runForEach(events, (event) =>
 *     event.detail.scaledToMax
 *       ? Effect.log(
 *           `${event.detail.resourceId} is pinned at max capacity ${event.detail.maxCapacity}`,
 *         )
 *       : Effect.void,
 *   ),
 * );
 * ```
 */
export const consumeScalingActivityEvents = (target, props, process) => 
// The pattern uses only literal `source` + `detail-type` so it round-trips
// through both the deploy-time rule and the runtime matcher (Output values
// cannot appear in the pattern — they don't resolve inside the deployed
// bundle).
consumeBusEvents(`${props.id ?? target.LogicalId}-ScalingActivityEvents`, {
    source: ["aws.application-autoscaling"],
    "detail-type": ["Application Auto Scaling Scaling Activity State Change"],
}, process);
//# sourceMappingURL=ScalingActivityEventSource.js.map