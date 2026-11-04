import * as ag from "@distilled.cloud/aws/api-gateway";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { RestApi } from "./RestApi.ts";
/**
 * Per-method override settings for a stage. Mirrors the API's
 * `MethodSetting` struct, with the cache TTL expressed as a
 * {@link Duration.Input} (`cacheTtl`) instead of the raw wire field
 * `cacheTtlInSeconds`.
 */
export interface StageMethodSetting extends Omit<ag.MethodSetting, "cacheTtlInSeconds"> {
    /**
     * Time-to-live for cached responses (e.g. `"5 minutes"` or
     * `Duration.seconds(300)`; a bare number is milliseconds). Sent to the
     * API as whole seconds (`cacheTtlInSeconds`).
     */
    cacheTtl?: Duration.Input;
}
export interface StageProps {
    /**
     * The `RestApi` this stage belongs to. When supplied, `restApiId` is
     * derived from `restApi.restApiId` automatically.
     */
    restApi?: RestApi;
    /**
     * ID of the REST API. Usually derived from `restApi.restApiId`.
     */
    restApiId?: Input<string>;
    /** Name of the stage (e.g. `prod`); forms the URL path segment. */
    stageName: string;
    /**
     * The `deploymentId` this stage points at. Pass `deployment.deploymentId`
     * — Alchemy will automatically wait for the deployment to be created
     * before creating the stage.
     */
    deploymentId: Input<string>;
    /** Description of the stage. */
    description?: string;
    /** Enable a dedicated cache cluster for the stage. */
    cacheClusterEnabled?: boolean;
    /** Cache cluster size in GB (e.g. `"0.5"`). */
    cacheClusterSize?: ag.CacheClusterSize;
    /** Stage variables available to integrations (e.g. `${stageVariables.foo}`). */
    variables?: {
        [key: string]: string | undefined;
    };
    /** Version of the associated API documentation to serve. */
    documentationVersion?: string;
    /** Canary release settings for the stage. */
    canarySettings?: ag.CanarySettings;
    /** Enable AWS X-Ray tracing for the stage. */
    tracingEnabled?: boolean;
    /**
     * Map of resource path pattern to method settings; keys use `{resourcePath}/{httpMethod}`.
     */
    methodSettings?: {
        [key: string]: StageMethodSetting | undefined;
    };
    /** Access log destination ARN and log format for the stage. */
    accessLogSettings?: ag.AccessLogSettings;
    /** ARN of an AWS WAF web ACL to associate with the stage. */
    webAclArn?: string;
    /** User-defined tags for the stage. */
    tags?: Record<string, string>;
}
export interface ApiGatewayStage extends Resource<"AWS.ApiGateway.Stage", StageProps, {
    restApiId: string;
    stageName: string;
    deploymentId: string;
    description: string | undefined;
    cacheClusterEnabled: boolean | undefined;
    cacheClusterSize: ag.CacheClusterSize | undefined;
    variables: {
        [key: string]: string | undefined;
    } | undefined;
    documentationVersion: string | undefined;
    canarySettings: ag.CanarySettings | undefined;
    tracingEnabled: boolean | undefined;
    methodSettings: {
        [key: string]: ag.MethodSetting | undefined;
    } | undefined;
    accessLogSettings: ag.AccessLogSettings | undefined;
    webAclArn: string | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A stage for a REST API deployment.
 *
 * A Stage is what clients actually call. It binds a name (`dev`, `prod`,
 * `v2`) to a specific `Deployment` of a `RestApi` and exposes it at a
 * stable URL:
 *
 * ```
 * https://<restApiId>.execute-api.<region>.amazonaws.com/<stageName>/
 * ```
 * ### Stages
 * **Example:** A dev stage pointing at the latest deployment
 * ```typescript
 * const stage = yield* ApiGateway.Stage("Dev", {
 *   restApi: api,
 *   stageName: "dev",
 *   deploymentId: deployment.deploymentId,
 * });
 * ```
 *
 * ### Stage variables
 * **Example:** Override values per stage
 * ```typescript
 * const stage = yield* ApiGateway.Stage("Prod", {
 *   restApi: api,
 *   stageName: "prod",
 *   deploymentId: deployment.deploymentId,
 *   variables: {
 *     logLevel: "info",
 *     featureFlag: "on",
 *   },
 * });
 * ```
 *
 * ### Canary deployments
 * Point `canarySettings` at a different `Deployment` to split traffic
 * between the stable and canary versions. `percentTraffic` is the
 * percent of requests routed to the canary deployment.
 *
 * **Example:** Shift 10% of traffic to a canary deployment
 * ```typescript
 * const stage = yield* ApiGateway.Stage("Prod", {
 *   restApi: api,
 *   stageName: "prod",
 *   deploymentId: stableDeployment.deploymentId,
 *   canarySettings: {
 *     percentTraffic: 10,
 *     deploymentId: canaryDeployment.deploymentId,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const StageResource: import("../../Resource.ts").ResourceClass<ApiGatewayStage>;
interface StageInputProps {
    restApi?: RestApi;
    restApiId?: Input<string>;
    stageName: Input<string>;
    deploymentId: Input<string>;
    description?: Input<string>;
    cacheClusterEnabled?: Input<boolean>;
    cacheClusterSize?: Input<ag.CacheClusterSize>;
    variables?: Input<{
        [key: string]: string | undefined;
    }>;
    documentationVersion?: Input<string>;
    canarySettings?: Input<ag.CanarySettings>;
    tracingEnabled?: Input<boolean>;
    methodSettings?: Input<{
        [key: string]: StageMethodSetting | undefined;
    }>;
    accessLogSettings?: Input<ag.AccessLogSettings>;
    webAclArn?: Input<string>;
    tags?: Input<Record<string, string>>;
}
/**
 * User-facing wrapper that derives `restApiId` from `restApi` when supplied.
 */
declare const StageImpl: (id: string, props: StageInputProps) => Effect.Effect<ApiGatewayStage, never, Providers>;
export declare const Stage: typeof StageImpl;
export declare const StageProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiGatewayStage>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=Stage.d.ts.map