import * as deadline from "@distilled.cloud/aws/deadline";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type QueueStatus = deadline.QueueStatus;
export type DefaultQueueBudgetAction = deadline.DefaultQueueBudgetAction;
export interface QueueProps {
    /**
     * The identifier of the farm the queue belongs to. Changing it replaces
     * the queue.
     */
    farmId: string;
    /**
     * Display name of the queue.
     * @default ${app}-${stage}-${id}
     */
    displayName?: string;
    /**
     * A description of the queue.
     */
    description?: string;
    /**
     * Action taken on jobs in the queue when its associated budget is
     * exhausted (`NONE`, `STOP_SCHEDULING_AND_COMPLETE_TASKS`,
     * `STOP_SCHEDULING_AND_CANCEL_TASKS`).
     * @default "NONE"
     */
    defaultBudgetAction?: DefaultQueueBudgetAction;
    /**
     * S3 bucket and root prefix used for job attachments.
     */
    jobAttachmentSettings?: deadline.JobAttachmentSettings;
    /**
     * ARN of the IAM role workers assume while running this queue's jobs.
     */
    roleArn?: string;
    /**
     * The OS user/group jobs run as on workers.
     */
    jobRunAsUser?: deadline.JobRunAsUser;
    /**
     * Names of file system locations (from storage profiles) that must be
     * present on a worker for it to pick up this queue's jobs.
     */
    requiredFileSystemLocationNames?: string[];
    /**
     * Storage profile IDs allowed to be used with the queue.
     */
    allowedStorageProfileIds?: string[];
    /**
     * How the queue orders and schedules its jobs.
     */
    schedulingConfiguration?: deadline.SchedulingConfiguration;
    /**
     * Tags to associate with the queue.
     */
    tags?: Record<string, string>;
}
export interface Queue extends Resource<"AWS.Deadline.Queue", QueueProps, {
    /**
     * The identifier of the farm the queue belongs to.
     */
    farmId: string;
    /**
     * Service-assigned unique identifier of the queue (`queue-...`).
     */
    queueId: string;
    /**
     * ARN of the queue.
     */
    queueArn: string;
    /**
     * The queue's display name.
     */
    displayName: string;
    /**
     * Current scheduling status of the queue.
     */
    status: QueueStatus;
    /**
     * The configured default budget action.
     */
    defaultBudgetAction: DefaultQueueBudgetAction;
    /**
     * ARN of the queue's job role, when configured.
     */
    roleArn: string | undefined;
    /**
     * Current tags reported for the queue.
     */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Deadline Cloud queue — accepts render jobs within a farm and
 * schedules them onto associated fleets.
 *
 * ### Creating Queues
 * **Example:** Basic Queue
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const farm = yield* AWS.Deadline.Farm("RenderFarm", {});
 * const queue = yield* AWS.Deadline.Queue("RenderQueue", {
 *   farmId: farm.farmId,
 * });
 * ```
 *
 * **Example:** Queue with Job Attachments and Role
 * ```typescript
 * const queue = yield* AWS.Deadline.Queue("RenderQueue", {
 *   farmId: farm.farmId,
 *   roleArn: queueRole.roleArn,
 *   defaultBudgetAction: "STOP_SCHEDULING_AND_COMPLETE_TASKS",
 *   jobAttachmentSettings: {
 *     s3BucketName: bucket.bucketName,
 *     rootPrefix: "attachments/",
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Queue: import("../../Resource.ts").ResourceClass<Queue>;
export declare const QueueProvider: () => import("effect/Layer").Layer<Provider.Provider<Queue>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Queue.d.ts.map