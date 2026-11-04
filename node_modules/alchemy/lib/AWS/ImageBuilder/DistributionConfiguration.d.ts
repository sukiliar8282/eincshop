import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DistributionConfigurationProps {
    /**
     * Name of the distribution configuration. If omitted, a deterministic
     * physical name is generated. Changing the name replaces the
     * configuration.
     */
    distributionConfigurationName?: string;
    /**
     * Per-region distribution settings: output AMI naming/tags/permissions,
     * launch template updates, SSM parameter publication, and more. At
     * least one entry (the build region) is required.
     */
    distributions: imagebuilder.Distribution[];
    /**
     * Description of the configuration.
     */
    description?: string;
    /**
     * User-defined tags for the configuration.
     */
    tags?: Record<string, string>;
}
export interface DistributionConfiguration extends Resource<"AWS.ImageBuilder.DistributionConfiguration", DistributionConfigurationProps, {
    /** The name of the distribution configuration. */
    distributionConfigurationName: string;
    /** The ARN of the distribution configuration. */
    distributionConfigurationArn: string;
    /** When the distribution configuration was created. */
    dateCreated: string | undefined;
}, never, Providers> {
}
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
export declare const DistributionConfiguration: import("../../Resource.ts").ResourceClass<DistributionConfiguration>;
export declare const DistributionConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<DistributionConfiguration>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=DistributionConfiguration.d.ts.map