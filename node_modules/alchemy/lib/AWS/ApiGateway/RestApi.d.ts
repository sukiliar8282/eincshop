import * as ag from "@distilled.cloud/aws/api-gateway";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import { AWSEnvironment } from "../Environment.ts";
export interface RestApiProps {
    /**
     * Name of the REST API.
     *
     * If omitted, Alchemy generates a deterministic physical name.
     */
    name?: string;
    /** Description of the REST API. */
    description?: string;
    /** A version identifier for the API. */
    version?: string;
    /** ID of an existing REST API to clone the new API from. */
    cloneFrom?: string;
    /** Media types treated as binary (e.g. `image/png`; a star-slash-star entry covers all types). */
    binaryMediaTypes?: string[];
    /** Minimum response size in bytes that triggers compression (0-10485760); unset disables compression. */
    minimumCompressionSize?: number;
    /**
     * Where API Gateway reads the API key on requests (`HEADER` or `AUTHORIZER`).
     * @default "HEADER"
     */
    apiKeySource?: ag.ApiKeySourceType;
    /** Endpoint type for the API (EDGE, REGIONAL, or PRIVATE). */
    endpointConfiguration?: ag.EndpointConfiguration;
    /** Resource policy document as a JSON string. */
    policy?: string;
    /**
     * Disable the default `execute-api` endpoint (serve only via custom domains).
     * @default false
     */
    disableExecuteApiEndpoint?: boolean;
    /** Minimum TLS version served by the API endpoint. */
    securityPolicy?: ag.SecurityPolicy;
    /** Access mode of the API endpoint. */
    endpointAccessMode?: ag.EndpointAccessMode;
    /** User-defined tags (Alchemy internal tags are merged automatically). */
    tags?: Record<string, string>;
}
/**
 * Structured metadata a child resource attaches to its RestApi via `.bind`.
 *
 * These bindings are the mechanism by which Methods, Resources, Authorizers,
 * and other REST-API-scoped children declare a reverse dependency on the API
 * itself. The presence of any such binding is what forces `RestApi.create` to
 * run *after* every child has been created — which is exactly the ordering
 * CloudFormation asks users to write manually via `DependsOn`.
 *
 * Consumers should not construct these directly; the child resource
 * constructors (e.g. `Method`, `Resource`) handle binding on behalf of the
 * user.
 */
export type RestApiBinding = {
    kind: "method";
    methodId: Input<string>;
    restApiId: Input<string>;
    resourceId: Input<string>;
    httpMethod: Input<string>;
} | {
    kind: "resource";
    resourceId: Input<string>;
    parentId: Input<string>;
    pathPart: Input<string>;
} | {
    kind: "authorizer";
    authorizerId: Input<string>;
};
export interface RestApi extends Resource<"AWS.ApiGateway.RestApi", RestApiProps, {
    restApiId: string;
    rootResourceId: string;
    name: string;
    description: string | undefined;
    version: string | undefined;
    binaryMediaTypes: string[] | undefined;
    minimumCompressionSize: number | undefined;
    apiKeySource: ag.ApiKeySourceType | undefined;
    endpointConfiguration: ag.EndpointConfiguration | undefined;
    policy: string | undefined;
    disableExecuteApiEndpoint: boolean | undefined;
    securityPolicy: ag.SecurityPolicy | undefined;
    endpointAccessMode: ag.EndpointAccessMode | undefined;
    tags: Record<string, string>;
}, RestApiBinding, Providers> {
}
/**
 * An Amazon API Gateway REST API (v1).
 *
 * `RestApi` is the root of an API Gateway v1 stack. Every other ApiGateway
 * resource — `Resource`, `Method`, `Authorizer`, `Deployment`, `Stage` —
 * hangs off a `RestApi`. The only identity you need to thread through your
 * stack is the `RestApi` value itself: child resources accept `restApi: api`
 * and register themselves back onto the API so that deployments and stages
 * wait for them without any user-authored dependency lists.
 * ### Getting started
 * A minimal API Gateway stack is four pieces: the `RestApi`, one or more
 * `Method`s, a `Deployment` that snapshots those methods, and a `Stage` that
 * exposes the deployment at a URL.
 *
 * **Example:** Mock HTTP GET on the root path
 * ```typescript
 * import * as ApiGateway from "alchemy/AWS/ApiGateway";
 *
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
 * });
 *
 * const stage = yield* ApiGateway.Stage("Prod", {
 *   restApi: api,
 *   stageName: "prod",
 *   deploymentId: deployment.deploymentId,
 * });
 * ```
 *
 * ### How dependencies flow
 * Writing `restApi: api` on a child (rather than `restApiId: api.restApiId`)
 * does two things: it threads the restApi id through, and it registers a
 * `RestApiBinding` back onto the API. The Alchemy scheduler sees those
 * bindings as reverse edges from children into the API, and `Deployment`
 * reads them to express a transitive dependency on every child. You never
 * have to write a `DependsOn` list or a `triggers` hash — adding a new
 * `Method` automatically orders it before the next `Deployment`.
 *
 * ### Private REST APIs
 * **Example:** Private REST API
 * ```typescript
 * const api = yield* ApiGateway.RestApi("PrivateApi", {
 *   endpointConfiguration: {
 *     types: ["PRIVATE"],
 *     vpcEndpointIds: [endpoint.vpcEndpointId],
 *   },
 *   policy: JSON.stringify({
 *     Version: "2012-10-17",
 *     Statement: [{
 *       Effect: "Allow",
 *       Principal: "*",
 *       Action: "execute-api:Invoke",
 *       Resource: "*",
 *     }],
 *   }),
 * });
 * ```
 *
 * ### Binary payloads
 * **Example:** Enable binary media types
 * ```typescript
 * const api = yield* ApiGateway.RestApi("BinaryApi", {
 *   binaryMediaTypes: ["application/octet-stream", "image/png"],
 *   minimumCompressionSize: 1024,
 * });
 * ```
 *
 * ### Endpoint hardening
 * **Example:** Disable the default execute-api endpoint
 * ```typescript
 * const api = yield* ApiGateway.RestApi("CustomDomainOnlyApi", {
 *   endpointConfiguration: { types: ["REGIONAL"] },
 *   disableExecuteApiEndpoint: true,
 * });
 * ```
 *
 * @resource
 */
export declare const RestApi: import("../../Resource.ts").ResourceClass<RestApi>;
export declare const RestApiProvider: () => import("effect/Layer").Layer<Provider.Provider<RestApi>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=RestApi.d.ts.map