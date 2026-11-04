import type * as Effect from "effect/Effect";
import type * as Stream from "effect/Stream";
import { type EventRecord, type EventRouteProps } from "../EventBridge/EventSource.ts";
/**
 * The `detail` payload Amazon Translate delivers to EventBridge when a
 * batch translation job changes state
 * (`Translate TextTranslationJob State Change`).
 */
export interface TranslationJobEventDetail {
    /** Id of the batch translation job. */
    jobId?: string;
    /** The job's new status, e.g. `COMPLETED`, `FAILED`, `STOPPED`. */
    jobStatus?: string;
    /** Additional event fields (the schema grows over time). */
    [key: string]: unknown;
}
/** A Translate batch-translation-job EventBridge event delivered to the handler. */
export type TranslationJobEvent = EventRecord<TranslationJobEventDetail>;
export interface TranslationJobEventSourceProps extends EventRouteProps {
    /**
     * Logical id for the backing EventBridge rule.
     * @default "TranslateTranslationJobEvents"
     */
    id?: string;
    /**
     * Only deliver events with these `detail.jobStatus` values (e.g.
     * `["COMPLETED", "FAILED"]`).
     * @default all statuses
     */
    statuses?: readonly string[];
}
/**
 * Event source connecting Amazon Translate batch translation job state
 * changes to the hosting compute. Translate publishes every job state
 * transition (`Translate TextTranslationJob State Change`, source
 * `aws.translate`) to the account's default EventBridge bus; this
 * subscribes the host Function to those events so it can chain
 * post-translation automation or alert on `FAILED` jobs.
 *
 * Translate publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Job Events
 * **Example:** React to finished batch translation jobs
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default TranslationReactor.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Translate.consumeTranslationJobEvents(
 *       { statuses: ["COMPLETED", "FAILED"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(`job ${event.detail.jobId}: ${event.detail.jobStatus}`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export declare const consumeTranslationJobEvents: <StreamReq = never, Req = never>(props: TranslationJobEventSourceProps, process: (events: Stream.Stream<TranslationJobEvent, never, StreamReq>) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, import("../EventBridge/EventSource.ts").EventSource>;
//# sourceMappingURL=TranslationJobEventSource.d.ts.map