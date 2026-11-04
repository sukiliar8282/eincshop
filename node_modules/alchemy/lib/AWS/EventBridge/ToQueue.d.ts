import * as Effect from "effect/Effect";
import type { Queue } from "../SQS/Queue.ts";
import type { EventBus } from "./EventBus.ts";
import { Rule, type RuleProps, type RuleTarget } from "./Rule.ts";
interface EventDescriptor {
    id?: string;
    bus?: EventBus;
    pattern: Record<string, any>;
    props?: Pick<RuleProps, "description" | "state">;
}
export interface QueueRouteTargetProps extends Pick<RuleTarget, "Input" | "InputPath" | "InputTransformer" | "RetryPolicy" | "DeadLetterConfig"> {
    sqsParameters?: RuleTarget["SqsParameters"];
}
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
export declare const toQueue: (descriptor: EventDescriptor, queue: Queue, props?: QueueRouteTargetProps) => Effect.Effect<Rule, never, import("../Providers.ts").Providers>;
export {};
//# sourceMappingURL=ToQueue.d.ts.map