import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "job-state": "Batch Job State Change",
    "job-queue-blocked": "Batch Job Queue Blocked",
};
/**
 * Event source connecting AWS Batch job state changes to the hosting compute.
 * AWS Batch publishes every job state transition (and job-queue-blocked
 * notifications) to the account's default EventBridge bus (source
 * `aws.batch`); this subscribes the host Function to those events so it can
 * alert on `FAILED` jobs or chain post-completion automation.
 *
 * AWS Batch publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Job Events
 * **Example:** Alert On Failed Jobs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Batch.consumeJobEvents(
 *       { kinds: ["job-state"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.status === "FAILED"
 *             ? Effect.log(`batch job ${event.detail.jobId} failed`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeJobEvents = (props, process) => consumeBusEvents(props.id ?? "BatchJobEvents", {
    source: ["aws.batch"],
    "detail-type": (props.kinds ?? Object.keys(DETAIL_TYPES)).map((kind) => DETAIL_TYPES[kind]),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobEventSource.js.map