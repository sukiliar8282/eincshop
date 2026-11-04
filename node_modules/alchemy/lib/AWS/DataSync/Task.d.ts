import * as datasync from "@distilled.cloud/aws/datasync";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface TaskProps {
    /**
     * ARN of the source location data is transferred from. Cannot be changed
     * after creation (replacement).
     */
    sourceLocationArn: string;
    /**
     * ARN of the destination location data is transferred to. Cannot be
     * changed after creation (replacement).
     */
    destinationLocationArn: string;
    /**
     * Name of the task. If omitted, a unique name is generated from the app,
     * stage, and logical id.
     */
    name?: string;
    /**
     * Transfer options — verification mode, overwrite behaviour, metadata
     * preservation, bandwidth throttle, logging, etc. Updatable in place.
     */
    options?: datasync.Options;
    /**
     * Filter rules excluding files/folders from the transfer. Updatable in
     * place.
     */
    excludes?: datasync.FilterRule[];
    /**
     * Filter rules including only matching files/folders. Updatable in place.
     */
    includes?: datasync.FilterRule[];
    /**
     * Schedule on which the task runs automatically (cron expression).
     * Updatable in place.
     */
    schedule?: datasync.TaskSchedule;
    /**
     * ARN of the CloudWatch log group DataSync publishes task logs to.
     * Updatable in place.
     */
    cloudWatchLogGroupArn?: string;
    /**
     * Task execution mode. `BASIC` (default) or `ENHANCED` (higher scale,
     * S3-only). Cannot be changed after creation (replacement).
     */
    taskMode?: datasync.TaskMode;
    /**
     * Tags to apply to the task. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Task extends Resource<"AWS.DataSync.Task", TaskProps, {
    /** ARN of the DataSync task. */
    taskArn: string;
    /** Current task status (e.g. `AVAILABLE`, `RUNNING`). */
    taskStatus: datasync.TaskStatus;
    /** ARN of the source location. */
    sourceLocationArn: string;
    /** ARN of the destination location. */
    destinationLocationArn: string;
}, {}, Providers> {
}
/**
 * A DataSync task — the transfer definition binding a source location to a
 * destination location, together with the filters, schedule, and transfer
 * options that govern each run.
 *
 * Creating the task does not move any data; it defines the transfer.
 * Start a run with `StartTaskExecution` (or attach a `schedule`). Source and
 * destination locations and the task mode are immutable; everything else
 * (name, options, filters, schedule, log group, tags) is updated in place.
 *
 * ### Creating Tasks
 * **Example:** S3 → S3 transfer
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const task = yield* AWS.DataSync.Task("Backup", {
 *   sourceLocationArn: source.locationArn,
 *   destinationLocationArn: dest.locationArn,
 * });
 * ```
 *
 * **Example:** With verification and a schedule
 * ```typescript
 * const task = yield* AWS.DataSync.Task("Nightly", {
 *   sourceLocationArn: source.locationArn,
 *   destinationLocationArn: dest.locationArn,
 *   options: { VerifyMode: "ONLY_FILES_TRANSFERRED" },
 *   schedule: { ScheduleExpression: "cron(0 2 * * ? *)" },
 * });
 * ```
 *
 * @resource
 */
export declare const Task: import("../../Resource.ts").ResourceClass<Task>;
export declare const TaskProvider: () => import("effect/Layer").Layer<Provider.Provider<Task>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Task.d.ts.map