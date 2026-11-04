import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { Stack } from "../../Stack.ts";
import type { Providers } from "../Providers.ts";
import type { RestApi } from "./RestApi.ts";
export interface DeploymentProps {
    /**
     * The `RestApi` to deploy. When supplied, the Deployment reads every
     * `RestApiBinding` already registered on the API (each `Method`,
     * `Resource`, etc. that was declared with `restApi: api`) and pulls
     * those into its dependency graph. Adding a new `Method` automatically
     * causes the next apply to produce a fresh deployment — no user-authored
     * `DependsOn` or `triggers` hash required.
     */
    restApi?: RestApi;
    /**
     * ID of the REST API. Usually derived from `restApi.restApiId`; supply
     * explicitly only when not using `restApi`.
     */
    restApiId?: Input<string>;
    /** Description of the deployment. */
    description?: string;
    /** Name of a stage API Gateway creates alongside the deployment (legacy pattern — prefer a separate `Stage`). */
    stageName?: string;
    /** Description of the stage created via `stageName`. */
    stageDescription?: string;
    /** Enable a cache cluster on the stage created via `stageName`. */
    cacheClusterEnabled?: boolean;
    /** Cache cluster size for the stage created via `stageName`. */
    cacheClusterSize?: ag.CacheClusterSize;
    /** Stage variables for the stage created via `stageName`. */
    variables?: {
        [key: string]: string | undefined;
    };
    /** Canary settings applied to the deployment. */
    canarySettings?: ag.DeploymentCanarySettings;
    /** Enable X-Ray tracing on the stage created via `stageName`. */
    tracingEnabled?: boolean;
    /**
     * Opaque key/value map; when any value changes, a replacement deployment
     * is planned. Each value may be a literal string or an `Input<string>`
     * (such as a resource output) — output references create real dependency
     * edges, which is how Alchemy ensures a new deployment runs after the
     * resources it references are updated.
     *
     * You rarely need to set this manually: when you pass `restApi`, the
     * deployment already depends on every bound `Method` and redeploys
     * automatically when any of them change. Reach for `triggers` only when
     * you want to force a redeploy on some other signal (e.g. a config hash,
     * a manual version bump).
     */
    triggers?: Record<string, Input<string>>;
}
export interface DeploymentType extends Resource<"AWS.ApiGateway.Deployment", DeploymentProps, {
    deploymentId: string;
    restApiId: string;
    description: string | undefined;
}, never, Providers> {
}
/**
 * A point-in-time snapshot of a REST API, ready to be served through a
 * `Stage`.
 * ### Creating a deployment
 * A Deployment captures whatever methods, integrations, resources, and
 * authorizers currently exist on the REST API and produces an immutable
 * `deploymentId` that a `Stage` can point at. Pass the `RestApi` value on
 * `restApi` and Alchemy handles all the ordering for you — the deployment
 * will run after every method bound to the API.
 *
 * **Example:** Deployment of a REST API
 * ```typescript
 * const api = yield* ApiGateway.RestApi("Api", {
 *   endpointConfiguration: { types: ["REGIONAL"] },
 * });
 *
 * yield* ApiGateway.Method("GetRoot", {
 *   restApi: api,
 *   httpMethod: "GET",
 *   authorizationType: "NONE",
 *   integration: { type: "MOCK" },
 * });
 *
 * const deployment = yield* ApiGateway.Deployment("Release", {
 *   restApi: api,
 *   description: "v1",
 * });
 * ```
 *
 * ### Forcing a redeploy
 * Usually you do not have to: `restApi` already makes the Deployment
 * depend on every method, so any change to a method re-plans a new
 * deployment. Use `triggers` when you want to couple the deployment to a
 * signal Alchemy cannot see — for example, a manual version bump or a
 * hash of configuration computed outside the stack.
 *
 * **Example:** Force redeploy on a version bump
 * ```typescript
 * const deployment = yield* ApiGateway.Deployment("Release", {
 *   restApi: api,
 *   triggers: { version: "2026-05-01" },
 * });
 * ```
 *
 * ### Why no DependsOn?
 * CloudFormation's `AWS::ApiGateway::Deployment` famously requires a
 * hand-written `DependsOn: [Method1, Method2, ...]` listing every method.
 * Alchemy derives that list automatically from the bindings registered on
 * the `RestApi`, so adding a method never requires editing the deployment.
 *
 * @resource
 */
export declare const DeploymentResource: import("../../Resource.ts").ResourceClass<DeploymentType>;
interface DeploymentInputProps {
    restApi?: RestApi;
    restApiId?: Input<string>;
    description?: Input<string>;
    stageName?: Input<string>;
    stageDescription?: Input<string>;
    cacheClusterEnabled?: Input<boolean>;
    cacheClusterSize?: Input<ag.CacheClusterSize>;
    variables?: Input<{
        [key: string]: string | undefined;
    }>;
    canarySettings?: Input<ag.DeploymentCanarySettings>;
    tracingEnabled?: Input<boolean>;
    triggers?: Record<string, Input<string>>;
}
/**
 * User-facing wrapper that adds a dependency edge from the Deployment to
 * every resource bound to the supplied `restApi`. Implementation detail:
 * each binding's output references get copied into the deployment's
 * `triggers` map so `resolveUpstream` sees them as real upstream dependencies.
 */
export declare const Deployment: (id: string, props: DeploymentInputProps) => Effect.Effect<DeploymentType, never, Providers | Stack>;
export declare const DeploymentProvider: () => import("effect/Layer").Layer<Provider.Provider<DeploymentType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=Deployment.d.ts.map