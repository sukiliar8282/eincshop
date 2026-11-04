import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting GuardDuty findings to the hosting compute.
 * GuardDuty publishes every new finding (and periodic updates for
 * recurring ones) to the account's default EventBridge bus (source
 * `aws.guardduty`, detail-type `GuardDuty Finding`); this subscribes the
 * host Function to those events so it can triage, notify, or auto-remediate.
 *
 * GuardDuty publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Findings
 * **Example:** Alert on High-Severity Findings
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.GuardDuty.consumeFindings({}, (events) =>
 *       Stream.runForEach(events, (event) =>
 *         (event.detail.severity ?? 0) >= 7
 *           ? Effect.logError(
 *               `GuardDuty: ${event.detail.type} on ${event.detail.accountId}`,
 *             )
 *           : Effect.void,
 *       ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeFindings = (props, process) => consumeBusEvents(props.id ?? "GuardDutyFindings", {
    source: ["aws.guardduty"],
    "detail-type": ["GuardDuty Finding"],
    ...(props.types !== undefined || props.severities !== undefined
        ? {
            detail: {
                ...(props.types !== undefined ? { type: [...props.types] } : {}),
                ...(props.severities !== undefined
                    ? { severity: [...props.severities] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=FindingEventSource.js.map