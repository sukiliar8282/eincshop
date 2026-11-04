import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting X-Ray insight notifications to the hosting
 * compute. When an X-Ray group has insights and notifications enabled
 * (`Group({ insightsEnabled: true, notificationsEnabled: true })`), X-Ray
 * publishes insight lifecycle updates to the account's default EventBridge
 * bus (source `aws.xray`, detail-type `AWS X-Ray Insight Update`); this
 * subscribes the host Function to those events so it can page, annotate
 * incidents, or drive remediation.
 *
 * X-Ray publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Insight Events
 * **Example:** Alert on Active Insights
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.XRay.consumeInsightEvents(
 *       { states: ["ACTIVE"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `X-Ray insight ${event.detail.InsightId}: ${event.detail.Summary}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeInsightEvents = (props, process) => consumeBusEvents(props.id ?? "XRayInsightEvents", {
    source: ["aws.xray"],
    "detail-type": ["AWS X-Ray Insight Update"],
    ...(props.groupNames !== undefined || props.states !== undefined
        ? {
            detail: {
                ...(props.groupNames !== undefined
                    ? { GroupName: [...props.groupNames] }
                    : {}),
                ...(props.states !== undefined
                    ? { State: [...props.states] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=InsightEventSource.js.map