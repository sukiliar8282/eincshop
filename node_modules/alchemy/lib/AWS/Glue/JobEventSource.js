import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Glue job run state changes to the hosting
 * compute. Glue publishes `Glue Job State Change` events to the account's
 * default EventBridge bus (source `aws.glue`) whenever a run reaches
 * `SUCCEEDED`, `FAILED`, `TIMEOUT`, or `STOPPED`; this subscribes the host
 * Function to those events so it can chain pipelines or alert on failures.
 *
 * Glue publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Job Events
 * **Example:** Alert on Failed Runs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Glue.consumeJobEvents(
 *       { states: ["FAILED", "TIMEOUT"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `glue run failed: ${event.detail.jobName} — ${event.detail.message}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeJobEvents = (props, process) => consumeBusEvents(props.id ?? "GlueJobEvents", {
    source: ["aws.glue"],
    "detail-type": ["Glue Job State Change"],
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