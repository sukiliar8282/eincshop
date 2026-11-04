import type * as scheduler from "@distilled.cloud/aws/scheduler";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.ts";
import type { Function as LambdaFunction } from "../Lambda/Function.ts";
import type { ScheduleBuilder } from "./builders.ts";
import { Schedule } from "./Schedule.ts";
import type { ScheduleGroup } from "./ScheduleGroup.ts";
/**
 * The typed event a consumed schedule delivers to its handler. EventBridge
 * Scheduler substitutes the `<aws.scheduler.*>` context attributes into the
 * schedule's `Input` template at invocation time; `scheduleId` is the stable
 * route id used to match the invocation to the registered handler.
 */
export interface ScheduleEvent {
    source: "alchemy.scheduler";
    /**
     * Stable route id of the `consumeSchedule` registration that created the
     * schedule.
     */
    scheduleId: string;
    /**
     * ARN of the schedule (`<aws.scheduler.schedule-arn>`).
     */
    scheduleArn: string;
    /**
     * The time the invocation was scheduled for, ISO 8601
     * (`<aws.scheduler.scheduled-time>`).
     */
    scheduledTime: string;
    /**
     * Unique id of this delivery attempt (`<aws.scheduler.execution-id>`).
     */
    executionId: string;
    /**
     * Delivery attempt counter, 1-based (`<aws.scheduler.attempt-number>`).
     */
    attemptNumber: string;
}
/**
 * Narrow an arbitrary Lambda invocation payload to a schedule event produced
 * by `consumeSchedule`.
 */
export declare const isScheduleEvent: (event: any) => event is ScheduleEvent;
export interface ScheduleRouteProps {
    /**
     * Optional schedule group the backing schedule is created in.
     * @default the AWS default group
     */
    group?: ScheduleGroup;
    /**
     * Optional description on the backing schedule.
     */
    description?: string;
    /**
     * Desired schedule state (`ENABLED` / `DISABLED`).
     */
    state?: string;
    /**
     * Timezone for cron or at expressions.
     */
    timezone?: string;
    /**
     * Optional start date.
     */
    startDate?: Date;
    /**
     * Optional end date.
     */
    endDate?: Date;
    /**
     * Optional KMS key ARN.
     */
    kmsKeyArn?: string;
    /**
     * Flexible time window configuration.
     * @default { Mode: "OFF" }
     */
    flexibleTimeWindow?: scheduler.FlexibleTimeWindow;
    /**
     * Action after a one-time schedule completes.
     */
    actionAfterCompletion?: string;
    /**
     * Retry policy for failed invocations.
     */
    retryPolicy?: scheduler.RetryPolicy;
    /**
     * Dead-letter queue for undeliverable invocations.
     */
    deadLetterConfig?: scheduler.DeadLetterConfig;
}
export interface ScheduleDescriptor {
    /**
     * Stable route id. Defaults to a hash of the schedule expression and the
     * host Function's logical id.
     */
    id?: string;
    /**
     * Schedule expression: `rate(...)`, `cron(...)`, or `at(...)`.
     */
    expression: string;
    props?: ScheduleRouteProps;
}
/**
 * The cron-handler DX for EventBridge Scheduler: a Lambda consumes its own
 * scheduled invocations. `consumeSchedule(every("5 minutes"), handler)`
 * provisions the backing `Schedule` (plus the synthesized execution role that
 * lets Scheduler invoke the host) and registers the runtime handler with a
 * typed event guard.
 *
 * @binding
 */
export interface ScheduleEventSource extends Binding.Service<ScheduleEventSource, "AWS.Scheduler.ScheduleEventSource", ScheduleEventSourceService> {
}
export declare const ScheduleEventSource: ScheduleEventSource;
export type ScheduleEventSourceService = <Req = never>(descriptor: ScheduleDescriptor, process: (event: ScheduleEvent) => Effect.Effect<void, never, Req>) => Effect.Effect<void, never, never>;
/**
 * Consume a schedule's invocations on the host Lambda Function — the "cron
 * handler" DX. Build the cadence with `every`/`cron`/`at` and pass the handler
 * as the last argument; the runtime layer provisions the backing schedule,
 * the execution role, and the typed event dispatch.
 *
 * @example Run a handler every 5 minutes
 * ```typescript
 * yield* AWS.Scheduler.consumeSchedule(
 *   AWS.Scheduler.every("5 minutes"),
 *   (event) => Effect.log(`fired at ${event.scheduledTime}`),
 * );
 * ```
 *
 * @example Name the backing schedule route deterministically
 * ```typescript
 * yield* AWS.Scheduler.consumeSchedule(
 *   "NightlyCleanup",
 *   AWS.Scheduler.cron("cron(0 3 * * ? *)"),
 *   (event) => Effect.log(`cleanup ${event.executionId}`),
 * );
 * ```
 */
export declare function consumeSchedule<Req = never>(builder: ScheduleBuilder, process: (event: ScheduleEvent) => Effect.Effect<void, never, Req>): Effect.Effect<void, never, ScheduleEventSource | Req>;
export declare function consumeSchedule<Req = never>(id: string, builder: ScheduleBuilder, process: (event: ScheduleEvent) => Effect.Effect<void, never, Req>): Effect.Effect<void, never, ScheduleEventSource | Req>;
/**
 * Derive the stable route id for a schedule descriptor: the explicit id when
 * given, otherwise a hash of the expression and the host Function's logical
 * id. Computed identically at deploy time (to name the backing resources) and
 * at runtime (to match incoming events to the handler).
 */
export declare const createScheduleRouteId: (descriptor: ScheduleDescriptor, fn: LambdaFunction) => string;
/**
 * Deploy-time half of `consumeSchedule`: synthesize the execution role that
 * lets EventBridge Scheduler invoke the host Function and create the backing
 * `Schedule` whose `Input` template carries the typed event envelope.
 *
 * @binding
 */
export declare const createScheduleRoute: (routeId: string, descriptor: ScheduleDescriptor, fn: LambdaFunction) => Effect.Effect<Schedule, never, import("../Providers.ts").Providers>;
//# sourceMappingURL=ScheduleEventSource.d.ts.map