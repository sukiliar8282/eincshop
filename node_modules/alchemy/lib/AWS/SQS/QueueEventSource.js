import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../../Binding.js";
export function consumeQueueMessages(queue, propsOrProcess, maybeProcess) {
    const [props, process] = typeof propsOrProcess === "function"
        ? [{}, propsOrProcess]
        : [propsOrProcess, maybeProcess];
    return QueueEventSource.use((source) => source(queue, props, process));
}
export const QueueEventSource = Binding.Service("AWS.SQS.QueueEventSource");
//# sourceMappingURL=QueueEventSource.js.map