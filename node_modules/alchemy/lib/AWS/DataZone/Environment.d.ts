import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
/**
 * A name/value provisioning parameter passed to the environment's blueprint.
 */
export interface EnvironmentUserParameter {
    /** The parameter name. */
    name?: string;
    /** The parameter value. */
    value?: string;
}
export interface EnvironmentProps {
    /**
     * The identifier of the {@link Domain} the environment lives in. Accepts a
     * domain's `domainId` output. Changing it triggers a replacement.
     */
    domainId: string;
    /**
     * The identifier of the {@link Project} that owns the environment. Accepts
     * a project's `projectId` output. Changing it triggers a replacement.
     */
    projectId: string;
    /**
     * Name of the environment. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. The name is mutable — it
     * converges via `UpdateEnvironment` without replacement.
     */
    name?: string;
    /**
     * A description of the environment.
     */
    description?: string;
    /**
     * The identifier of the environment profile to create the environment
     * from (V1 domains). Changing it triggers a replacement.
     */
    environmentProfileId?: string;
    /**
     * The identifier of the environment blueprint to create the environment
     * from directly (profile-less flows). Changing it triggers a replacement.
     */
    environmentBlueprintId?: string;
    /**
     * The AWS account to provision the environment in. Defaults to the
     * domain's account. Changing it triggers a replacement.
     */
    environmentAccountId?: string;
    /**
     * The region to provision the environment in. Changing it triggers a
     * replacement.
     */
    environmentAccountRegion?: string;
    /**
     * Blueprint provisioning parameters (e.g. the Glue database name for
     * `DefaultDataLake`).
     */
    userParameters?: EnvironmentUserParameter[];
    /**
     * Glossary term identifiers to attach to the environment.
     */
    glossaryTerms?: string[];
}
export interface Environment extends Resource<"AWS.DataZone.Environment", EnvironmentProps, {
    /** The unique identifier of the environment. */
    environmentId: string;
    /** The identifier of the domain the environment lives in. */
    domainId: string;
    /** The identifier of the owning project. */
    projectId: string;
    /** The name of the environment. */
    name: string;
    /** The status of the environment (`ACTIVE` once deployed). */
    status: string | undefined;
    /** The provider of the environment (e.g. `Amazon DataZone`). */
    provider: string;
    /** The AWS account the environment is provisioned in. */
    awsAccountId: string | undefined;
    /** The region the environment is provisioned in. */
    awsAccountRegion: string | undefined;
    /** The identifier of the environment profile the environment came from. */
    environmentProfileId: string | undefined;
    /** The identifier of the blueprint the environment came from. */
    environmentBlueprintId: string | undefined;
}> {
}
/**
 * An Amazon DataZone environment — the provisioned collection of AWS
 * resources (Glue databases, IAM roles, Athena workgroups, ...) a project
 * works with, deployed from an environment blueprint via CloudFormation.
 *
 * Environment deployment is asynchronous (minutes — DataZone drives a
 * CloudFormation stack) and is polled to `ACTIVE` with a bounded wait. The
 * environment's blueprint must be configured in the domain first (see
 * {@link EnvironmentBlueprintConfiguration}).
 *
 * ### Creating Environments
 * **Example:** Environment from a Profile (V1 Domains)
 * ```typescript
 * import * as DataZone from "alchemy/AWS/DataZone";
 *
 * const env = yield* DataZone.Environment("datalake-env", {
 *   domainId: domain.domainId,
 *   projectId: project.projectId,
 *   environmentProfileId: profileId,
 * });
 * ```
 *
 * **Example:** Environment with Provisioning Parameters
 * ```typescript
 * const env = yield* DataZone.Environment("datalake-env", {
 *   domainId: domain.domainId,
 *   projectId: project.projectId,
 *   environmentProfileId: profileId,
 *   description: "Analytics data lake environment",
 *   userParameters: [
 *     { name: "glueDbName", value: "analytics_db" },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const Environment: import("../../Resource.ts").ResourceClass<Environment>;
declare const EnvironmentDeploymentFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AWS.DataZone.EnvironmentDeploymentFailed";
} & Readonly<A>;
/** The environment deployment settled in a failed state. */
export declare class EnvironmentDeploymentFailed extends EnvironmentDeploymentFailed_base<{
    readonly environmentId: string;
    readonly status: string;
    readonly reason: string | undefined;
}> {
}
export declare const EnvironmentProvider: () => import("effect/Layer").Layer<Provider.Provider<Environment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Environment.d.ts.map