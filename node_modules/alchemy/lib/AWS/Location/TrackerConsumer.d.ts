import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TrackerConsumerProps {
    /**
     * Name of the tracker whose device position updates are consumed.
     * Changing it replaces the association.
     */
    trackerName: string;
    /**
     * ARN of the geofence collection that consumes the tracker's position
     * updates (evaluating them against its geofences). Changing it replaces
     * the association.
     */
    consumerArn: string;
}
export interface TrackerConsumer extends Resource<"AWS.Location.TrackerConsumer", TrackerConsumerProps, {
    /** Name of the tracker. */
    trackerName: string;
    /** ARN of the consuming geofence collection. */
    consumerArn: string;
}, never, Providers> {
}
/**
 * Links an Amazon Location {@link Tracker} to a {@link GeofenceCollection}
 * so every device position uploaded to the tracker is automatically
 * evaluated against the collection's geofences, emitting ENTER/EXIT events
 * (delivered to EventBridge — see `consumeTrackerEvents`).
 *
 * The association is existence-only: both properties are immutable and any
 * change replaces it.
 *
 * ### Linking Trackers to Geofence Collections
 * **Example:** Evaluate Tracker Positions Against a Collection
 * ```typescript
 * import * as Location from "alchemy/AWS/Location";
 *
 * const tracker = yield* Location.Tracker("Fleet", {
 *   eventBridgeEnabled: true,
 * });
 * const fences = yield* Location.GeofenceCollection("Zones", {});
 *
 * const link = yield* Location.TrackerConsumer("FleetZones", {
 *   trackerName: tracker.trackerName,
 *   consumerArn: fences.collectionArn,
 * });
 * ```
 *
 * @resource
 */
export declare const TrackerConsumer: import("../../Resource.ts").ResourceClass<TrackerConsumer>;
export declare const TrackerConsumerProvider: () => import("effect/Layer").Layer<Provider.Provider<TrackerConsumer>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=TrackerConsumer.d.ts.map