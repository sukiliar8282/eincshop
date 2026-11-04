import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS HealthImaging state changes to the hosting
 * compute. HealthImaging publishes data store lifecycle transitions, DICOM
 * import job progress, and image set workflow changes to the account's
 * default EventBridge bus (source `aws.medical-imaging`); this subscribes
 * the host Function to those events so it can chain post-import processing
 * (e.g. read the new image sets with `SearchImageSets` +
 * `GetImageSetMetadata`) or alert on failures.
 *
 * HealthImaging publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming HealthImaging Events
 * **Example:** React To Finished Imports
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ImportReactor.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.MedicalImaging.consumeImagingEvents(
 *       { detailTypes: ["Import Job Completed", "Import Job Failed"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event["detail-type"] === "Import Job Failed"
 *             ? Effect.logError(`import ${event.detail.jobId} failed`)
 *             : Effect.log(`import ${event.detail.jobId} completed`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeImagingEvents = (props, process) => consumeBusEvents(props.id ?? "MedicalImagingEvents", {
    source: ["aws.medical-imaging"],
    ...(props.detailTypes !== undefined
        ? { "detail-type": [...props.detailTypes] }
        : {}),
    ...(props.datastoreIds !== undefined
        ? { detail: { datastoreId: [...props.datastoreIds] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ImagingEventSource.js.map