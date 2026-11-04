import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { Api } from "./Api.ts";
import type { IntegrationType } from "./Integration.ts";
export interface RouteProps {
    /**
     * ID of the API this route belongs to. Usually derived from `api.apiId`
     * by the {@link Route} wrapper.
     */
    apiId: string;
    /**
     * The route key:
     *
     * - HTTP APIs — `"GET /items"`, `"ANY /{proxy+}"`, or `"$default"`.
     * - WebSocket APIs — `"$connect"`, `"$disconnect"`, `"$default"`, or a
     *   custom action name matched by the API's route selection expression.
     */
    routeKey: string;
    /**
     * The route target, usually `integrations/{integrationId}`. Prefer the
     * `integration` prop on the {@link Route} wrapper which formats this for
     * you.
     */
    target?: string;
    /**
     * The authorization type: `NONE`, `AWS_IAM`, `JWT` (HTTP APIs), or
     * `CUSTOM` (Lambda authorizer).
     * @default "NONE"
     */
    authorizationType?: agw2.AuthorizationType;
    /**
     * The `Authorizer` id when `authorizationType` is `JWT` or `CUSTOM`.
     */
    authorizerId?: string;
    /**
     * Authorization scopes for JWT authorization.
     */
    authorizationScopes?: string[];
    /** Whether an API key is required (WebSocket APIs only). */
    apiKeyRequired?: boolean;
    /** Operation name for the route. */
    operationName?: string;
    /** The model selection expression (WebSocket APIs only). */
    modelSelectionExpression?: string;
    /** Request models (WebSocket APIs only). */
    requestModels?: {
        [key: string]: string | undefined;
    };
    /** Request parameter constraints (WebSocket APIs only). */
    requestParameters?: {
        [key: string]: agw2.ParameterConstraints | undefined;
    };
    /**
     * The route response selection expression (WebSocket APIs only). Set to
     * `$default` to enable two-way (request/response) routes.
     */
    routeResponseSelectionExpression?: string;
}
export interface RouteType extends Resource<"AWS.ApiGatewayV2.Route", RouteProps, {
    /** The API this route belongs to. */
    apiId: string;
    /** The route identifier. */
    routeId: string;
    /** The route key. */
    routeKey: string;
    target: string | undefined;
    authorizationType: agw2.AuthorizationType | undefined;
    authorizerId: string | undefined;
    authorizationScopes: string[] | undefined;
    apiKeyRequired: boolean | undefined;
    operationName: string | undefined;
    modelSelectionExpression: string | undefined;
    requestModels: {
        [key: string]: string | undefined;
    } | undefined;
    requestParameters: {
        [key: string]: agw2.ParameterConstraints | undefined;
    } | undefined;
    routeResponseSelectionExpression: string | undefined;
}, never, Providers> {
}
/**
 * An API Gateway v2 Route — matches incoming requests (or WebSocket
 * messages) and forwards them to an Integration.
 * ### HTTP API routes
 * **Example:** Catch-all $default route
 * ```typescript
 * yield* ApiGatewayV2.Route("Default", {
 *   api,
 *   routeKey: "$default",
 *   integration,
 * });
 * ```
 *
 * **Example:** Method + path route
 * ```typescript
 * yield* ApiGatewayV2.Route("ListItems", {
 *   api,
 *   routeKey: "GET /items",
 *   integration,
 * });
 * ```
 *
 * ### WebSocket routes
 * **Example:** $connect route
 * ```typescript
 * yield* ApiGatewayV2.Route("Connect", {
 *   api,
 *   routeKey: "$connect",
 *   integration,
 * });
 * ```
 *
 * ### Securing routes
 * **Example:** JWT-protected route
 * ```typescript
 * yield* ApiGatewayV2.Route("Secure", {
 *   api,
 *   routeKey: "GET /me",
 *   integration,
 *   authorizationType: "JWT",
 *   authorizerId: authorizer.authorizerId,
 * });
 * ```
 *
 * @resource
 */
export declare const RouteResource: import("../../Resource.ts").ResourceClass<RouteType>;
export interface RouteInputProps extends Omit<{
    [K in keyof RouteProps]?: Input<RouteProps[K]>;
}, "apiId" | "routeKey"> {
    /**
     * The `Api` this route belongs to (preferred). Alternatively pass a raw
     * `apiId`.
     */
    api?: Api;
    apiId?: Input<string>;
    routeKey: Input<string>;
    /**
     * The `Integration` this route targets. Formats `target` as
     * `integrations/{integrationId}` for you. Alternatively pass a raw
     * `target`.
     */
    integration?: IntegrationType;
}
/**
 * User-facing wrapper for the Route resource. Accepts `api: Api` and
 * `integration: Integration` as the idiomatic way to wire a route.
 */
export declare const Route: (id: string, props: RouteInputProps) => Effect.Effect<RouteType, never, Providers>;
export declare const RouteProvider: () => import("effect/Layer").Layer<Provider.Provider<RouteType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Route.d.ts.map