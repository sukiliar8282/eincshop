import * as Effect from "effect/Effect";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { DurableObjectState } from "./DurableObjectState.ts";
export interface ScheduledEvent {
    id: string;
    runAt: Date;
    repeatMs?: number;
    payload: unknown;
}
/**
 * Schedule (or reschedule) a named event on the current Durable Object.
 *
 * The event is persisted in a SQLite table and the DO alarm is set to
 * the earliest pending `runAt`. If an event with the same `id` already
 * exists it is replaced (upsert).
 *
 * @param id      Stable identifier for the event (used for upsert / cancel).
 * @param runAt   When the event should fire.
 * @param payload Arbitrary JSON-serialisable data delivered to the alarm handler.
 * @param repeatMs If set, the event re-schedules itself this many ms after each fire.
 */
export declare const scheduleEvent: (id: string, runAt: Date, payload: unknown, repeatMs?: number | undefined) => Effect.Effect<void, never, DurableObjectState | RuntimeContext>;
/**
 * Cancel a previously scheduled event by id. No-op if the event does not exist.
 */
export declare const cancelEvent: (id: string) => Effect.Effect<void, never, DurableObjectState | RuntimeContext>;
/**
 * List all currently scheduled events, ordered by `runAt` ascending.
 */
export declare const listEvents: Effect.Effect<ScheduledEvent[], never, DurableObjectState | RuntimeContext>;
/**
 * Process all events whose `runAt` <= now. Returns the fired events.
 *
 * - One-shot events are deleted after firing.
 * - Repeating events have their `runAt` bumped by `repeatMs`.
 * - The DO alarm is re-set to the next pending event (if any).
 *
 * Call this from your Durable Object's `alarm` handler:
 *
 * ```ts
 * alarm: () => Effect.gen(function* () {
 *   const fired = yield* Cloudflare.Workers.processScheduledEvents;
 *   for (const event of fired) {
 *     // handle each event
 *   }
 * })
 * ```
 */
export declare const processScheduledEvents: Effect.Effect<ScheduledEvent[], never, DurableObjectState | RuntimeContext>;
//# sourceMappingURL=ScheduledEvents.d.ts.map