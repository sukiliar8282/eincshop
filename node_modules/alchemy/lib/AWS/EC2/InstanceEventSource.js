import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Deliver EC2 instance state-change events to the host Function via
 * EventBridge — e.g. to deregister a host from an external system when it
 * stops, or alert when a critical box is terminated.
 *
 * The EventBridge pattern matches every instance state-change in the account
 * (narrowed to `states` when given); inspect `event.detail["instance-id"]` in
 * the handler if the Function should only react to specific instances — the
 * bound instance's id is an Output and cannot appear in the deploy-time rule
 * pattern.
 *
 * ### Observing Instance State
 * **Example:** React to an instance stopping or terminating
 * ```typescript
 * yield* consumeInstanceStateEvents(
 *   instance,
 *   { states: ["stopped", "terminated"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(
 *         `${event.detail["instance-id"]} is now ${event.detail.state}`,
 *       ),
 *     ),
 * );
 * ```
 */
export const consumeInstanceStateEvents = (instance, props, process) => 
// The pattern uses only literal strings so it round-trips through both the
// deploy-time rule and the runtime matcher (Output values cannot appear in
// the pattern — they don't resolve inside the deployed bundle).
consumeBusEvents(`${props.id ?? instance.LogicalId}-InstanceState`, {
    source: ["aws.ec2"],
    "detail-type": ["EC2 Instance State-change Notification"],
    ...(props.states ? { detail: { state: props.states } } : {}),
}, process);
//# sourceMappingURL=InstanceEventSource.js.map