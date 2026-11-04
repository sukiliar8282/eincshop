import * as emrc from "@distilled.cloud/aws/emr-containers";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
export class JobTemplateConsistencyError extends Data.TaggedError("JobTemplateConsistencyError") {
}
/**
 * An Amazon EMR on EKS job template — a stored set of `StartJobRun` values
 * (execution role, release label, job driver, configuration) that can be
 * referenced by ID when starting job runs, optionally with `${placeholder}`
 * parameters filled in per run.
 *
 * Job templates are account-level and fully immutable: any change (including
 * tags, which the tagging API does not support post-create for templates)
 * replaces the template. They pair with the
 * {@link StartJobRun | AWS.EMRContainers.StartJobRun} binding — a Lambda can
 * start a templated Spark job with just the template ID and parameter values.
 *
 * ### Creating Job Templates
 * **Example:** A Spark Job Template
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const template = yield* AWS.EMRContainers.JobTemplate("EtlTemplate", {
 *   jobTemplateData: {
 *     executionRoleArn: jobRole.roleArn,
 *     releaseLabel: "emr-7.5.0-latest",
 *     jobDriver: {
 *       sparkSubmitJobDriver: {
 *         entryPoint: "s3://my-bucket/scripts/etl.py",
 *         sparkSubmitParameters: "--conf spark.executor.instances=2",
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Parameterized Template
 * ```typescript
 * const template = yield* AWS.EMRContainers.JobTemplate("Parameterized", {
 *   jobTemplateData: {
 *     executionRoleArn: jobRole.roleArn,
 *     releaseLabel: "emr-7.5.0-latest",
 *     jobDriver: {
 *       sparkSubmitJobDriver: { entryPoint: "${EntryPoint}" },
 *     },
 *     parameterConfiguration: {
 *       EntryPoint: { type: "STRING" },
 *     },
 *   },
 * });
 * // StartJobRun with jobTemplateId + jobTemplateParameters: { EntryPoint: "s3://..." }
 * ```
 *
 * @resource
 */
export const JobTemplate = Resource("AWS.EMRContainers.JobTemplate");
/** Convert declared props to the distilled wire shape. */
const toJobTemplateData = (data) => ({
    executionRoleArn: data.executionRoleArn,
    releaseLabel: data.releaseLabel,
    configurationOverrides: data.configurationOverrides,
    jobDriver: data.jobDriver,
    parameterConfiguration: data.parameterConfiguration,
    jobTags: data.jobTags,
});
export const JobTemplateProvider = () => Provider.effect(JobTemplate, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.jobTemplateName ??
            (yield* createPhysicalName({ id, maxLength: 64 })));
    });
    const toAttributes = (jt) => ({
        jobTemplateId: jt.id,
        jobTemplateName: jt.name,
        jobTemplateArn: jt.arn,
    });
    const observeById = Effect.fn(function* (id) {
        return yield* emrc.describeJobTemplate({ id }).pipe(Effect.map((response) => response.jobTemplate), Effect.catchTag(["ResourceNotFoundException", "ValidationException"], 
        // a malformed/unknown id is "not present", same as not-found
        () => Effect.succeed(undefined)));
    });
    const observeByName = Effect.fn(function* (name) {
        return yield* emrc.listJobTemplates.items({}).pipe(Stream.filter((jt) => jt.name === name), Stream.runHead, Effect.map(Option.getOrUndefined));
    });
    const observeListedById = Effect.fn(function* (id) {
        return yield* emrc.listJobTemplates.items({}).pipe(Stream.filter((jt) => jt.id === id), Stream.runHead, Effect.map(Option.getOrUndefined));
    });
    const awaitListVisibility = (id) => Effect.repeat(observeListedById(id), {
        schedule: Schedule.spaced("3 seconds"),
        until: (jt) => jt !== undefined,
        times: 10,
    });
    const awaitAbsent = (id) => Effect.repeat(Effect.all([observeById(id), observeListedById(id)]), {
        schedule: Schedule.spaced("3 seconds"),
        until: ([described, listed]) => described === undefined && listed === undefined,
        times: 10,
    });
    const observe = Effect.fn(function* (id, name) {
        const byId = id !== undefined ? yield* observeById(id) : undefined;
        return byId ?? (yield* observeByName(name));
    });
    return JobTemplate.Provider.of({
        stables: ["jobTemplateId", "jobTemplateName", "jobTemplateArn"],
        list: () => Effect.gen(function* () {
            const pages = yield* emrc.listJobTemplates
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.templates ?? [])
                .filter((jt) => jt.id !== undefined &&
                jt.name !== undefined &&
                jt.arn !== undefined)
                .map(toAttributes);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.jobTemplateName ?? (yield* createName(id, olds ?? {}));
            const jt = yield* observe(output?.jobTemplateId, name);
            if (jt?.id === undefined || jt.arn === undefined) {
                return undefined;
            }
            const attrs = toAttributes(jt);
            return (yield* hasAlchemyTags(id, jt.tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            const { upsert, removed } = diffTags(olds.tags ?? {}, news.tags ?? {});
            if (oldName !== newName ||
                JSON.stringify(toJobTemplateData(olds.jobTemplateData)) !==
                    JSON.stringify(toJobTemplateData(news.jobTemplateData)) ||
                olds.kmsKeyArn !== news.kmsKeyArn ||
                upsert.length > 0 ||
                removed.length > 0) {
                // job templates are fully immutable — even tags: the tagging API
                // rejects job template ARNs (typed InvalidResourceArn), so tags
                // are set at creation only and any change replaces
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session, instanceId, }) {
            const name = output?.jobTemplateName ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative; output is an id cache
            let jt = yield* observe(output?.jobTemplateId, name);
            // 2. ENSURE — create if missing (synchronous, available immediately)
            if (jt === undefined) {
                const created = yield* emrc.createJobTemplate({
                    // deterministic per instance: a retried create after a crashed
                    // reconcile never double-provisions
                    clientToken: instanceId.replaceAll(/[^a-zA-Z0-9]/g, "").slice(0, 64) ||
                        "alchemy",
                    name,
                    jobTemplateData: toJobTemplateData(news.jobTemplateData),
                    kmsKeyArn: news.kmsKeyArn,
                    tags: desiredTags,
                });
                jt =
                    created.id !== undefined
                        ? yield* emrc
                            .describeJobTemplate({ id: created.id })
                            .pipe(Effect.map((r) => r.jobTemplate))
                        : yield* observeByName(name);
                if (jt?.id === undefined) {
                    return yield* Effect.fail(new emrc.ResourceNotFoundException({
                        message: `job template ${name} not visible after create`,
                    }));
                }
                const listed = yield* awaitListVisibility(jt.id);
                if (listed?.id !== jt.id) {
                    return yield* Effect.fail(new JobTemplateConsistencyError({
                        jobTemplateId: jt.id,
                        jobTemplateName: name,
                        operation: "create",
                        message: `job template ${name} (${jt.id}) was not visible in ListJobTemplates after 30 seconds`,
                    }));
                }
            }
            // No tag sync: EMR containers' TagResource rejects job template
            // ARNs (typed InvalidResourceArn) — tags exist at creation only,
            // and diff() replaces the template on any tag change.
            yield* session.note(jt.id);
            return toAttributes(jt);
        }),
        delete: Effect.fn(function* ({ output }) {
            // deleteJobTemplate's typed union has no not-found tag — the API
            // reports missing/already-deleted ids as validation errors, which
            // makes the swallow below the idempotency guarantee.
            yield* emrc
                .deleteJobTemplate({ id: output.jobTemplateId })
                .pipe(Effect.catchTag("ValidationException", () => Effect.void));
            const [described, listed] = yield* awaitAbsent(output.jobTemplateId);
            if (described !== undefined || listed !== undefined) {
                return yield* Effect.fail(new JobTemplateConsistencyError({
                    jobTemplateId: output.jobTemplateId,
                    jobTemplateName: output.jobTemplateName,
                    operation: "delete",
                    message: `job template ${output.jobTemplateName} (${output.jobTemplateId}) remained visible after delete for 30 seconds`,
                }));
            }
        }),
    });
}));
//# sourceMappingURL=JobTemplate.js.map