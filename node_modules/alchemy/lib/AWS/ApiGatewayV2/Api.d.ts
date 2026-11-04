import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
export interface ApiProps {
    /**
     * Name of the API. If omitted, Alchemy generates a deterministic
     * physical name from the app, stage, and logical ID.
     */
    name?: string;
    /**
     * The API protocol. `HTTP` is the modern Lambda front door; `WEBSOCKET`
     * is the real-time two-way protocol. Changing this triggers a
     * replacement.
     * @default "HTTP"
     */
    protocolType?: "HTTP" | "WEBSOCKET";
    /**
     * Description of the API.
     */
    description?: string;
    /**
     * The route selection expression. Required by AWS for WebSocket APIs;
     * defaults to `$request.body.action` when `protocolType` is `WEBSOCKET`.
     * HTTP APIs must use `$request.method $request.path` (the AWS default).
     */
    routeSelectionExpression?: string;
    /**
     * An API key selection expression (WebSocket APIs only).
     */
    apiKeySelectionExpression?: string;
    /**
     * CORS configuration (HTTP APIs only). Synced in place; removing it
     * deletes the CORS configuration from the API.
     */
    corsConfiguration?: agw2.Cors;
    /**
     * Disable the default `execute-api` endpoint so the API is reachable
     * only through custom domain names.
     * @default false
     */
    disableExecuteApiEndpoint?: boolean;
    /**
     * Avoid validating models when creating a deployment (WebSocket APIs
     * only).
     */
    disableSchemaValidation?: boolean;
    /**
     * The IP address types that can invoke the API.
     * @default "ipv4"
     */
    ipAddressType?: agw2.IpAddressType;
    /**
     * A version identifier for the API.
     */
    version?: string;
    /**
     * User-defined tags (Alchemy internal tags are merged automatically).
     */
    tags?: Record<string, string>;
}
export interface Api extends Resource<"AWS.ApiGatewayV2.Api", ApiProps, {
    /** The API identifier. */
    apiId: string;
    /** The default endpoint, e.g. `https://{apiId}.execute-api.{region}.amazonaws.com` (or `wss://...` for WebSocket APIs). */
    apiEndpoint: string;
    /** The API name. */
    name: string;
    /** The API protocol. */
    protocolType: string;
    /** The route selection expression. */
    routeSelectionExpression: string | undefined;
    description: string | undefined;
    apiKeySelectionExpression: string | undefined;
    corsConfiguration: agw2.Cors | undefined;
    disableExecuteApiEndpoint: boolean | undefined;
    disableSchemaValidation: boolean | undefined;
    ipAddressType: string | undefined;
    version: string | undefined;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon API Gateway v2 API — the root of an HTTP API or WebSocket API.
 *
 * HTTP APIs are the modern, cheaper, faster front door for Lambda functions
 * (compared to REST v1). WebSocket APIs provide two-way real-time messaging
 * backed by Lambda route handlers. Child resources (`Integration`, `Route`,
 * `Stage`, `Authorizer`) reference the API by passing `api` in their props.
 * ### HTTP APIs
 * For the common "HTTP API in front of a Lambda function" case, prefer the
 * high-level {@link HttpApi} helper which wires up the integration, route,
 * stage, and invoke permission in one call.
 *
 * **Example:** Minimal HTTP API
 * ```typescript
 * import * as ApiGatewayV2 from "alchemy/AWS/ApiGatewayV2";
 *
 * const api = yield* ApiGatewayV2.Api("Api", {});
 * ```
 *
 * **Example:** HTTP API with CORS
 * ```typescript
 * const api = yield* ApiGatewayV2.Api("Api", {
 *   corsConfiguration: {
 *     AllowOrigins: ["https://example.com"],
 *     AllowMethods: ["GET", "POST"],
 *     AllowHeaders: ["content-type"],
 *     MaxAge: 3600,
 *   },
 * });
 * ```
 *
 * ### WebSocket APIs
 * **Example:** WebSocket API
 * ```typescript
 * const api = yield* ApiGatewayV2.Api("WsApi", {
 *   protocolType: "WEBSOCKET",
 *   routeSelectionExpression: "$request.body.action",
 * });
 * ```
 *
 * ### Endpoint hardening
 * **Example:** Disable the default execute-api endpoint
 * ```typescript
 * const api = yield* ApiGatewayV2.Api("Api", {
 *   disableExecuteApiEndpoint: true,
 * });
 * ```
 *
 * @resource
 */
export declare const Api: import("../../Resource.ts").ResourceClass<Api>;
export declare const ApiProvider: () => import("effect/Layer").Layer<Provider.Provider<Api>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Api.d.ts.map