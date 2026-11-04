import * as Layer from "effect/Layer";
import { DeploymentEventSource as AppConfigDeploymentEventSourceContract, type DeploymentEventRecord } from "../AppConfig/DeploymentEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * Narrow an arbitrary Lambda invocation payload to an AppConfig extension
 * deployment notification.
 */
export declare const isAppConfigDeploymentEvent: (event: any) => event is DeploymentEventRecord;
/**
 * Lambda runtime implementation for `AWS.AppConfig.consumeDeploymentEvents(...)`.
 *
 * This layer does two things:
 *
 * 1. At deploy time it provisions an AppConfig {@link Extension} whose
 *    actions invoke the current Lambda function at the subscribed deployment
 *    action points, the IAM role AppConfig assumes to perform the
 *    invocation, and an {@link ExtensionAssociation} attaching the extension
 *    to the target application or environment.
 * 2. At runtime it narrows incoming invocations to AppConfig deployment
 *    notifications for the bound target and forwards them into the supplied
 *    handler as a typed `DeploymentEventRecord` stream.
 * ### Consuming Deployment Events
 * **Example:** Record Completed Deployments
 * ```typescript
 * yield* AppConfig.consumeDeploymentEvents(
 *   env,
 *   { events: ["ON_DEPLOYMENT_COMPLETE"] },
 *   (events) =>
 *     events.pipe(
 *       Stream.runForEach((event) =>
 *         Effect.log(`deployment ${event.DeploymentNumber} completed`),
 *       ),
 *     ),
 * );
 * ```
 *
 * @binding
 */
export declare const AppConfigDeploymentEventSource: Layer.Layer<AppConfigDeploymentEventSourceContract, never, Lambda.Function>;
//# sourceMappingURL=AppConfigDeploymentEventSource.d.ts.map