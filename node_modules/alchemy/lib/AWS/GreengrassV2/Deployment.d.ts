import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * A configuration update applied to a component when the deployment reaches
 * a core device.
 */
export interface DeploymentComponentConfigurationUpdate {
    /**
     * A JSON-serialized object that the deployment merges into the component's
     * default configuration.
     */
    merge?: string;
    /**
     * Configuration paths to reset to their default values.
     */
    reset?: string[];
}
/**
 * A component to include in a deployment, keyed by component name on the
 * deployment's `components` map.
 */
export interface DeploymentComponent {
    /**
     * The version of the component to deploy, e.g. `1.0.0`.
     */
    componentVersion: string;
    /**
     * Configuration update the deployment applies to the component.
     */
    configurationUpdate?: DeploymentComponentConfigurationUpdate;
}
export interface DeploymentProps {
    /**
     * The ARN of the target IoT thing or thing group. Each target has at most
     * one deployment; creating a new deployment for a target supersedes the
     * previous revision.
     *
     * Changing the target replaces the deployment.
     */
    targetArn: string;
    /**
     * A friendly name for the deployment.
     * @default ${app}-${stage}-${id}
     */
    deploymentName?: string;
    /**
     * The components to deploy, keyed by component name. Updating this map
     * creates a new deployment revision for the target.
     */
    components?: Record<string, DeploymentComponent>;
    /**
     * Tags to apply to the deployment. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Deployment extends Resource<"AWS.GreengrassV2.Deployment", DeploymentProps, {
    /** The unique ID of the deployment. */
    deploymentId: string;
    /** The ARN of the deployment. */
    deploymentArn: string;
    /** The ARN of the target core device or thing group. */
    targetArn: string;
    /** The revision of the deployment. */
    revisionId?: string;
    /** The current status of the deployment (`ACTIVE`, `COMPLETED`, ...). */
    deploymentStatus?: string;
    /** The ID of the IoT job that rolls the deployment out to core devices. */
    iotJobId?: string;
    /** The ARN of the IoT job that rolls the deployment out to core devices. */
    iotJobArn?: string;
}, never, Providers> {
}
/**
 * An IoT Greengrass V2 continuous deployment that installs a set of component
 * versions on a target IoT thing or thing group.
 *
 * Updating the deployment's components or name creates a new deployment
 * revision for the target (the `deploymentId` attribute changes); the
 * previous revision is canceled and deleted.
 *
 * ### Creating Deployments
 * **Example:** Deploy a component to a thing
 * ```typescript
 * import * as GreengrassV2 from "alchemy/AWS/GreengrassV2";
 * import * as IoT from "alchemy/AWS/IoT";
 *
 * const core = yield* IoT.Thing("Core", {});
 * const component = yield* GreengrassV2.ComponentVersion("Hello", { recipe });
 *
 * const deployment = yield* GreengrassV2.Deployment("Rollout", {
 *   targetArn: core.thingArn,
 *   components: {
 *     [component.componentName]: {
 *       componentVersion: component.componentVersion,
 *     },
 *   },
 * });
 * ```
 *
 * **Example:** Deployment with a configuration update
 * ```typescript
 * const deployment = yield* GreengrassV2.Deployment("Rollout", {
 *   targetArn: core.thingArn,
 *   components: {
 *     "com.example.Hello": {
 *       componentVersion: "1.0.0",
 *       configurationUpdate: { merge: JSON.stringify({ interval: 30 }) },
 *     },
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const Deployment: import("../../Resource.ts").ResourceClass<Deployment>;
declare const GreengrassDeploymentMissingId_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "GreengrassDeploymentMissingId";
} & Readonly<A>;
/**
 * Raised when `createDeployment` returns without a deployment ID, which the
 * provider needs to track the deployment revision.
 */
export declare class GreengrassDeploymentMissingId extends GreengrassDeploymentMissingId_base<{
    message: string;
}> {
}
export declare const DeploymentProvider: () => import("effect/Layer").Layer<Provider.Provider<Deployment>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Deployment.d.ts.map