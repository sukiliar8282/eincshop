import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface JobTemplateProps {
    /**
     * Name of the job template. Must be unique within the account/region and
     * match `^[\w-]+$`. If omitted, a unique name is generated. Changing the
     * name replaces the job template.
     */
    jobTemplateName?: string;
    /**
     * Optional description of the job template.
     */
    description?: string;
    /**
     * Optional category used to group job templates in the MediaConvert console.
     */
    category?: string;
    /**
     * Name of the queue jobs created from this template are submitted to. If
     * omitted, the account's `Default` queue is used.
     */
    queue?: string;
    /**
     * Relative priority (-50 to 50) of jobs created from this template.
     */
    priority?: number;
    /**
     * The transcode settings — input template(s), output groups, timecode
     * config, and so on — applied to jobs created from this template. Required.
     */
    settings: mediaconvert.JobTemplateSettings;
    /**
     * Accelerated transcoding configuration.
     */
    accelerationSettings?: mediaconvert.AccelerationSettings;
    /**
     * Optional destination queues jobs hop to if they wait too long.
     */
    hopDestinations?: mediaconvert.HopDestination[];
    /**
     * How often, in seconds, MediaConvert emits `STATUS_UPDATE` events for jobs
     * created from this template.
     */
    statusUpdateInterval?: mediaconvert.StatusUpdateInterval;
    /**
     * User-defined tags for the job template.
     */
    tags?: Record<string, string>;
}
export interface JobTemplate extends Resource<"AWS.MediaConvert.JobTemplate", JobTemplateProps, {
    jobTemplateName: string;
    jobTemplateArn: string;
    type: string | undefined;
    category: string | undefined;
}, never, Providers> {
}
/**
 * An AWS Elemental MediaConvert job template — a reusable, named transcode
 * configuration (inputs, output groups, and job-level settings) that new jobs
 * are created from so callers only supply the input/output specifics.
 *
 * ### Creating a Job Template
 * **Example:** MP4 File-Group Template
 * ```typescript
 * const template = yield* MediaConvert.JobTemplate("Mp4", {
 *   description: "Single MP4 output",
 *   settings: {
 *     Inputs: [{ TimecodeSource: "ZEROBASED" }],
 *     OutputGroups: [
 *       {
 *         OutputGroupSettings: {
 *           Type: "FILE_GROUP_SETTINGS",
 *           FileGroupSettings: {},
 *         },
 *         Outputs: [
 *           {
 *             ContainerSettings: { Container: "MP4" },
 *             VideoDescription: {
 *               CodecSettings: {
 *                 Codec: "H_264",
 *                 H264Settings: {
 *                   RateControlMode: "QVBR",
 *                   MaxBitrate: 5000000,
 *                 },
 *               },
 *             },
 *           },
 *         ],
 *       },
 *     ],
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const JobTemplate: import("../../Resource.ts").ResourceClass<JobTemplate>;
export declare const JobTemplateProvider: () => import("effect/Layer").Layer<Provider.Provider<JobTemplate>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=JobTemplate.d.ts.map