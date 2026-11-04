import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon Macie findings to the hosting compute.
 * Macie publishes every new finding (and periodic updates for recurring ones,
 * at the session's `findingPublishingFrequency`) to the account's default
 * EventBridge bus (source `aws.macie`, detail-type `Macie Finding`); this
 * subscribes the host Function to those events so it can triage, notify, or
 * quarantine the affected S3 objects.
 *
 * Macie publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Findings
 * **Example:** Alert on High-Severity Sensitive Data
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Macie2.consumeFindings(
 *       { categories: ["CLASSIFICATION"], severities: ["High"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `Macie: ${event.detail.type} in ${event.detail.accountId}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeFindings = (props, process) => consumeBusEvents(props.id ?? "MacieFindings", {
    source: ["aws.macie"],
    "detail-type": ["Macie Finding"],
    ...(props.types !== undefined ||
        props.categories !== undefined ||
        props.severities !== undefined
        ? {
            detail: {
                ...(props.types !== undefined ? { type: [...props.types] } : {}),
                ...(props.categories !== undefined
                    ? { category: [...props.categories] }
                    : {}),
                ...(props.severities !== undefined
                    ? { severity: { description: [...props.severities] } }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=FindingEventSource.js.map