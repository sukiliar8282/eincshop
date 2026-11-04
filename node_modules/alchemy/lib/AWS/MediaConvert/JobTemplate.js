import * as mediaconvert from "@distilled.cloud/aws/mediaconvert";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readMcTags, syncMcTags } from "./internal.js";
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
export const JobTemplate = Resource("AWS.MediaConvert.JobTemplate");
export const JobTemplateProvider = () => Provider.effect(JobTemplate, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.jobTemplateName ??
            (yield* createPhysicalName({ id, maxLength: 128 })));
    });
    const toAttrs = (template) => ({
        jobTemplateName: template.Name,
        jobTemplateArn: template.Arn,
        type: template.Type,
        category: template.Category,
    });
    /** Get a job template by name; typed not-found → undefined. */
    const getJobTemplate = Effect.fn(function* (name) {
        const response = yield* mediaconvert
            .getJobTemplate({ Name: name })
            .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
        return response?.JobTemplate;
    });
    return {
        stables: ["jobTemplateName", "jobTemplateArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.jobTemplateName ?? (yield* createName(id, olds ?? {}));
            const template = yield* getJobTemplate(name);
            if (template === undefined)
                return undefined;
            const attrs = toAttrs(template);
            const tags = yield* readMcTags(template.Arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const name = output?.jobTemplateName ?? (yield* createName(id, news));
            // 1. Observe — cloud state is authoritative.
            let template = yield* getJobTemplate(name);
            // 2. Ensure — create if missing.
            if (template === undefined) {
                const created = yield* mediaconvert.createJobTemplate({
                    Name: name,
                    Description: news.description,
                    Category: news.category,
                    Queue: news.queue,
                    Priority: news.priority,
                    Settings: news.settings,
                    AccelerationSettings: news.accelerationSettings,
                    HopDestinations: news.hopDestinations,
                    StatusUpdateInterval: news.statusUpdateInterval,
                    Tags: desiredTags,
                });
                template = created.JobTemplate;
            }
            else {
                // 3. Sync — UpdateJobTemplate re-applies the mutable fields.
                const updated = yield* mediaconvert.updateJobTemplate({
                    Name: name,
                    Description: news.description,
                    Category: news.category,
                    Queue: news.queue,
                    Priority: news.priority,
                    Settings: news.settings,
                    AccelerationSettings: news.accelerationSettings,
                    HopDestinations: news.hopDestinations,
                    StatusUpdateInterval: news.statusUpdateInterval,
                });
                template = updated.JobTemplate;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncMcTags(template.Arn, desiredTags);
            yield* session.note(name);
            return toAttrs(template);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* mediaconvert
                .deleteJobTemplate({ Name: output.jobTemplateName })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
        }),
        list: () => mediaconvert.listJobTemplates.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.JobTemplates ?? [])), Effect.map((templates) => templates.map(toAttrs))),
    };
}));
//# sourceMappingURL=JobTemplate.js.map