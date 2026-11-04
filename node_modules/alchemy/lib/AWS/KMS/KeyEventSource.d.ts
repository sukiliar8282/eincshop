import type * as Effect from "effect/Effect";
import type * as Stream from "effect/Stream";
import { type EventRecord, type EventRouteProps } from "../EventBridge/EventSource.ts";
/**
 * The `detail` payload AWS KMS delivers to EventBridge. Rotation and
 * deletion events carry the affected key's id; fields not shared by every
 * event kind are optional (the schema grows over time).
 */
export interface KeyEventDetail {
    /** The id of the KMS key the event is about. */
    "key-id"?: string;
    /** Deletion events: when the key material was destroyed. */
    "deletion-time"?: string;
    /** Rotation events: when the key material was rotated. */
    "rotation-time"?: string;
    /** Imported key material expiration events: when the material expired. */
    "expiration-time"?: string;
    /** Additional event fields (the schema grows over time). */
    [key: string]: unknown;
}
/** A KMS EventBridge event delivered to the handler. */
export type KeyEvent = EventRecord<KeyEventDetail>;
/** Which KMS notifications to subscribe to. */
export type KeyEventKind = "rotation" | "deletion" | "imported-key-material-expiration";
export interface KeyEventSourceProps extends EventRouteProps {
    /**
     * Logical id for the backing EventBridge rule.
     * @default "KMSKeyEvents"
     */
    id?: string;
    /**
     * Which notifications to subscribe to: automatic key-material rotations,
     * completed key deletions (the end of the pending-deletion window), and/or
     * imported key material expirations.
     * @default all three kinds
     */
    kinds?: readonly KeyEventKind[];
    /**
     * Restrict to events about specific KMS keys (matched against the event's
     * top-level `resources`, which contains the key's ARN).
     */
    keyArns?: readonly string[];
}
/**
 * Event source connecting AWS KMS notifications to the hosting compute. KMS
 * publishes key-material rotations, completed key deletions (the moment the
 * pending-deletion window elapses and the material is destroyed), and
 * imported key material expirations to the account's default EventBridge bus
 * (source `aws.kms`); this subscribes the host Function to those events so
 * it can audit rotations or react before/when a key becomes unusable.
 *
 * KMS publishes to EventBridge automatically — no additional resource is
 * created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Key Events
 * **Example:** Audit Rotations and Deletions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AuditFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.KMS.consumeKeyEvents(
 *       { kinds: ["rotation", "deletion"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.logInfo(
 *             `${event["detail-type"]}: ${event.detail["key-id"]}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export declare const consumeKeyEvents: <StreamReq = never, Req = never>(props: KeyEventSourceProps, process: (events: Stream.Stream<KeyEvent, never, StreamReq>) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, import("../EventBridge/EventSource.ts").EventSource>;
//# sourceMappingURL=KeyEventSource.d.ts.map