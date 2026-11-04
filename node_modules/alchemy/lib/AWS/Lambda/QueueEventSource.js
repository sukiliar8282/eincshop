import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as Namespace from "../../Namespace.js";
import { QueueEventSource as SQSQueueEventSource, } from "../SQS/QueueEventSource.js";
import { EventSourceMapping } from "./EventSourceMapping.js";
import * as Lambda from "./Function.js";
export const isSQSEvent = (event) => Array.isArray(event?.Records) &&
    event.Records.length > 0 &&
    event.Records[0].eventSource === "aws:sqs";
/** @binding */
export const QueueEventSource = Layer.effect(SQSQueueEventSource, Effect.gen(function* () {
    const host = yield* Lambda.Function;
    const Mapping = yield* EventSourceMapping;
    return Effect.fn(function* (queue, props, process) {
        // Deploy-time: grant IAM and create the event-source mapping. Skipped once
        // running inside the deployed Function (the global guard), where the only
        // work is registering the runtime handler below. Namespaced under the host
        // so the mapping's logical identity matches the previous Binding.Policy.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* Namespace.push(host.LogicalId, Effect.gen(function* () {
                yield* host.bind `Allow(${host}, AWS.Lambda.QueueEventSource(${queue}))`({
                    policyStatements: [
                        {
                            Effect: "Allow",
                            Action: [
                                "sqs:ReceiveMessage",
                                "sqs:DeleteMessage",
                                "sqs:GetQueueAttributes",
                            ],
                            Resource: [queue.queueArn],
                        },
                    ],
                });
                yield* Mapping(`${queue.LogicalId}-EventSource`, {
                    functionName: host.functionName,
                    eventSourceArn: queue.queueArn,
                    batchSize: props.batchSize,
                    maximumBatchingWindow: props.maximumBatchingWindow,
                    enabled: true,
                });
            }));
        }
        yield* host.listen(Effect.gen(function* () {
            return (event) => {
                if (isSQSEvent(event)) {
                    return process(Stream.fromArray(event.Records)).pipe(Effect.orDie);
                }
            };
        }));
    });
}));
//# sourceMappingURL=QueueEventSource.js.map