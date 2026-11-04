import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Step Functions execution status changes to the
 * hosting compute. Step Functions publishes every STANDARD execution status
 * transition to the account's default EventBridge bus (source `aws.states`,
 * detail-type `Step Functions Execution Status Change`); this subscribes
 * the host Function to those events so it can alert on `FAILED` executions
 * or chain post-completion automation.
 *
 * Step Functions publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * `EXPRESS` workflows do not emit execution status change events.
 *
 * ### Consuming Execution Events
 * **Example:** Alert On Failed Executions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.StepFunctions.consumeExecutionEvents(
 *       { stateMachines: [orderWorkflow], statuses: ["FAILED", "TIMED_OUT"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(`execution ${event.detail.executionArn} failed`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeExecutionEvents = (props, process) => consumeBusEvents(props.id ?? "SfnExecutionEvents", {
    source: ["aws.states"],
    "detail-type": ["Step Functions Execution Status Change"],
    ...(props.stateMachines !== undefined && props.stateMachines.length > 0
        ? props.statuses !== undefined && props.statuses.length > 0
            ? {
                detail: {
                    stateMachineArn: props.stateMachines.map((machine) => machine.stateMachineArn),
                    status: [...props.statuses],
                },
            }
            : {
                detail: {
                    stateMachineArn: props.stateMachines.map((machine) => machine.stateMachineArn),
                },
            }
        : props.statuses !== undefined && props.statuses.length > 0
            ? { detail: { status: [...props.statuses] } }
            : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ExecutionEventSource.js.map