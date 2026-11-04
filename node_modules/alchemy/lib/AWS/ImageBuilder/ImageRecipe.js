import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { deepEqual } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { deleteImageBuilderLogGroup, imageBuilderArn, immutableVersionKeysChanged, retryWhileDependedOn, syncImageBuilderTags, toTagRecord, } from "./internal.js";
/**
 * Image Builder image recipe versions are immutable — the deployed recipe
 * differs from the desired one but the semantic version was not bumped, so
 * the cloud state cannot be converged.
 */
export class ImageRecipeVersionImmutable extends Data.TaggedError("AWS::ImageBuilder::ImageRecipeVersionImmutable") {
}
/**
 * An EC2 Image Builder image recipe — the blueprint that combines a parent
 * image with an ordered list of components to produce a new AMI.
 *
 * Recipes are immutable versions: every property except `tags` replaces the
 * recipe. Bump `semanticVersion` when changing the definition.
 * ### Creating an Image Recipe
 * **Example:** Recipe from an AWS-Managed Parent Image
 * ```typescript
 * const recipe = yield* ImageBuilder.ImageRecipe("Recipe", {
 *   parentImage: "arn:aws:imagebuilder:us-west-2:aws:image/amazon-linux-2023-x86/x.x.x",
 *   semanticVersion: "1.0.0",
 *   components: [{ componentArn: component.componentBuildVersionArn }],
 * });
 * ```
 *
 * ### Using in a Pipeline
 * **Example:** Wire into an Image Pipeline
 * ```typescript
 * const pipeline = yield* ImageBuilder.ImagePipeline("Pipeline", {
 *   imageRecipeArn: recipe.imageRecipeArn,
 *   infrastructureConfigurationArn: infra.infrastructureConfigurationArn,
 * });
 * ```
 *
 * @resource
 */
export const ImageRecipe = Resource("AWS.ImageBuilder.ImageRecipe");
export const ImageRecipeProvider = () => Provider.effect(ImageRecipe, Effect.gen(function* () {
    const toName = (id, props) => props.imageRecipeName
        ? Effect.succeed(props.imageRecipeName)
        : createPhysicalName({ id, maxLength: 126 });
    const toVersion = (props) => props.semanticVersion ?? "1.0.0";
    const toArn = (name, version) => imageBuilderArn("image-recipe", `${name}/${version}`);
    const getRecipe = Effect.fn(function* (arn) {
        const response = yield* imagebuilder
            .getImageRecipe({ imageRecipeArn: arn })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.imageRecipe;
    });
    const toAttrs = Effect.fn(function* (recipe) {
        if (!recipe.arn || !recipe.name || !recipe.version) {
            return yield* Effect.fail(new Error("Image Builder image recipe is missing its ARN, name, or version"));
        }
        return {
            imageRecipeName: recipe.name,
            imageRecipeArn: recipe.arn,
            semanticVersion: recipe.version,
            platform: recipe.platform,
            parentImage: recipe.parentImage,
            dateCreated: recipe.dateCreated,
        };
    });
    return {
        stables: ["imageRecipeName", "semanticVersion"],
        // Recipes are immutable — any changed property except tags
        // replaces. Individual keys may still hold unresolved Outputs at
        // plan time (e.g. the ARN of a component being replaced in the
        // same deploy); compare per key so a resolved change (like a
        // semanticVersion bump) still plans a replacement, and let the
        // reconcile immutability guard catch drift hidden behind an
        // unresolved key.
        diff: Effect.fn(function* ({ olds, news }) {
            const immutableKeys = [
                "imageRecipeName",
                "semanticVersion",
                "parentImage",
                "components",
                "description",
                "blockDeviceMappings",
                "workingDirectory",
                "additionalInstanceConfiguration",
                "amiTags",
            ];
            if (immutableVersionKeysChanged(olds, news, immutableKeys)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arn = output?.imageRecipeArn ??
                (yield* toArn(yield* toName(id, olds), toVersion(olds)));
            const recipe = yield* getRecipe(arn);
            if (recipe === undefined)
                return undefined;
            const attrs = yield* toAttrs(recipe);
            const tags = toTagRecord(recipe.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            // One idempotency token per reconcile — retries within this run
            // are deduplicated by the API.
            const clientToken = yield* Effect.sync(() => crypto.randomUUID());
            const name = output?.imageRecipeName ?? (yield* toName(id, news));
            const version = output?.semanticVersion ?? toVersion(news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — the recipe ARN is deterministic from name+version.
            const arn = output?.imageRecipeArn ?? (yield* toArn(name, version));
            let observed = yield* getRecipe(arn);
            // Immutability guard — the version already exists in the cloud
            // with a different definition (e.g. a component was replaced
            // without bumping the recipe version). It cannot be converged in
            // place; the user must bump `semanticVersion`.
            if (observed !== undefined) {
                const observedComponents = (observed.components ?? []).map((component) => component.componentArn);
                const desiredComponents = news.components.map((component) => component.componentArn);
                if (!deepEqual(observedComponents, desiredComponents) ||
                    observed.parentImage !== news.parentImage) {
                    return yield* new ImageRecipeVersionImmutable({
                        message: `Image Builder recipe '${name}' version '${version}' already exists with a different definition — bump semanticVersion to publish the change`,
                    });
                }
            }
            // 2. Ensure — recipes are immutable; missing is the only create
            //    path.
            if (observed === undefined) {
                const created = yield* imagebuilder.createImageRecipe({
                    name,
                    semanticVersion: version,
                    parentImage: news.parentImage,
                    components: news.components,
                    description: news.description,
                    blockDeviceMappings: news.blockDeviceMappings,
                    workingDirectory: news.workingDirectory,
                    additionalInstanceConfiguration: news.additionalInstanceConfiguration,
                    amiTags: news.amiTags,
                    tags: desiredTags,
                    clientToken,
                });
                if (!created.imageRecipeArn) {
                    return yield* Effect.fail(new Error("CreateImageRecipe returned no imageRecipeArn"));
                }
                observed = yield* getRecipe(created.imageRecipeArn);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`created Image Builder recipe '${name}' is not readable`));
                }
            }
            // 3. Sync — tags are the only mutable aspect.
            if (observed.arn) {
                yield* syncImageBuilderTags(observed.arn, desiredTags);
            }
            // 4. Return fresh attributes.
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryWhileDependedOn(imagebuilder.deleteImageRecipe({
                imageRecipeArn: output.imageRecipeArn,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Do not discard state until Image Builder confirms the owned
            // version is gone. The auto-created recipe log group is shared by
            // every version with the same name, so delete it only when no live
            // same-name recipe remains (including a replacement version).
            for (let attempt = 0; attempt < 30; attempt++) {
                if ((yield* getRecipe(output.imageRecipeArn)) === undefined)
                    break;
                if (attempt === 29) {
                    return yield* Effect.die(new Error(`Image Builder recipe ${output.imageRecipeArn} remained observable 30 seconds after delete`));
                }
                yield* Effect.sleep("1 second");
            }
            const summaries = yield* imagebuilder.listImageRecipes
                .pages({ owner: "Self" })
                .pipe(Stream.runCollect, Effect.map((pages) => Array.from(pages).flatMap((page) => page.imageRecipeSummaryList ?? [])));
            const sameName = summaries.filter((summary) => summary.name === output.imageRecipeName &&
                summary.arn !== undefined);
            const liveSameName = yield* Effect.forEach(sameName, (summary) => getRecipe(summary.arn), { concurrency: 4 });
            if (liveSameName.every((recipe) => recipe === undefined)) {
                yield* deleteImageBuilderLogGroup(`/aws/imagebuilder/${output.imageRecipeName}`);
            }
        }),
        list: () => imagebuilder.listImageRecipes.pages({ owner: "Self" }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.imageRecipeSummaryList ?? []).filter((summary) => summary.arn !== undefined))), Effect.flatMap(Effect.forEach((summary) => getRecipe(summary.arn).pipe(Effect.flatMap((recipe) => recipe === undefined
            ? Effect.succeed(undefined)
            : toAttrs(recipe))), { concurrency: 4 })), Effect.map((items) => items.filter((item) => item !== undefined))),
    };
}));
//# sourceMappingURL=ImageRecipe.js.map