import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS RAM resource-sharing events to the hosting
 * compute. RAM publishes `Resource Sharing State Change` events (source
 * `aws.ram`) to the default EventBridge bus in near-real time — for both the
 * share owner and the principals granted access — whenever a resource share
 * changes state; this subscribes the host Function to those events so it can
 * drive invitation-acceptance or failure-alerting automation.
 *
 * RAM publishes to EventBridge automatically (best effort — events can be
 * dropped) — no additional resource is created besides the EventBridge rule
 * targeting the host. Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Resource Sharing Events
 * **Example:** Alert on Resource Share Failures
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default SharingMonitor.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.RAM.consumeResourceShareEvents(
 *       { events: ["Resource Share Association"], statuses: ["failed"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(`sharing failed: ${JSON.stringify(event.detail)}`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeResourceShareEvents = (props, process) => consumeBusEvents(props.id ?? "ResourceShareEvents", {
    source: ["aws.ram"],
    "detail-type": ["Resource Sharing State Change"],
    ...(props.events !== undefined || props.statuses !== undefined
        ? {
            detail: {
                ...(props.events !== undefined
                    ? { event: [...props.events] }
                    : {}),
                ...(props.statuses !== undefined
                    ? { status: [...props.statuses] }
                    : {}),
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=ResourceShareEventSource.js.map