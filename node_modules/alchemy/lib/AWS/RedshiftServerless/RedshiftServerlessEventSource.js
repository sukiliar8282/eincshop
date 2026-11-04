import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Redshift Serverless notifications to the hosting
 * compute. Redshift Serverless publishes namespace, workgroup, and snapshot
 * lifecycle events — capacity changes, completed snapshots, configuration
 * updates — to the account's default EventBridge bus (source
 * `aws.redshift-serverless`); this subscribes the host Function to those
 * events so it can react to completed snapshots or alert on workgroup
 * status changes.
 *
 * Redshift Serverless publishes to EventBridge automatically — no
 * additional resource is created besides the EventBridge rule targeting the
 * host. Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Redshift Serverless Events
 * **Example:** React to Data Warehouse Events
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const namespaceArn = yield* namespace.namespaceArn;
 *     yield* AWS.RedshiftServerless.consumeRedshiftServerlessEvents(
 *       { resourceArns: [namespaceArn] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logInfo(
 *             `${event["detail-type"]}: ${event.detail.eventMessage}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeRedshiftServerlessEvents = (props, process) => consumeBusEvents(props.id ?? "RedshiftServerlessEvents", {
    source: ["aws.redshift-serverless"],
    ...(props.detailTypes !== undefined
        ? { "detail-type": [...props.detailTypes] }
        : {}),
    ...(props.resourceArns !== undefined
        ? { resources: [...props.resourceArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=RedshiftServerlessEventSource.js.map