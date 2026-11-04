import * as ag from "@distilled.cloud/aws/api-gateway";
import type * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { RestApi } from "./RestApi.ts";
/**
 * Integration configuration for an API Gateway method (passed to `putIntegration`).
 */
export interface MethodIntegrationProps {
    /** Integration type: `AWS`, `AWS_PROXY`, `HTTP`, `HTTP_PROXY`, or `MOCK`. */
    type: ag.IntegrationType;
    /** HTTP method used to call the backend (always `POST` for Lambda integrations). */
    integrationHttpMethod?: string;
    /** Integration endpoint URI (Lambda invocation ARN or HTTP URL). */
    uri?: Input<string>;
    /** `VPC_LINK` for private integrations, otherwise `INTERNET`. */
    connectionType?: ag.ConnectionType;
    /** ID of the `VpcLink` when `connectionType` is `VPC_LINK`. */
    connectionId?: string;
    /**
     * IAM role ARN used by API Gateway for integration credentials.
     *
     * This is not a secret value; API Gateway stores an ARN or passthrough marker.
     */
    credentials?: string;
    /** Maps integration request parameters from method request parameters. */
    requestParameters?: {
        [key: string]: string | undefined;
    };
    /** Request body mapping templates keyed by content type. */
    requestTemplates?: {
        [key: string]: string | undefined;
    };
    /** How unmapped content types pass through (`WHEN_NO_MATCH`, `WHEN_NO_TEMPLATES`, `NEVER`). */
    passthroughBehavior?: string;
    /** Cache namespace for integration responses. */
    cacheNamespace?: string;
    /** Request parameters whose values form the cache key. */
    cacheKeyParameters?: string[];
    /** Payload encoding conversion (`CONVERT_TO_BINARY` or `CONVERT_TO_TEXT`). */
    contentHandling?: ag.ContentHandlingStrategy;
    /**
     * Integration timeout (e.g. `"29 seconds"` or `Duration.seconds(29)`;
     * a bare number is milliseconds). Sent to the API in milliseconds
     * (`timeoutInMillis`).
     */
    timeout?: Duration.Input;
    /** TLS settings for HTTP integrations (e.g. `insecureSkipVerification`). */
    tlsConfig?: ag.TlsConfig;
    /** How the integration response is transferred to the client. */
    responseTransferMode?: ag.ResponseTransferMode;
    /** Target resource of the integration, where the API distinguishes one from `uri`. */
    integrationTarget?: string;
}
export interface MethodProps {
    /**
     * The `RestApi` this method lives on. When supplied, the method auto-binds
     * itself to the API so that any `Deployment` of this API waits for the
     * method to be created before snapshotting.
     *
     * When `restApi` is provided, `resourceId` defaults to `restApi.rootResourceId`,
     * which is the common case for methods on the API root (`/`). Pass an
     * explicit `resourceId` when targeting a sub-path defined by
     * `ApiGateway.Resource`.
     *
     * Passing a raw `restApiId` instead is still supported but opts out of
     * automatic deployment ordering — you must then manage `Deployment.triggers`
     * yourself.
     */
    restApi?: RestApi;
    /**
     * ID of the REST API. Usually derived from `restApi.restApiId`; supply
     * explicitly only when not using `restApi`.
     */
    restApiId?: Input<string>;
    /**
     * ID of the API Gateway Resource this method attaches to. Defaults to
     * `restApi.rootResourceId` when `restApi` is provided.
     */
    resourceId?: Input<string>;
    /** HTTP verb, e.g. `GET`, `POST`, `ANY`. */
    httpMethod: string;
    /**
     * Authorization type (`NONE`, `IAM`, `CUSTOM`, `COGNITO_USER_POOLS`, etc.).
     * @default "NONE"
     */
    authorizationType?: string;
    /** ID of the `Authorizer` when `authorizationType` is `CUSTOM` or `COGNITO_USER_POOLS`. */
    authorizerId?: string;
    /** Require callers to present an API key. */
    apiKeyRequired?: boolean;
    /** Friendly operation name (e.g. for SDK generation). */
    operationName?: string;
    /** Accepted request parameters; `true` marks a parameter required. */
    requestParameters?: {
        [key: string]: boolean | undefined;
    };
    /** Request body models keyed by content type. */
    requestModels?: {
        [key: string]: string | undefined;
    };
    /** ID of a request validator applied to this method. */
    requestValidatorId?: string;
    /** OAuth scopes for `COGNITO_USER_POOLS` authorization. */
    authorizationScopes?: string[];
    /** When set, `putIntegration` is applied after `putMethod`. */
    integration?: MethodIntegrationProps;
}
export interface MethodType extends Resource<"AWS.ApiGateway.Method", MethodProps, {
    restApiId: string;
    resourceId: string;
    httpMethod: string;
    authorizationType: string;
    authorizerId: string | undefined;
    apiKeyRequired: boolean | undefined;
    operationName: string | undefined;
    requestParameters: {
        [key: string]: boolean | undefined;
    } | undefined;
    requestModels: {
        [key: string]: string | undefined;
    } | undefined;
    requestValidatorId: string | undefined;
    authorizationScopes: string[] | undefined;
    integration: MethodIntegrationProps | undefined;
}, never, Providers> {
}
/**
 * An HTTP method on an API Gateway Resource.
 *
 * A `Method` is a single HTTP verb (`GET`, `POST`, `ANY`, …) attached to a
 * REST API resource path. Most methods also carry an `integration` — the
 * downstream target that actually handles the request (a Lambda function,
 * an HTTP endpoint, a mock response, etc.).
 * ### Binding to a RestApi
 * Pass the `RestApi` value on `restApi`. This threads the API id through
 * and registers the method as a `RestApiBinding` on the API, so that any
 * `Deployment` of the same API is automatically ordered after this method
 * completes. You do not need to manage `Deployment.triggers` yourself.
 *
 * **Example:** GET on the API root with a mock integration
 * ```typescript
 * yield* ApiGateway.Method("GetRoot", {
 *   restApi: api,
 *   httpMethod: "GET",
 *   authorizationType: "NONE",
 *   integration: { type: "MOCK" },
 * });
 * ```
 *
 * ### Lambda proxy integration
 * For Lambda-backed APIs, the integration `uri` follows the
 * `arn:aws:apigateway:<region>:lambda:path/2015-03-31/functions/<function-arn>/invocations`
 * shape. Use `Output.map` to resolve the function ARN before building the
 * URI, since the function's ARN is only known at deploy time.
 *
 * **Example:** ANY method with Lambda AWS_PROXY integration
 * ```typescript
 * import * as Output from "alchemy/Output";
 *
 * const invokeUri = Output.map(
 *   fn.functionArn,
 *   (arn) =>
 *     `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${arn}/invocations`,
 * );
 *
 * yield* ApiGateway.Method("RootAny", {
 *   restApi: api,
 *   httpMethod: "ANY",
 *   authorizationType: "NONE",
 *   integration: {
 *     type: "AWS_PROXY",
 *     integrationHttpMethod: "POST",
 *     uri: invokeUri,
 *   },
 * });
 * ```
 *
 * ### Methods on sub-paths
 * Attach a method to a nested path by creating an `ApiGateway.Resource` and
 * passing its `resourceId` explicitly. `restApi` is still required so the
 * method binds for deployment ordering.
 *
 * **Example:** Method on `/items`
 * ```typescript
 * const items = yield* ApiGateway.Resource("Items", {
 *   restApi: api,
 *   parentId: api.rootResourceId,
 *   pathPart: "items",
 * });
 *
 * yield* ApiGateway.Method("ListItems", {
 *   restApi: api,
 *   resourceId: items.resourceId,
 *   httpMethod: "GET",
 *   authorizationType: "NONE",
 *   integration: { type: "MOCK" },
 * });
 * ```
 *
 * @resource
 */
export declare const MethodResource: import("../../Resource.ts").ResourceClass<MethodType>;
/**
 * `Input`-accepting mirror of {@link MethodProps} used by the `Method`
 * wrapper function — see {@link MethodProps} for per-field documentation.
 */
export interface MethodInputProps {
    restApi?: RestApi;
    restApiId?: Input<string>;
    resourceId?: Input<string>;
    httpMethod: Input<string>;
    authorizationType?: Input<string>;
    authorizerId?: Input<string>;
    apiKeyRequired?: Input<boolean>;
    operationName?: Input<string>;
    requestParameters?: Input<MethodProps["requestParameters"]>;
    requestModels?: Input<MethodProps["requestModels"]>;
    requestValidatorId?: Input<string>;
    authorizationScopes?: Input<string[]>;
    integration?: Input<MethodIntegrationProps>;
}
declare const MethodImpl: (id: string, props: MethodInputProps) => Effect.Effect<MethodType, never, Providers>;
/**
 * User-facing wrapper for the Method resource. Accepts `restApi: RestApi`
 * as the idiomatic way to attach a method — this both forwards the API id
 * and registers the method as a binding on the RestApi so the scheduler
 * orders `Deployment` after it.
 */
export declare const Method: typeof MethodImpl;
export declare const MethodProvider: () => import("effect/Layer").Layer<Provider.Provider<MethodType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=Method.d.ts.map