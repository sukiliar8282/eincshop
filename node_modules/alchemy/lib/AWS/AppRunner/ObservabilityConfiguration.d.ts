import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Tracing configuration for an observability configuration.
 */
export interface ObservabilityTraceConfiguration {
    /**
     * The tracing vendor. `AWSXRAY` is the only supported vendor.
     */
    vendor: "AWSXRAY";
}
export interface ObservabilityConfigurationProps {
    /**
     * Name of the observability configuration. Must be 4-32 characters
     * (letters, digits, hyphens, underscores). If omitted, a deterministic
     * physical name is generated. Changing the name replaces the
     * configuration (all revisions of the old name are deleted).
     */
    observabilityConfigurationName?: string;
    /**
     * Tracing configuration. Omit to create a configuration with tracing
     * disabled (services referencing it emit no traces).
     */
    traceConfiguration?: ObservabilityTraceConfiguration;
    /**
     * User-defined tags for the configuration.
     */
    tags?: Record<string, string>;
}
export interface ObservabilityConfiguration extends Resource<"AWS.AppRunner.ObservabilityConfiguration", ObservabilityConfigurationProps, {
    /**
     * Name of the observability configuration.
     */
    observabilityConfigurationName: string;
    /**
     * ARN of this observability configuration revision.
     */
    observabilityConfigurationArn: string;
    /**
     * Revision number of the configuration (revisions are immutable).
     */
    observabilityConfigurationRevision: number;
    /**
     * The configured tracing vendor, if tracing is enabled.
     */
    traceVendor: string | undefined;
}, never, Providers> {
}
/**
 * An AWS App Runner observability configuration — enables AWS X-Ray tracing
 * for the App Runner services that reference it.
 *
 * Observability configurations are immutable revisions: changing
 * `traceConfiguration` creates a new revision under the same name (the ARN
 * and revision attributes change). A configuration can be shared across
 * multiple App Runner services.
 * ### Creating an Observability Configuration
 * **Example:** X-Ray Tracing Configuration
 * ```typescript
 * const observability = yield* AppRunner.ObservabilityConfiguration("Tracing", {
 *   traceConfiguration: { vendor: "AWSXRAY" },
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
 *   observabilityConfiguration: {
 *     observabilityEnabled: true,
 *     observabilityConfigurationArn:
 *       observability.observabilityConfigurationArn,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const ObservabilityConfiguration: import("../../Resource.ts").ResourceClass<ObservabilityConfiguration>;
export declare const ObservabilityConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<ObservabilityConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ObservabilityConfiguration.d.ts.map