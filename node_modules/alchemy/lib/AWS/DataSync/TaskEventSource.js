import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "task-state-change": "DataSync Task State Change",
    "task-execution-state-change": "DataSync Task Execution State Change",
};
/**
 * Event source connecting AWS DataSync notifications to the hosting
 * compute. DataSync publishes task state changes and task-execution state
 * changes to the account's default EventBridge bus (source `aws.datasync`);
 * this subscribes the host Function to those events so it can react when a
 * transfer finishes, fails, or a task drops offline.
 *
 * DataSync publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Task Events
 * **Example:** React When A Transfer Finishes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.DataSync.consumeTaskEvents(
 *       { kinds: ["task-execution-state-change"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.State === "ERROR"
 *             ? Effect.logError(`transfer failed: ${event.resources[0]}`)
 *             : Effect.log(`transfer ${event.detail.State}`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeTaskEvents = (props, process) => consumeBusEvents(props.id ?? "DataSyncTaskEvents", {
    source: ["aws.datasync"],
    "detail-type": (props.kinds ?? ["task-execution-state-change"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.taskArns !== undefined
        ? { resources: props.taskArns.map((arn) => ({ prefix: arn })) }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=TaskEventSource.js.map