import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface EventTrackerProps {
    /**
     * Name of the event tracker. If omitted, a unique name is generated from
     * the app, stage, and logical ID. Changing the name replaces the tracker.
     */
    name?: string;
    /**
     * ARN of the dataset group the event tracker records events for. The
     * dataset group should contain an Interactions dataset (events are recorded
     * into it). Only one event tracker can exist per dataset group. Immutable —
     * changing it replaces the tracker.
     */
    datasetGroupArn: string;
    /**
     * User-defined tags for the event tracker.
     */
    tags?: Record<string, string>;
}
export interface EventTracker extends Resource<"AWS.Personalize.EventTracker", EventTrackerProps, {
    /**
     * ARN of the event tracker.
     */
    eventTrackerArn: string;
    /**
     * The tracking ID passed as `trackingId` to the PutEvents /
     * PutActionInteractions data-plane operations.
     */
    trackingId: string;
    /**
     * Name of the event tracker.
     */
    name: string;
    /**
     * Event tracker status (e.g. `ACTIVE`, `CREATE PENDING`).
     */
    status: string;
    /**
     * ARN of the dataset group the tracker records events for.
     */
    datasetGroupArn: string;
}, never, Providers> {
}
/**
 * An Amazon Personalize event tracker — the ingestion endpoint for streaming
 * interaction events into a dataset group's Interactions dataset. Creating a
 * tracker yields a `trackingId` that the {@link PutEvents} data-plane binding
 * uses to record events in real time.
 *
 * ### Creating an Event Tracker
 * **Example:** Track Events for a Dataset Group
 * ```typescript
 * const tracker = yield* Personalize.EventTracker("Tracker", {
 *   datasetGroupArn: group.datasetGroupArn,
 * });
 * ```
 *
 * ### Streaming Events
 * **Example:** Record Click Events from a Lambda
 * ```typescript
 * // init
 * const putEvents = yield* Personalize.PutEvents(tracker);
 *
 * // runtime
 * yield* putEvents({
 *   sessionId: "session-1",
 *   userId: "user-1",
 *   eventList: [{ eventType: "click", itemId: "item-42", sentAt: new Date() }],
 * });
 * ```
 *
 * @resource
 */
export declare const EventTracker: import("../../Resource.ts").ResourceClass<EventTracker>;
export declare const EventTrackerProvider: () => import("effect/Layer").Layer<Provider.Provider<EventTracker>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=EventTracker.d.ts.map