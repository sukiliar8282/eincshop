import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting ECR image pushes and deletes to the hosting
 * compute. ECR publishes an event to the account's default EventBridge bus
 * (source `aws.ecr`, detail-type `ECR Image Action`) every time an image
 * push or delete completes; this subscribes the host Function to those
 * events so it can react without polling.
 *
 * ECR publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Image Events
 * **Example:** React to Successful Pushes
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default DeployBot.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.ECR.consumeImageActions(
 *       { actionTypes: ["PUSH"], results: ["SUCCESS"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `${event.detail["repository-name"]}:${event.detail["image-tag"]} pushed`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeImageActions = (props, process) => consumeBusEvents(props.id ?? "EcrImageActions", {
    source: ["aws.ecr"],
    "detail-type": ["ECR Image Action"],
    ...(props.repositories || props.actionTypes || props.results
        ? {
            detail: {
                ...(props.repositories
                    ? { "repository-name": [...props.repositories] }
                    : {}),
                ...(props.actionTypes
                    ? { "action-type": [...props.actionTypes] }
                    : {}),
                ...(props.results ? { result: [...props.results] } : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
/**
 * Event source connecting completed ECR image scans to the hosting compute.
 * ECR publishes an event to the account's default EventBridge bus (source
 * `aws.ecr`, detail-type `ECR Image Scan`) when a vulnerability scan
 * finishes — including scan-on-push scans; this subscribes the host Function
 * to those events so it can react to new findings without polling.
 *
 * ### Consuming Image Events
 * **Example:** Alert on High-Severity Findings
 * ```typescript
 * yield* AWS.ECR.consumeImageScans({}, (events) =>
 *   Stream.runForEach(events, (event) =>
 *     Effect.log(
 *       event.detail["repository-name"],
 *       event.detail["finding-severity-counts"],
 *     ),
 *   ),
 * );
 * ```
 */
export const consumeImageScans = (props, process) => consumeBusEvents(props.id ?? "EcrImageScans", {
    source: ["aws.ecr"],
    "detail-type": ["ECR Image Scan"],
    ...(props.repositories
        ? { detail: { "repository-name": [...props.repositories] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ImageActionEventSource.js.map