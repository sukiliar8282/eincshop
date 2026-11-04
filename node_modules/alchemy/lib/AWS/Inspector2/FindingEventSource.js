import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon Inspector findings to the hosting compute.
 * Inspector publishes every newly created, updated, or closed finding to
 * the account's default EventBridge bus (source `aws.inspector2`,
 * detail-type `Inspector2 Finding`); this subscribes the host Function to
 * those events so it can triage, notify, or auto-remediate.
 *
 * Inspector publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Findings
 * **Example:** Alert on Critical Findings
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Inspector2.consumeFindings(
 *       { severities: ["CRITICAL"], statuses: ["ACTIVE"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `Inspector: ${event.detail.title} on ${event.detail.awsAccountId}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeFindings = (props, process) => consumeBusEvents(props.id ?? "Inspector2Findings", {
    source: ["aws.inspector2"],
    "detail-type": ["Inspector2 Finding"],
    ...(props.severities !== undefined || props.statuses !== undefined
        ? {
            detail: {
                ...(props.severities !== undefined
                    ? { severity: [...props.severities] }
                    : {}),
                ...(props.statuses !== undefined
                    ? { status: [...props.statuses] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=FindingEventSource.js.map