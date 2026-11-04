import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface JobProps {
    /**
     * ARN of the IAM role MediaConvert assumes to read the input from and write
     * the output to Amazon S3. Required.
     */
    role: string;
    /**
     * The transcode settings for this job — the input file(s) and the output
     * groups to produce. Required unless a `jobTemplate` supplies them.
     */
    settings?: mediaconvert.JobSettings;
    /**
     * Name (or ARN) of a job template to base this job on. When set, the
     * template's settings are merged with any `settings` overrides.
     */
    jobTemplate?: string;
    /**
     * Name of the queue to submit the job to. If omitted, the account's
     * `Default` queue is used.
     */
    queue?: string;
    /**
     * Relative priority of the job within its queue (-50 to 50).
     */
    priority?: number;
    /**
     * How often, in seconds, MediaConvert emits `STATUS_UPDATE` events.
     */
    statusUpdateInterval?: mediaconvert.StatusUpdateInterval;
    /**
     * Accelerated transcoding configuration.
     */
    accelerationSettings?: mediaconvert.AccelerationSettings;
    /**
     * Arbitrary key/value metadata attached to the job and echoed in events.
     */
    userMetadata?: Record<string, string>;
    /**
     * User-defined tags for the job.
     */
    tags?: Record<string, string>;
}
export interface Job extends Resource<"AWS.MediaConvert.Job", JobProps, {
    jobId: string;
    jobArn: string;
    status: string | undefined;
    queue: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Elemental MediaConvert transcode job — a one-shot request to convert
 * an input in S3 into one or more outputs. Jobs are immutable once submitted:
 * they run to `COMPLETE`, `ERROR`, or `CANCELED` on their own. Deleting the
 * resource cancels the job only if it is still `SUBMITTED` or `PROGRESSING`.
 *
 * A live job is slow and billable — it requires input/output S3 objects and an
 * IAM role MediaConvert can assume. Drive it behind an environment gate in
 * tests rather than on every run.
 *
 * ### Submitting a Job
 * **Example:** File Transcode from a Template
 * ```typescript
 * const job = yield* MediaConvert.Job("Transcode", {
 *   role: mediaConvertRole.roleArn,
 *   jobTemplate: template.jobTemplateName,
 *   settings: {
 *     Inputs: [{ FileInput: "s3://my-bucket/input.mp4" }],
 *     OutputGroups: [
 *       {
 *         OutputGroupSettings: {
 *           Type: "FILE_GROUP_SETTINGS",
 *           FileGroupSettings: { Destination: "s3://my-bucket/out/" },
 *         },
 *         Outputs: [{ Preset: preset.presetName }],
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Job: import("../../Resource.ts").ResourceClass<Job>;
export declare const JobProvider: () => import("effect/Layer").Layer<Provider.Provider<Job>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Job.d.ts.map