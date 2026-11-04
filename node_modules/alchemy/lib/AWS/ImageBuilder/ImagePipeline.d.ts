import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Image test settings applied to builds of the pipeline. Mirrors the wire
 * `ImageTestsConfiguration`, with the timeout expressed as a
 * {@link Duration.Input} instead of raw minutes.
 */
export interface ImageTestsConfiguration {
    /**
     * Whether to run tests on the output image.
     * @default true
     */
    imageTestsEnabled?: boolean;
    /**
     * Maximum time tests may run before they are considered failed
     * (e.g. `"90 minutes"`). AWS accepts 1 hour to 24 hours, in whole
     * minutes on the wire.
     * @default "12 hours"
     */
    timeout?: Duration.Input;
}
export interface ImagePipelineProps {
    /**
     * Name of the image pipeline. If omitted, a deterministic physical name
     * is generated. Changing the name replaces the pipeline.
     */
    imagePipelineName?: string;
    /**
     * ARN of the image recipe that the pipeline builds. Exactly one of
     * `imageRecipeArn` / `containerRecipeArn` is required.
     */
    imageRecipeArn?: string;
    /**
     * ARN of the container recipe that the pipeline builds.
     */
    containerRecipeArn?: string;
    /**
     * ARN of the infrastructure configuration used to build images.
     */
    infrastructureConfigurationArn: string;
    /**
     * ARN of the distribution configuration applied to output images.
     */
    distributionConfigurationArn?: string;
    /**
     * Description of the pipeline.
     */
    description?: string;
    /**
     * Image test settings (enable/disable tests, timeout).
     */
    imageTestsConfiguration?: ImageTestsConfiguration;
    /**
     * Collect additional information about the image being created,
     * including the operating system and packages.
     * @default true
     */
    enhancedImageMetadataEnabled?: boolean;
    /**
     * Build schedule (cron expression + start condition). Without a
     * schedule the pipeline only builds on manual invocation.
     */
    schedule?: imagebuilder.Schedule;
    /**
     * Whether the pipeline schedule is active.
     * @default "ENABLED"
     */
    status?: "ENABLED" | "DISABLED";
    /**
     * Image scanning (Amazon Inspector) settings for output images.
     */
    imageScanningConfiguration?: imagebuilder.ImageScanningConfiguration;
    /**
     * Custom build/test workflows to run.
     */
    workflows?: imagebuilder.WorkflowConfiguration[];
    /**
     * IAM role (name or ARN) that Image Builder assumes to run workflows.
     */
    executionRole?: string;
    /**
     * User-defined tags for the pipeline.
     */
    tags?: Record<string, string>;
}
export interface ImagePipeline extends Resource<"AWS.ImageBuilder.ImagePipeline", ImagePipelineProps, {
    /** The name of the image pipeline. */
    imagePipelineName: string;
    /** The ARN of the image pipeline. */
    imagePipelineArn: string;
    /** The OS platform of the pipeline's recipe (`Linux` / `Windows`). */
    platform: string | undefined;
    /** Whether the pipeline is `ENABLED` or `DISABLED`. */
    status: string | undefined;
    /** When the pipeline was created. */
    dateCreated: string | undefined;
}, never, Providers> {
}
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
export declare const ImagePipeline: import("../../Resource.ts").ResourceClass<ImagePipeline>;
export declare const ImagePipelineProvider: () => import("effect/Layer").Layer<Provider.Provider<ImagePipeline>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ImagePipeline.d.ts.map