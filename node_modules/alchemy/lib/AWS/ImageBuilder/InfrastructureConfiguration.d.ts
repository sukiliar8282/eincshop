import * as imagebuilder from "@distilled.cloud/aws/imagebuilder";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface InfrastructureConfigurationProps {
    /**
     * Name of the infrastructure configuration. If omitted, a deterministic
     * physical name is generated. Changing the name replaces the
     * configuration.
     */
    infrastructureConfigurationName?: string;
    /**
     * Name of the IAM instance profile attached to build/test instances.
     * The profile's role needs at least `EC2InstanceProfileForImageBuilder`
     * and `AmazonSSMManagedInstanceCore`.
     */
    instanceProfileName: string;
    /**
     * EC2 instance types to use when building. Image Builder picks the
     * type with the most available capacity.
     */
    instanceTypes?: string[];
    /**
     * Security group IDs applied to build/test instances.
     */
    securityGroupIds?: string[];
    /**
     * Subnet in which to place build/test instances.
     */
    subnetId?: string;
    /**
     * Description of the configuration.
     */
    description?: string;
    /**
     * S3 logging configuration for build logs.
     */
    logging?: imagebuilder.Logging;
    /**
     * EC2 key pair for debugging build instances.
     */
    keyPair?: string;
    /**
     * Terminate the build instance when the build fails (set `false` to
     * keep it for debugging).
     * @default true
     */
    terminateInstanceOnFailure?: boolean;
    /**
     * SNS topic ARN notified of image build events.
     */
    snsTopicArn?: string;
    /**
     * Tags applied to the EC2 resources (instances, volumes) created
     * during builds.
     */
    resourceTags?: Record<string, string>;
    /**
     * Instance metadata service (IMDS) settings for build instances.
     */
    instanceMetadataOptions?: imagebuilder.InstanceMetadataOptions;
    /**
     * Placement settings (availability zone, tenancy, host) for build
     * instances.
     */
    placement?: imagebuilder.Placement;
    /**
     * User-defined tags for the configuration.
     */
    tags?: Record<string, string>;
}
export interface InfrastructureConfiguration extends Resource<"AWS.ImageBuilder.InfrastructureConfiguration", InfrastructureConfigurationProps, {
    /** The name of the infrastructure configuration. */
    infrastructureConfigurationName: string;
    /** The ARN of the infrastructure configuration. */
    infrastructureConfigurationArn: string;
    /** The instance profile builds run with. */
    instanceProfileName: string | undefined;
    /** When the infrastructure configuration was created. */
    dateCreated: string | undefined;
}, never, Providers> {
}
/**
 * An EC2 Image Builder infrastructure configuration — the environment
 * (instance profile, instance types, network, logging) in which images are
 * built and tested.
 * ### Creating an Infrastructure Configuration
 * **Example:** Minimal Configuration
 * ```typescript
 * const role = yield* IAM.Role("BuilderRole", {
 *   assumeRolePolicyDocument: {
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: { Service: "ec2.amazonaws.com" },
 *       Action: ["sts:AssumeRole"],
 *     }],
 *   },
 *   managedPolicyArns: [
 *     "arn:aws:iam::aws:policy/EC2InstanceProfileForImageBuilder",
 *     "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore",
 *   ],
 * });
 * const profile = yield* IAM.InstanceProfile("BuilderProfile", {
 *   roleName: role.roleName,
 * });
 * const infra = yield* ImageBuilder.InfrastructureConfiguration("Infra", {
 *   instanceProfileName: profile.instanceProfileName,
 *   instanceTypes: ["t3.micro"],
 *   terminateInstanceOnFailure: true,
 * });
 * ```
 *
 * @resource
 */
export declare const InfrastructureConfiguration: import("../../Resource.ts").ResourceClass<InfrastructureConfiguration>;
export declare const InfrastructureConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<InfrastructureConfiguration>, never, import("../Environment.ts").AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=InfrastructureConfiguration.d.ts.map