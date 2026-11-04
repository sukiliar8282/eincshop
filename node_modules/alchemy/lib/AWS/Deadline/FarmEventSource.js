import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "job-lifecycle": "Job Lifecycle Status Change",
    "job-run": "Job Run Status Change",
    "step-lifecycle": "Step Lifecycle Status Change",
    "step-run": "Step Run Status Change",
    "task-run": "Task Run Status Change",
    "budget-threshold": "Budget Threshold Reached",
    "fleet-size-recommendation": "Fleet Size Recommendation Change",
    "worker-unhealthy": "Worker Status Unhealthy",
};
/**
 * Event source connecting AWS Deadline Cloud notifications to the hosting
 * compute. Deadline Cloud publishes job/step/task status changes, budget
 * threshold crossings, fleet size recommendations, and unhealthy-worker
 * reports to the account's default EventBridge bus (source `aws.deadline`);
 * this subscribes the host Function to those events so it can react to
 * finished renders or runaway spend.
 *
 * Deadline Cloud publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Farm Events
 * **Example:** Alert When A Job Finishes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default RenderAlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Deadline.consumeFarmEvents(
 *       { kinds: ["job-run"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.status === "SUCCEEDED"
 *             ? Effect.log(`render ${event.detail.jobId} finished`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 *
 * **Example:** Stop The Farm On A Budget Threshold
 * ```typescript
 * yield* AWS.Deadline.consumeFarmEvents(
 *   { kinds: ["budget-threshold"], farmIds: [farm.farmId] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.logWarning(`budget ${event.detail.budgetId} threshold hit`),
 *     ),
 * );
 * ```
 */
export const consumeFarmEvents = (props, process) => consumeBusEvents(props.id ?? "DeadlineFarmEvents", {
    source: ["aws.deadline"],
    "detail-type": (props.kinds ?? ["job-run"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.farmIds !== undefined
        ? { detail: { farmId: [...props.farmIds] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=FarmEventSource.js.map