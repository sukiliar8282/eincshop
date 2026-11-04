import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    stack: "CloudFormation Stack Status Change",
    resource: "CloudFormation Resource Status Change",
    "drift-detection": "CloudFormation Drift Detection Status Change",
    "stack-set": "CloudFormation StackSet Status Change",
    "stack-set-operation": "CloudFormation StackSet Operation Status Change",
    "stack-set-stack-instance": "CloudFormation StackSet StackInstance Status Change",
};
/**
 * Event source connecting CloudFormation status changes to the hosting
 * compute. CloudFormation publishes every stack, resource, drift-detection,
 * and StackSet status change to the account's default EventBridge bus
 * (source `aws.cloudformation`); this subscribes the host Function to those
 * events so it can alert on failed deployments or chain post-deploy
 * automation.
 *
 * CloudFormation publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer
 * (e.g. `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Stack Events
 * **Example:** Alert On Failed Stack Operations
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.CloudFormation.consumeStackEvents(
 *       { kinds: ["stack"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail["status-details"]?.status?.endsWith("_FAILED")
 *             ? Effect.log(`stack ${event.detail["stack-id"]} failed`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeStackEvents = (props, process) => consumeBusEvents(props.id ?? "CloudFormationEvents", {
    source: ["aws.cloudformation"],
    "detail-type": (props.kinds ?? Object.keys(DETAIL_TYPES)).map((kind) => DETAIL_TYPES[kind]),
    ...(props.stackIds !== undefined
        ? { detail: { "stack-id": [...props.stackIds] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=StackEventSource.js.map