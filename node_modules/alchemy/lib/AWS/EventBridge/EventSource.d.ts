import type * as lambda from "aws-lambda";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../../Binding.ts";
import type { Cluster } from "../ECS/Cluster.ts";
import type { Function as LambdaFunction } from "../Lambda/Function.ts";
import type { Queue } from "../SQS/Queue.ts";
import type { EventBus } from "./EventBus.ts";
import type { RuleProps } from "./Rule.ts";
import { type EcsRouteTargetProps } from "./ToEcsTask.ts";
import { type LambdaRouteTargetProps } from "./ToLambda.ts";
import { type QueueRouteTargetProps } from "./ToQueue.ts";
export type EventPattern = Record<string, any>;
export type EventRecord<Detail = unknown> = lambda.EventBridgeEvent<string, Detail>;
export interface EventRouteProps extends Pick<RuleProps, "description" | "state"> {
}
export interface SubscribeProps extends EventRouteProps {
}
export type { EcsRouteTargetProps } from "./ToEcsTask.ts";
export type { LambdaRouteTargetProps } from "./ToLambda.ts";
export type { QueueRouteTargetProps } from "./ToQueue.ts";
interface EventDescriptor {
    id?: string;
    bus?: EventBus;
    pattern: EventPattern;
    props?: EventRouteProps;
}
/**
 * Event source connecting an EventBridge {@link EventBus} to the hosting
 * compute (Lambda function or ServerHost process). Matching events invoke
 * the host with a stream of {@link EventRecord}s.
 *
 * Use it through the {@link consumeBusEvents} helper; the host-specific
 * implementation layer (e.g. `AWS.Lambda.EventSource`) creates the rule,
 * grants EventBridge invoke permission, and dispatches events at runtime.
 * ### Consuming Events
 * **Example:** Consume Matching Events on a Lambda Function
 * ```typescript
 * // init — subscribe to matching events (provide AWS.Lambda.EventSource on the Function)
 * yield* AWS.EventBridge.consumeBusEvents(
 *   bus,
 *   { source: ["my.app"] },
 *   (events: Stream.Stream<AWS.EventBridge.EventRecord>) =>
 *     events.pipe(
 *       Stream.runForEach((event) =>
 *         Effect.log(event["detail-type"], event.detail),
 *       ),
 *     ),
 * );
 * ```
 *
 * @binding
 */
export interface EventSource extends Binding.Service<EventSource, "AWS.EventBridge.EventSource", EventSourceService> {
}
export declare const EventSource: EventSource;
export type EventSourceService = <Detail = unknown, StreamReq = never, Req = never>(descriptor: EventDescriptor, process: (events: Stream.Stream<EventRecord<Detail>, never, StreamReq>) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, never>;
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
export declare const events: (...args: any[]) => {
    toLambda: (fn: LambdaFunction, props?: LambdaRouteTargetProps) => Effect.Effect<import("./Rule.ts").Rule, never, import("../Providers.ts").Providers>;
    toQueue: (queue: Queue, props?: QueueRouteTargetProps) => Effect.Effect<import("./Rule.ts").Rule, never, import("../Providers.ts").Providers>;
    toEcsTask: (cluster: Cluster, props: EcsRouteTargetProps) => Effect.Effect<import("./Rule.ts").Rule, never, import("../Providers.ts").Providers>;
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
export declare const consumeBusEvents: (...args: any[]) => Effect.Effect<void, never, EventSource>;
export declare const matchesEventPattern: (pattern: EventPattern, event: Record<string, any>) => boolean;
//# sourceMappingURL=EventSource.d.ts.map