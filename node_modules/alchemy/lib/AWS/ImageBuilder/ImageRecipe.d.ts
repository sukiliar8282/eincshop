import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
declare const ImageRecipeVersionImmutable_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AWS::ImageBuilder::ImageRecipeVersionImmutable";
} & Readonly<A>;
/**
 * Image Builder image recipe versions are immutable — the deployed recipe
 * differs from the desired one but the semantic version was not bumped, so
 * the cloud state cannot be converged.
 */
export declare class ImageRecipeVersionImmutable extends ImageRecipeVersionImmutable_base<{
    message: string;
}> {
}
export interface RecipeComponentParameter {
    /** Name of the component parameter to set. */
    name: string;
    /** Value(s) to assign to the parameter. */
    value: string[];
}
export interface RecipeComponent {
    /**
     * Build-version ARN of the component to apply
     * (e.g. `component.componentBuildVersionArn`).
     */
    componentArn: string;
    /** Parameter overrides for parameterized components. */
    parameters?: RecipeComponentParameter[];
}
export interface ImageRecipeProps {
    /**
     * Name of the image recipe. If omitted, a deterministic physical name is
     * generated. Changing the name replaces the recipe.
     */
    imageRecipeName?: string;
    /**
     * Semantic version of the recipe (`major.minor.patch`). Recipes are
     * immutable — bump the version when changing any property. Changing the
     * version replaces the recipe.
     * @default "1.0.0"
     */
    semanticVersion?: string;
    /**
     * Base image of the recipe: an Image Builder image ARN (e.g. the
     * AWS-managed `arn:aws:imagebuilder:us-west-2:aws:image/amazon-linux-2023-x86/x.x.x`),
     * an AMI ID, or an SSM parameter reference (`ssm:/path/to/parameter`).
     * Changing the parent image replaces the recipe.
     */
    parentImage: string;
    /**
     * Components applied to the image, in order. Changing the component list
     * replaces the recipe.
     */
    components: RecipeComponent[];
    /**
     * Description of the recipe. Changing it replaces the recipe.
     */
    description?: string;
    /**
     * Block device mappings for instances built from the recipe. Changing
     * them replaces the recipe.
     */
    blockDeviceMappings?: imagebuilder.InstanceBlockDeviceMapping[];
    /**
     * Working directory used during build and test workflows.
     * Changing it replaces the recipe.
     * @default "/tmp"
     */
    workingDirectory?: string;
    /**
     * Additional instance configuration (SSM agent removal, user data
     * override). Changing it replaces the recipe.
     */
    additionalInstanceConfiguration?: imagebuilder.AdditionalInstanceConfiguration;
    /**
     * Tags applied to output AMIs created from the recipe. Changing them
     * replaces the recipe.
     */
    amiTags?: Record<string, string>;
    /**
     * User-defined tags for the recipe.
     */
    tags?: Record<string, string>;
}
export interface ImageRecipe extends Resource<"AWS.ImageBuilder.ImageRecipe", ImageRecipeProps, {
    /** The name of the image recipe. */
    imageRecipeName: string;
    /** The ARN of the image recipe. */
    imageRecipeArn: string;
    /** The semantic version of the recipe. */
    semanticVersion: string;
    /** The OS platform of the recipe (`Linux` / `Windows`). */
    platform: string | undefined;
    /** The base image the recipe builds on. */
    parentImage: string | undefined;
    /** When the recipe was created. */
    dateCreated: string | undefined;
}, never, Providers> {
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
export declare const ImageRecipe: import("../../Resource.ts").ResourceClass<ImageRecipe>;
export declare const ImageRecipeProvider: () => import("effect/Layer").Layer<Provider.Provider<ImageRecipe>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=ImageRecipe.d.ts.map