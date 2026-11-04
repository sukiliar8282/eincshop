import type * as Effect from "effect/Effect";
import type * as Stream from "effect/Stream";
import { type EventRecord, type EventRouteProps } from "../EventBridge/EventSource.ts";
/**
 * The `detail` payload DMS delivers to EventBridge when a replication
 * instance or replication task changes state (source `aws.dms`). Fields not
 * shared by every event kind are optional (the schema grows over time).
 */
export interface DmsReplicationEventDetail {
    /** The DMS event categories, e.g. `["failure"]`, `["state change"]`. */
    category?: string;
    /** The DMS event id, e.g. `DMS-EVENT-0079`. */
    eventId?: string;
    /** The event message, e.g. `Replication task has stopped.`. */
    eventMessage?: string;
    /** Human-readable event type, e.g. `REPLICATION_TASK_STOPPED`. */
    eventType?: string;
    /** The source identifier (instance or task identifier). */
    sourceId?: string;
    /** Additional event fields (the schema grows over time). */
    [key: string]: unknown;
}
/** A DMS EventBridge event delivered to the handler. */
export type DmsReplicationEvent = EventRecord<DmsReplicationEventDetail>;
/** Which DMS state-change events to subscribe to. */
export type DmsReplicationEventKind = "instance-state" | "task-state";
export interface ReplicationEventSourceProps extends EventRouteProps {
    /**
     * Logical id for the backing EventBridge rule.
     * @default "DmsReplicationEvents"
     */
    id?: string;
    /**
     * Which state-change events to subscribe to.
     * @default all kinds
     */
    kinds?: readonly DmsReplicationEventKind[];
}
/**
 * Event source connecting DMS replication state changes to the hosting
 * compute. DMS publishes replication instance and replication task state
 * changes (creation, failover, failure, task stop/start) to the account's
 * default EventBridge bus (source `aws.dms`); this subscribes the host
 * Function to those events so it can alert on failures or chain
 * post-migration automation.
 *
 * DMS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Replication Events
 * **Example:** Alert On Task Failures
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.DMS.consumeReplicationEvents(
 *       { kinds: ["task-state"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.category === "failure"
 *             ? Effect.log(`DMS task ${event.detail.sourceId} failed`)
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export declare const consumeReplicationEvents: <StreamReq = never, Req = never>(props: ReplicationEventSourceProps, process: (events: Stream.Stream<DmsReplicationEvent, never, StreamReq>) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, import("../EventBridge/EventSource.ts").EventSource>;
//# sourceMappingURL=ReplicationEventSource.d.ts.map