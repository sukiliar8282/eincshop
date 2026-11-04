import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ScheduleProps {
    /**
     * Name of the schedule. If omitted, a unique name is generated. Changing
     * the name replaces the schedule.
     * @default a generated physical name
     */
    scheduleName?: string;
    /**
     * The cron expression (in AWS cron format, evaluated in UTC) that
     * determines when the associated jobs run, e.g.
     * `cron(0 12 * * ? *)` for every day at noon UTC.
     */
    cronExpression: string;
    /**
     * Names of the DataBrew jobs the schedule starts.
     */
    jobNames?: string[];
    /**
     * Tags to apply to the schedule. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Schedule extends Resource<"AWS.DataBrew.Schedule", ScheduleProps, {
    /** Name of the schedule. */
    scheduleName: string;
    /** ARN of the schedule. */
    scheduleArn: string;
}, {}, Providers> {
}
/**
 * An AWS Glue DataBrew schedule — a cron expression that starts one or more
 * DataBrew jobs at recurring times. The schedule definition is free; only
 * the job runs it triggers are billed.
 * ### Creating Schedules
 * **Example:** Nightly Job Schedule
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const schedule = yield* AWS.DataBrew.Schedule("Nightly", {
 *   cronExpression: "cron(0 3 * * ? *)",
 *   jobNames: [job.jobName],
 * });
 * ```
 *
 * **Example:** Schedule Without Jobs (attach later)
 * ```typescript
 * const schedule = yield* AWS.DataBrew.Schedule("Standing", {
 *   cronExpression: "cron(0 12 ? * MON-FRI *)",
 * });
 * ```
 *
 * @resource
 */
export declare const Schedule: import("../../Resource.ts").ResourceClass<Schedule>;
export declare const ScheduleProvider: () => import("effect/Layer").Layer<Provider.Provider<Schedule>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Schedule.d.ts.map