import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../../Binding.js";
export const TopicEventSource = Binding.Service("AWS.SNS.TopicEventSource");
export function consumeTopicNotifications(topic, propsOrProcess, maybeProcess) {
    const [props, process] = typeof propsOrProcess === "function"
        ? [{}, propsOrProcess]
        : [propsOrProcess, maybeProcess];
    return TopicEventSource.use((source) => source(topic, props, process));
}
//# sourceMappingURL=TopicEventSource.js.map