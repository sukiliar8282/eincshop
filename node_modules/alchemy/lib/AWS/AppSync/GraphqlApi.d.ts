import * as appsync from "@distilled.cloud/aws/appsync";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
/**
 * The primary authentication mode of a GraphQL API.
 */
export type AuthenticationType = "API_KEY" | "AWS_IAM" | "AMAZON_COGNITO_USER_POOLS" | "OPENID_CONNECT" | "AWS_LAMBDA";
export interface UserPoolAuthConfig {
    /** The Cognito user pool ID. */
    userPoolId: string;
    /**
     * The region the user pool lives in.
     * @default the ambient AWS region
     */
    awsRegion?: string;
    /**
     * What to do for requests that don't match an `appIdClientRegex`.
     * @default "ALLOW"
     */
    defaultAction?: "ALLOW" | "DENY";
    /** Regular expression matching allowed user pool app client IDs. */
    appIdClientRegex?: string;
}
export interface LambdaAuthorizerConfig {
    /**
     * The ARN of the Lambda authorizer function (or an alias/version
     * qualified ARN). AppSync must be allowed to invoke it — attach a
     * `Lambda.Permission` with principal `appsync.amazonaws.com`.
     */
    authorizerUri: string;
    /**
     * How long AppSync caches an authorizer response, e.g. `"5 minutes"` or
     * `Duration.seconds(300)` (0 disables caching, max 1 hour). Sent to AWS
     * as whole seconds.
     * @default "300 seconds"
     */
    authorizerResultTtl?: Duration.Input;
    /** Regular expression the authorization token must match before invoking. */
    identityValidationExpression?: string;
}
export interface OpenIDConnectAuthConfig {
    /** The OIDC issuer URL. */
    issuer: string;
    /** The client identifier the token audience must match. */
    clientId?: string;
    /** How long a token is valid after `iat`, e.g. `"1 hour"`. */
    iatTTL?: Duration.Input;
    /** How long a token is valid after `auth_time`, e.g. `"1 hour"`. */
    authTTL?: Duration.Input;
}
export interface AdditionalAuthProvider {
    /** The authentication mode of this additional provider. */
    authenticationType: AuthenticationType;
    /** Cognito user pool config (for `AMAZON_COGNITO_USER_POOLS`). */
    userPoolConfig?: Omit<UserPoolAuthConfig, "defaultAction">;
    /** OIDC config (for `OPENID_CONNECT`). */
    openIDConnectConfig?: OpenIDConnectAuthConfig;
    /** Lambda authorizer config (for `AWS_LAMBDA`). */
    lambdaAuthorizerConfig?: LambdaAuthorizerConfig;
}
export interface ApiCacheConfig {
    /**
     * The cache instance type, e.g. `"SMALL"`, `"MEDIUM"`, `"LARGE"` (or the
     * legacy `T2_SMALL`-style types).
     */
    type: appsync.ApiCacheType;
    /**
     * Caching behavior: `"FULL_REQUEST_CACHING"` caches every resolver,
     * `"PER_RESOLVER_CACHING"` caches only resolvers that opt in.
     */
    behavior: appsync.ApiCachingBehavior;
    /** TTL for cache entries, e.g. `"60 seconds"` (1 second–1 hour). */
    ttl: Duration.Input;
    /** Encrypt cache entries in transit. Immutable after creation. */
    transitEncryptionEnabled?: boolean;
    /** Encrypt cache entries at rest. Immutable after creation. */
    atRestEncryptionEnabled?: boolean;
    /**
     * Whether cache health metrics are emitted to CloudWatch.
     * @default "DISABLED"
     */
    healthMetricsConfig?: appsync.CacheHealthMetricsConfig;
}
export interface GraphqlApiProps {
    /**
     * Name of the API. If omitted, a deterministic physical name is
     * generated from the app, stage, and logical ID. Names are mutable.
     */
    name?: string;
    /**
     * The primary authentication mode.
     * @default "API_KEY"
     */
    authenticationType?: AuthenticationType;
    /**
     * The GraphQL schema (SDL string). Applied via `startSchemaCreation`
     * and awaited until the schema is active. Resolvers can only be
     * attached to types/fields that exist in this schema.
     */
    schema?: string;
    /**
     * Cognito user pool config — required when `authenticationType` is
     * `AMAZON_COGNITO_USER_POOLS`.
     */
    userPoolConfig?: UserPoolAuthConfig;
    /**
     * OIDC config — required when `authenticationType` is `OPENID_CONNECT`.
     */
    openIDConnectConfig?: OpenIDConnectAuthConfig;
    /**
     * Lambda authorizer config — required when `authenticationType` is
     * `AWS_LAMBDA`.
     */
    lambdaAuthorizerConfig?: LambdaAuthorizerConfig;
    /**
     * Additional authentication modes beyond the primary one.
     */
    additionalAuthenticationProviders?: AdditionalAuthProvider[];
    /**
     * CloudWatch Logs configuration. Requires a role AppSync can assume
     * with log-delivery permissions.
     */
    logConfig?: appsync.LogConfig;
    /**
     * Whether AWS X-Ray tracing is enabled.
     * @default false
     */
    xrayEnabled?: boolean;
    /**
     * `GLOBAL` (public endpoint) or `PRIVATE` (VPC-only). Immutable —
     * changing it triggers a replacement.
     * @default "GLOBAL"
     */
    visibility?: "GLOBAL" | "PRIVATE";
    /**
     * `GRAPHQL` (standard) or `MERGED` (merged API). Immutable — changing
     * it triggers a replacement.
     * @default "GRAPHQL"
     */
    apiType?: "GRAPHQL" | "MERGED";
    /**
     * Whether introspection queries are allowed.
     * @default "ENABLED"
     */
    introspectionConfig?: "ENABLED" | "DISABLED";
    /** Maximum depth a query is allowed to reach (0 disables the limit). */
    queryDepthLimit?: number;
    /** Maximum number of resolvers a query may invoke (0 disables the limit). */
    resolverCountLimit?: number;
    /**
     * Server-side API cache. **Cache instances bill hourly** while
     * provisioned; omit to run without a cache. Provisioning is
     * asynchronous (~10–20 minutes to reach `AVAILABLE`); reconcile does
     * not wait for it.
     */
    cache?: ApiCacheConfig;
    /**
     * Environment variables exposed to `APPSYNC_JS` resolver and function
     * code via `ctx.env`. The whole map is replaced on each change; pass
     * `{}` to clear all variables. When omitted, environment variables are
     * left unmanaged.
     */
    environmentVariables?: Record<string, string>;
    /**
     * Tags to apply to the API. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface GraphqlApi extends Resource<"AWS.AppSync.GraphqlApi", GraphqlApiProps, {
    /** The unique API ID. */
    apiId: string;
    /** The API's ARN. */
    apiArn: string;
    /** The API name. */
    name: string;
    /** The GraphQL endpoint (`https://{id}.appsync-api.{region}.amazonaws.com/graphql`). */
    graphqlUrl: string;
    /** The real-time (WebSocket subscriptions) endpoint. */
    realtimeUrl: string | undefined;
    /** The primary authentication mode. */
    authenticationType: AuthenticationType;
}, never, Providers> {
}
/**
 * An AWS AppSync GraphQL API.
 *
 * Owns the API, its SDL schema (applied via `startSchemaCreation` and
 * awaited until active), its authentication modes, and an optional
 * server-side cache. Pair with {@link DataSource}, {@link Resolver},
 * and {@link ApiKey} to serve GraphQL over Lambda or DynamoDB.
 * ### Creating a GraphQL API
 * **Example:** API-key authenticated API with a schema
 * ```typescript
 * import * as AppSync from "alchemy/AWS/AppSync";
 *
 * const api = yield* AppSync.GraphqlApi("Api", {
 *   schema: `
 *     type Query { hello: String! }
 *     schema { query: Query }
 *   `,
 * });
 * const key = yield* AppSync.ApiKey("Key", { api });
 * ```
 *
 * ### Authentication Modes
 * **Example:** Lambda authorizer
 * ```typescript
 * const api = yield* AppSync.GraphqlApi("Api", {
 *   authenticationType: "AWS_LAMBDA",
 *   lambdaAuthorizerConfig: { authorizerUri: authorizer.functionArn },
 *   schema,
 * });
 * // AppSync must be allowed to invoke the authorizer:
 * yield* AWS.Lambda.Permission("AppSyncInvoke", {
 *   functionName: authorizer.functionName,
 *   principal: "appsync.amazonaws.com",
 *   action: "lambda:InvokeFunction",
 *   sourceArn: api.apiArn,
 * });
 * ```
 *
 * **Example:** Cognito user pools as an additional auth mode
 * ```typescript
 * const api = yield* AppSync.GraphqlApi("Api", {
 *   authenticationType: "API_KEY",
 *   additionalAuthenticationProviders: [
 *     {
 *       authenticationType: "AMAZON_COGNITO_USER_POOLS",
 *       userPoolConfig: { userPoolId: pool.userPoolId },
 *     },
 *   ],
 *   schema,
 * });
 * ```
 *
 * ### Caching
 * **Example:** Full-request server-side cache (bills hourly!)
 * ```typescript
 * const api = yield* AppSync.GraphqlApi("Api", {
 *   schema,
 *   cache: { type: "SMALL", behavior: "FULL_REQUEST_CACHING", ttl: "60 seconds" },
 * });
 * ```
 *
 * ### Environment Variables
 * **Example:** Expose variables to resolver code via ctx.env
 * ```typescript
 * const api = yield* AppSync.GraphqlApi("Api", {
 *   schema,
 *   environmentVariables: { STAGE: "prod" },
 * });
 * // in APPSYNC_JS resolver code:
 * //   export function response(ctx) { return ctx.env.STAGE; }
 * ```
 *
 * @resource
 */
export declare const GraphqlApi: import("../../Resource.ts").ResourceClass<GraphqlApi>;
declare const SchemaCreationFailed_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SchemaCreationFailed";
} & Readonly<A>;
/** Schema creation finished in the `FAILED` state. */
export declare class SchemaCreationFailed extends SchemaCreationFailed_base<{
    readonly apiId: string;
    readonly details: string | undefined;
}> {
}
declare const SchemaCreationTimedOut_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SchemaCreationTimedOut";
} & Readonly<A>;
/** Schema creation did not settle within the bounded polling window. */
export declare class SchemaCreationTimedOut extends SchemaCreationTimedOut_base<{
    readonly apiId: string;
    readonly status: string | undefined;
}> {
}
export declare const GraphqlApiProvider: () => import("effect/Layer").Layer<Provider.Provider<GraphqlApi>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=GraphqlApi.d.ts.map