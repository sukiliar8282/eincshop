import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireMinutes } from "../../Util/Duration.js";
import { deleteImageBuilderLogGroup, driftedFrom, imageBuilderArn, retryWhileDependedOn, syncImageBuilderTags, toTagRecord, } from "./internal.js";
/** Convert the duration-typed test settings to the wire shape. */
const toWireImageTests = (config) => config === undefined
    ? undefined
    : {
        imageTestsEnabled: config.imageTestsEnabled,
        timeoutMinutes: toWireMinutes(config.timeout),
    };
/**
 * An EC2 Image Builder image pipeline — wires a recipe to an infrastructure
 * configuration (and optionally a distribution configuration) and automates
 * image builds on a schedule or on demand.
 *
 * Creating the pipeline does not start a build; builds start on the
 * configured schedule or when explicitly invoked.
 * ### Creating an Image Pipeline
 * **Example:** Manual-Only Pipeline
 * ```typescript
 * const pipeline = yield* ImageBuilder.ImagePipeline("Pipeline", {
 *   imageRecipeArn: recipe.imageRecipeArn,
 *   infrastructureConfigurationArn: infra.infrastructureConfigurationArn,
 *   status: "DISABLED",
 * });
 * ```
 *
 * **Example:** Scheduled Pipeline with Distribution
 * ```typescript
 * const pipeline = yield* ImageBuilder.ImagePipeline("Nightly", {
 *   imageRecipeArn: recipe.imageRecipeArn,
 *   infrastructureConfigurationArn: infra.infrastructureConfigurationArn,
 *   distributionConfigurationArn: distribution.distributionConfigurationArn,
 *   schedule: {
 *     scheduleExpression: "cron(0 9 * * ? *)",
 *     pipelineExecutionStartCondition:
 *       "EXPRESSION_MATCH_AND_DEPENDENCY_UPDATES_AVAILABLE",
 *   },
 * });
 * ```
 *
 * @resource
 */
export const ImagePipeline = Resource("AWS.ImageBuilder.ImagePipeline");
export const ImagePipelineProvider = () => Provider.effect(ImagePipeline, Effect.gen(function* () {
    const toName = (id, props) => props.imagePipelineName
        ? Effect.succeed(props.imagePipelineName)
        : createPhysicalName({ id, maxLength: 126 });
    const toArn = (name) => imageBuilderArn("image-pipeline", name);
    const getPipeline = Effect.fn(function* (arn) {
        const response = yield* imagebuilder
            .getImagePipeline({ imagePipelineArn: arn })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.imagePipeline;
    });
    const toAttrs = Effect.fn(function* (pipeline) {
        if (!pipeline.arn || !pipeline.name) {
            return yield* Effect.fail(new Error("Image Builder image pipeline is missing its ARN or name"));
        }
        return {
            imagePipelineName: pipeline.name,
            imagePipelineArn: pipeline.arn,
            platform: pipeline.platform,
            status: pipeline.status,
            dateCreated: pipeline.dateCreated,
        };
    });
    /** Mutable aspects synced by a full-PUT update. */
    const mutableKeys = [
        "description",
        "imageRecipeArn",
        "containerRecipeArn",
        "infrastructureConfigurationArn",
        "distributionConfigurationArn",
        "imageTestsConfiguration",
        "enhancedImageMetadataEnabled",
        "schedule",
        "status",
        "imageScanningConfiguration",
        "workflows",
        "executionRole",
    ];
    return {
        stables: ["imagePipelineName", "imagePipelineArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arn = output?.imagePipelineArn ?? (yield* toArn(yield* toName(id, olds)));
            const pipeline = yield* getPipeline(arn);
            if (pipeline === undefined)
                return undefined;
            const attrs = yield* toAttrs(pipeline);
            const tags = toTagRecord(pipeline.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
            // One idempotency token per reconcile — retries within this run
            // are deduplicated by the API.
            const clientToken = yield* Effect.sync(() => crypto.randomUUID());
            const name = output?.imagePipelineName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Desired state in wire shape (Duration timeout → whole minutes)
            // so create/update/drift all compare like against like.
            const desired = {
                ...news,
                imageTestsConfiguration: toWireImageTests(news.imageTestsConfiguration),
            };
            // 1. Observe.
            const arn = output?.imagePipelineArn ?? (yield* toArn(name));
            let observed = yield* getPipeline(arn);
            // 2. Ensure — create if missing; tolerate an AlreadyExists race.
            if (observed === undefined) {
                const created = yield* imagebuilder
                    .createImagePipeline({
                    name,
                    description: news.description,
                    imageRecipeArn: news.imageRecipeArn,
                    containerRecipeArn: news.containerRecipeArn,
                    infrastructureConfigurationArn: news.infrastructureConfigurationArn,
                    distributionConfigurationArn: news.distributionConfigurationArn,
                    imageTestsConfiguration: desired.imageTestsConfiguration,
                    enhancedImageMetadataEnabled: news.enhancedImageMetadataEnabled,
                    schedule: news.schedule,
                    status: news.status,
                    imageScanningConfiguration: news.imageScanningConfiguration,
                    workflows: news.workflows,
                    executionRole: news.executionRole,
                    tags: desiredTags,
                    clientToken,
                })
                    .pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.succeed(undefined)));
                observed = yield* getPipeline(created?.imagePipelineArn ?? arn);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`created Image Builder pipeline '${name}' is not readable`));
                }
            }
            // 3. Sync — compare OBSERVED cloud state against the desired
            //    props; a full-PUT update converges any drift (`olds` is only
            //    a hint for removed props).
            const drifted = mutableKeys.some((key) => driftedFrom(observed?.[key], desired[key]) ||
                (desired[key] === undefined && olds?.[key] !== undefined));
            if (drifted && observed.arn) {
                yield* imagebuilder.updateImagePipeline({
                    imagePipelineArn: observed.arn,
                    description: news.description,
                    imageRecipeArn: news.imageRecipeArn,
                    containerRecipeArn: news.containerRecipeArn,
                    infrastructureConfigurationArn: news.infrastructureConfigurationArn,
                    distributionConfigurationArn: news.distributionConfigurationArn,
                    imageTestsConfiguration: desired.imageTestsConfiguration,
                    enhancedImageMetadataEnabled: news.enhancedImageMetadataEnabled,
                    schedule: news.schedule,
                    status: news.status,
                    imageScanningConfiguration: news.imageScanningConfiguration,
                    workflows: news.workflows,
                    executionRole: news.executionRole,
                    clientToken,
                });
                observed = (yield* getPipeline(observed.arn)) ?? observed;
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            if (observed.arn) {
                yield* syncImageBuilderTags(observed.arn, desiredTags);
            }
            // 4. Return fresh attributes.
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileDependedOn(imagebuilder.deleteImagePipeline({
                imagePipelineArn: output.imagePipelineArn,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Image Builder creates this fixed group outside of the pipeline
            // API. Delete only the exact group derived from this owned output,
            // and only after the pipeline itself is observed absent.
            for (let attempt = 0; attempt < 30; attempt++) {
                if ((yield* getPipeline(output.imagePipelineArn)) === undefined) {
                    yield* deleteImageBuilderLogGroup(`/aws/imagebuilder/pipeline/${output.imagePipelineName.toLowerCase()}`);
                    return;
                }
                yield* Effect.sleep("1 second");
            }
            return yield* Effect.die(new Error(`Image Builder pipeline ${output.imagePipelineArn} remained observable 30 seconds after delete`));
        }),
        list: () => imagebuilder.listImagePipelines.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.imagePipelineList ?? []).filter((pipeline) => pipeline.arn !== undefined && pipeline.name !== undefined))), Effect.map((pipelines) => pipelines.map((pipeline) => ({
            imagePipelineName: pipeline.name,
            imagePipelineArn: pipeline.arn,
            platform: pipeline.platform,
            status: pipeline.status,
            dateCreated: pipeline.dateCreated,
        })))),
    };
}));
//# sourceMappingURL=ImagePipeline.js.map