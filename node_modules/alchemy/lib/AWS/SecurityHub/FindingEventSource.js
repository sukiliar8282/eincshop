import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Security Hub findings to the hosting compute.
 * Security Hub publishes every new finding and finding update to the
 * account's default EventBridge bus (source `aws.securityhub`, detail-type
 * `Security Hub Findings - Imported`); this subscribes the host Function to
 * those events so it can triage, notify, or auto-remediate.
 *
 * Security Hub publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Findings
 * **Example:** Alert on Critical Findings
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.SecurityHub.consumeFindings(
 *       { severityLabels: ["CRITICAL"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.forEach(event.detail.findings ?? [], (finding) =>
 *             Effect.logError(`Security Hub: ${finding.Title}`),
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeFindings = (props, process) => consumeBusEvents(props.id ?? "SecurityHubFindings", {
    source: ["aws.securityhub"],
    "detail-type": ["Security Hub Findings - Imported"],
    ...(props.severityLabels !== undefined ||
        props.workflowStatuses !== undefined
        ? {
            detail: {
                findings: {
                    ...(props.severityLabels !== undefined
                        ? { Severity: { Label: [...props.severityLabels] } }
                        : {}),
                    ...(props.workflowStatuses !== undefined
                        ? { Workflow: { Status: [...props.workflowStatuses] } }
                        : {}),
                },
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
/**
 * Event source connecting Security Hub custom actions to the hosting
 * compute. Selecting a custom action on findings or insights in the console
 * publishes a `Security Hub Findings - Custom Action` event carrying the
 * selected findings; this subscribes the host Function to those events.
 * Define the action with {@link ActionTarget}.
 *
 * ### Consuming Custom Actions
 * **Example:** Handle an Escalation Action
 * ```typescript
 * yield* AWS.SecurityHub.consumeCustomActions(
 *   { actionArns: [escalate.actionTargetArn] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`${event.detail.actionName}:`, event.detail.findings),
 *     ),
 * );
 * ```
 */
export const consumeCustomActions = (props, process) => consumeBusEvents(props.id ?? "SecurityHubCustomActions", {
    source: ["aws.securityhub"],
    "detail-type": ["Security Hub Findings - Custom Action"],
    ...(props.actionArns !== undefined
        ? { resources: [...props.actionArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=FindingEventSource.js.map