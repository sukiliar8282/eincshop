import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Event source connecting AWS Control Tower lifecycle events to the hosting
 * compute. Control Tower publishes every completed lifecycle action —
 * account provisioning (`CreateManagedAccount`), guardrail changes
 * (`EnableGuardrail`), landing zone setup/upgrade (`SetupLandingZone`,
 * `UpdateLandingZone`), and OU registration — to the management account's
 * default EventBridge bus in the home region (source `aws.controltower`);
 * this subscribes the host Function to those events so it can trigger
 * account-customization or notification automation.
 *
 * Control Tower publishes to EventBridge automatically — no additional
 * resource is created besides the EventBridge rule targeting the host.
 * Provide the host-specific implementation layer (e.g.
 * `AWS.Lambda.EventSource`) on the Function effect.
 *
 * ### Consuming Lifecycle Events
 * **Example:** Customize Newly Provisioned Accounts
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default OnboardFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.ControlTower.consumeLifecycleEvents(
 *       { events: ["CreateManagedAccount"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           Effect.log(
 *             `account provisioned: ${JSON.stringify(
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
export const consumeLifecycleEvents = (props, process) => consumeBusEvents(props.id ?? "ControlTowerLifecycleEvents", {
    source: ["aws.controltower"],
    "detail-type": ["AWS Service Event via CloudTrail"],
    ...(props.events === undefined
        ? {}
        : { detail: { eventName: [...props.events] } }),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=LifecycleEventSource.js.map