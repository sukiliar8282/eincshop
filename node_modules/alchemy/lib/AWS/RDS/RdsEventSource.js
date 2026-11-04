import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "db-instance": "RDS DB Instance Event",
    "db-cluster": "RDS DB Cluster Event",
    "db-snapshot": "RDS DB Snapshot Event",
    "db-cluster-snapshot": "RDS DB Cluster Snapshot Event",
    "db-parameter-group": "RDS DB Parameter Group Event",
    "db-security-group": "RDS DB Security Group Event",
    "db-proxy": "RDS DB Proxy Event",
    "blue-green-deployment": "RDS Blue Green Deployment Event",
};
/**
 * Event source connecting RDS notifications to the hosting compute. RDS
 * publishes instance, cluster, snapshot, parameter-group, and proxy
 * lifecycle events — failovers, maintenance, completed backups,
 * configuration changes — to the account's default EventBridge bus (source
 * `aws.rds`); this subscribes the host Function to those events so it can
 * alert on failovers or react to completed snapshots.
 *
 * RDS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Because the
 * `aws.rds` source is shared with Neptune and DocumentDB, pass
 * `resourceArns` (e.g. the cluster ARN) to scope the rule to your RDS
 * resources. Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming RDS Events
 * **Example:** Alert on Cluster Failovers
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const clusterArn = yield* cluster.dbClusterArn;
 *     yield* AWS.RDS.consumeRdsEvents(
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
export const consumeRdsEvents = (props, process) => consumeBusEvents(props.id ?? "RdsEvents", {
    source: ["aws.rds"],
    ...(props.kinds !== undefined
        ? { "detail-type": props.kinds.map((kind) => DETAIL_TYPES[kind]) }
        : {}),
    ...(props.resourceArns !== undefined
        ? { resources: [...props.resourceArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=RdsEventSource.js.map