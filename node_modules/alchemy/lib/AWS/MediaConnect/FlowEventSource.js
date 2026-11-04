import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    alert: "MediaConnect Alert",
    "flow-status-change": "MediaConnect Flow Status Change",
    "flow-health": "MediaConnect Flow Health",
    "flow-maintenance": "MediaConnect Flow Maintenance",
    "flow-content-quality": "MediaConnect Flow Content Quality",
    "source-health": "MediaConnect Source Health",
    "output-health": "MediaConnect Output Health",
    "output-status-change": "MediaConnect Output Status Change",
};
/**
 * Event source connecting AWS Elemental MediaConnect flow notifications to
 * the hosting compute. MediaConnect publishes alerts (a source
 * disconnecting, failover firing), flow status changes (STANDBY/ACTIVE
 * transitions), flow/source/output health, scheduled maintenance, and
 * content-quality events to the account's default EventBridge bus (source
 * `aws.mediaconnect`); this subscribes the host Function to those events
 * so it can page an operator or trigger automated failover handling.
 *
 * MediaConnect publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Flow Events
 * **Example:** Page an Operator When a Flow Raises an Alert
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default MonitorFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.MediaConnect.consumeFlowEvents(
 *       { kinds: ["alert", "flow-status-change"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.errored === true
 *             ? Effect.log(`flow alert: ${event.detail.message}`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeFlowEvents = (props, process) => consumeBusEvents(props.id ?? "MediaConnectFlowEvents", {
    source: ["aws.mediaconnect"],
    "detail-type": (props.kinds ?? ["alert"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.flowArns !== undefined
        ? { resources: [...props.flowArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=FlowEventSource.js.map