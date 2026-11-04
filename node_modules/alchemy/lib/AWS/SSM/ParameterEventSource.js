import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    change: "Parameter Store Change",
    "policy-action": "Parameter Store Policy Action",
};
/**
 * Event source connecting SSM Parameter Store changes to the hosting compute.
 * Systems Manager publishes every parameter create/update/delete (and
 * parameter-policy action, e.g. expiration) to the account's default
 * EventBridge bus (source `aws.ssm`); this subscribes the host Function to
 * those events so it can react to configuration changes — refresh caches,
 * fan out notifications, or audit secret rotation.
 *
 * Parameter Store publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Parameter Events
 * **Example:** React To Parameter Changes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ConfigWatcher.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.SSM.consumeParameterEvents(
 *       { kinds: ["change"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `${event.detail.operation}: ${event.detail.name}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeParameterEvents = (props, process) => consumeBusEvents(props.id ?? "SSMParameterEvents", {
    source: ["aws.ssm"],
    "detail-type": (props.kinds ?? Object.keys(DETAIL_TYPES)).map((kind) => DETAIL_TYPES[kind]),
    ...(props.names !== undefined && props.names.length > 0
        ? { detail: { name: [...props.names] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ParameterEventSource.js.map