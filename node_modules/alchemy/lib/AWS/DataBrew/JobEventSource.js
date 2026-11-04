import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting DataBrew job-run notifications to the hosting
 * compute. DataBrew publishes every job-run state change to the account's
 * default EventBridge bus (source `aws.databrew`, detail-type
 * `DataBrew Job State Change`); this subscribes the host Function to those
 * events so it can alert on failed runs or chain post-run automation.
 *
 * DataBrew publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Job Events
 * **Example:** Alert On Failed Runs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.DataBrew.consumeJobEvents(
 *       { states: ["FAILED", "TIMEOUT"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `run ${event.detail.jobRunId} of ${event.detail.jobName} failed`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeJobEvents = (props, process) => consumeBusEvents(props.id ?? "DataBrewJobEvents", {
    source: ["aws.databrew"],
    "detail-type": ["DataBrew Job State Change"],
    ...(props.jobNames !== undefined || props.states !== undefined
        ? {
            detail: {
                ...(props.jobNames !== undefined
                    ? { jobName: [...props.jobNames] }
                    : {}),
                ...(props.states !== undefined
                    ? { state: [...props.states] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobEventSource.js.map