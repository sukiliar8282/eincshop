import * as Effect from "effect/Effect";
import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Deliver B2BI transformation results (`aws.b2bi` / `"Transformation
 * Completed"` and `"Transformation Failed"` EventBridge events) to the host
 * Function — B2BI emits one for every transformer run, whether started by a
 * capability's S3 trigger or {@link StartTransformerJob}.
 *
 * The EventBridge pattern matches every transformation in the account and
 * region (the pattern must be literal — `Output` values do not resolve
 * inside the deployed bundle); inspect `event.detail["trading-partner-id"]`
 * or the resource ARNs in `event.resources` in the handler if multiple
 * partnerships share the Function. Provide `AWS.Lambda.EventSource` on the
 * Function effect to implement the subscription.
 *
 * ### Reacting to Transformations
 * **Example:** Post-Process Completed Transformations
 * ```typescript
 * yield* AWS.B2BI.consumeTransformationEvents(
 *   { events: ["Transformation Completed"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(
 *         `transformed -> s3://${event.detail["output-file-s3-attributes"]?.bucket}/${event.detail["output-file-s3-attributes"]?.["object-key"]}`,
 *       ),
 *     ),
 * );
 * ```
 */
export const consumeTransformationEvents = (props, process) => Effect.gen(function* () {
    const { id, events, ...routeProps } = props;
    yield* consumeBusEvents(`${id ?? "B2BI"}-TransformationEvents`, {
        source: ["aws.b2bi"],
        "detail-type": events && events.length > 0
            ? events
            : ["Transformation Completed", "Transformation Failed"],
    }, routeProps, process);
});
/**
 * Deliver B2BI acknowledgement results (`aws.b2bi` / `"Acknowledgement
 * Completed"` and `"Acknowledgement Failed"` EventBridge events) to the host
 * Function — emitted when B2BI generates (or fails to generate) an X12
 * acknowledgement such as a 997 for an inbound document.
 *
 * Provide `AWS.Lambda.EventSource` on the Function effect to implement the
 * subscription.
 *
 * ### Reacting to Acknowledgements
 * **Example:** Alert on Failed Acknowledgements
 * ```typescript
 * yield* AWS.B2BI.consumeAcknowledgementEvents(
 *   { events: ["Acknowledgement Failed"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`ack failed: ${event.detail["failure-message"]}`),
 *     ),
 * );
 * ```
 */
export const consumeAcknowledgementEvents = (props, process) => Effect.gen(function* () {
    const { id, events, ...routeProps } = props;
    yield* consumeBusEvents(`${id ?? "B2BI"}-AcknowledgementEvents`, {
        source: ["aws.b2bi"],
        "detail-type": events && events.length > 0
            ? events
            : ["Acknowledgement Completed", "Acknowledgement Failed"],
    }, routeProps, process);
});
//# sourceMappingURL=TransformationEventSource.js.map