import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Athena query state changes to the hosting compute.
 * Athena publishes every query execution state transition to the account's
 * default EventBridge bus (source `aws.athena`, detail-type `Athena Query
 * State Change`); this subscribes the host Function to those events so it can
 * react to completed or failed queries without polling.
 *
 * Athena publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Query State Changes
 * **Example:** React to Terminal Query Outcomes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default EtlFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Athena.consumeQueryStateChanges(
 *       { states: ["SUCCEEDED", "FAILED"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `query ${event.detail.queryExecutionId} → ${event.detail.currentState}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeQueryStateChanges = (props, process) => consumeBusEvents(props.id ?? "AthenaQueryStateChanges", {
    source: ["aws.athena"],
    "detail-type": ["Athena Query State Change"],
    ...(props.states || props.workGroups
        ? {
            detail: {
                ...(props.states ? { currentState: [...props.states] } : {}),
                ...(props.workGroups
                    ? { workgroupName: [...props.workGroups] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=QueryStateChangeEventSource.js.map