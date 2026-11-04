import * as Effect from "effect/Effect";
import type { Function as LambdaFunction } from "../Lambda/Function.ts";
import type { EventBus } from "./EventBus.ts";
import { Rule, type RuleProps, type RuleTarget } from "./Rule.ts";
interface EventDescriptor {
    id?: string;
    bus?: EventBus;
    pattern: Record<string, any>;
    props?: Pick<RuleProps, "description" | "state">;
}
export interface LambdaRouteTargetProps extends Pick<RuleTarget, "Input" | "InputPath" | "InputTransformer" | "RetryPolicy" | "DeadLetterConfig"> {
}
/**
 * Routes matching events from an EventBridge bus to a Lambda function.
 *
 * Creates a {@link Rule} targeting the function and a Lambda permission
 * allowing `events.amazonaws.com` to invoke it. Usually reached through the
 * `events(...)` builder rather than called directly.
 * **Example:** Route Matching Events to a Lambda Function
 * ```typescript
 * yield* AWS.EventBridge.events(bus, { source: ["my.app"] }).toLambda(fn);
 * ```
 *
 * **Example:** Transform the Event Payload Before Invoking
 * ```typescript
 * yield* AWS.EventBridge.events(bus, { source: ["my.app"] }).toLambda(fn, {
 *   InputTransformer: {
 *     InputPathsMap: { orderId: "$.detail.orderId" },
 *     InputTemplate: '{"orderId": <orderId>}',
 *   },
 * });
 * ```
 *
 * @binding
 */
export declare const toLambda: (descriptor: EventDescriptor, fn: LambdaFunction, props?: LambdaRouteTargetProps) => Effect.Effect<Rule, never, import("../Providers.ts").Providers>;
export {};
//# sourceMappingURL=ToLambda.d.ts.map