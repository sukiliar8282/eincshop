import * as Effect from "effect/Effect";
import { createHash } from "node:crypto";
import { Permission as LambdaPermission } from "../Lambda/Permission.js";
import { Rule } from "./Rule.js";
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
export const toLambda = (descriptor, fn, props = {}) => Effect.gen(function* () {
    const routeId = descriptor.id ?? createRouteId(descriptor, `${fn.LogicalId}Lambda`);
    const rule = yield* Rule(routeId, {
        description: descriptor.props?.description,
        state: descriptor.props?.state,
        eventBusName: descriptor.bus?.eventBusName,
        eventPattern: descriptor.pattern,
        targets: [
            {
                Id: `${fn.LogicalId}Target`,
                Arn: fn.functionArn,
                Input: props.Input,
                InputPath: props.InputPath,
                InputTransformer: props.InputTransformer,
                RetryPolicy: props.RetryPolicy,
                DeadLetterConfig: props.DeadLetterConfig,
            },
        ],
    });
    // Deploy-time: grant EventBridge permission to invoke the Lambda. Skipped
    // once running inside the deployed Function by the global guard. The
    // permission is explicitly named, so no Namespace.push is required.
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        yield* LambdaPermission(`${routeId}${fn.LogicalId}InvokePermission`, {
            action: "lambda:InvokeFunction",
            functionName: fn.functionName,
            principal: "events.amazonaws.com",
            sourceArn: rule.ruleArn,
        }).pipe(Effect.asVoid);
    }
    return rule;
});
const createRouteId = (descriptor, suffix) => `EventBridge${createHash("sha1")
    .update(JSON.stringify({
    bus: descriptor.bus?.LogicalId ?? "default",
    pattern: descriptor.pattern,
    suffix,
}))
    .digest("hex")
    .slice(0, 10)}`;
//# sourceMappingURL=ToLambda.js.map