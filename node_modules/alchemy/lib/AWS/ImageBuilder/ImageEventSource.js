import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "image-state-change": "EC2 Image Builder Image State Change",
    "workflow-step-waiting": "EC2 Image Builder Workflow Step Waiting",
};
/**
 * Event source connecting EC2 Image Builder notifications to the hosting
 * compute. Image Builder publishes image state changes (and workflow
 * step-waiting notifications) to the account's default EventBridge bus
 * (source `aws.imagebuilder`); this subscribes the host Function to those
 * events so it can react when a build finishes, fails, or pauses for manual
 * action.
 *
 * Image Builder publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Image Events
 * **Example:** React When a Build Completes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.ImageBuilder.consumeImageEvents(
 *       { kinds: ["image-state-change"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.state?.status === "AVAILABLE"
 *             ? Effect.log(`new image ready: ${event.resources[0]}`)
 *             : Effect.log(`build ${event.detail.state?.status}`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeImageEvents = (props, process) => consumeBusEvents(props.id ?? "ImageBuilderImageEvents", {
    source: ["aws.imagebuilder"],
    "detail-type": (props.kinds ?? ["image-state-change"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.imageArns !== undefined
        ? { resources: props.imageArns.map((arn) => ({ prefix: arn })) }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ImageEventSource.js.map