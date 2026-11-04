import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type JobQueueName = string;
export type JobQueueArn = `arn:aws:batch:${RegionID}:${AccountID}:job-queue/${JobQueueName}`;
declare const JobQueueDeleteTimeoutError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "JobQueueDeleteTimeoutError";
} & Readonly<A>;
/**
 * Raised when a job queue's asynchronous deletion does not complete within
 * the provider's poll budget. Reporting success here would let the engine
 * delete the queue's compute environments while the association still exists,
 * wedging the whole chain.
 */
export declare class JobQueueDeleteTimeoutError extends JobQueueDeleteTimeoutError_base<{
    readonly jobQueueName: string;
    readonly status: string | undefined;
    readonly statusReason: string | undefined;
    readonly message: string;
}> {
}
export interface JobQueueProps {
    /**
     * Name of the job queue. If omitted, a unique name is generated.
     * Up to 128 characters (letters, numbers, hyphens, underscores).
     */
    jobQueueName?: string;
    /**
     * Compute environment ARNs the queue schedules onto, in preference order
     * (index 0 is tried first).
     */
    computeEnvironments: string[];
    /**
     * Queue priority — queues with a higher value are evaluated first when
     * they share compute environments.
     * @default 1
     */
    priority?: number;
    /**
     * Whether the queue accepts new job submissions.
     * @default "ENABLED"
     */
    state?: "ENABLED" | "DISABLED";
    /**
     * User-defined tags to apply to the job queue.
     */
    tags?: Record<string, string>;
}
export interface JobQueue extends Resource<"AWS.Batch.JobQueue", JobQueueProps, {
    jobQueueName: JobQueueName;
    jobQueueArn: JobQueueArn;
    state: "ENABLED" | "DISABLED";
    status: string;
    priority: number;
    computeEnvironments: string[];
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An AWS Batch job queue. Jobs submitted to the queue are scheduled onto its
 * associated compute environments in preference order.
 *
 * ### Creating Job Queues
 * **Example:** Queue on a Fargate Compute Environment
 * ```typescript
 * const ce = yield* Batch.ComputeEnvironment("JobsCE", {});
 * const queue = yield* Batch.JobQueue("JobsQueue", {
 *   computeEnvironments: [ce.computeEnvironmentArn],
 * });
 * ```
 *
 * **Example:** Prioritized queue
 * ```typescript
 * const critical = yield* Batch.JobQueue("CriticalQueue", {
 *   priority: 10,
 *   computeEnvironments: [ce.computeEnvironmentArn],
 * });
 * ```
 *
 * @resource
 */
export declare const JobQueue: import("../../Resource.ts").ResourceClass<JobQueue>;
export declare const JobQueueProvider: () => import("effect/Layer").Layer<Provider.Provider<JobQueue>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=JobQueue.d.ts.map