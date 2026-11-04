import * as scheduler from "@distilled.cloud/aws/scheduler";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ScheduleProps {
    /**
     * Schedule name. If omitted, Alchemy generates a deterministic name.
     */
    name?: string;
    /**
     * Optional schedule group. Defaults to the AWS default group.
     */
    groupName?: Input<string>;
    /**
     * Required schedule expression, such as `rate(5 minutes)` or `cron(...)`.
     */
    scheduleExpression: string;
    /**
     * Optional start date.
     */
    startDate?: Date;
    /**
     * Optional end date.
     */
    endDate?: Date;
    /**
     * Optional description.
     */
    description?: string;
    /**
     * Optional timezone for cron or at expressions.
     */
    scheduleExpressionTimezone?: string;
    /**
     * Desired schedule state.
     */
    state?: string;
    /**
     * Optional KMS key ARN.
     */
    kmsKeyArn?: Input<string>;
    /**
     * Scheduler target configuration.
     */
    target: Input<scheduler.Target>;
    /**
     * Flexible time window configuration.
     */
    flexibleTimeWindow?: Input<scheduler.FlexibleTimeWindow>;
    /**
     * Action after a one-time schedule completes.
     */
    actionAfterCompletion?: string;
}
/**
 * An EventBridge Scheduler schedule.
 *
 * `Schedule` is the canonical time-based delivery primitive. High-level helpers
 * like `every`, `cron`, and `at` can synthesize the target role and scheduler
 * target configuration on top of this resource.
 * ### Creating Schedules
 * **Example:** Hourly Schedule
 * ```typescript
 * const schedule = yield* Schedule("HourlyJob", {
 *   scheduleExpression: "rate(1 hour)",
 *   target: {
 *     Arn: fn.functionArn,
 *     RoleArn: role.roleArn,
 *   },
 *   flexibleTimeWindow: {
 *     Mode: "OFF",
 *   },
 * });
 * ```
 *
 * @resource
 */
export interface Schedule extends Resource<"AWS.Scheduler.Schedule", ScheduleProps, {
    /**
     * ARN of the schedule.
     */
    scheduleArn: string;
    /**
     * Name of the schedule.
     */
    scheduleName: string;
    /**
     * Name of the schedule group containing the schedule.
     */
    groupName: string;
    /**
     * Current state of the schedule (`ENABLED` or `DISABLED`).
     */
    state: string | undefined;
}, never, Providers> {
}
export declare const Schedule: import("../../Resource.ts").ResourceClass<Schedule>;
export declare const ScheduleProvider: () => import("effect/Layer").Layer<Provider.Provider<Schedule>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Schedule.d.ts.map