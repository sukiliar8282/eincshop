import * as Layer from "effect/Layer";
import { ScheduleEventSource as SchedulerScheduleEventSource } from "../Scheduler/ScheduleEventSource.ts";
import * as Lambda from "./Function.ts";
/**
 * Lambda runtime implementation for `AWS.Scheduler.consumeSchedule(...)` —
 * the "cron handler" DX where a Lambda consumes its own EventBridge Scheduler
 * invocations.
 *
 * This layer does two things:
 *
 * 1. At deploy time it creates the backing `Schedule` targeting the current
 *    Lambda function, plus the synthesized execution role that allows
 *    EventBridge Scheduler to invoke it.
 * 2. At runtime it matches incoming Lambda events against the schedule's
 *    typed envelope (`isScheduleEvent` + the stable route id) and dispatches
 *    them to the supplied handler.
 * ### Consuming Scheduled Invocations
 * **Example:** Run A Handler Every 5 Minutes
 * ```typescript
 * yield* AWS.Scheduler.consumeSchedule(
 *   AWS.Scheduler.every("5 minutes"),
 *   (event) => Effect.log(`fired at ${event.scheduledTime}`),
 * );
 * ```
 *
 * **Example:** Nightly Cron With An Explicit Route Id
 * ```typescript
 * yield* AWS.Scheduler.consumeSchedule(
 *   "NightlyCleanup",
 *   AWS.Scheduler.cron("cron(0 3 * * ? *)"),
 *   (event) => Effect.log(`cleanup ${event.executionId}`),
 * );
 * ```
 *
 * @binding
 */
export declare const ScheduleEventSource: Layer.Layer<SchedulerScheduleEventSource, never, Lambda.Function>;
//# sourceMappingURL=ScheduleEventSource.d.ts.map