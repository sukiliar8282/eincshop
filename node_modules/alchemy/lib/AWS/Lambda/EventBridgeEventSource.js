import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import { EventSource as EventBridgeEventSource, matchesEventPattern, } from "../EventBridge/EventSource.js";
import { toLambda as createLambdaRoute } from "../EventBridge/ToLambda.js";
import * as Lambda from "./Function.js";
/**
 * Narrow an arbitrary Lambda invocation payload to an EventBridge event.
 */
export const isEventBridgeEvent = (event) => typeof event?.source === "string" &&
    typeof event?.["detail-type"] === "string";
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
export const EventSource = Layer.effect(EventBridgeEventSource, Effect.gen(function* () {
    const host = yield* Lambda.Function;
    return Effect.fn(function* (descriptor, process) {
        // Deploy-time: create the backing EventBridge rule + Lambda permission
        // targeting this function. Skipped once running inside the deployed
        // Function (the global guard), where the only work is registering the
        // runtime handler below.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* createLambdaRoute(descriptor, host).pipe(Effect.asVoid);
        }
        yield* host.listen(Effect.sync(() => (event) => {
            if (isEventBridgeEvent(event) &&
                matchesEventPattern(descriptor.pattern, event)) {
                return process(Stream.succeed(event)).pipe(Effect.orDie);
            }
        }));
    });
}));
//# sourceMappingURL=EventBridgeEventSource.js.map