import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "state-change": "DLM Policy State Change",
    "pre-post-script": "DLM Pre Post Script Notification",
};
/**
 * Event source connecting Amazon Data Lifecycle Manager notifications to
 * the hosting compute. DLM publishes lifecycle policy state changes (most
 * importantly a policy dropping into `ERROR` and no longer creating
 * snapshots) and pre/post script execution reports to the account's
 * default EventBridge bus (source `aws.dlm`); this subscribes the host
 * Function to those events so it can alert on stalled backup policies.
 *
 * DLM publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on
 * the Function effect.
 *
 * ### Consuming Lifecycle Policy Events
 * **Example:** Alert When A Policy Stops Running
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.DLM.consumePolicyEvents(
 *       { kinds: ["state-change"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.state === "ERROR"
 *             ? Effect.logError(
 *                 `DLM policy ${event.detail.policy_id} failed: ${event.detail.cause}`,
 *               )
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumePolicyEvents = (props, process) => consumeBusEvents(props.id ?? "DLMPolicyEvents", {
    source: ["aws.dlm"],
    "detail-type": (props.kinds ?? ["state-change"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.policyArns !== undefined
        ? { resources: [...props.policyArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=LifecyclePolicyEventSource.js.map