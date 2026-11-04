import * as fis from "@distilled.cloud/aws/fis";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import * as crypto from "node:crypto";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { toSeconds } from "../../Util/Duration.js";
/**
 * An AWS Fault Injection Service (FIS) experiment template — a reusable
 * definition of a chaos-engineering experiment: the targets to disrupt, the
 * fault actions to run against them, and the stop conditions that abort a
 * runaway experiment.
 *
 * Creating a template is free and does not disrupt any resources — faults
 * are only injected when an experiment is explicitly started from the
 * template.
 * ### Creating Experiment Templates
 * **Example:** Stop EC2 instances selected by tag
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const role = yield* AWS.IAM.Role("FisRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "fis.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: [
 *     "arn:aws:iam::aws:policy/service-role/AWSFaultInjectionSimulatorEC2Access",
 *   ],
 * });
 *
 * const template = yield* AWS.FIS.ExperimentTemplate("StopInstances", {
 *   description: "Stop one tagged instance for two minutes",
 *   roleArn: role.roleArn,
 *   targets: {
 *     Instances: {
 *       resourceType: "aws:ec2:instance",
 *       resourceTags: { ChaosReady: "true" },
 *       selectionMode: "COUNT(1)",
 *     },
 *   },
 *   actions: {
 *     StopInstances: {
 *       actionId: "aws:ec2:stop-instances",
 *       parameters: { startInstancesAfterDuration: "PT2M" },
 *       targets: { Instances: "Instances" },
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Stop condition backed by a CloudWatch alarm
 * ```typescript
 * const template = yield* AWS.FIS.ExperimentTemplate("GuardedExperiment", {
 *   roleArn: role.roleArn,
 *   targets: {
 *     Instances: {
 *       resourceType: "aws:ec2:instance",
 *       resourceTags: { ChaosReady: "true" },
 *       selectionMode: "ALL",
 *     },
 *   },
 *   actions: {
 *     StopInstances: {
 *       actionId: "aws:ec2:stop-instances",
 *       targets: { Instances: "Instances" },
 *     },
 *   },
 *   stopConditions: [
 *     {
 *       source: "aws:cloudwatch:alarm",
 *       value: alarmArn,
 *     },
 *   ],
 * });
 * ```
 *
 * **Example:** Wait action sequenced after a fault
 * ```typescript
 * const template = yield* AWS.FIS.ExperimentTemplate("SequencedExperiment", {
 *   roleArn: role.roleArn,
 *   actions: {
 *     Wait: {
 *       actionId: "aws:fis:wait",
 *       parameters: { duration: "PT1M" },
 *     },
 *     WaitAgain: {
 *       actionId: "aws:fis:wait",
 *       parameters: { duration: "PT1M" },
 *       startAfter: ["Wait"],
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const ExperimentTemplate = Resource("AWS.FIS.ExperimentTemplate");
/**
 * A freshly created IAM role referenced by `roleArn` can take a few seconds
 * to become visible to FIS, which rejects the create/update with a
 * `ValidationException` until the role propagates. Bounded retry through the
 * propagation window. Explicitly typed so the conditional `Retry.Return`
 * type never leaks into declaration emit.
 */
const retryRolePropagation = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ValidationException",
    schedule: Schedule.max([Schedule.fixed("2 seconds"), Schedule.recurs(10)]),
});
/**
 * Deterministic stringification for observed-vs-desired comparison: sorts
 * object keys and drops `undefined` members, empty arrays, and empty objects
 * so wire-level "absent" and "empty" compare equal.
 */
const normalize = (value) => {
    if (Array.isArray(value)) {
        const items = value.map(normalize).filter((v) => v !== undefined);
        return items.length === 0 ? undefined : items;
    }
    if (typeof value === "object" && value !== null) {
        const entries = Object.entries(value)
            .map(([k, v]) => [k, normalize(v)])
            .filter(([, v]) => v !== undefined)
            .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
        return entries.length === 0 ? undefined : Object.fromEntries(entries);
    }
    return value;
};
const stableStringify = (value) => JSON.stringify(normalize(value) ?? null);
export const ExperimentTemplateProvider = () => Provider.effect(ExperimentTemplate, Effect.gen(function* () {
    const getTemplate = (templateId) => fis.getExperimentTemplate({ id: templateId }).pipe(Effect.map((r) => r.experimentTemplate), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    // FIS template IDs are server-generated, so when the cached output is
    // lost (state persistence failure) we recover our template by the
    // internal Alchemy tags carried on the list summaries. The match is
    // scoped to the INSTANCE id (not just stack/stage/logical id): during a
    // replacement the new instance must not "recover" the old physical
    // template — it has to create a fresh one.
    const findByTags = Effect.fn(function* (id, instanceId) {
        const summaries = yield* fis.listExperimentTemplates.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
        for (const summary of summaries) {
            if (summary.id !== undefined &&
                tagRecord(summary.tags)["alchemy::instance"] === instanceId &&
                (yield* hasAlchemyTags(id, summary.tags))) {
                return yield* getTemplate(summary.id);
            }
        }
        return undefined;
    });
    const toAttrs = (template) => ({
        id: template.id,
        arn: template.arn,
        roleArn: template.roleArn,
    });
    // Report-capture durations are `Duration.Input`s; the FIS wire format
    // is an ISO-8601 duration string (e.g. `PT10M`). Normalize through the
    // central Duration util (handles state-persisted Duration JSON), then
    // emit hours when the duration is whole hours, else minutes, else
    // seconds, matching the canonical forms FIS reports back.
    const toIsoDuration = (input) => {
        if (input === undefined)
            return undefined;
        const seconds = toSeconds(input);
        if (seconds > 0 && seconds % 3600 === 0)
            return `PT${seconds / 3600}H`;
        if (seconds % 60 === 0)
            return `PT${seconds / 60}M`;
        return `PT${seconds}S`;
    };
    // Project the report configuration into the wire shape (ISO-8601
    // duration strings).
    const projectReportConfiguration = (config) => config
        ? {
            ...config,
            preExperimentDuration: toIsoDuration(config.preExperimentDuration),
            postExperimentDuration: toIsoDuration(config.postExperimentDuration),
        }
        : undefined;
    // The desired mutable state, projected into the wire shape that
    // `getExperimentTemplate` reports so observed-vs-desired comparison is
    // structural.
    const projectDesired = (id, props) => ({
        description: props.description ?? id,
        roleArn: props.roleArn,
        stopConditions: props.stopConditions ?? [{ source: "none" }],
        targets: props.targets ?? {},
        actions: props.actions,
        // Settable-but-not-removable aspects only participate in the
        // comparison while the user declares them, so dropping the prop
        // doesn't cause a perpetual (and futile) update call.
        logConfiguration: props.logConfiguration
            ? {
                ...props.logConfiguration,
                logSchemaVersion: props.logConfiguration.logSchemaVersion ?? 2,
            }
            : undefined,
        emptyTargetResolutionMode: props.experimentOptions?.emptyTargetResolutionMode,
        experimentReportConfiguration: projectReportConfiguration(props.experimentReportConfiguration),
    });
    const projectObserved = (template, props) => ({
        description: template.description,
        roleArn: template.roleArn,
        stopConditions: template.stopConditions ?? [],
        targets: template.targets ?? {},
        actions: template.actions ?? {},
        logConfiguration: props.logConfiguration
            ? template.logConfiguration
            : undefined,
        emptyTargetResolutionMode: props.experimentOptions
            ?.emptyTargetResolutionMode
            ? template.experimentOptions?.emptyTargetResolutionMode
            : undefined,
        experimentReportConfiguration: props.experimentReportConfiguration
            ? template.experimentReportConfiguration
            : undefined,
    });
    return ExperimentTemplate.Provider.of({
        stables: ["id", "arn"],
        // Enumerate every experiment template in the ambient account/region,
        // hydrating each summary into the full attribute shape. A template
        // can vanish between enumeration and hydration; drop it.
        list: () => Effect.gen(function* () {
            const summaries = yield* fis.listExperimentTemplates.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
            const items = yield* Effect.forEach(summaries, (summary) => summary.id === undefined
                ? Effect.succeed(undefined)
                : getTemplate(summary.id).pipe(Effect.map((t) => (t ? toAttrs(t) : undefined))), { concurrency: 10 });
            return items.filter((item) => item !== undefined);
        }),
        read: Effect.fn(function* ({ id, instanceId, output }) {
            const template = output?.id
                ? yield* getTemplate(output.id)
                : yield* findByTags(id, instanceId);
            if (template === undefined)
                return undefined;
            const attrs = toAttrs(template);
            return (yield* hasAlchemyTags(id, template.tags))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            // accountTargeting is create-only — changing it replaces. Other
            // props (commonly roleArn) are unresolved Outputs during plan, so
            // narrow only the field replacement detection needs rather than
            // requiring the whole props object to be resolved.
            const newOptions = news.experimentOptions;
            if (newOptions !== undefined && !isResolved(newOptions)) {
                return undefined;
            }
            const oldTargeting = olds.experimentOptions?.accountTargeting ?? "single-account";
            const newTargeting = newOptions?.accountTargeting ?? "single-account";
            if (oldTargeting !== newTargeting) {
                return { action: "replace" };
            }
            // fall through: undefined → default update
        }),
        reconcile: Effect.fn(function* ({ id, instanceId, news, output, session, }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = {
                ...news.tags,
                ...internalTags,
                "alchemy::instance": instanceId,
            };
            const desired = projectDesired(id, news);
            // 1. Observe — cloud state is authoritative; output is only an id
            // cache. Fall back to instance-scoped tag recovery when the id is
            // unknown (state persistence failure).
            let observed = output?.id ? yield* getTemplate(output.id) : undefined;
            if (observed === undefined) {
                observed = yield* findByTags(id, instanceId);
            }
            // 2. Ensure — create if missing. The clientToken is a per-request
            // idempotency token, not a physical name.
            if (observed === undefined) {
                const clientToken = yield* Effect.sync(() => crypto.randomUUID());
                observed = yield* retryRolePropagation(fis.createExperimentTemplate({
                    clientToken,
                    description: desired.description,
                    stopConditions: desired.stopConditions,
                    targets: desired.targets,
                    actions: desired.actions,
                    roleArn: news.roleArn,
                    logConfiguration: desired.logConfiguration,
                    experimentOptions: news.experimentOptions,
                    experimentReportConfiguration: desired.experimentReportConfiguration,
                    tags: desiredTags,
                })).pipe(Effect.map((r) => r.experimentTemplate));
            }
            else if (
            // 3a. Sync definition — compare the observed template against the
            // desired projection and apply a single update on any delta
            // (UpdateExperimentTemplate replaces the provided aspects
            // wholesale). Skip the API entirely on no-op.
            stableStringify(projectObserved(observed, news)) !==
                stableStringify(desired)) {
                observed = yield* retryRolePropagation(fis.updateExperimentTemplate({
                    id: observed.id,
                    description: desired.description,
                    stopConditions: desired.stopConditions,
                    targets: desired.targets,
                    actions: desired.actions,
                    roleArn: news.roleArn,
                    logConfiguration: desired.logConfiguration,
                    experimentOptions: news.experimentOptions
                        ? {
                            emptyTargetResolutionMode: news.experimentOptions.emptyTargetResolutionMode,
                        }
                        : undefined,
                    experimentReportConfiguration: desired.experimentReportConfiguration,
                })).pipe(Effect.map((r) => r.experimentTemplate));
            }
            // 3b. Sync tags — diff against the OBSERVED cloud tags (the create
            // path already landed them, so this is a no-op there; adoption and
            // out-of-band drift converge here).
            const arn = observed.arn;
            const currentTags = tagRecord(observed.tags);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* fis.tagResource({
                    resourceArn: arn,
                    tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                });
            }
            if (removed.length > 0) {
                yield* fis.untagResource({
                    resourceArn: arn,
                    tagKeys: removed,
                });
            }
            yield* session.note(observed.id);
            return toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* fis
                .deleteExperimentTemplate({ id: output.id })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=ExperimentTemplate.js.map