import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface AutoScalingConfigurationProps {
    /**
     * Name of the auto scaling configuration. Must be 4-32 characters
     * (letters, digits, hyphens, underscores). If omitted, a deterministic
     * physical name is generated. Changing the name replaces the
     * configuration (all revisions of the old name are deleted).
     */
    autoScalingConfigurationName?: string;
    /**
     * Maximum number of concurrent requests an instance processes before
     * App Runner scales up.
     * @default 100
     */
    maxConcurrency?: number;
    /**
     * Minimum number of provisioned (warm) instances. Higher values spread
     * the service over more Availability Zones at a higher minimal cost.
     * @default 1
     */
    minSize?: number;
    /**
     * Maximum number of instances the service scales up to.
     * @default 25
     */
    maxSize?: number;
    /**
     * User-defined tags for the configuration.
     */
    tags?: Record<string, string>;
}
export interface AutoScalingConfiguration extends Resource<"AWS.AppRunner.AutoScalingConfiguration", AutoScalingConfigurationProps, {
    /**
     * Name of the auto scaling configuration.
     */
    autoScalingConfigurationName: string;
    /**
     * ARN of this auto scaling configuration revision.
     */
    autoScalingConfigurationArn: string;
    /**
     * Revision number of the configuration (revisions are immutable).
     */
    autoScalingConfigurationRevision: number;
    /**
     * Maximum concurrent requests per instance before scaling out.
     */
    maxConcurrency: number | undefined;
    /**
     * Minimum number of provisioned instances.
     */
    minSize: number | undefined;
    /**
     * Maximum number of instances the service may scale out to.
     */
    maxSize: number | undefined;
}, never, Providers> {
}
/**
 * An AWS App Runner auto scaling configuration.
 *
 * Auto scaling configurations are immutable revisions: changing
 * `maxConcurrency`, `minSize`, or `maxSize` creates a new revision under
 * the same name (the ARN and revision attributes change). A configuration
 * can be shared across multiple App Runner services.
 * ### Creating an Auto Scaling Configuration
 * **Example:** Basic Configuration
 * ```typescript
 * const scaling = yield* AppRunner.AutoScalingConfiguration("Scaling", {
 *   maxConcurrency: 50,
 *   minSize: 1,
 *   maxSize: 3,
 * });
 * ```
 *
 * ### Using with an App Runner Service
 * **Example:** Attach to a Service
 * ```typescript
 * const service = yield* AppRunner.Service("Api", {
 *   imageRepository: {
 *     imageIdentifier: "public.ecr.aws/aws-containers/hello-app-runner:latest",
 *     imageRepositoryType: "ECR_PUBLIC",
 *     port: "8000",
 *   },
 *   autoScalingConfigurationArn: scaling.autoScalingConfigurationArn,
 * });
 * ```
 *
 * @resource
 */
export declare const AutoScalingConfiguration: import("../../Resource.ts").ResourceClass<AutoScalingConfiguration>;
export declare const AutoScalingConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<AutoScalingConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=AutoScalingConfiguration.d.ts.map