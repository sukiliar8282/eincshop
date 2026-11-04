import { createHash } from "node:crypto";
import * as Effect from "effect/Effect";
import { Rule } from "./Rule.js";
/**
 * Routes matching events from an EventBridge bus to an SQS queue.
 *
 * Creates a {@link Rule} targeting the queue and binds a queue policy that
 * allows `events.amazonaws.com` to send messages from that rule. Usually
 * reached through the `events(...)` builder rather than called directly.
 * **Example:** Route Matching Events to an SQS Queue
 * ```typescript
 * yield* AWS.EventBridge.events(bus, { source: ["my.app"] }).toQueue(queue);
 * ```
 *
 * @binding
 */
export const toQueue = (descriptor, queue, props = {}) => Effect.gen(function* () {
    const routeId = descriptor.id ?? createRouteId(descriptor, `${queue.LogicalId}Queue`);
    const rule = yield* Rule(routeId, {
        description: descriptor.props?.description,
        state: descriptor.props?.state,
        eventBusName: descriptor.bus?.eventBusName,
        eventPattern: descriptor.pattern,
        targets: [
            {
                Id: `${queue.LogicalId}Target`,
                Arn: queue.queueArn,
                Input: props.Input,
                InputPath: props.InputPath,
                InputTransformer: props.InputTransformer,
                RetryPolicy: props.RetryPolicy,
                DeadLetterConfig: props.DeadLetterConfig,
                SqsParameters: props.sqsParameters,
            },
        ],
    });
    if (!globalThis.__ALCHEMY_RUNTIME__) {
        yield* queue.bind `Allow(${rule}, AWS.EventBridge.toQueue(${queue}))`({
            policyStatements: [
                {
                    Effect: "Allow",
                    Principal: {
                        Service: "events.amazonaws.com",
                    },
                    Action: ["sqs:SendMessage"],
                    Resource: [queue.queueArn],
                    Condition: {
                        ArnEquals: {
                            "aws:SourceArn": [rule.ruleArn],
                        },
                    },
                },
            ],
        });
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
//# sourceMappingURL=ToQueue.js.map