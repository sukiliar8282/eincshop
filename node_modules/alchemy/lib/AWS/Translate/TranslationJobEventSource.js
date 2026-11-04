import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon Translate batch translation job state
 * changes to the hosting compute. Translate publishes every job state
 * transition (`Translate TextTranslationJob State Change`, source
 * `aws.translate`) to the account's default EventBridge bus; this
 * subscribes the host Function to those events so it can chain
 * post-translation automation or alert on `FAILED` jobs.
 *
 * Translate publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Job Events
 * **Example:** React to finished batch translation jobs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default TranslationReactor.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Translate.consumeTranslationJobEvents(
 *       { statuses: ["COMPLETED", "FAILED"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(`job ${event.detail.jobId}: ${event.detail.jobStatus}`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeTranslationJobEvents = (props, process) => consumeBusEvents(props.id ?? "TranslateTranslationJobEvents", {
    source: ["aws.translate"],
    "detail-type": ["Translate TextTranslationJob State Change"],
    ...(props.statuses ? { detail: { jobStatus: [...props.statuses] } } : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=TranslationJobEventSource.js.map