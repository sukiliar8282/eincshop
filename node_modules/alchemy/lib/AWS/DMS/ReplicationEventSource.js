import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "instance-state": "DMS Replication Instance State Change",
    "task-state": "DMS Replication Task State Change",
};
/**
 * Event source connecting DMS replication state changes to the hosting
 * compute. DMS publishes replication instance and replication task state
 * changes (creation, failover, failure, task stop/start) to the account's
 * default EventBridge bus (source `aws.dms`); this subscribes the host
 * Function to those events so it can alert on failures or chain
 * post-migration automation.
 *
 * DMS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Replication Events
 * **Example:** Alert On Task Failures
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.DMS.consumeReplicationEvents(
 *       { kinds: ["task-state"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.category === "failure"
 *             ? Effect.log(`DMS task ${event.detail.sourceId} failed`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeReplicationEvents = (props, process) => consumeBusEvents(props.id ?? "DmsReplicationEvents", {
    source: ["aws.dms"],
    "detail-type": (props.kinds ?? Object.keys(DETAIL_TYPES)).map((kind) => DETAIL_TYPES[kind]),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ReplicationEventSource.js.map