import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting Amazon CloudWatch Internet Monitor health events
 * to the hosting compute. When a monitor detects an availability or
 * performance issue between your application and your users' city-networks,
 * Internet Monitor publishes a health event to the account's default
 * EventBridge bus (source `aws.internetmonitor`); this subscribes the host
 * Function to those events so it can page, reroute traffic, or annotate
 * incidents.
 *
 * Internet Monitor publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Health Events
 * **Example:** Page on Availability Drops
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const monitor = yield* AWS.InternetMonitor.Monitor("AppMonitor", {
 *       resources: [vpcArn],
 *       maxCityNetworksToMonitor: 100,
 *     });
 *
 *     yield* AWS.InternetMonitor.consumeHealthEvents(
 *       { monitorArns: [monitor.monitorArn], impactTypes: ["AVAILABILITY"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `Internet Monitor health event: ${event.detail.summary}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeHealthEvents = (props, process) => {
    const detail = {
        ...(props.impactTypes !== undefined
            ? { impactType: [...props.impactTypes] }
            : {}),
        ...(props.statuses !== undefined ? { status: [...props.statuses] } : {}),
    };
    return consumeBusEvents(props.id ?? "InternetMonitorHealthEvents", {
        source: ["aws.internetmonitor"],
        "detail-type": ["Internet Monitor Health Event"],
        ...(props.monitorArns !== undefined
            ? { resources: [...props.monitorArns] }
            : {}),
        ...(Object.keys(detail).length > 0 ? { detail } : {}),
    }, { description: props.description, state: props.state }, process);
};
//# sourceMappingURL=HealthEventSource.js.map