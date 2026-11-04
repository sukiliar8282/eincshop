import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "db-cluster": "RDS DB Cluster Event",
    "db-instance": "RDS DB Instance Event",
    "db-cluster-snapshot": "RDS DB Cluster Snapshot Event",
    "db-parameter-group": "RDS DB Parameter Group Event",
};
/**
 * Event source connecting Neptune notifications to the hosting compute.
 * Neptune publishes cluster, instance, snapshot, and parameter-group
 * lifecycle events — failovers, maintenance, backups, configuration changes
 * — through the shared RDS eventing plane to the account's default
 * EventBridge bus (source `aws.rds`); this subscribes the host Function to
 * those events so it can alert on failovers or react to completed
 * snapshots.
 *
 * Neptune publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Because the
 * `aws.rds` source is shared with RDS and DocumentDB, pass `resourceArns`
 * (e.g. the cluster ARN) to scope the rule to your Neptune resources.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Neptune Events
 * **Example:** Alert on Cluster Failovers
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const clusterArn = yield* cluster.dbClusterArn;
 *     yield* AWS.Neptune.consumeNeptuneEvents(
 *       { kinds: ["db-cluster"], resourceArns: [clusterArn] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `${event["detail-type"]}: ${event.detail.Message}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeNeptuneEvents = (props, process) => consumeBusEvents(props.id ?? "NeptuneEvents", {
    source: ["aws.rds"],
    ...(props.kinds !== undefined
        ? { "detail-type": props.kinds.map((kind) => DETAIL_TYPES[kind]) }
        : {}),
    ...(props.resourceArns !== undefined
        ? { resources: [...props.resourceArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=NeptuneEventSource.js.map