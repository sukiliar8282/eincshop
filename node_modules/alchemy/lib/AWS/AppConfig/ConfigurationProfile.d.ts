import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * A validator run against configuration data before it is deployed.
 */
export interface ConfigurationValidator {
    /** Validator kind. */
    type: "JSON_SCHEMA" | "LAMBDA";
    /**
     * For `JSON_SCHEMA`, the JSON Schema document. For `LAMBDA`, the ARN of the
     * validating Lambda function.
     */
    content: string;
}
export interface ConfigurationProfileProps {
    /**
     * ID of the application this profile belongs to. Changing it replaces the
     * profile.
     */
    applicationId: string;
    /**
     * Name of the configuration profile. Must be 1-64 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * profile.
     */
    configurationProfileName?: string;
    /**
     * URI of the configuration source. Use `"hosted"` for the AppConfig hosted
     * configuration store, or an S3 URI (`s3://bucket/key`), SSM parameter/
     * document name, Secrets Manager secret, or CodePipeline pipeline ARN.
     * Immutable — changing it replaces the profile.
     * @default "hosted"
     */
    locationUri?: string;
    /**
     * Description of the configuration profile.
     */
    description?: string;
    /**
     * ARN of an IAM role AppConfig assumes to fetch configuration from a
     * non-hosted source (S3, SSM, Secrets Manager). Not required for `"hosted"`.
     */
    retrievalRoleArn?: string;
    /**
     * Validators run against the configuration data before deployment.
     */
    validators?: ConfigurationValidator[];
    /**
     * Configuration profile type. `"AWS.Freeform"` for free-form configuration
     * or `"AWS.AppConfig.FeatureFlags"` for feature flags. Immutable — changing
     * it replaces the profile.
     * @default "AWS.Freeform"
     */
    type?: string;
    /**
     * Customer-managed KMS key ARN/id used to encrypt the configuration data.
     */
    kmsKeyIdentifier?: string;
    /**
     * User-defined tags for the configuration profile.
     */
    tags?: Record<string, string>;
}
export interface ConfigurationProfile extends Resource<"AWS.AppConfig.ConfigurationProfile", ConfigurationProfileProps, {
    configurationProfileId: string;
    configurationProfileName: string;
    applicationId: string;
    locationUri: string;
    configurationProfileArn: string;
}, never, Providers> {
}
/**
 * An AWS AppConfig configuration profile — describes where the configuration
 * data lives (the AppConfig hosted store, S3, SSM, Secrets Manager, or
 * CodePipeline) and how to validate it.
 *
 * ### Creating a Configuration Profile
 * **Example:** Hosted Configuration Profile
 * ```typescript
 * const profile = yield* AppConfig.ConfigurationProfile("Settings", {
 *   applicationId: app.applicationId,
 *   locationUri: "hosted",
 * });
 * ```
 *
 * **Example:** S3-sourced Profile with a JSON Schema Validator
 * ```typescript
 * const profile = yield* AppConfig.ConfigurationProfile("Settings", {
 *   applicationId: app.applicationId,
 *   locationUri: "s3://my-bucket/config.json",
 *   retrievalRoleArn: role.roleArn,
 *   validators: [{ type: "JSON_SCHEMA", content: schemaJson }],
 * });
 * ```
 *
 * @resource
 */
export declare const ConfigurationProfile: import("../../Resource.ts").ResourceClass<ConfigurationProfile>;
export declare const ConfigurationProfileProvider: () => import("effect/Layer").Layer<Provider.Provider<ConfigurationProfile>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ConfigurationProfile.d.ts.map