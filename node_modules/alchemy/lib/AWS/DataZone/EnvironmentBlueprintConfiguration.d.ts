import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
/**
 * Lake Formation provisioning configuration for a blueprint.
 */
export interface BlueprintLakeFormationConfiguration {
    /** The ARN of the role used to register S3 locations with Lake Formation. */
    locationRegistrationRole?: string;
    /** S3 locations to exclude from Lake Formation registration. */
    locationRegistrationExcludeS3Locations?: string[];
}
/**
 * A provisioning configuration attached to a blueprint configuration.
 */
export interface BlueprintProvisioningConfiguration {
    /** Lake Formation settings applied when the blueprint provisions environments. */
    lakeFormationConfiguration: BlueprintLakeFormationConfiguration;
}
export interface EnvironmentBlueprintConfigurationProps {
    /**
     * The identifier of the {@link Domain} to configure the blueprint in.
     * Accepts a domain's `domainId` output. Changing it triggers a
     * replacement.
     */
    domainId: string;
    /**
     * The managed environment blueprint to configure — a blueprint name
     * (e.g. `"DefaultDataLake"`, `"DefaultDataWarehouse"`) or a raw blueprint
     * identifier. Changing it triggers a replacement.
     */
    environmentBlueprint: string;
    /**
     * The regions in which environments may be created from this blueprint.
     */
    enabledRegions: string[];
    /**
     * The ARN of the role DataZone uses to provision environment resources
     * (CloudFormation stacks) from this blueprint.
     */
    provisioningRoleArn?: string;
    /**
     * The ARN of the role DataZone uses to manage access grants to
     * environment resources (e.g. Lake Formation permissions).
     */
    manageAccessRoleArn?: string;
    /**
     * The ARN of a permission boundary policy to apply to environment roles
     * created from this blueprint.
     */
    environmentRolePermissionBoundary?: string;
    /**
     * Region-scoped provisioning parameters, keyed by region then parameter
     * name (e.g. `{ "us-west-2": { S3Location: "s3://bucket" } }`).
     */
    regionalParameters?: Record<string, Record<string, string>>;
    /**
     * Global provisioning parameters applied in every enabled region.
     */
    globalParameters?: Record<string, string>;
    /**
     * Additional provisioning configurations (e.g. Lake Formation location
     * registration).
     */
    provisioningConfigurations?: BlueprintProvisioningConfiguration[];
}
export interface EnvironmentBlueprintConfiguration extends Resource<"AWS.DataZone.EnvironmentBlueprintConfiguration", EnvironmentBlueprintConfigurationProps, {
    /** The identifier of the domain the configuration lives in. */
    domainId: string;
    /** The identifier of the configured environment blueprint. */
    environmentBlueprintId: string;
    /** The name of the configured environment blueprint. */
    environmentBlueprintName: string;
    /** The regions in which the blueprint is enabled. */
    enabledRegions: string[];
    /** The ARN of the provisioning role. */
    provisioningRoleArn: string | undefined;
    /** The ARN of the manage-access role. */
    manageAccessRoleArn: string | undefined;
}> {
}
/**
 * The account/domain configuration of an Amazon DataZone environment
 * blueprint — enables a managed blueprint (like `DefaultDataLake`) in
 * specific regions with the IAM roles DataZone should provision with.
 *
 * The blueprint itself is an AWS-managed definition; this resource owns only
 * its per-domain configuration (a `PUT`-style singleton keyed by domain +
 * blueprint).
 *
 * ### Configuring Blueprints
 * **Example:** Enable the DefaultDataLake Blueprint
 * ```typescript
 * import * as DataZone from "alchemy/AWS/DataZone";
 *
 * const config = yield* DataZone.EnvironmentBlueprintConfiguration(
 *   "datalake",
 *   {
 *     domainId: domain.domainId,
 *     environmentBlueprint: "DefaultDataLake",
 *     enabledRegions: ["us-west-2"],
 *     provisioningRoleArn: provisioningRole.roleArn,
 *     manageAccessRoleArn: manageAccessRole.roleArn,
 *     regionalParameters: {
 *       "us-west-2": { S3Location: "s3://my-datalake-bucket" },
 *     },
 *   },
 * );
 * ```
 *
 * **Example:** Blueprint with Lake Formation Provisioning
 * ```typescript
 * const config = yield* DataZone.EnvironmentBlueprintConfiguration(
 *   "datalake",
 *   {
 *     domainId: domain.domainId,
 *     environmentBlueprint: "DefaultDataLake",
 *     enabledRegions: ["us-west-2"],
 *     provisioningRoleArn: provisioningRole.roleArn,
 *     provisioningConfigurations: [
 *       {
 *         lakeFormationConfiguration: {
 *           locationRegistrationRole: registrationRole.roleArn,
 *         },
 *       },
 *     ],
 *   },
 * );
 * ```
 *
 * @resource
 */
export declare const EnvironmentBlueprintConfiguration: import("../../Resource.ts").ResourceClass<EnvironmentBlueprintConfiguration>;
declare const EnvironmentBlueprintNotFound_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AWS.DataZone.EnvironmentBlueprintNotFound";
} & Readonly<A>;
/** No blueprint with the requested name or id exists in the domain. */
export declare class EnvironmentBlueprintNotFound extends EnvironmentBlueprintNotFound_base<{
    readonly domainId: string;
    readonly environmentBlueprint: string;
}> {
}
export declare const EnvironmentBlueprintConfigurationProvider: () => import("effect/Layer").Layer<Provider.Provider<EnvironmentBlueprintConfiguration>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=EnvironmentBlueprintConfiguration.d.ts.map