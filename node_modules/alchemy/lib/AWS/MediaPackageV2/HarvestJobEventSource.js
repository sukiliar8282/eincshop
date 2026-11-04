import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS Elemental MediaPackage v2 harvest-job
 * notifications to the hosting compute. MediaPackage publishes an event to
 * the account's default EventBridge bus (source `aws.mediapackagev2`,
 * detail-type `MediaPackageV2 HarvestJob Notification`) when a live-to-VOD
 * harvest job completes or fails; this subscribes the host Function to
 * those events so it can publish the exported clip — or alert on a failed
 * export — without polling `GetHarvestJob`.
 *
 * MediaPackage publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Harvest Job Events
 * **Example:** Publish a Clip When Its Harvest Job Completes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ClipPublisher.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.MediaPackageV2.consumeHarvestJobEvents({}, (events) =>
 *       Stream.runForEach(events, (event) =>
 *         event.detail.harvestJob.status === "COMPLETED"
 *           ? Effect.log(
 *               `clip ready: ${event.detail.harvestJob.destination?.s3Destination?.destinationPath}`,
 *             )
 *           : Effect.log(`harvest failed: ${event.detail.harvestJob.message}`),
 *       ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeHarvestJobEvents = (props, process) => consumeBusEvents(props.id ?? "MediaPackageV2HarvestJobEvents", {
    source: ["aws.mediapackagev2"],
    "detail-type": ["MediaPackageV2 HarvestJob Notification"],
    ...(props.harvestJobArns !== undefined
        ? { resources: [...props.harvestJobArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=HarvestJobEventSource.js.map