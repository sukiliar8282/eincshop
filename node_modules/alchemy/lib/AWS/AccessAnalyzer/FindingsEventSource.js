import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    external: ["Access Analyzer Finding"],
    unused: ["Unused Access Finding for IAM entities"],
    all: ["Access Analyzer Finding", "Unused Access Finding for IAM entities"],
};
/**
 * Event source connecting IAM Access Analyzer findings to the hosting
 * compute. Access Analyzer publishes every finding create/update/delete to
 * the account's default EventBridge bus (source `aws.access-analyzer`); this
 * subscribes the host Function to those events so it can alert on or
 * auto-remediate new findings.
 *
 * Analyzers publish to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Finding Events
 * **Example:** Alert on New External-Access Findings
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.AccessAnalyzer.consumeFindings(
 *       { kind: "external" },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `finding ${event.detail.id} on ${event.detail.resource}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeFindings = (props, process) => consumeBusEvents(props.id ?? "AccessAnalyzerFindings", {
    source: ["aws.access-analyzer"],
    "detail-type": [...DETAIL_TYPES[props.kind ?? "all"]],
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=FindingsEventSource.js.map