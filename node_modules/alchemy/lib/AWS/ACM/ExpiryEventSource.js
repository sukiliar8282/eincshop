import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting ACM certificate-expiry notifications to the
 * hosting compute. ACM publishes one `ACM Certificate Approaching
 * Expiration` event per day per certificate to the account's default
 * EventBridge bus (source `aws.acm`) starting `daysBeforeExpiry` days before
 * each certificate expires — the threshold managed by the
 * {@link AccountConfiguration} resource. This subscribes the host Function
 * to those events so it can alert on, rotate, or re-import certificates
 * before they lapse.
 *
 * ACM publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. EventBridge rules
 * are regional: deploy the consuming Function in the certificate's region
 * (`us-east-1` for certificates created by the {@link Certificate}
 * resource). Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Expiry Events
 * **Example:** Alert Before Certificates Expire
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.ACM.consumeExpiryEvents({}, (events) =>
 *       Stream.runForEach(events, (event) =>
 *         Effect.log(
 *           `${event.detail.CommonName} expires in ${event.detail.DaysToExpiry} days`,
 *         ),
 *       ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 *
 * **Example:** Watch a Specific Certificate
 * ```typescript
 * yield* AWS.ACM.consumeExpiryEvents(
 *   { certificateArns: [certificateArn] },
 *   (events) =>
 *     Stream.runForEach(events, (event) => rotateCertificate(event)),
 * );
 * ```
 */
export const consumeExpiryEvents = (props, process) => consumeBusEvents(props.id ?? "AcmExpiryEvents", {
    source: ["aws.acm"],
    "detail-type": ["ACM Certificate Approaching Expiration"],
    ...(props.certificateArns !== undefined
        ? { resources: [...props.certificateArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ExpiryEventSource.js.map