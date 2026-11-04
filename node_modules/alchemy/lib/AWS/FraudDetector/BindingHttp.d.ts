import * as Effect from "effect/Effect";
import type { Detector } from "./Detector.ts";
import type { EventType } from "./EventType.ts";
import type { List } from "./List.ts";
/**
 * Shared scaffolding for Amazon Fraud Detector HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for a Fraud Detector operation scoped to a
 * {@link Detector}: the deploy-time half grants `actions` on the bound
 * detector's ARN, and the runtime half injects the detector's `detectorId`
 * into every request.
 */
export declare const makeFraudDetectorDetectorHttpBinding: <I extends {
    detectorId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.FraudDetector.GetEventPrediction`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the detector ARN. */
    actions: readonly string[];
}) => Effect.Effect<(detector: Detector) => Effect.Effect<(request: Omit<I, "detectorId">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a Fraud Detector event data-plane operation
 * scoped to an {@link EventType} (`SendEvent`, `GetEvent`, `DeleteEvent`,
 * `UpdateEventLabel`): the deploy-time half grants `actions` on the bound
 * event type's ARN, and the runtime half injects the event type's
 * `eventTypeName` into every request.
 */
/**
 * Build the impl Effect for a Fraud Detector list data-plane operation scoped
 * to a {@link List} (`GetListElements`, `UpdateList`): the deploy-time half
 * grants `actions` on the bound list's ARN, and the runtime half injects the
 * list's `name` into every request.
 */
export declare const makeFraudDetectorListHttpBinding: <I extends {
    name: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.FraudDetector.GetListElements`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the list ARN. */
    actions: readonly string[];
}) => Effect.Effect<(list: List) => Effect.Effect<(request: Omit<I, "name">) => Effect.Effect<A, E, never>, never, never>, never, R>;
export declare const makeFraudDetectorEventTypeHttpBinding: <I extends {
    eventTypeName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.FraudDetector.SendEvent`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the event type ARN. */
    actions: readonly string[];
}) => Effect.Effect<(eventType: EventType) => Effect.Effect<(request: Omit<I, "eventTypeName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map