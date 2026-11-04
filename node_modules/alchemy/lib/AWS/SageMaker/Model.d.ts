import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ModelProps {
    /**
     * Name of the model. Must be unique within the account/region.
     * Maximum 63 characters, alphanumeric and hyphens.
     * @default ${app}-${stage}-${id}
     */
    modelName?: string;
    /**
     * The primary inference container: the ECR image (and optionally model
     * artifacts in S3) SageMaker runs when the model is deployed to an
     * endpoint. Exactly one of `primaryContainer` or `containers` is required.
     */
    primaryContainer?: sagemaker.ContainerDefinition;
    /**
     * Containers for an inference pipeline (executed as a sequence) or a
     * multi-container model. Mutually exclusive with `primaryContainer`.
     */
    containers?: sagemaker.ContainerDefinition[];
    /**
     * How containers in a multi-container model are run (`Serial` pipeline or
     * `Direct` invocation of a specific container).
     */
    inferenceExecutionConfig?: sagemaker.InferenceExecutionConfig;
    /**
     * ARN of the IAM role SageMaker assumes to pull the container image and
     * model artifacts. The role must trust `sagemaker.amazonaws.com`.
     */
    executionRoleArn: string;
    /**
     * VPC configuration for the model's containers.
     */
    vpcConfig?: sagemaker.VpcConfig;
    /**
     * Isolate the model containers from the network (no outbound calls).
     * @default false
     */
    enableNetworkIsolation?: boolean;
    /**
     * Tags to associate with the model. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Model extends Resource<"AWS.SageMaker.Model", ModelProps, {
    /**
     * The model's name.
     */
    modelName: string;
    /**
     * ARN of the model.
     */
    modelArn: string;
}, never, Providers> {
}
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
export declare const Model: import("../../Resource.ts").ResourceClass<Model>;
export declare const ModelProvider: () => import("effect/Layer").Layer<Provider.Provider<Model>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Model.d.ts.map