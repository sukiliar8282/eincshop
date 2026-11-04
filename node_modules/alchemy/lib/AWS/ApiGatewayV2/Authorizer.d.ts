import * as agw2 from "@distilled.cloud/aws/apigatewayv2";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { Api } from "./Api.ts";
export interface AuthorizerProps {
    /**
     * ID of the API this authorizer belongs to. Usually derived from
     * `api.apiId` by the {@link Authorizer} wrapper.
     */
    apiId: string;
    /**
     * The authorizer type: `JWT` (HTTP APIs — validate a JWT issued by an
     * OIDC/OAuth2 provider) or `REQUEST` (Lambda authorizer, both
     * protocols).
     */
    authorizerType: "JWT" | "REQUEST";
    /**
     * Name of the authorizer. If omitted, Alchemy generates a deterministic
     * physical name.
     */
    name?: string;
    /**
     * The identity source(s):
     *
     * - JWT — where to find the token, e.g. `["$request.header.Authorization"]`.
     * - REQUEST (HTTP APIs) — the caching identity sources.
     * - REQUEST (WebSocket APIs) — e.g. `["route.request.header.Auth"]`.
     */
    identitySource?: string[];
    /**
     * JWT configuration (`JWT` authorizers only): the token `Issuer` URL and
     * accepted `Audience` values.
     */
    jwtConfiguration?: agw2.JWTConfiguration;
    /**
     * The authorizer's Lambda invocation URI (`REQUEST` authorizers only):
     * `arn:aws:apigateway:{region}:lambda:path/2015-03-31/functions/{functionArn}/invocations`.
     */
    authorizerUri?: string;
    /**
     * The payload format version the Lambda authorizer receives (`REQUEST`
     * on HTTP APIs only): `1.0` or `2.0`.
     */
    authorizerPayloadFormatVersion?: string;
    /**
     * Whether a `REQUEST` authorizer (HTTP APIs, payload 2.0) returns simple
     * `{ isAuthorized: boolean }` responses instead of IAM policies.
     */
    enableSimpleResponses?: boolean;
    /**
     * TTL for cached authorizer results (`REQUEST` only), e.g. `"5 minutes"`
     * or `Duration.seconds(300)` (a bare number is milliseconds). Rounded to
     * whole seconds on the wire (`AuthorizerResultTtlInSeconds`).
     * @default 300 seconds
     */
    authorizerResultTtl?: Duration.Input;
    /**
     * IAM role ARN API Gateway assumes to invoke the authorizer Lambda.
     * Omit to use a Lambda resource policy (`Lambda.Permission`) instead.
     */
    authorizerCredentialsArn?: string;
    /**
     * Validation expression for the incoming identity (WebSocket `REQUEST`
     * authorizers only).
     */
    identityValidationExpression?: string;
}
export interface AuthorizerType extends Resource<"AWS.ApiGatewayV2.Authorizer", AuthorizerProps, {
    /** The API this authorizer belongs to. */
    apiId: string;
    /** The authorizer identifier — referenced by `Route.authorizerId`. */
    authorizerId: string;
    /** The authorizer name. */
    name: string;
    authorizerType: string;
    identitySource: string[] | undefined;
    jwtConfiguration: agw2.JWTConfiguration | undefined;
    authorizerUri: string | undefined;
    authorizerPayloadFormatVersion: string | undefined;
    enableSimpleResponses: boolean | undefined;
    authorizerResultTtlInSeconds: number | undefined;
    authorizerCredentialsArn: string | undefined;
    identityValidationExpression: string | undefined;
}, never, Providers> {
}
/**
 * An API Gateway v2 Authorizer — controls access to HTTP/WebSocket API
 * routes via JWT validation or a Lambda (`REQUEST`) authorizer.
 * ### JWT authorizers
 * The common HTTP API authorizer: API Gateway validates the caller's JWT
 * against the issuer's JWKS and matches the audience — no Lambda invoked.
 *
 * **Example:** JWT authorizer for a Cognito user pool
 * ```typescript
 * const authorizer = yield* ApiGatewayV2.Authorizer("Jwt", {
 *   api,
 *   authorizerType: "JWT",
 *   identitySource: ["$request.header.Authorization"],
 *   jwtConfiguration: {
 *     Issuer: `https://cognito-idp.us-west-2.amazonaws.com/${userPoolId}`,
 *     Audience: [clientId],
 *   },
 * });
 *
 * yield* ApiGatewayV2.Route("Secure", {
 *   api,
 *   routeKey: "GET /me",
 *   integration,
 *   authorizationType: "JWT",
 *   authorizerId: authorizer.authorizerId,
 * });
 * ```
 *
 * ### Lambda (REQUEST) authorizers
 * **Example:** Simple-response Lambda authorizer
 * ```typescript
 * const authorizer = yield* ApiGatewayV2.Authorizer("Lambda", {
 *   api,
 *   authorizerType: "REQUEST",
 *   identitySource: ["$request.header.Authorization"],
 *   authorizerUri: invocationUri,
 *   authorizerPayloadFormatVersion: "2.0",
 *   enableSimpleResponses: true,
 * });
 * ```
 *
 * @resource
 */
export declare const AuthorizerResource: import("../../Resource.ts").ResourceClass<AuthorizerType>;
export interface AuthorizerInputProps extends Omit<{
    [K in keyof AuthorizerProps]?: Input<AuthorizerProps[K]>;
}, "apiId" | "authorizerType"> {
    /**
     * The `Api` this authorizer belongs to (preferred). Alternatively pass a
     * raw `apiId`.
     */
    api?: Api;
    apiId?: Input<string>;
    authorizerType: Input<"JWT" | "REQUEST">;
}
/**
 * User-facing wrapper for the Authorizer resource. Accepts `api: Api` as
 * the idiomatic way to attach an authorizer to an API.
 */
export declare const Authorizer: (id: string, props: AuthorizerInputProps) => Effect.Effect<AuthorizerType, never, Providers>;
export declare const AuthorizerProvider: () => import("effect/Layer").Layer<Provider.Provider<AuthorizerType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Authorizer.d.ts.map