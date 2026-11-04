import * as appsync from "@distilled.cloud/aws/appsync";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { toWireMillis, toWireSeconds } from "../../Util/Duration.js";
import { AWSEnvironment } from "../Environment.js";
import { retryConcurrentModification, syncAppSyncTags, tagRecord, } from "./common.js";
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
export const GraphqlApi = Resource("AWS.AppSync.GraphqlApi");
/** Schema creation finished in the `FAILED` state. */
export class SchemaCreationFailed extends Data.TaggedError("SchemaCreationFailed") {
}
/** Schema creation did not settle within the bounded polling window. */
export class SchemaCreationTimedOut extends Data.TaggedError("SchemaCreationTimedOut") {
}
const toWireOidcConfig = (config) => config === undefined
    ? undefined
    : {
        issuer: config.issuer,
        clientId: config.clientId,
        // The AppSync API expresses both token TTLs in milliseconds.
        iatTTL: toWireMillis(config.iatTTL),
        authTTL: toWireMillis(config.authTTL),
    };
const toWireLambdaAuthorizerConfig = (config) => config === undefined
    ? undefined
    : {
        authorizerUri: config.authorizerUri,
        // The wire field carries the unit; the prop is a Duration.Input.
        authorizerResultTtlInSeconds: toWireSeconds(config.authorizerResultTtl),
        identityValidationExpression: config.identityValidationExpression,
    };
const toWireUserPoolConfig = (config, region) => config === undefined
    ? undefined
    : {
        userPoolId: config.userPoolId,
        awsRegion: config.awsRegion ?? region,
        defaultAction: config.defaultAction ?? "ALLOW",
        appIdClientRegex: config.appIdClientRegex,
    };
const toWireAdditionalProviders = (providers, region) => providers === undefined
    ? undefined
    : providers.map((provider) => ({
        authenticationType: provider.authenticationType,
        userPoolConfig: provider.userPoolConfig === undefined
            ? undefined
            : {
                userPoolId: provider.userPoolConfig.userPoolId,
                awsRegion: provider.userPoolConfig.awsRegion ?? region,
                appIdClientRegex: provider.userPoolConfig.appIdClientRegex,
            },
        openIDConnectConfig: toWireOidcConfig(provider.openIDConnectConfig),
        lambdaAuthorizerConfig: toWireLambdaAuthorizerConfig(provider.lambdaAuthorizerConfig),
    }));
/**
 * Canonicalize the wire-facing auth/limit surface of an API so observed
 * and desired states compare structurally (dropping undefined members).
 */
const authSurface = (api) => JSON.parse(JSON.stringify({
    name: api.name,
    authenticationType: api.authenticationType,
    userPoolConfig: api.userPoolConfig,
    openIDConnectConfig: api.openIDConnectConfig,
    lambdaAuthorizerConfig: {
        ...api.lambdaAuthorizerConfig,
        // AWS normalizes the TTL default (300) into the response
        authorizerResultTtlInSeconds: api.lambdaAuthorizerConfig === undefined
            ? undefined
            : (api.lambdaAuthorizerConfig.authorizerResultTtlInSeconds ?? 300),
    },
    additionalAuthenticationProviders: api.additionalAuthenticationProviders?.map((p) => ({
        ...p,
        lambdaAuthorizerConfig: p.lambdaAuthorizerConfig === undefined
            ? undefined
            : {
                ...p.lambdaAuthorizerConfig,
                authorizerResultTtlInSeconds: p.lambdaAuthorizerConfig.authorizerResultTtlInSeconds ??
                    300,
            },
    })),
    xrayEnabled: api.xrayEnabled ?? false,
    introspectionConfig: api.introspectionConfig ?? "ENABLED",
    queryDepthLimit: api.queryDepthLimit ?? 0,
    resolverCountLimit: api.resolverCountLimit ?? 0,
    logConfig: api.logConfig,
}));
export const GraphqlApiProvider = () => Provider.effect(GraphqlApi, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 64 }));
    });
    const getApiSafe = (apiId) => appsync.getGraphqlApi({ apiId }).pipe(Effect.map((response) => response.graphqlApi), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    /** Find an API by exact name (fallback when no apiId is cached). */
    const findApiByName = Effect.fn(function* (name) {
        const pages = yield* appsync.listGraphqlApis
            .pages({})
            .pipe(Stream.runCollect);
        return Array.from(pages)
            .flatMap((page) => page.graphqlApis ?? [])
            .find((api) => api.name === name);
    });
    const toAttributes = (api) => ({
        apiId: api.apiId,
        apiArn: api.arn,
        name: api.name,
        graphqlUrl: api.uris?.GRAPHQL ?? "",
        realtimeUrl: api.uris?.REALTIME,
        authenticationType: api.authenticationType,
    });
    /**
     * Apply the SDL schema and poll until the creation settles.
     * `startSchemaCreation` is asynchronous; polling is bounded (~60s —
     * schema creation is normally seconds).
     */
    const applySchema = Effect.fn(function* (apiId, schema) {
        const definition = yield* Effect.sync(() => new TextEncoder().encode(schema));
        yield* retryConcurrentModification(appsync.startSchemaCreation({ apiId, definition }));
        const final = yield* appsync.getSchemaCreationStatus({ apiId }).pipe(Effect.repeat({
            schedule: Schedule.fixed("1 second"),
            until: (response) => response.status !== "PROCESSING",
            times: 60,
        }));
        if (final.status === "FAILED") {
            return yield* new SchemaCreationFailed({
                apiId,
                details: final.details,
            });
        }
        if (final.status === "PROCESSING") {
            return yield* new SchemaCreationTimedOut({
                apiId,
                status: final.status,
            });
        }
    });
    /**
     * Converge the optional server-side cache: create when desired and
     * missing, update on drift, delete when no longer desired. Creation
     * is asynchronous and NOT awaited (10–20 minutes to AVAILABLE).
     */
    const syncCache = Effect.fn(function* (apiId, desired) {
        const observed = yield* appsync.getApiCache({ apiId }).pipe(Effect.map((response) => response.apiCache), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
        if (desired === undefined) {
            if (observed !== undefined) {
                yield* retryConcurrentModification(appsync
                    .deleteApiCache({ apiId })
                    .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
            }
            return;
        }
        // The wire TTL is whole seconds.
        const desiredTtl = toWireSeconds(desired.ttl);
        if (observed === undefined) {
            yield* retryConcurrentModification(appsync.createApiCache({
                apiId,
                type: desired.type,
                apiCachingBehavior: desired.behavior,
                ttl: desiredTtl,
                transitEncryptionEnabled: desired.transitEncryptionEnabled,
                atRestEncryptionEnabled: desired.atRestEncryptionEnabled,
                healthMetricsConfig: desired.healthMetricsConfig,
            }));
            return;
        }
        const drifted = observed.type !== desired.type ||
            observed.apiCachingBehavior !== desired.behavior ||
            observed.ttl !== desiredTtl ||
            (desired.healthMetricsConfig !== undefined &&
                observed.healthMetricsConfig !== desired.healthMetricsConfig);
        if (drifted) {
            yield* retryConcurrentModification(appsync.updateApiCache({
                apiId,
                type: desired.type,
                apiCachingBehavior: desired.behavior,
                ttl: desiredTtl,
                healthMetricsConfig: desired.healthMetricsConfig,
            }));
        }
    });
    /**
     * Converge resolver environment variables (`ctx.env`). The AWS API
     * replaces the whole map on PUT, so a single drift-guarded call
     * suffices. Skipped entirely when the prop is unmanaged.
     */
    const syncEnvironmentVariables = Effect.fn(function* (apiId, desired) {
        if (desired === undefined)
            return;
        const observed = yield* appsync
            .getGraphqlApiEnvironmentVariables({ apiId })
            .pipe(Effect.map((response) => response.environmentVariables ?? {}));
        if (!deepEqual(tagRecord(observed), desired)) {
            yield* retryConcurrentModification(appsync.putGraphqlApiEnvironmentVariables({
                apiId,
                environmentVariables: desired,
            }));
        }
    });
    return GraphqlApi.Provider.of({
        stables: ["apiId", "apiArn", "graphqlUrl", "realtimeUrl"],
        list: () => Effect.gen(function* () {
            const pages = yield* appsync.listGraphqlApis
                .pages({})
                .pipe(Stream.runCollect);
            return Array.from(pages)
                .flatMap((page) => page.graphqlApis ?? [])
                .filter((api) => api.apiId != null)
                .map(toAttributes);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const api = output?.apiId !== undefined
                ? yield* getApiSafe(output.apiId)
                : yield* findApiByName(yield* createName(id, olds ?? {}));
            if (api?.apiId == null)
                return undefined;
            const attrs = toAttributes(api);
            const tags = tagRecord(api.tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if ((news.visibility ?? "GLOBAL") !== (olds.visibility ?? "GLOBAL") ||
                (news.apiType ?? "GRAPHQL") !== (olds.apiType ?? "GRAPHQL")) {
                return { action: "replace" };
            }
            // name/auth/schema/cache/limits/tags converge via update
        }),
        reconcile: Effect.fn(function* ({ id, news, olds, output, session }) {
            const { region } = yield* AWSEnvironment.current;
            const name = news.name ?? (yield* createName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const authenticationType = news.authenticationType ?? "API_KEY";
            const desired = {
                name,
                authenticationType,
                userPoolConfig: toWireUserPoolConfig(news.userPoolConfig, region),
                openIDConnectConfig: toWireOidcConfig(news.openIDConnectConfig),
                lambdaAuthorizerConfig: toWireLambdaAuthorizerConfig(news.lambdaAuthorizerConfig),
                additionalAuthenticationProviders: toWireAdditionalProviders(news.additionalAuthenticationProviders, region),
                xrayEnabled: news.xrayEnabled,
                introspectionConfig: news.introspectionConfig,
                queryDepthLimit: news.queryDepthLimit,
                resolverCountLimit: news.resolverCountLimit,
                logConfig: news.logConfig,
            };
            // 1. OBSERVE — the cached apiId is only a hint; fall back to a
            //    name scan so interrupted deploys converge.
            let observed = output?.apiId !== undefined
                ? yield* getApiSafe(output.apiId)
                : yield* findApiByName(name);
            // 2. ENSURE
            let justCreated = false;
            if (observed?.apiId == null) {
                const created = yield* retryConcurrentModification(appsync.createGraphqlApi({
                    ...desired,
                    visibility: news.visibility,
                    apiType: news.apiType,
                    tags: desiredTags,
                }));
                observed = created.graphqlApi;
                justCreated = true;
                yield* session.note(`Created GraphQL API ${observed.apiId}`);
            }
            const apiId = observed.apiId;
            // 3. SYNC — one update call when the observed auth/limit surface
            //    drifted from the desired one.
            if (!justCreated &&
                !deepEqual(authSurface(observed), authSurface(desired))) {
                const updated = yield* retryConcurrentModification(appsync.updateGraphqlApi({ apiId, ...desired }));
                observed = updated.graphqlApi ?? observed;
                yield* session.note(`Updated GraphQL API ${apiId}`);
            }
            // 3b. SYNC SCHEMA — `startSchemaCreation` replaces the schema
            //     wholesale (idempotent). Apply on first provision, on
            //     adoption, and whenever the desired SDL changed; the
            //     previous props are only a hint to skip the no-op call.
            if (news.schema !== undefined &&
                (justCreated ||
                    output === undefined ||
                    olds?.schema !== news.schema)) {
                yield* applySchema(apiId, news.schema);
                yield* session.note(`Applied schema to ${apiId}`);
            }
            // 3c. SYNC CACHE
            yield* syncCache(apiId, news.cache);
            // 3d. SYNC ENVIRONMENT VARIABLES (ctx.env in resolver code).
            yield* syncEnvironmentVariables(apiId, news.environmentVariables);
            // 3e. SYNC TAGS — against OBSERVED cloud tags.
            if (observed.arn !== undefined) {
                yield* syncAppSyncTags({
                    resourceArn: observed.arn,
                    oldTags: tagRecord(observed.tags),
                    newTags: desiredTags,
                });
            }
            yield* session.note(apiId);
            return toAttributes(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryConcurrentModification(appsync
                .deleteGraphqlApi({ apiId: output.apiId })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
        }),
    });
}));
//# sourceMappingURL=GraphqlApi.js.map