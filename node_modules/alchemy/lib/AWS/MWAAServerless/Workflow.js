import * as logs from "@distilled.cloud/aws/cloudwatch-logs";
import * as mwaa from "@distilled.cloud/aws/mwaa-serverless";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
/**
 * An Amazon Managed Workflows for Apache Airflow **Serverless** workflow —
 * a serverless Airflow DAG defined by a YAML file in S3 and executed by
 * AWS-managed, multi-tenant Airflow infrastructure without provisioning an
 * environment.
 *
 * Each update to the definition or configuration creates a new workflow
 * version; MWAA Serverless keeps only the latest version actively
 * scheduled.
 * ### Creating a Workflow
 * **Example:** Basic Workflow
 * ```typescript
 * import * as MWAAServerless from "alchemy/AWS/MWAAServerless";
 * import * as IAM from "alchemy/AWS/IAM";
 *
 * const role = yield* IAM.Role("WorkflowRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "airflow-serverless.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 * });
 *
 * const workflow = yield* MWAAServerless.Workflow("Etl", {
 *   definitionS3Location: {
 *     bucket: "my-dag-bucket",
 *     objectKey: "workflows/etl.yaml",
 *   },
 *   roleArn: role.roleArn,
 * });
 * ```
 *
 * **Example:** Workflow with Logging and Tags
 * ```typescript
 * const workflow = yield* MWAAServerless.Workflow("Etl", {
 *   definitionS3Location: {
 *     bucket: "my-dag-bucket",
 *     objectKey: "workflows/etl.yaml",
 *   },
 *   roleArn: role.roleArn,
 *   description: "nightly ETL",
 *   loggingConfiguration: { logGroupName: "/mwaa-serverless/etl" },
 *   tags: { team: "data" },
 * });
 * ```
 *
 * @resource
 */
export const Workflow = Resource("AWS.MWAAServerless.Workflow");
/**
 * Bounded retry for `createWorkflow` while a freshly created IAM execution
 * role propagates — the service validates that it can assume the role at
 * create time, which surfaces as a ValidationException/AccessDeniedException
 * mentioning the role for the first seconds of the role's life.
 *
 * Explicitly annotated so the conditional `Retry.Return` type never leaks
 * into declaration emit (it would widen `AWS.providers()` for consumers).
 */
const retryWhileRolePropagates = (self) => Effect.retry(self, {
    while: (e) => (e._tag === "ValidationException" ||
        e._tag === "AccessDeniedException") &&
        /role/i.test(e.message ?? ""),
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(8)]),
});
export const WorkflowProvider = () => Provider.effect(Workflow, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 64 }));
    });
    const observeByArn = (arn) => mwaa
        .getWorkflow({ WorkflowArn: arn })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    const findArnByName = (name) => mwaa.listWorkflows.items({}).pipe(Stream.runCollect, Effect.map((items) => Array.from(items).find((w) => w.Name === name)?.WorkflowArn));
    const observe = Effect.fn(function* (name, arnHint) {
        if (arnHint !== undefined) {
            const found = yield* observeByArn(arnHint);
            if (found !== undefined)
                return found;
        }
        const arn = yield* findArnByName(name);
        return arn === undefined ? undefined : yield* observeByArn(arn);
    });
    const observedTags = (arn) => mwaa.listTagsForResource({ ResourceArn: arn }).pipe(Effect.map((r) => {
        const tags = {};
        for (const [key, value] of Object.entries(r.Tags ?? {})) {
            if (value !== undefined)
                tags[key] = value;
        }
        return tags;
    }), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({})));
    const toDefinitionS3Location = (location) => ({
        Bucket: location.bucket,
        ObjectKey: location.objectKey,
        VersionId: location.versionId,
    });
    const sameDefinition = (live, desired) => live !== undefined &&
        live.Bucket === desired.bucket &&
        live.ObjectKey === desired.objectKey &&
        (desired.versionId === undefined ||
            live.VersionId === desired.versionId);
    const sameNetwork = (live, desired) => JSON.stringify({
        securityGroupIds: live?.SecurityGroupIds ?? [],
        subnetIds: live?.SubnetIds ?? [],
    }) ===
        JSON.stringify({
            securityGroupIds: desired.securityGroupIds ?? [],
            subnetIds: desired.subnetIds ?? [],
        });
    const toAttributes = (live, name) => ({
        name: live.Name ?? name,
        workflowArn: live.WorkflowArn,
        workflowVersion: live.WorkflowVersion,
        workflowStatus: live.WorkflowStatus,
        roleArn: live.RoleArn,
        triggerMode: live.TriggerMode,
    });
    return Workflow.Provider.of({
        stables: ["name", "workflowArn"],
        list: () => Effect.gen(function* () {
            const items = yield* mwaa.listWorkflows
                .items({})
                .pipe(Stream.runCollect);
            const workflows = [];
            for (const item of Array.from(items)) {
                if (item.WorkflowArn === undefined || item.Name === undefined) {
                    continue;
                }
                // tolerate delete races between list and get
                const live = yield* observeByArn(item.WorkflowArn);
                if (live !== undefined && live.Name !== undefined) {
                    workflows.push(toAttributes(live, live.Name));
                }
            }
            return workflows;
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const live = yield* observe(name, output?.workflowArn);
            if (live === undefined || live.Name === undefined) {
                return undefined;
            }
            const attrs = toAttributes(live, name);
            const tags = yield* observedTags(live.WorkflowArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds ?? {});
            const newName = yield* createName(id, news ?? {});
            if (oldName !== newName) {
                return { action: "replace" };
            }
            // Encryption cannot be updated in place — UpdateWorkflow does not
            // accept EncryptionConfiguration.
            const oldEncryption = olds?.encryptionConfiguration;
            const newEncryption = news.encryptionConfiguration;
            if ((oldEncryption?.type ?? "AWS_MANAGED_KEY") !==
                (newEncryption?.type ?? "AWS_MANAGED_KEY") ||
                oldEncryption?.kmsKeyId !== newEncryption?.kmsKeyId) {
                return { action: "replace" };
            }
            // fall through: engine default update logic for mutable fields
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative; output.workflowArn is
            //    only a cache of the identifier.
            let live = yield* observe(name, output?.workflowArn);
            // 2. ENSURE — create when missing. A ConflictException means a
            //    concurrent create (or a previous run's create whose state
            //    persistence failed) raced us: converge on the workflow with
            //    OUR name if one now exists, otherwise propagate.
            if (live === undefined) {
                live = yield* mwaa
                    .createWorkflow({
                    Name: name,
                    DefinitionS3Location: toDefinitionS3Location(news.definitionS3Location),
                    RoleArn: news.roleArn,
                    Description: news.description,
                    EncryptionConfiguration: news.encryptionConfiguration === undefined
                        ? undefined
                        : {
                            Type: news.encryptionConfiguration.type,
                            KmsKeyId: news.encryptionConfiguration.kmsKeyId,
                        },
                    LoggingConfiguration: news.loggingConfiguration === undefined
                        ? undefined
                        : {
                            LogGroupName: news.loggingConfiguration.logGroupName,
                        },
                    EngineVersion: news.engineVersion,
                    NetworkConfiguration: news.networkConfiguration === undefined
                        ? undefined
                        : {
                            SecurityGroupIds: news.networkConfiguration.securityGroupIds,
                            SubnetIds: news.networkConfiguration.subnetIds,
                        },
                    TriggerMode: news.triggerMode,
                    Tags: desiredTags,
                })
                    .pipe(retryWhileRolePropagates, Effect.flatMap((created) => observeByArn(created.WorkflowArn)), Effect.catchTag("ConflictException", (error) => observe(name, undefined).pipe(Effect.flatMap((existing) => existing === undefined
                    ? Effect.fail(error)
                    : Effect.succeed(existing)))));
            }
            const arn = live?.WorkflowArn ?? output?.workflowArn;
            // 3. SYNC — diff each OBSERVED mutable aspect against the desired
            //    state; UpdateWorkflow requires the definition and role, so
            //    issue one full update when any managed aspect drifted (each
            //    update creates a new workflow version — skip on no-op).
            if (live !== undefined && arn !== undefined) {
                const drifted = !sameDefinition(live.DefinitionS3Location, news.definitionS3Location) ||
                    live.RoleArn !== news.roleArn ||
                    (news.description !== undefined &&
                        live.Description !== news.description) ||
                    (news.loggingConfiguration !== undefined &&
                        live.LoggingConfiguration?.LogGroupName !==
                            news.loggingConfiguration.logGroupName) ||
                    (news.engineVersion !== undefined &&
                        live.EngineVersion !== news.engineVersion) ||
                    (news.networkConfiguration !== undefined &&
                        !sameNetwork(live.NetworkConfiguration, news.networkConfiguration)) ||
                    (news.triggerMode !== undefined &&
                        live.TriggerMode !== news.triggerMode);
                if (drifted) {
                    yield* mwaa.updateWorkflow({
                        WorkflowArn: arn,
                        DefinitionS3Location: toDefinitionS3Location(news.definitionS3Location),
                        RoleArn: news.roleArn,
                        Description: news.description,
                        LoggingConfiguration: news.loggingConfiguration === undefined
                            ? undefined
                            : {
                                LogGroupName: news.loggingConfiguration.logGroupName,
                            },
                        EngineVersion: news.engineVersion,
                        NetworkConfiguration: news.networkConfiguration === undefined
                            ? undefined
                            : {
                                SecurityGroupIds: news.networkConfiguration.securityGroupIds,
                                SubnetIds: news.networkConfiguration.subnetIds,
                            },
                        TriggerMode: news.triggerMode,
                    });
                    live = (yield* observeByArn(arn)) ?? live;
                }
            }
            // 3b. SYNC TAGS — diff against OBSERVED cloud tags so adoption
            //     converges (create-time tags only apply on first create).
            if (arn !== undefined) {
                const currentTags = yield* observedTags(arn);
                const { upsert, removed } = diffTags(currentTags, desiredTags);
                if (upsert.length > 0) {
                    yield* mwaa.tagResource({
                        ResourceArn: arn,
                        Tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
                    });
                }
                if (removed.length > 0) {
                    yield* mwaa.untagResource({
                        ResourceArn: arn,
                        TagKeys: removed,
                    });
                }
            }
            yield* session.note(name);
            return {
                name: live?.Name ?? name,
                workflowArn: arn,
                workflowVersion: live?.WorkflowVersion,
                workflowStatus: live?.WorkflowStatus,
                roleArn: live?.RoleArn ?? news.roleArn,
                triggerMode: live?.TriggerMode ?? news.triggerMode,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // Omitting WorkflowVersion deletes the workflow and all versions.
            yield* mwaa
                .deleteWorkflow({ WorkflowArn: output.workflowArn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // MWAA Serverless auto-creates a per-workflow log group named
            // `/aws/mwaa-serverless/{name}-{id}/` (the ARN's resource id,
            // which includes the service-assigned 10-char suffix, plus a
            // trailing slash) at CREATE time, and deleteWorkflow does NOT
            // remove it — without this reap every deleted workflow (including
            // the old workflow of a replacement) leaks an orphaned log group.
            // A group with no streams or provably-quiescent ingestion (last
            // ingestion > 2 minutes ago) has no pending flush and deletes in
            // a single call, so routine deletes of never-run workflows stay
            // fast. A group with recent ingestion — or one that does not
            // exist yet — is re-reaped on a short bounded schedule
            // (t=0s / 20s / 40s) to catch a late log flush from the
            // workflow's final runs; each attempt is idempotent.
            const workflowId = output.workflowArn.split(":workflow/")[1];
            if (workflowId !== undefined) {
                const logGroupName = `/aws/mwaa-serverless/${workflowId}/`;
                const reapLogGroup = logs
                    .deleteLogGroup({ logGroupName })
                    .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
                const observed = yield* logs
                    .describeLogStreams({
                    logGroupName,
                    orderBy: "LastEventTime",
                    descending: true,
                    limit: 1,
                })
                    .pipe(Effect.map((r) => ({
                    exists: true,
                    lastIngestion: r.logStreams?.[0]?.lastIngestionTime,
                })), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed({
                    exists: false,
                    lastIngestion: undefined,
                })));
                const now = yield* Effect.sync(() => Date.now());
                const quiescent = observed.exists &&
                    (observed.lastIngestion === undefined ||
                        now - observed.lastIngestion > 120_000);
                if (quiescent) {
                    yield* reapLogGroup;
                }
                else {
                    yield* reapLogGroup.pipe(Effect.repeat({
                        schedule: Schedule.spaced("20 seconds"),
                        times: 2,
                    }));
                }
            }
        }),
    });
}));
//# sourceMappingURL=Workflow.js.map