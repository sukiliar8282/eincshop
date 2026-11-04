import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon Fraud Detector prediction results to the
 * hosting compute. When event orchestration is enabled on an event type
 * (`EventType` with `eventBridgeEnabled: true`), every `GetEventPrediction`
 * result is published to the account's default EventBridge bus (source
 * `aws.frauddetector`, detail-type `Event Prediction Result Returned`); this
 * subscribes the host Function to those events so it can trigger downstream
 * workflows — queue a manual review, block an account, notify the customer.
 *
 * Fraud Detector publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Prediction Results
 * **Example:** React To High-Risk Predictions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default ReviewFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.FraudDetector.consumePredictionEvents(
 *       { eventTypeNames: ["purchase"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `prediction for ${event.detail.eventId}: ` +
 *               JSON.stringify(event.detail.ruleResults),
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumePredictionEvents = (props, process) => consumeBusEvents(props.id ?? "FraudDetectorPredictions", {
    source: ["aws.frauddetector"],
    "detail-type": ["Event Prediction Result Returned"],
    ...(props.eventTypeNames !== undefined || props.detectorIds !== undefined
        ? {
            detail: {
                ...(props.eventTypeNames !== undefined
                    ? { eventTypeName: [...props.eventTypeNames] }
                    : {}),
                ...(props.detectorIds !== undefined
                    ? { detectorId: [...props.detectorIds] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=PredictionEventSource.js.map