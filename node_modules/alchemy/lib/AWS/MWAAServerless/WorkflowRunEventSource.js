import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const ALL_RUN_STATES = [
    "Started",
    "Queued",
    "Running",
    "Succeeded",
    "Failed",
    "Stopped",
    "Timeout",
];
/**
 * Event source connecting Amazon MWAA Serverless notifications to the
 * hosting compute. MWAA Serverless publishes workflow-run state changes
 * (started, queued, running, succeeded, failed, stopped, timeout) and task
 * state changes to the account's default EventBridge bus (source
 * `aws.airflow-serverless`); this subscribes the host Function to those
 * events so it can alert on failed runs or chain follow-up work when a run
 * succeeds.
 *
 * MWAA Serverless publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Workflow Run Events
 * **Example:** Alert On Failed Runs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.MWAAServerless.consumeWorkflowRunEvents(
 *       { runStates: ["Failed", "Timeout"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `workflow run failed: ${event["detail-type"]}`,
 *             event.detail,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeWorkflowRunEvents = (props, process) => consumeBusEvents(props.id ?? "MWAAServerlessWorkflowRunEvents", {
    source: ["aws.airflow-serverless"],
    "detail-type": [
        ...(props.runStates ?? ALL_RUN_STATES).map((state) => `MWAA Serverless Workflow Run ${state}`),
        ...(props.taskStates ?? []).map((state) => `MWAA Serverless Task ${state}`),
    ],
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=WorkflowRunEventSource.js.map