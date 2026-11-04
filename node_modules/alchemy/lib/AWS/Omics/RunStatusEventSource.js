import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon HealthOmics run state changes to the hosting
 * compute. HealthOmics publishes every run state transition (`Run Status
 * Change`, source `aws.omics`) to the account's default EventBridge bus; this
 * subscribes the host Function to those events so it can chain post-run
 * automation (fetch outputs, kick off downstream analysis) or alert on
 * `FAILED` runs.
 *
 * HealthOmics publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Run Events
 * **Example:** React To Finished Runs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default RunReactor.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Omics.consumeRunEvents(
 *       { statuses: ["COMPLETED", "FAILED"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.status === "FAILED"
 *             ? Effect.log(`run ${event.detail.id} failed: ${event.detail.statusMessage}`)
 *             : Effect.log(`run ${event.detail.id} complete`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeRunEvents = (props, process) => consumeBusEvents(props.id ?? "OmicsRunStatusEvents", {
    source: ["aws.omics"],
    "detail-type": ["Run Status Change"],
    ...(props.statuses ? { detail: { status: [...props.statuses] } } : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=RunStatusEventSource.js.map