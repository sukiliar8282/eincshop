import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
export function consumeTopicMessages(topicFilter, propsOrProcess, maybeProcess) {
    const [props, process] = typeof propsOrProcess === "function"
        ? [{}, propsOrProcess]
        : [propsOrProcess, maybeProcess];
    return TopicRuleEventSource.use((source) => source(topicFilter, props, process));
}
/**
 * Event source connecting an IoT topic filter to the hosting compute.
 *
 * The contract is a Context service consumed via
 * {@link consumeTopicMessages}; the Lambda implementation layer is
 * `AWS.Lambda.TopicRuleEventSource`, which deploys an IoT {@link TopicRule}
 * with a Lambda action (plus the invoke permission) and streams matching
 * messages into the registered handler.
 *
 * @binding
 */
export class TopicRuleEventSource extends Context.Service()("AWS.IoT.TopicRuleEventSource") {
}
//# sourceMappingURL=TopicRuleEventSource.js.map