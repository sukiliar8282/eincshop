import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "new-insight": "DevOps Guru New Insight Open",
    "severity-upgraded": "DevOps Guru Insight Severity Upgraded",
    "insight-closed": "DevOps Guru Insight Closed",
    "new-anomaly": "DevOps Guru New Anomaly Association",
    "new-recommendation": "DevOps Guru New Recommendation Created",
};
/**
 * Event source connecting Amazon DevOps Guru notifications to the hosting
 * compute. DevOps Guru publishes insight lifecycle events (an insight
 * opening, upgrading severity, or closing, plus new anomaly associations
 * and recommendations) to the account's default EventBridge bus (source
 * `aws.devops-guru`); this subscribes the host Function to those events so
 * it can page, annotate incidents, or drive remediation.
 *
 * DevOps Guru publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Insight Events
 * **Example:** Page on High-Severity Insights
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.DevOpsGuru.consumeInsightEvents(
 *       { kinds: ["new-insight", "severity-upgraded"], severities: ["HIGH"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `DevOps Guru insight: ${event.detail.insightDescription} (${event.detail.insightUrl})`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeInsightEvents = (props, process) => consumeBusEvents(props.id ?? "DevOpsGuruInsightEvents", {
    source: ["aws.devops-guru"],
    "detail-type": (props.kinds ?? ["new-insight"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.severities !== undefined
        ? { detail: { insightSeverity: [...props.severities] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=InsightEventSource.js.map