import * as Effect from "effect/Effect";
import { consumeBusEvents, } from "../EventBridge/EventSource.js";
import { EventIntegration } from "./EventIntegration.js";
/**
 * Consume partner events on the host Function through an AppIntegrations
 * {@link EventIntegration}. Creates the event integration (the metadata that
 * connects the partner source to the EventBridge bus) and subscribes the
 * host Function to the matching events via an EventBridge rule.
 *
 * Returns the created {@link EventIntegration} so it can be passed to other
 * bindings (e.g. `ListEventIntegrationAssociations`).
 *
 * ### Consuming Integration Events
 * **Example:** Consume Partner Events on a Lambda Function
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 * import { consumeIntegrationEvents } from "alchemy/AWS/AppIntegrations";
 *
 * // init — creates the EventIntegration + EventBridge rule and registers
 * // the runtime handler (provide AWS.Lambda.EventSource on the Function)
 * const integration = yield* consumeIntegrationEvents(
 *   "PartnerEvents",
 *   { source: "aws.partner/examplepartner.com" },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(event["detail-type"], event.detail),
 *     ),
 * );
 * ```
 *
 * **Example:** Narrow by Detail Type on a Custom Bus
 * ```typescript
 * const bus = yield* AWS.EventBridge.EventBus("PartnerBus");
 * yield* consumeIntegrationEvents(
 *   "PartnerEvents",
 *   {
 *     source: "aws.partner/examplepartner.com",
 *     bus,
 *     detailType: ["OrderCreated"],
 *   },
 *   (events) => Stream.runForEach(events, handleOrder),
 * );
 * ```
 */
export const consumeIntegrationEvents = (id, props, process) => Effect.gen(function* () {
    // Persist the integration metadata connecting the partner source to the
    // EventBridge bus.
    const integration = yield* EventIntegration(id, {
        name: props.name,
        description: props.description,
        source: props.source,
        eventBridgeBus: props.bus ? props.bus.eventBusName : "default",
        tags: props.tags,
    });
    // Subscribe the host Function to the matching partner events. The
    // pattern uses only literal values so it round-trips through both the
    // deploy-time rule and the runtime matcher.
    const pattern = {
        source: [props.source],
        ...(props.detailType ? { "detail-type": props.detailType } : {}),
    };
    yield* props.bus
        ? consumeBusEvents(`${id}-Events`, props.bus, pattern, props.rule, process)
        : consumeBusEvents(`${id}-Events`, pattern, props.rule, process);
    return integration;
});
//# sourceMappingURL=EventIntegrationEventSource.js.map