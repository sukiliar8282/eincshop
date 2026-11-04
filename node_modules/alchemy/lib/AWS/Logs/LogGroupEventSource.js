import * as Context from "effect/Context";
export function consumeLogEvents(logGroup, propsOrProcess, maybeProcess) {
    const [props, process] = typeof propsOrProcess === "function"
        ? [{}, propsOrProcess]
        : [propsOrProcess, maybeProcess];
    return LogGroupEventSource.use((source) => source(logGroup, props, process));
}
export class LogGroupEventSource extends Context.Service()("AWS.Logs.LogGroupEventSource") {
}
//# sourceMappingURL=LogGroupEventSource.js.map