import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AutoScalingGroup as AutoScalingGroupResource } from "./AutoScalingGroup.ts";
export type ScheduledActionName = string;
export interface ScheduledActionProps {
    /**
     * Scheduled action name. If omitted, a deterministic name is generated.
     */
    scheduledActionName?: string;
    /**
     * Auto Scaling Group whose capacity the action changes.
     */
    autoScalingGroup: Input<string> | AutoScalingGroupResource;
    /**
     * Cron expression describing a recurring schedule (e.g. `"0 9 * * MON-FRI"`).
     * Omit for a one-time action scheduled via `startTime`.
     */
    recurrence?: string;
    /**
     * ISO-8601 timestamp the action first runs (recurring) or the single time it
     * runs (one-time). Must be in the future.
     */
    startTime?: string;
    /**
     * ISO-8601 timestamp after which the recurring action stops running.
     */
    endTime?: string;
    /**
     * IANA time zone the `recurrence` is evaluated in (e.g. `"America/New_York"`).
     */
    timeZone?: string;
    /**
     * Minimum group size to set when the action runs.
     */
    minSize?: number;
    /**
     * Maximum group size to set when the action runs.
     */
    maxSize?: number;
    /**
     * Desired capacity to set when the action runs.
     */
    desiredCapacity?: number;
}
export interface ScheduledAction extends Resource<"AWS.AutoScaling.ScheduledAction", ScheduledActionProps, {
    /**
     * Name of the scheduled action.
     */
    scheduledActionName: ScheduledActionName;
    /**
     * ARN of the scheduled action.
     */
    scheduledActionARN: string;
    /**
     * Name of the Auto Scaling Group the action applies to.
     */
    autoScalingGroupName: string;
    /**
     * Cron expression for recurring actions.
     */
    recurrence?: string;
    /**
     * ISO-8601 time the action first fires.
     */
    startTime?: string;
    /**
     * ISO-8601 time after which the recurrence stops.
     */
    endTime?: string;
    /**
     * IANA timezone the recurrence is evaluated in.
     */
    timeZone?: string;
    /**
     * Minimum group size applied when the action fires.
     */
    minSize?: number;
    /**
     * Maximum group size applied when the action fires.
     */
    maxSize?: number;
    /**
     * Desired capacity applied when the action fires.
     */
    desiredCapacity?: number;
}, never, Providers> {
}
/**
 * A scheduled scaling action that changes an Auto Scaling Group's capacity on a
 * recurring cron schedule or at a single future time.
 *
 * ### Creating a Scheduled Action
 * **Example:** Scale up every weekday morning
 * ```typescript
 * const action = yield* ScheduledAction("MorningScaleUp", {
 *   autoScalingGroup: group,
 *   recurrence: "0 9 * * MON-FRI",
 *   timeZone: "America/New_York",
 *   minSize: 2,
 *   maxSize: 10,
 *   desiredCapacity: 4,
 * });
 * ```
 *
 * **Example:** One-time capacity change
 * ```typescript
 * const action = yield* ScheduledAction("BlackFriday", {
 *   autoScalingGroup: group,
 *   startTime: "2026-11-27T00:00:00Z",
 *   desiredCapacity: 20,
 * });
 * ```
 *
 * @resource
 */
export declare const ScheduledAction: import("../../Resource.ts").ResourceClass<ScheduledAction>;
export declare const ScheduledActionProvider: () => import("effect/Layer").Layer<Provider.Provider<ScheduledAction>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ScheduledAction.d.ts.map