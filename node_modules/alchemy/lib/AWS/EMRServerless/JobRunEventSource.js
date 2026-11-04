import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "job-run-state-change": "EMR Serverless Job Run State Change",
    "application-state-change": "EMR Serverless Application State Change",
};
/**
 * Event source connecting Amazon EMR Serverless notifications to the
 * hosting compute. EMR Serverless publishes job-run state changes (most
 * importantly a job dropping into `FAILED`) and application state changes
 * to the account's default EventBridge bus (source `aws.emr-serverless`);
 * this subscribes the host Function to those events so it can alert on
 * failed jobs or chain follow-up work when a job succeeds.
 *
 * EMR Serverless publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Job Run Events
 * **Example:** Alert On Failed Jobs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.EMRServerless.consumeJobRunEvents(
 *       { states: ["FAILED"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `job ${event.detail.jobRunId} failed: ${event.detail.stateDetails}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeJobRunEvents = (props, process) => consumeBusEvents(props.id ?? "EMRServerlessJobRunEvents", {
    source: ["aws.emr-serverless"],
    "detail-type": (props.kinds ?? ["job-run-state-change"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.applicationIds !== undefined || props.states !== undefined
        ? {
            detail: {
                ...(props.applicationIds !== undefined
                    ? { applicationId: [...props.applicationIds] }
                    : {}),
                ...(props.states !== undefined
                    ? { state: [...props.states] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobRunEventSource.js.map