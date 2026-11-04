import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS Elemental MediaConvert job state changes to
 * the hosting compute. MediaConvert publishes every job state transition
 * (`MediaConvert Job State Change`, source `aws.mediaconvert`) to the
 * account's default EventBridge bus; this subscribes the host Function to
 * those events so it can chain post-transcode automation or alert on
 * `ERROR` jobs.
 *
 * MediaConvert publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Job Events
 * **Example:** React To Finished Transcodes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default TranscodeReactor.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.MediaConvert.consumeJobEvents(
 *       { statuses: ["COMPLETE", "ERROR"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.status === "ERROR"
 *             ? Effect.log(`job ${event.detail.jobId} failed: ${event.detail.errorMessage}`)
 *             : Effect.log(`job ${event.detail.jobId} complete`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeJobEvents = (props, process) => consumeBusEvents(props.id ?? "MediaConvertJobEvents", {
    source: ["aws.mediaconvert"],
    "detail-type": ["MediaConvert Job State Change"],
    ...(props.statuses ? { detail: { status: [...props.statuses] } } : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=JobEventSource.js.map