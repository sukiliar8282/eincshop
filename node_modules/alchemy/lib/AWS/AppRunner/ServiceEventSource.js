import * as Effect from "effect/Effect";
import { consumeBusEvents, } from "../EventBridge/EventSource.js";
/**
 * Deliver App Runner service status changes (`aws.apprunner` /
 * `"AppRunner Service Status Change"` EventBridge events) to the host
 * Function — e.g. to alert when a service unexpectedly leaves `RUNNING`.
 *
 * The EventBridge pattern matches every App Runner service in the account
 * and region (the pattern must be literal — `Output` values such as
 * `service.serviceId` do not resolve inside the deployed bundle); inspect
 * `event.detail.serviceName` / `event.detail.serviceId` in the handler if
 * multiple services share the Function. Provide `AWS.Lambda.EventSource` on
 * the Function effect to implement the subscription.
 *
 * ### Reacting To Status Changes
 * **Example:** Alert when a Service Pauses
 * ```typescript
 * yield* AWS.AppRunner.consumeServiceStatusChanges(
 *   { currentStatus: ["PAUSED"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`${event.detail.serviceName} is paused`),
 *     ),
 * );
 * ```
 */
export const consumeServiceStatusChanges = (props, process) => Effect.gen(function* () {
    const { id, currentStatus, ...routeProps } = props;
    yield* consumeBusEvents(`${id ?? "AppRunner"}-ServiceStatusChanges`, {
        source: ["aws.apprunner"],
        "detail-type": ["AppRunner Service Status Change"],
        ...(currentStatus && currentStatus.length > 0
            ? { detail: { currentStatus } }
            : {}),
    }, routeProps, process);
});
/**
 * Deliver App Runner operation status changes (`aws.apprunner` /
 * `"AppRunner Service Operation Status Change"` EventBridge events) to the
 * host Function — e.g. to notify a chat channel when a deployment completes
 * or fails.
 *
 * The EventBridge pattern matches every App Runner service in the account
 * and region; inspect `event.detail.serviceName` / `event.detail.operationId`
 * in the handler if multiple services share the Function. Provide
 * `AWS.Lambda.EventSource` on the Function effect to implement the
 * subscription.
 *
 * ### Reacting To Deployments
 * **Example:** Alert on Failed Deployments
 * ```typescript
 * yield* AWS.AppRunner.consumeOperationStatusChanges(
 *   { operationStatus: ["DeploymentFailed"] },
 *   (events) =>
 *     Stream.runForEach(events, (event) =>
 *       Effect.log(`deployment failed on ${event.detail.serviceName}`),
 *     ),
 * );
 * ```
 */
export const consumeOperationStatusChanges = (props, process) => Effect.gen(function* () {
    const { id, operationStatus, ...routeProps } = props;
    yield* consumeBusEvents(`${id ?? "AppRunner"}-OperationStatusChanges`, {
        source: ["aws.apprunner"],
        "detail-type": ["AppRunner Service Operation Status Change"],
        ...(operationStatus && operationStatus.length > 0
            ? { detail: { operationStatus } }
            : {}),
    }, routeProps, process);
});
//# sourceMappingURL=ServiceEventSource.js.map