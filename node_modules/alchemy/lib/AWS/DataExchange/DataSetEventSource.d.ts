import type * as Effect from "effect/Effect";
import type * as Stream from "effect/Stream";
import { type EventRecord, type EventRouteProps } from "../EventBridge/EventSource.ts";
/**
 * The `detail` payload AWS Data Exchange delivers to EventBridge. Revision
 * events carry the published/revoked `RevisionIds`; product events carry
 * `DataSetIds`; provider-generated notifications carry the notification
 * comment and scope. Fields not shared by every event kind are optional
 * (the schema grows over time).
 */
export interface DataSetEventDetail {
    /** Revision events: the revisions that were published or revoked. */
    RevisionIds?: string[];
    /** Product events: the data sets that were added to or removed from a product. */
    DataSetIds?: string[];
    /** Revocation events: the provider's revocation comment. */
    RevocationComment?: string;
    /** Additional event fields (the schema grows over time). */
    [key: string]: unknown;
}
/** An AWS Data Exchange EventBridge event delivered to the handler. */
export type DataSetEvent = EventRecord<DataSetEventDetail>;
/**
 * Which AWS Data Exchange notifications to subscribe to. Each kind maps to
 * one documented EventBridge detail-type (source `aws.dataexchange`).
 */
export type DataSetEventKind = "revision-published" | "revision-revoked" | "data-sets-published-to-product" | "data-set-removed-from-product" | "update-delayed" | "data-updated" | "deprecation-planned" | "schema-change-planned" | "auto-export-completed" | "auto-export-failed" | "data-grant-accepted" | "data-grant-extended" | "data-grant-revoked";
export interface DataSetEventSourceProps extends EventRouteProps {
    /**
     * Logical id for the backing EventBridge rule.
     * @default "DataExchangeEvents"
     */
    id?: string;
    /**
     * Which notifications to subscribe to. Data Exchange publishes provider
     * events (new revisions, revocations, product changes), provider-generated
     * notifications (data updated/delayed, schema change, deprecation),
     * auto-export job outcomes, and data grant lifecycle events.
     * @default ["revision-published"]
     */
    kinds?: readonly DataSetEventKind[];
    /**
     * Raw EventBridge detail-types to subscribe to in addition to `kinds` —
     * the escape hatch for the long tail of asset-type-specific detail-types
     * (Redshift datashare, API Gateway API, S3 data access, Lake Formation).
     */
    detailTypes?: readonly string[];
    /**
     * Restrict to events about specific data sets (matched against the
     * event's top-level `resources`, which carries the data set id).
     */
    dataSetIds?: readonly string[];
}
/**
 * Event source connecting AWS Data Exchange notifications to the hosting
 * compute. Data Exchange publishes subscriber-facing events to the
 * account's default EventBridge bus (source `aws.dataexchange`) — most
 * importantly `Revision Published To Data Set` when a provider publishes
 * fresh data to an entitled data set — and this subscribes the host
 * Function to those events so it can trigger export jobs or downstream
 * pipelines the moment new data arrives.
 *
 * Data Exchange publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Data Exchange Events
 * **Example:** Process Newly Published Revisions
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default IngestFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.DataExchange.consumeDataSetEvents(
 *       { kinds: ["revision-published", "revision-revoked"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `${event["detail-type"]}: revisions ${event.detail.RevisionIds}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export declare const consumeDataSetEvents: <StreamReq = never, Req = never>(props: DataSetEventSourceProps, process: (events: Stream.Stream<DataSetEvent, never, StreamReq>) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, import("../EventBridge/EventSource.ts").EventSource>;
//# sourceMappingURL=DataSetEventSource.d.ts.map