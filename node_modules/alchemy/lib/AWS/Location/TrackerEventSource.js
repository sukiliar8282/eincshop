import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "geofence-event": "Location Geofence Event",
    "device-position-event": "Location Device Position Event",
};
/**
 * Event source connecting Amazon Location Service tracking notifications to
 * the hosting compute. Location publishes geofence ENTER/EXIT events (for
 * trackers linked to a geofence collection via {@link TrackerConsumer}) and
 * raw device position updates (for trackers with `eventBridgeEnabled: true`)
 * to the account's default EventBridge bus (source `aws.geo`); this
 * subscribes the host Function to those events.
 *
 * Location publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Tracker Events
 * **Example:** React to Geofence Breaches
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Location.consumeTrackerEvents(
 *       { kinds: ["geofence-event"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `${event.detail.DeviceId} ${event.detail.EventType} ${event.detail.GeofenceId}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeTrackerEvents = (props, process) => consumeBusEvents(props.id ?? "LocationTrackerEvents", {
    source: ["aws.geo"],
    "detail-type": (props.kinds ?? ["geofence-event"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.resourceArns !== undefined
        ? { resources: [...props.resourceArns] }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=TrackerEventSource.js.map