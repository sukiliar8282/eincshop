import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "software-update": "Amazon OpenSearch Service Software Update Notification",
    "auto-tune": "Amazon OpenSearch Service Auto-Tune Notification",
    "cluster-status": "Amazon OpenSearch Service Cluster Status Notification",
    "domain-update": "Amazon OpenSearch Service Domain Update Notification",
    "vpc-endpoint": "Amazon OpenSearch Service VPC Endpoint Notification",
    "node-retirement": "Amazon OpenSearch Service Node Retirement Notification",
    "dry-run-progress": "Amazon OpenSearch Service Dry Run Progress Notification",
};
/**
 * Event source connecting OpenSearch Service notifications to the hosting
 * compute. OpenSearch publishes domain lifecycle events — available and
 * completed service software updates, Auto-Tune optimizations, cluster
 * health transitions (e.g. a red cluster or blocked writes), VPC endpoint
 * changes, node retirements, and blue/green update progress — to the
 * account's default EventBridge bus (source `aws.es`); this subscribes the
 * host Function to those events so it can alert on degraded clusters or
 * auto-approve pending software updates.
 *
 * OpenSearch publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Domain Events
 * **Example:** Alert When a Cluster Degrades or an Update Fails
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.OpenSearch.consumeDomainEvents(
 *       { kinds: ["cluster-status", "software-update"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `${event.detail.event}: ${event.detail.description}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeDomainEvents = (props, process) => consumeBusEvents(props.id ?? "OpenSearchDomainEvents", {
    source: ["aws.es"],
    ...(props.kinds !== undefined
        ? { "detail-type": props.kinds.map((kind) => DETAIL_TYPES[kind]) }
        : {}),
    ...(props.domainArns !== undefined
        ? { resources: [...props.domainArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=DomainEventSource.js.map