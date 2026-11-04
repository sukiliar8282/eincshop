import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { Api } from "./Api.ts";
export interface StageProps {
    /**
     * ID of the API this stage belongs to. Usually derived from `api.apiId`
     * by the {@link Stage} wrapper.
     */
    apiId: string;
    /**
     * The stage name. `$default` is served at the API's root endpoint
     * (no path prefix).
     * @default "$default"
     */
    stageName?: string;
    /**
     * Automatically deploy every route/integration change to this stage.
     * The canonical happy path — a `Deployment` resource is only needed
     * when this is off.
     * @default false
     */
    autoDeploy?: boolean;
    /**
     * The deployment this stage points at (non-autoDeploy flows only).
     */
    deploymentId?: string;
    /** Description of the stage. */
    description?: string;
    /** Stage variables. */
    stageVariables?: {
        [key: string]: string | undefined;
    };
    /**
     * Default route settings (throttling, logging, detailed metrics) applied
     * to all routes on the stage.
     */
    defaultRouteSettings?: agw2.RouteSettings;
    /** Per-route settings keyed by route key. */
    routeSettings?: {
        [key: string]: agw2.RouteSettings | undefined;
    };
    /** Access log settings (CloudWatch Logs destination + format). */
    accessLogSettings?: agw2.AccessLogSettings;
    /** Client certificate ID (WebSocket APIs only). */
    clientCertificateId?: string;
    /**
     * User-defined tags (Alchemy internal tags are merged automatically).
     */
    tags?: Record<string, string>;
}
export interface ApiGatewayV2Stage extends Resource<"AWS.ApiGatewayV2.Stage", StageProps, {
    /** The API this stage belongs to. */
    apiId: string;
    /** The stage name. */
    stageName: string;
    /**
     * The URL clients call:
     * `https://{apiId}.execute-api.{region}.amazonaws.com[/{stageName}]`
     * for HTTP APIs, `wss://{apiId}.execute-api.{region}.amazonaws.com/{stageName}`
     * for WebSocket APIs.
     */
    invokeUrl: string;
    /**
     * The WebSocket callback endpoint
     * (`https://{apiId}.execute-api.{region}.amazonaws.com/{stageName}`) —
     * the endpoint the `ManageConnections` binding posts to.
     */
    callbackUrl: string;
    /**
     * The `execute-api` ARN covering the stage's `@connections` API,
     * used to scope `execute-api:ManageConnections` IAM policies.
     */
    connectionsArn: string;
    autoDeploy: boolean | undefined;
    deploymentId: string | undefined;
    description: string | undefined;
    stageVariables: {
        [key: string]: string | undefined;
    } | undefined;
    defaultRouteSettings: agw2.RouteSettings | undefined;
    routeSettings: {
        [key: string]: agw2.RouteSettings | undefined;
    } | undefined;
    accessLogSettings: agw2.AccessLogSettings | undefined;
    clientCertificateId: string | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An API Gateway v2 Stage — the deployed, callable endpoint of an HTTP or
 * WebSocket API.
 * ### The $default auto-deploy stage
 * The canonical modern setup is a single `$default` stage with
 * `autoDeploy: true` — every route/integration change goes live
 * automatically at the API root endpoint, with no `Deployment` juggling.
 *
 * **Example:** $default stage with auto-deploy
 * ```typescript
 * const stage = yield* ApiGatewayV2.Stage("Stage", {
 *   api,
 *   autoDeploy: true,
 * });
 * // stage.invokeUrl === api.apiEndpoint
 * ```
 *
 * ### Named stages
 * **Example:** A named dev stage
 * ```typescript
 * const dev = yield* ApiGatewayV2.Stage("Dev", {
 *   api,
 *   stageName: "dev",
 *   autoDeploy: true,
 *   stageVariables: { logLevel: "debug" },
 * });
 * ```
 *
 * ### Throttling
 * **Example:** Default route throttling
 * ```typescript
 * const stage = yield* ApiGatewayV2.Stage("Stage", {
 *   api,
 *   autoDeploy: true,
 *   defaultRouteSettings: {
 *     ThrottlingBurstLimit: 100,
 *     ThrottlingRateLimit: 50,
 *   },
 * });
 * ```
 *
 * @resource
 */
export declare const StageResource: import("../../Resource.ts").ResourceClass<ApiGatewayV2Stage>;
export interface StageInputProps extends Omit<{
    [K in keyof StageProps]?: Input<StageProps[K]>;
}, "apiId"> {
    /**
     * The `Api` this stage belongs to (preferred). Alternatively pass a raw
     * `apiId`.
     */
    api?: Api;
    apiId?: Input<string>;
}
/**
 * User-facing wrapper for the Stage resource. Accepts `api: Api` as the
 * idiomatic way to attach a stage to an API.
 */
export declare const Stage: (id: string, props?: StageInputProps) => Effect.Effect<ApiGatewayV2Stage, never, Providers>;
export declare const StageProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiGatewayV2Stage>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Stage.d.ts.map