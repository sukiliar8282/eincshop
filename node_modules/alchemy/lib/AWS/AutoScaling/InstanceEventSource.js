import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const allInstanceEvents = [
    "EC2 Instance Launch Successful",
    "EC2 Instance Launch Unsuccessful",
    "EC2 Instance Terminate Successful",
    "EC2 Instance Terminate Unsuccessful",
];
/**
 * Deliver EC2 Auto Scaling instance launch/terminate events to the host
 * Function via EventBridge. Unlike {@link consumeLifecycleActions} this does
 * not pause the instance transition — it observes completed scaling
 * activities, e.g. to deregister an instance from an external system after
 * termination or alert on launch failures.
 *
 * The EventBridge pattern matches every event of the chosen detail-types in
 * the account; inspect `event.detail.AutoScalingGroupName` in the handler if
 * multiple groups share the Function.
 *
 * ### Observing the Fleet
 * **Example:** React to instance launches and terminations
 * ```typescript
 * yield* consumeInstanceEvents(
 *   group,
 *   {
 *     events: [
 *       "EC2 Instance Launch Successful",
 *       "EC2 Instance Terminate Successful",
 *     ],
 *   },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(
 *         `${event["detail-type"]}: ${event.detail.EC2InstanceId} in ${event.detail.AutoScalingGroupName}`,
 *       ),
 *     ),
 * );
 * ```
 *
 * **Example:** Alert on launch failures
 * ```typescript
 * yield* consumeInstanceEvents(
 *   group,
 *   { events: ["EC2 Instance Launch Unsuccessful"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       notify(`Launch failed: ${event.detail.StatusMessage}`),
 *     ),
 * );
 * ```
 */
export const consumeInstanceEvents = (group, props, process) => 
// The pattern uses only literal `source` + `detail-type` so it round-trips
// through both the deploy-time rule and the runtime matcher (Output values
// cannot appear in the pattern — they don't resolve inside the deployed
// bundle).
consumeBusEvents(`${props.id ?? group.LogicalId}-InstanceEvents`, {
    source: ["aws.autoscaling"],
    "detail-type": props.events ?? allInstanceEvents,
}, process);
//# sourceMappingURL=InstanceEventSource.js.map