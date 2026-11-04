import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon EMR on EKS job run state changes to the
 * hosting compute. EMR on EKS publishes every job run state transition
 * (`PENDING` → `SUBMITTED` → `RUNNING` → `COMPLETED`/`FAILED`/`CANCELLED`)
 * to the account's default EventBridge bus (source `aws.emr-containers`,
 * detail-type `EMR Job Run State Change`); this subscribes the host
 * Function to those events so it can react when Spark jobs finish or fail.
 *
 * EMR on EKS publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Job Run Events
 * **Example:** Alert On Failed Spark Jobs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.EMRContainers.consumeJobRunEvents(
 *       { states: ["FAILED"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `job run ${event.detail.id} failed: ${event.detail.failureReason}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeJobRunEvents = (props, process) => consumeBusEvents(props.id ?? "EMRContainersJobRunEvents", {
    source: ["aws.emr-containers"],
    "detail-type": ["EMR Job Run State Change"],
    ...(props.virtualClusterIds !== undefined || props.states !== undefined
        ? {
            detail: {
                ...(props.virtualClusterIds !== undefined
                    ? { virtualClusterId: [...props.virtualClusterIds] }
                    : {}),
                ...(props.states !== undefined
                    ? { state: [...props.states] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobRunEventSource.js.map