import type * as Effect from "effect/Effect";
import type * as Stream from "effect/Stream";
import { type EventRecord, type EventRouteProps } from "../EventBridge/EventSource.ts";
/**
 * The `detail` payload ElastiCache delivers to EventBridge. The schema is
 * loosely specified and differs slightly per event kind, so every field is
 * optional (the schema grows over time).
 */
export interface CacheEventDetail {
    /** Human-readable description of what happened. */
    message?: string;
    /** Additional event fields (the schema grows over time). */
    [key: string]: unknown;
}
/** An ElastiCache EventBridge event delivered to the handler. */
export type CacheEvent = EventRecord<CacheEventDetail>;
/**
 * Which ElastiCache notifications to subscribe to. Each kind maps to one of
 * the detail-types ElastiCache publishes to the account's default bus.
 */
export type CacheEventKind = "cache-created" | "cache-creation-failed" | "cache-updated" | "cache-update-failed" | "cache-deleted" | "cache-limit-approaching" | "snapshot-created" | "snapshot-creation-failed" | "snapshot-copy-failed" | "snapshot-export-failed";
export interface CacheEventSourceProps extends EventRouteProps {
    /**
     * Logical id for the backing EventBridge rule.
     * @default "ElastiCacheEvents"
     */
    id?: string;
    /**
     * Which notifications to subscribe to.
     * @default all ElastiCache detail-types
     */
    kinds?: readonly CacheEventKind[];
    /**
     * Restrict to events about specific caches or snapshots (matched against
     * the event's top-level `resources`, which carries the resource ARNs).
     */
    resourceArns?: readonly string[];
}
/**
 * Event source connecting ElastiCache notifications to the hosting compute.
 * ElastiCache publishes cache and snapshot lifecycle events — creations,
 * updates, deletions, failures, approaching usage limits — to the account's
 * default EventBridge bus (source `aws.elasticache`); this subscribes the
 * host Function to those events so it can alert on failed snapshots or a
 * cache nearing its usage limits.
 *
 * ElastiCache publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Cache Events
 * **Example:** Alert When a Cache Approaches Its Usage Limit
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.ElastiCache.consumeCacheEvents(
 *       { kinds: ["cache-limit-approaching", "snapshot-creation-failed"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logError(
 *             `${event["detail-type"]}: ${event.resources.join(", ")}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export declare const consumeCacheEvents: <StreamReq = never, Req = never>(props: CacheEventSourceProps, process: (events: Stream.Stream<CacheEvent, never, StreamReq>) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, import("../EventBridge/EventSource.ts").EventSource>;
//# sourceMappingURL=CacheEventSource.d.ts.map