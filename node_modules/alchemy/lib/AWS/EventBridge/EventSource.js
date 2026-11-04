import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../../Binding.js";
import { toEcsTask as createEcsTaskRoute, } from "./ToEcsTask.js";
import { toLambda as createLambdaRoute, } from "./ToLambda.js";
import { toQueue as createQueueRoute, } from "./ToQueue.js";
export const EventSource = Binding.Service("AWS.EventBridge.EventSource");
/**
 * Build a routing target for an EventBridge event bus. Pass the bus and
 * pattern (no handler) and chain `.toLambda` / `.toQueue` / `.toEcsTask` to
 * route matching events to a target resource.
 *
 * @example Route matching events to a Lambda function
 * ```typescript
 * yield* events(bus, { source: ["my.app"] }).toLambda(fn);
 * ```
 *
 * @example Route matching events to an SQS queue
 * ```typescript
 * yield* events(bus, { source: ["my.app"] }).toQueue(queue);
 * ```
 *
 * To consume events locally with a handler, use {@link consumeBusEvents}.
 */
export const events = (...args) => {
    const descriptor = parseEventDescriptor(args);
    return {
        toLambda: (fn, props = {}) => createLambdaRoute(descriptor, fn, props),
        toQueue: (queue, props = {}) => createQueueRoute(descriptor, queue, props),
        toEcsTask: (cluster, props) => createEcsTaskRoute(descriptor, cluster, props),
    };
};
/**
 * Consume events from an EventBridge event bus with a handler. The handler is
 * the LAST positional argument; the event bus, pattern, and optional props
 * precede it.
 *
 * @example Consume matching events with a handler
 * ```typescript
 * yield* consumeBusEvents(bus, { source: ["my.app"] }, (events) =>
 *   events.pipe(Stream.runForEach((event) => Effect.log(event))),
 * );
 * ```
 *
 * To route events to another resource instead of consuming them locally, use
 * {@link events}.
 */
export const consumeBusEvents = (...args) => {
    // The handler is the LAST positional argument. Peel it off and run the
    // subscribe body directly.
    const process = args[args.length - 1];
    const descriptor = parseEventDescriptor(args.slice(0, -1));
    return EventSource.use((source) => source(descriptor, process));
};
export const matchesEventPattern = (pattern, event) => Object.entries(pattern).every(([key, expected]) => matchValue(expected, event[key]));
const matchValue = (expected, actual) => {
    if (Array.isArray(expected)) {
        return expected.some((value) => matchValue(value, actual));
    }
    if (expected && typeof expected === "object") {
        if (actual === null || typeof actual !== "object") {
            return false;
        }
        return Object.entries(expected).every(([key, value]) => matchValue(value, actual[key]));
    }
    return actual === expected;
};
const parseEventDescriptor = (args) => {
    if (typeof args[0] === "string") {
        if (isEventBus(args[1])) {
            return {
                id: args[0],
                bus: args[1],
                pattern: args[2],
                props: args[3],
            };
        }
        return {
            id: args[0],
            pattern: args[1],
            props: args[2],
        };
    }
    if (isEventBus(args[0])) {
        return {
            bus: args[0],
            pattern: args[1],
            props: args[2],
        };
    }
    return {
        pattern: args[0],
        props: args[1],
    };
};
const isEventBus = (value) => value &&
    typeof value === "object" &&
    "Type" in value &&
    value.Type === "AWS.EventBridge.EventBus";
//# sourceMappingURL=EventSource.js.map