import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Stream from "effect/Stream";
import * as Namespace from "../../Namespace.js";
import { Subscription as SNSSubscription } from "../SNS/Subscription.js";
import { TopicEventSource as SNSTopicEventSource, } from "../SNS/TopicEventSource.js";
import * as Lambda from "./Function.js";
import { Permission as LambdaPermission } from "./Permission.js";
export const isSNSEvent = (event) => Array.isArray(event?.Records) &&
    event.Records.some((record) => record.EventSource === "aws:sns");
/** @binding */
export const TopicEventSource = Layer.effect(SNSTopicEventSource, Effect.gen(function* () {
    const host = yield* Lambda.Function;
    const Permission = yield* LambdaPermission;
    const Subscription = yield* SNSSubscription;
    return Effect.fn(function* (topic, props, process) {
        const TopicArn = yield* topic.topicArn;
        // Deploy-time: grant invoke permission and create the SNS subscription.
        // Skipped once running inside the deployed Function (the global guard),
        // where the only work is registering the runtime handler below.
        // Namespaced under the host so the sub-resources' logical identity matches
        // the previous Binding.Policy.
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* Namespace.push(host.LogicalId, Effect.gen(function* () {
                yield* Permission(`AWS.Lambda.InvokeFunction(${topic.LogicalId})`, {
                    action: "lambda:InvokeFunction",
                    functionName: host.functionName,
                    principal: "sns.amazonaws.com",
                    sourceArn: topic.topicArn,
                });
                yield* Subscription(`AWS.SNS.Subscription(${topic.LogicalId}, ${host.LogicalId})`, {
                    topicArn: topic.topicArn,
                    protocol: "lambda",
                    endpoint: host.functionArn,
                    attributes: props.attributes,
                    returnSubscriptionArn: true,
                });
            }));
        }
        yield* host.listen(Effect.gen(function* () {
            const topicArn = yield* TopicArn;
            return (event) => {
                if (isSNSEvent(event)) {
                    const records = event.Records.filter((record) => record.Sns?.TopicArn === topicArn);
                    if (records.length > 0) {
                        return process(Stream.fromArray(records.map((record) => record.Sns))).pipe(Effect.orDie);
                    }
                }
            };
        }));
    });
}));
//# sourceMappingURL=TopicEventSource.js.map