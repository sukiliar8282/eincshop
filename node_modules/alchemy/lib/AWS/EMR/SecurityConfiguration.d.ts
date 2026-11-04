import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface SecurityConfigurationProps {
    /**
     * Name of the security configuration. If omitted, a deterministic physical
     * name is generated. Changing the name replaces the configuration.
     */
    securityConfigurationName?: string;
    /**
     * The security configuration document — encryption, authentication
     * (Kerberos), authorization, and instance-metadata settings — as a plain
     * object or a pre-serialized JSON string. The document is immutable in
     * EMR; content changes are converged by deleting and recreating the
     * configuration under the same name (clusters capture the document at
     * launch, so running clusters are unaffected).
     */
    securityConfiguration: Record<string, unknown> | string;
}
export interface SecurityConfiguration extends Resource<"AWS.EMR.SecurityConfiguration", SecurityConfigurationProps, {
    /** The name of the security configuration. */
    securityConfigurationName: string;
    /** The JSON document of the security configuration. */
    securityConfiguration: string;
}, never, Providers> {
}
/**
 * An Amazon EMR security configuration — a reusable JSON document of
 * encryption, authentication, and instance-metadata settings referenced by
 * name when launching a {@link Cluster}.
 *
 * Clusters capture the configuration at launch, so editing a configuration
 * only affects clusters launched afterwards.
 * ### Creating a Security Configuration
 * **Example:** Require IMDSv2 on Cluster Instances
 * ```typescript
 * const config = yield* SecurityConfiguration("Imds", {
 *   securityConfiguration: {
 *     InstanceMetadataServiceConfiguration: {
 *       MinimumInstanceMetadataServiceVersion: 2,
 *       HttpPutResponseHopLimit: 1,
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Encryption Settings
 * ```typescript
 * const config = yield* SecurityConfiguration("Encryption", {
 *   securityConfiguration: {
 *     EncryptionConfiguration: {
 *       EnableInTransitEncryption: false,
 *       EnableAtRestEncryption: true,
 *       AtRestEncryptionConfiguration: {
 *         S3EncryptionConfiguration: { EncryptionMode: "SSE-S3" },
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * ### Using with a Cluster
 * **Example:** Reference by Name at Launch
 * ```typescript
 * const cluster = yield* Cluster("Secure", {
 *   releaseLabel: "emr-7.5.0",
 *   serviceRole: serviceRole.roleName,
 *   jobFlowRole: instanceProfile.instanceProfileName,
 *   securityConfiguration: config.securityConfigurationName,
 * });
 * ```
 *
 * @resource
 */
export declare const SecurityConfiguration: import("../../Resource.ts").ResourceClass<SecurityConfiguration>;
export declare const SecurityConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<SecurityConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SecurityConfiguration.d.ts.map