import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS Fault Injection Service experiment state
 * changes to the hosting compute. FIS publishes an event to the account's
 * default EventBridge bus (source `aws.fis`, detail-type
 * `FIS Experiment State Change`) whenever an experiment transitions state —
 * starts running, completes, stops, or fails — so a function can post
 * chaos-run reports or trigger follow-up verification the moment an
 * experiment finishes.
 *
 * FIS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Experiment Events
 * **Example:** Report When an Experiment Finishes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ReportFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.FIS.consumeExperimentEvents(
 *       { statuses: ["completed", "stopped", "failed"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `experiment ${event.detail["experiment-id"]} -> ` +
 *               `${event.detail["new-state"]?.status}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeExperimentEvents = (props, process) => consumeBusEvents(props.id ?? "FISExperimentEvents", {
    source: ["aws.fis"],
    "detail-type": ["FIS Experiment State Change"],
    ...(props.experimentTemplateIds !== undefined ||
        props.statuses !== undefined
        ? {
            detail: {
                ...(props.experimentTemplateIds !== undefined
                    ? { "experiment-template-id": [...props.experimentTemplateIds] }
                    : {}),
                ...(props.statuses !== undefined
                    ? { "new-state": { status: [...props.statuses] } }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ExperimentEventSource.js.map