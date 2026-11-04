import * as sagemaker from "@distilled.cloud/aws/sagemaker";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export type EndpointStatus = sagemaker.EndpointStatus;
export interface EndpointProps {
    /**
     * Name of the endpoint. Maximum 63 characters.
     * @default ${app}-${stage}-${id}
     */
    endpointName?: string;
    /**
     * Name of the `EndpointConfig` that describes the models and hosting
     * resources to deploy. Changing it updates the live endpoint in place
     * (blue/green by default on the SageMaker side).
     */
    endpointConfigName: string;
    /**
     * Deployment (blue/green or rolling) configuration applied when the
     * endpoint is updated to a new configuration.
     */
    deploymentConfig?: sagemaker.DeploymentConfig;
    /**
     * Tags to associate with the endpoint. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Endpoint extends Resource<"AWS.SageMaker.Endpoint", EndpointProps, {
    /**
     * The endpoint's name.
     */
    endpointName: string;
    /**
     * ARN of the endpoint.
     */
    endpointArn: string;
    /**
     * Lifecycle status of the endpoint after reconcile (`InService`).
     */
    endpointStatus: EndpointStatus | undefined;
}, never, Providers> {
}
/**
 * An Amazon SageMaker Endpoint — the live, invocable deployment of an
 * `EndpointConfig`. Provisioning takes minutes and **bills while the
 * endpoint exists** (serverless variants bill per request; instance variants
 * bill per instance-hour). Destroy endpoints promptly.
 *
 * Invoke a deployed endpoint from a function with
 * `AWS.SageMakerRuntime.InvokeEndpoint`.
 * ### Creating Endpoints
 * **Example:** Deploy an EndpointConfig
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const endpoint = yield* AWS.SageMaker.Endpoint("MyEndpoint", {
 *   endpointConfigName: config.endpointConfigName,
 * });
 * ```
 *
 * ### Invoking
 * **Example:** Invoke from a Lambda function
 * ```typescript
 * // init
 * const invoke = yield* AWS.SageMakerRuntime.InvokeEndpoint(
 *   endpoint.endpointName,
 * );
 *
 * // runtime
 * const result = yield* invoke({
 *   ContentType: "application/json",
 *   Body: JSON.stringify({ instances: [[1, 2, 3, 4]] }),
 * });
 * ```
 *
 * @resource
 */
export declare const Endpoint: import("../../Resource.ts").ResourceClass<Endpoint>;
declare const EndpointProvisioningFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "EndpointProvisioningFailed";
} & Readonly<A>;
/**
 * The endpoint's asynchronous provisioning converged to the terminal
 * `Failed` status (e.g. the container image could not be pulled or the model
 * server failed its health checks).
 */
export declare class EndpointProvisioningFailed extends EndpointProvisioningFailed_base<{
    readonly endpointName: string;
    readonly message: string | undefined;
}> {
}
export declare const EndpointProvider: () => import("effect/Layer").Layer<Provider.Provider<Endpoint>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Endpoint.d.ts.map