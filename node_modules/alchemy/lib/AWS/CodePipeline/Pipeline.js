import * as codepipeline from "@distilled.cloud/aws/codepipeline";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An AWS CodePipeline continuous-delivery pipeline: an ordered set of
 * stages, each running one or more actions (source → build → deploy), with
 * an S3 artifact store carrying outputs between them.
 *
 * Defining and updating the pipeline is instant. Pipelines that use a git
 * source require a CodeConnections connection whose OAuth handshake is
 * completed manually — use an S3 source to avoid the handshake.
 * ### Creating a Pipeline
 * **Example:** S3-Source → CodeBuild Pipeline
 * ```typescript
 * const pipeline = yield* CodePipeline.Pipeline("Release", {
 *   roleArn: role.roleArn,
 *   artifactStore: { type: "S3", location: artifactBucket.bucketName },
 *   stages: [
 *     {
 *       name: "Source",
 *       actions: [{
 *         name: "S3Source",
 *         category: "Source",
 *         owner: "AWS",
 *         provider: "S3",
 *         outputArtifacts: ["SourceOutput"],
 *         configuration: {
 *           S3Bucket: sourceBucket.bucketName,
 *           S3ObjectKey: "source.zip",
 *           PollForSourceChanges: "false",
 *         },
 *       }],
 *     },
 *     {
 *       name: "Build",
 *       actions: [{
 *         name: "Build",
 *         category: "Build",
 *         owner: "AWS",
 *         provider: "CodeBuild",
 *         inputArtifacts: ["SourceOutput"],
 *         configuration: { ProjectName: project.projectName },
 *       }],
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const Pipeline = Resource("AWS.CodePipeline.Pipeline");
/** Convert a CodePipeline wire tag list into a plain record. */
const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.key === "string" && typeof tag.value === "string")
    .map((tag) => [tag.key, tag.value]));
const toWireArtifactStore = (store) => ({
    type: store.type ?? "S3",
    location: store.location,
    encryptionKey: store.encryptionKey,
});
const toWireStages = (stages) => stages.map((stage) => ({
    name: stage.name,
    actions: stage.actions.map((action) => ({
        name: action.name,
        actionTypeId: {
            category: action.category,
            owner: action.owner,
            provider: action.provider,
            version: action.version ?? "1",
        },
        runOrder: action.runOrder,
        configuration: action.configuration,
        inputArtifacts: action.inputArtifacts?.map((n) => ({ name: n })),
        outputArtifacts: action.outputArtifacts?.map((n) => ({ name: n })),
        region: action.region,
        roleArn: action.roleArn,
        namespace: action.namespace,
    })),
}));
const toWireDeclaration = (name, props) => ({
    name,
    roleArn: props.roleArn,
    artifactStore: toWireArtifactStore(props.artifactStore),
    stages: toWireStages(props.stages),
    pipelineType: props.pipelineType ?? "V2",
    executionMode: props.executionMode,
});
/**
 * CodePipeline validates the pipeline role at create time; a freshly created
 * IAM role is not yet assumable, surfacing as an `InvalidStructureException`
 * whose message mentions the role cannot be assumed / is not authorized.
 * Retry (bounded) through IAM propagation. The explicit return annotation
 * keeps the retry's conditional type out of declaration emit (PATTERNS §7).
 */
const retryIamPropagation = (effect) => effect.pipe(Effect.retry({
    while: (e) => {
        const message = (e.message ?? "").toLowerCase();
        return (e._tag === "InvalidStructureException" &&
            (message.includes("not authorized") ||
                message.includes("cannot be assumed") ||
                message.includes("unable to assume")));
    },
    schedule: Schedule.max([
        Schedule.fixed("3 seconds"),
        Schedule.recurs(10),
    ]),
}));
export const PipelineProvider = () => Provider.effect(Pipeline, Effect.gen(function* () {
    const toName = (id, props) => props.pipelineName
        ? Effect.succeed(props.pipelineName)
        : createPhysicalName({ id, maxLength: 100 });
    /** Read a pipeline; a missing pipeline reads as absent. */
    const getPipeline = Effect.fn(function* (name) {
        return yield* codepipeline
            .getPipeline({ name })
            .pipe(Effect.catchTag("PipelineNotFoundException", () => Effect.succeed(undefined)));
    });
    const syncTags = Effect.fn(function* (arn, desiredTags) {
        const observed = yield* codepipeline
            .listTagsForResource({ resourceArn: arn })
            .pipe(Effect.catch(() => Effect.succeed(undefined)));
        const { removed, upsert } = diffTags(toTagRecord(observed?.tags), desiredTags);
        if (upsert.length > 0) {
            yield* codepipeline.tagResource({
                resourceArn: arn,
                tags: upsert.map(({ Key, Value }) => ({ key: Key, value: Value })),
            });
        }
        if (removed.length > 0) {
            yield* codepipeline.untagResource({
                resourceArn: arn,
                tagKeys: removed,
            });
        }
    });
    return {
        stables: ["pipelineName", "pipelineArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds ?? {})) !== (yield* toName(id, news ?? {}))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.pipelineName ?? (yield* toName(id, olds ?? {}));
            const found = yield* getPipeline(name);
            if (found?.metadata?.pipelineArn === undefined)
                return undefined;
            const attrs = {
                pipelineName: found.pipeline?.name ?? name,
                pipelineArn: found.metadata.pipelineArn,
                pipelineVersion: found.pipeline?.version ?? 1,
            };
            const tags = yield* codepipeline
                .listTagsForResource({ resourceArn: attrs.pipelineArn })
                .pipe(Effect.map((res) => toTagRecord(res.tags)), Effect.catch(() => Effect.succeed({})));
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const { accountId, region } = yield* AWSEnvironment.current;
            const name = output?.pipelineName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            const declaration = toWireDeclaration(name, news);
            // 1. Observe — cloud state is authoritative.
            let observed = yield* getPipeline(name);
            // 2. Ensure — create if missing; tolerate the name-in-use race.
            if (observed === undefined) {
                yield* retryIamPropagation(codepipeline.createPipeline({
                    pipeline: declaration,
                    tags: Object.entries(desiredTags).map(([key, value]) => ({
                        key,
                        value,
                    })),
                })).pipe(Effect.catchTag("PipelineNameInUseException", () => Effect.void));
                observed = yield* getPipeline(name);
            }
            else {
                // 3. Sync — updatePipeline is a full upsert of the declaration.
                yield* retryIamPropagation(codepipeline.updatePipeline({ pipeline: declaration }));
                observed = yield* getPipeline(name);
            }
            const arn = observed?.metadata?.pipelineArn ??
                `arn:aws:codepipeline:${region}:${accountId}:${name}`;
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncTags(arn, desiredTags);
            // 4. Return fresh attributes.
            yield* session.note(name);
            return {
                pipelineName: observed?.pipeline?.name ?? name,
                pipelineArn: arn,
                pipelineVersion: observed?.pipeline?.version ?? 1,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            // deletePipeline is idempotent — a missing pipeline returns success.
            yield* codepipeline.deletePipeline({ name: output.pipelineName });
        }),
        list: () => codepipeline.listPipelines.pages({}).pipe(Stream.runCollect, Effect.flatMap((chunk) => Effect.gen(function* () {
            const { accountId, region } = yield* AWSEnvironment.current;
            return Array.from(chunk)
                .flatMap((page) => page.pipelines ?? [])
                .flatMap((p) => p.name !== undefined
                ? [
                    {
                        pipelineName: p.name,
                        pipelineArn: `arn:aws:codepipeline:${region}:${accountId}:${p.name}`,
                        pipelineVersion: p.version ?? 1,
                    },
                ]
                : []);
        }))),
    };
}));
//# sourceMappingURL=Pipeline.js.map