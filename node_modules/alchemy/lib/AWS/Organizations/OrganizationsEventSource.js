import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS Organizations events to the hosting compute.
 * Organizations publishes CloudTrail-backed events — asynchronous
 * account-creation outcomes (`CreateAccountResult`) and every management
 * operation (account moves, OU changes, policy attachments, handshake
 * responses) — to the **management account's** default EventBridge bus in
 * **us-east-1** (source `aws.organizations`); this subscribes the host
 * Function to those events so it can drive account-vending, baseline, or
 * compliance automation.
 *
 * Organizations publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host. The
 * rule must be deployed in us-east-1 of the management account to receive
 * events. Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Organization Events
 * **Example:** React to Completed Account Creations
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default VendingFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.Organizations.consumeOrganizationsEvents(
 *       { events: ["CreateAccountResult"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `account creation: ${JSON.stringify(
 *               event.detail.serviceEventDetails,
 *             )}`,
 *           ),
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeOrganizationsEvents = (props, process) => consumeBusEvents(props.id ?? "OrganizationsEvents", {
    source: ["aws.organizations"],
    ...(props.events !== undefined
        ? { detail: { eventName: [...props.events] } }
        : {}),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=OrganizationsEventSource.js.map