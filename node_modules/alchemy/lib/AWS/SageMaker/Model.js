import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
/**
 * An Amazon SageMaker Model — the immutable pairing of an inference
 * container image (and optional S3 model artifacts) with an execution role.
 * A model is pure configuration: it costs nothing until it is deployed to an
 * endpoint via an `EndpointConfig` + `Endpoint`.
 *
 * SageMaker models are immutable — any change other than tags replaces the
 * model.
 * ### Creating Models
 * **Example:** Model from an ECR image
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const role = yield* AWS.IAM.Role("SageMakerRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "sagemaker.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: ["arn:aws:iam::aws:policy/AmazonSageMakerFullAccess"],
 * });
 *
 * const model = yield* AWS.SageMaker.Model("MyModel", {
 *   executionRoleArn: role.roleArn,
 *   primaryContainer: {
 *     Image: "123456789012.dkr.ecr.us-west-2.amazonaws.com/my-inference:latest",
 *     ModelDataUrl: "s3://my-bucket/model.tar.gz",
 *   },
 * });
 * ```
 *
 * **Example:** Serverless deployment (Model → EndpointConfig → Endpoint)
 * ```typescript
 * const config = yield* AWS.SageMaker.EndpointConfig("MyConfig", {
 *   productionVariants: [{
 *     VariantName: "AllTraffic",
 *     ModelName: model.modelName,
 *     ServerlessConfig: { MemorySizeInMB: 2048, MaxConcurrency: 5 },
 *   }],
 * });
 * const endpoint = yield* AWS.SageMaker.Endpoint("MyEndpoint", {
 *   endpointConfigName: config.endpointConfigName,
 * });
 * ```
 *
 * @resource
 */
export const Model = Resource("AWS.SageMaker.Model");
const createModelName = (id, props) => props.modelName
    ? Effect.succeed(props.modelName)
    : createPhysicalName({ id, maxLength: 63 });
const fetchModelTags = Effect.fn(function* (arn) {
    const tags = yield* sagemaker.listTags.items({ ResourceArn: arn }).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk)), 
    // A just-deleted (or foreign) resource ARN surfaces as AccessDenied.
    Effect.catchTag("AccessDeniedException", () => Effect.succeed([])));
    return Object.fromEntries(tags.flatMap((tag) => tag.Key !== undefined ? [[tag.Key, tag.Value ?? ""]] : []));
});
const readModel = Effect.fn(function* (modelName) {
    const described = yield* sagemaker
        .describeModel({ ModelName: modelName })
        .pipe(Effect.catchTag("ModelNotFound", () => Effect.succeed(undefined)));
    if (!described)
        return undefined;
    return {
        modelName: described.ModelName,
        modelArn: described.ModelArn,
    };
});
// CreateModel validates the execution role (existence + sagemaker trust); a
// freshly-created IAM role takes a few seconds to propagate and surfaces as
// ValidationException. Bounded retry through the propagation window.
// Explicitly typed so Retry.Return's conditional type never reaches
// declaration emit (it would widen AWS.providers() to unknown downstream).
const retryThroughIamPropagation = (self) => Effect.retry(self, {
    while: (e) => e._tag === "ValidationException",
    schedule: Schedule.max([Schedule.spaced("5 seconds"), Schedule.recurs(10)]),
});
export const ModelProvider = () => Provider.effect(Model, Effect.gen(function* () {
    return {
        stables: ["modelName", "modelArn"],
        list: () => Effect.gen(function* () {
            const summaries = yield* sagemaker.listModels.pages({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.Models ?? [])));
            return summaries.flatMap((s) => s.ModelName !== undefined && s.ModelArn !== undefined
                ? [{ modelName: s.ModelName, modelArn: s.ModelArn }]
                : []);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const modelName = output?.modelName ?? (yield* createModelName(id, olds ?? {}));
            const attrs = yield* readModel(modelName);
            if (!attrs)
                return undefined;
            const tags = yield* fetchModelTags(attrs.modelArn);
            return (yield* hasAlchemyTags(id, tags))
                ? attrs
                : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            // SageMaker models are immutable — everything except tags replaces.
            const identity = (props) => [
                props.primaryContainer,
                props.containers,
                props.inferenceExecutionConfig,
                props.executionRoleArn,
                props.vpcConfig,
                props.enableNetworkIsolation ?? false,
            ];
            const oldName = yield* createModelName(id, olds);
            const newName = yield* createModelName(id, news);
            if (oldName !== newName ||
                JSON.stringify(identity(olds)) !== JSON.stringify(identity(news))) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("SageMaker Model requires props"));
            }
            const modelName = output?.modelName ?? (yield* createModelName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — cloud state is authoritative.
            let attrs = yield* readModel(modelName);
            // Ensure — create if missing; tolerate the already-exists race.
            if (attrs === undefined) {
                yield* retryThroughIamPropagation(sagemaker.createModel({
                    ModelName: modelName,
                    PrimaryContainer: news.primaryContainer,
                    Containers: news.containers,
                    InferenceExecutionConfig: news.inferenceExecutionConfig,
                    ExecutionRoleArn: news.executionRoleArn,
                    VpcConfig: news.vpcConfig,
                    EnableNetworkIsolation: news.enableNetworkIsolation,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })).pipe(Effect.catchTag("ModelAlreadyExists", () => Effect.void));
                attrs = yield* readModel(modelName);
                if (attrs === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created model ${modelName}`));
                }
            }
            // Sync tags — diff against OBSERVED cloud tags.
            const currentTags = yield* fetchModelTags(attrs.modelArn);
            const { removed, upsert } = diffTags(currentTags, desiredTags);
            if (removed.length > 0) {
                yield* sagemaker.deleteTags({
                    ResourceArn: attrs.modelArn,
                    TagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* sagemaker.addTags({
                    ResourceArn: attrs.modelArn,
                    Tags: upsert.map(({ Key, Value }) => ({ Key, Value })),
                });
            }
            yield* session.note(attrs.modelArn);
            return attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* sagemaker
                .deleteModel({ ModelName: output.modelName })
                .pipe(Effect.catchTag("ModelNotFound", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Model.js.map