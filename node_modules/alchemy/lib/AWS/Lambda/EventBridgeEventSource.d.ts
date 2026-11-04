import type * as lambda from "aws-lambda";
import * as Layer from "effect/Layer";
import { EventSource as EventBridgeEventSource } from "../EventBridge/EventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * Narrow an arbitrary Lambda invocation payload to an EventBridge event.
 */
export declare const isEventBridgeEvent: (event: any) => event is lambda.EventBridgeEvent<string, any>;
/**
 * Lambda runtime implementation for `AWS.EventBridge.consumeBusEvents(...)`.
 *
 * This layer does two things:
 *
 * 1. It delegates to `EventSourcePolicy` so deployment creates an EventBridge
 *    rule targeting the current Lambda function.
 * 2. At runtime it filters incoming Lambda events against the original event
 *    pattern and forwards matching events into the supplied `Stream`.
 * ### Subscribing To The Default Bus
 * **Example:** Match User Events On The Default Bus
 * ```typescript
 * yield* AWS.EventBridge.consumeBusEvents(
 *   {
 *     source: ["app.user"],
 *     "detail-type": ["UserCreated"],
 *   },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`new user: ${event.detail.userId}`),
 *     ),
 * );
 * ```
 *
 * ### Subscribing To A Custom Bus
 * **Example:** Match Orders On A Named Bus
 * ```typescript
 * const bus = yield* AWS.EventBridge.EventBus("OrdersBus", {
 *   name: "orders",
 * });
 *
 * yield* AWS.EventBridge.consumeBusEvents(
 *   bus,
 *   {
 *     source: ["app.orders"],
 *     "detail-type": ["OrderPaid"],
 *   },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`paid order: ${event.detail.orderId}`),
 *     ),
 * );
 * ```
 *
 * ### Explicit Route Names
 * **Example:** Name The Backing Rule Deterministically
 * ```typescript
 * yield* AWS.EventBridge.consumeBusEvents(
 *   "InvoiceEvents",
 *   {
 *     source: ["app.billing"],
 *     "detail-type": ["InvoiceIssued"],
 *   },
 *   {
 *     description: "Deliver invoice events into this Lambda function",
 *   },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`invoice: ${event.detail.invoiceId}`),
 *     ),
 * );
 * ```
 *
 * ### Processing Typed Details
 * **Example:** Narrow The Event Detail Payload
 * ```typescript
 * type UserCreated = {
 *   userId: string;
 *   email: string;
 * };
 *
 * yield* AWS.EventBridge.consumeBusEvents(
 *   {
 *     source: ["app.user"],
 *     "detail-type": ["UserCreated"],
 *   },
 *   (events) =>
 *     Stream.runForEach(
 *       events as Stream.Stream<AWS.EventBridge.EventRecord<UserCreated>>,
 *       (event) => Effect.log(`welcome ${event.detail.email}`),
 *     ),
 * );
 * ```
 *
 * @binding
 */
export declare const EventSource: Layer.Layer<EventBridgeEventSource, never, Lambda.Function>;
//# sourceMappingURL=EventBridgeEventSource.d.ts.map