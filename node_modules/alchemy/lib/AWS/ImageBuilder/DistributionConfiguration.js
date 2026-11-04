import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { driftedFrom, imageBuilderArn, retryWhileDependedOn, syncImageBuilderTags, toTagRecord, } from "./internal.js";
/**
 * An EC2 Image Builder distribution configuration — defines where and how
 * the output AMIs (or containers) of a pipeline are distributed across
 * regions and accounts.
 * ### Creating a Distribution Configuration
 * **Example:** Distribute in the Build Region
 * ```typescript
 * const distribution = yield* ImageBuilder.DistributionConfiguration("Dist", {
 *   distributions: [{
 *     region: "us-west-2",
 *     amiDistributionConfiguration: {
 *       name: "my-app-{{ imagebuilder:buildDate }}",
 *       amiTags: { project: "my-app" },
 *     },
 *   }],
 * });
 * ```
 *
 * ### Using in a Pipeline
 * **Example:** Wire into an Image Pipeline
 * ```typescript
 * const pipeline = yield* ImageBuilder.ImagePipeline("Pipeline", {
 *   imageRecipeArn: recipe.imageRecipeArn,
 *   infrastructureConfigurationArn: infra.infrastructureConfigurationArn,
 *   distributionConfigurationArn: distribution.distributionConfigurationArn,
 * });
 * ```
 *
 * @resource
 */
export const DistributionConfiguration = Resource("AWS.ImageBuilder.DistributionConfiguration");
export const DistributionConfigurationProvider = () => Provider.effect(DistributionConfiguration, Effect.gen(function* () {
    const toName = (id, props) => props.distributionConfigurationName
        ? Effect.succeed(props.distributionConfigurationName)
        : createPhysicalName({ id, maxLength: 126 });
    const toArn = (name) => imageBuilderArn("distribution-configuration", name);
    const getConfiguration = Effect.fn(function* (arn) {
        const response = yield* imagebuilder
            .getDistributionConfiguration({
            distributionConfigurationArn: arn,
        })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.distributionConfiguration;
    });
    const toAttrs = Effect.fn(function* (config) {
        if (!config.arn || !config.name) {
            return yield* Effect.fail(new Error("Image Builder distribution configuration is missing its ARN or name"));
        }
        return {
            distributionConfigurationName: config.name,
            distributionConfigurationArn: config.arn,
            dateCreated: config.dateCreated,
        };
    });
    return {
        stables: [
            "distributionConfigurationName",
            "distributionConfigurationArn",
        ],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arn = output?.distributionConfigurationArn ??
                (yield* toArn(yield* toName(id, olds)));
            const config = yield* getConfiguration(arn);
            if (config === undefined)
                return undefined;
            const attrs = yield* toAttrs(config);
            const tags = toTagRecord(config.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
            // One idempotency token per reconcile — retries within this run
            // are deduplicated by the API.
            const clientToken = yield* Effect.sync(() => crypto.randomUUID());
            const name = output?.distributionConfigurationName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe.
            const arn = output?.distributionConfigurationArn ?? (yield* toArn(name));
            let observed = yield* getConfiguration(arn);
            // 2. Ensure — create if missing; tolerate an AlreadyExists race.
            if (observed === undefined) {
                const created = yield* imagebuilder
                    .createDistributionConfiguration({
                    name,
                    description: news.description,
                    distributions: news.distributions,
                    tags: desiredTags,
                    clientToken,
                })
                    .pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.succeed(undefined)));
                observed = yield* getConfiguration(created?.distributionConfigurationArn ?? arn);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`created Image Builder distribution configuration '${name}' is not readable`));
                }
            }
            // 3. Sync — compare OBSERVED distributions/description against
            //    desired; a full-PUT update converges any drift.
            const drifted = driftedFrom(observed.distributions, news.distributions) ||
                driftedFrom(observed.description, news.description) ||
                (news.description === undefined && olds?.description !== undefined);
            if (drifted && observed.arn) {
                yield* imagebuilder.updateDistributionConfiguration({
                    distributionConfigurationArn: observed.arn,
                    description: news.description,
                    distributions: news.distributions,
                    clientToken,
                });
                observed = (yield* getConfiguration(observed.arn)) ?? observed;
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
            yield* retryWhileDependedOn(imagebuilder.deleteDistributionConfiguration({
                distributionConfigurationArn: output.distributionConfigurationArn,
            })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
        list: () => imagebuilder.listDistributionConfigurations.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.distributionConfigurationSummaryList ?? []).filter((summary) => summary.arn !== undefined && summary.name !== undefined))), Effect.map((summaries) => summaries.map((summary) => ({
            distributionConfigurationName: summary.name,
            distributionConfigurationArn: summary.arn,
            dateCreated: summary.dateCreated,
        })))),
    };
}));
//# sourceMappingURL=DistributionConfiguration.js.map