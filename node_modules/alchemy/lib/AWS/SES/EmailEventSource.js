import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    send: "Email Sent",
    reject: "Email Rejected",
    delivery: "Email Delivered",
    "delivery-delay": "Email Delivery Delayed",
    bounce: "Email Bounced",
    complaint: "Email Complaint Received",
    open: "Email Opened",
    click: "Email Clicked",
    "rendering-failure": "Email Rendering Failed",
    subscription: "Email Subscription",
};
/**
 * Event source connecting SES email sending events to the hosting compute.
 * SES publishes send/delivery/bounce/complaint (and open/click) events to
 * the account's default EventBridge bus (source `aws.ses`) for every
 * configuration set that has an EventBridge event destination; this
 * subscribes the host Function to those events so it can suppress bouncing
 * addresses, update subscriber state, or alert on complaints.
 *
 * Events only flow for messages sent through a `ConfigurationSet` that has
 * a `ConfigurationSetEventDestination` with an `eventBridgeDestination`
 * (the default bus). Provide the host-specific implementation layer
 * (e.g. `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Email Events
 * **Example:** Suppress Hard-Bouncing Addresses
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default FeedbackFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.SES.consumeEmailEvents(
 *       { kinds: ["bounce", "complaint"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(`${event["detail-type"]}: ${event.detail.mail?.messageId}`),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeEmailEvents = (props, process) => consumeBusEvents(props.id ?? "SESEmailEvents", {
    source: ["aws.ses"],
    "detail-type": (props.kinds ?? ["bounce", "complaint"]).map((kind) => DETAIL_TYPES[kind]),
    ...(props.configurationSets !== undefined
        ? {
            detail: {
                mail: {
                    tags: {
                        "ses:configuration-set": [...props.configurationSets],
                    },
                },
            },
        }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=EmailEventSource.js.map