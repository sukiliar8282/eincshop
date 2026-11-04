import { consumeBusEvents, } from "../EventBridge/EventSource.js";
const DETAIL_TYPES = {
    "deployment-status": "Greengrass V2 Effective Deployment Status Change",
    "component-status": "Greengrass V2 Installed Component Status Change",
};
/**
 * Event source connecting IoT Greengrass V2 notifications to the hosting
 * compute. Greengrass publishes per-core-device deployment execution status
 * (`SUCCEEDED`, `FAILED`, …) and installed-component lifecycle changes (most
 * importantly a component dropping into `BROKEN`) to the account's default
 * EventBridge bus (source `aws.greengrass`); this subscribes the host
 * Function to those events so it can alert on failed rollouts or broken
 * edge software.
 *
 * Greengrass publishes to EventBridge automatically — no additional resource
 * is created besides the EventBridge rule targeting the host. Provide the
 * host-specific implementation layer (e.g. `AWS.Lambda.EventSource`) on the
 * Function effect.
 *
 * ### Consuming Greengrass Events
 * **Example:** Alert When A Rollout Fails On A Device
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * export default AlertFunction.make(
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     yield* AWS.GreengrassV2.consumeGreengrassEvents(
 *       { kinds: ["deployment-status"] },
 *       (events) =>
 *         Stream.runForEach(events, (event) =>
 *           event.detail.coreDeviceExecutionStatus === "FAILED"
 *             ? Effect.logError(
 *                 `deployment ${event.detail.deploymentId} failed on ${event.detail.coreDeviceThingName}`,
 *               )
 *             : Effect.void,
 *         ),
 *     );
 *     return {};
 *   }).pipe(Effect.provide(AWS.Lambda.EventSource)),
 * );
 * ```
 */
export const consumeGreengrassEvents = (props, process) => consumeBusEvents(props.id ?? "GreengrassEvents", {
    source: ["aws.greengrass"],
    "detail-type": (props.kinds ?? ["deployment-status"]).map((kind) => DETAIL_TYPES[kind]),
}, { description: props.description, state: props.state }, process);
//# sourceMappingURL=GreengrassEventSource.js.map