import * as aas from "@distilled.cloud/aws/application-auto-scaling";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ScheduledActionProps {
    /**
     * Scheduled action name. If omitted, a deterministic name is generated.
     *
     * Changing this triggers a replacement.
     */
    scheduledActionName?: string;
    /**
     * The namespace of the AWS service that provides the scalable target,
     * e.g. `ecs`, `dynamodb`.
     *
     * Changing this triggers a replacement.
     */
    serviceNamespace: aas.ServiceNamespace;
    /**
     * The identifier of the resource the action's scalable target scales,
     * e.g. `service/{clusterName}/{serviceName}` or `table/{tableName}`.
     *
     * Changing this triggers a replacement.
     */
    resourceId: string;
    /**
     * The scalable dimension of the scalable target,
     * e.g. `ecs:service:DesiredCount` or `dynamodb:table:ReadCapacityUnits`.
     *
     * Changing this triggers a replacement.
     */
    scalableDimension: aas.ScalableDimension;
    /**
     * The schedule expression: `at(yyyy-mm-ddThh:mm:ss)` for one-time actions,
     * `rate(value unit)` or `cron(fields)` for recurring actions.
     */
    schedule: string;
    /**
     * Time zone for the schedule expression (IANA name, e.g.
     * `America/Los_Angeles`).
     * @default "UTC"
     */
    timezone?: string;
    /**
     * ISO-8601 date-time at which a recurring schedule begins.
     */
    startTime?: string;
    /**
     * ISO-8601 date-time at which a recurring schedule ends.
     */
    endTime?: string;
    /**
     * The new minimum and/or maximum capacity applied when the action runs.
     */
    scalableTargetAction: aas.ScalableTargetAction;
}
export interface ScheduledAction extends Resource<"AWS.ApplicationAutoScaling.ScheduledAction", ScheduledActionProps, {
    /**
     * Name of the scheduled action.
     */
    scheduledActionName: string;
    /**
     * ARN of the scheduled action.
     */
    scheduledActionArn: string;
    /**
     * Namespace of the AWS service that provides the scalable target.
     */
    serviceNamespace: aas.ServiceNamespace;
    /**
     * Identifier of the scaled resource.
     */
    resourceId: string;
    /**
     * Scalable dimension the action applies to.
     */
    scalableDimension: aas.ScalableDimension;
    /**
     * Schedule expression (`at(...)`, `rate(...)`, or `cron(...)`).
     */
    schedule: string;
    /**
     * IANA timezone the schedule is evaluated in.
     */
    timezone: string | undefined;
    /**
     * Capacity bounds applied when the action fires.
     */
    scalableTargetAction: aas.ScalableTargetAction | undefined;
}, never, Providers> {
}
/**
 * An Application Auto Scaling scheduled action — adjusts a scalable target's
 * minimum and/or maximum capacity on a one-time (`at(...)`) or recurring
 * (`cron(...)` / `rate(...)`) schedule.
 *
 * The action applies to the scalable target identified by the
 * (`serviceNamespace`, `resourceId`, `scalableDimension`) triple, which must
 * be registered (see {@link ScalableTarget}) before the action is created —
 * pass the target's outputs so deployment orders correctly.
 * ### Scheduling Capacity Changes
 * **Example:** Scale Out for Business Hours
 * ```typescript
 * yield* ScheduledAction("BusinessHoursScaleOut", {
 *   serviceNamespace: target.serviceNamespace,
 *   resourceId: target.resourceId,
 *   scalableDimension: target.scalableDimension,
 *   schedule: "cron(0 8 ? * MON-FRI *)",
 *   timezone: "America/Los_Angeles",
 *   scalableTargetAction: { MinCapacity: 3, MaxCapacity: 10 },
 * });
 * ```
 *
 * **Example:** One-Time Capacity Bump
 * ```typescript
 * yield* ScheduledAction("LaunchDayBump", {
 *   serviceNamespace: target.serviceNamespace,
 *   resourceId: target.resourceId,
 *   scalableDimension: target.scalableDimension,
 *   schedule: "at(2030-01-01T00:00:00)",
 *   scalableTargetAction: { MinCapacity: 5 },
 * });
 * ```
 *
 * @resource
 */
export declare const ScheduledAction: import("../../Resource.ts").ResourceClass<ScheduledAction>;
export declare const ScheduledActionProvider: () => import("effect/Layer").Layer<Provider.Provider<ScheduledAction>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ScheduledAction.d.ts.map