import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface DeploymentProps {
    /**
     * ID of the application.
     */
    applicationId: string;
    /**
     * ID of the environment to deploy to.
     */
    environmentId: string;
    /**
     * ID of the deployment strategy that governs the rollout.
     */
    deploymentStrategyId: string;
    /**
     * ID of the configuration profile being deployed.
     */
    configurationProfileId: string;
    /**
     * The configuration version to deploy. For a hosted configuration profile
     * this is the hosted version number (as a string); for other sources it is
     * the version identifier defined by that source.
     */
    configurationVersion: string;
    /**
     * Description of the deployment.
     */
    description?: string;
}
export interface Deployment extends Resource<"AWS.AppConfig.Deployment", DeploymentProps, {
    applicationId: string;
    environmentId: string;
    deploymentNumber: number;
    configurationProfileId: string;
    configurationVersion: string;
    state: string;
}, never, Providers> {
}
/**
 * An AWS AppConfig deployment — releases a configuration version to an
 * environment following a deployment strategy. Deployments are immutable and
 * asynchronous: the provider starts the deployment and waits (bounded) for it
 * to reach a terminal state. Any change to the deployed version, strategy, or
 * target creates a new deployment (a replacement). Use an all-at-once strategy
 * (duration 0, bake 0) for a near-instant rollout.
 *
 * ### Deploying a Configuration
 * **Example:** Deploy a Hosted Version
 * ```typescript
 * const deployment = yield* AppConfig.Deployment("Rollout", {
 *   applicationId: app.applicationId,
 *   environmentId: env.environmentId,
 *   deploymentStrategyId: strategy.deploymentStrategyId,
 *   configurationProfileId: profile.configurationProfileId,
 *   configurationVersion: String(version.versionNumber),
 * });
 * ```
 *
 * @resource
 */
export declare const Deployment: import("../../Resource.ts").ResourceClass<Deployment>;
export declare const DeploymentProvider: () => import("effect/Layer").Layer<Provider.Provider<Deployment>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Deployment.d.ts.map