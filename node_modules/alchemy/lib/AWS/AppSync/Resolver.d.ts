import * as appsync from "@distilled.cloud/aws/appsync";
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AppSyncDataSource } from "./DataSource.ts";
import type { GraphqlApi } from "./GraphqlApi.ts";
/** The modern JavaScript resolver runtime. */
export declare const APPSYNC_JS: appsync.AppSyncRuntime;
export interface ResolverProps {
    /**
     * ID of the GraphQL API. Usually derived from `api.apiId` by the
     * {@link Resolver} wrapper.
     */
    apiId: string;
    /**
     * The schema type the resolver is attached to (e.g. `Query`,
     * `Mutation`, or an object type). Changing it triggers a replacement.
     */
    typeName: string;
    /**
     * The field on {@link ResolverProps.typeName} this resolver serves.
     * Changing it triggers a replacement.
     */
    fieldName: string;
    /**
     * Name of the data source a `UNIT` resolver targets. Not used by
     * `PIPELINE` resolvers.
     */
    dataSourceName?: string;
    /**
     * The resolver kind.
     * @default "UNIT"
     */
    kind?: "UNIT" | "PIPELINE";
    /**
     * `APPSYNC_JS` resolver code exporting `request(ctx)` and
     * `response(ctx)`. When set, the runtime defaults to APPSYNC_JS 1.0.0.
     */
    code?: string;
    /** VTL request mapping template (legacy alternative to `code`). */
    requestMappingTemplate?: string;
    /** VTL response mapping template (legacy alternative to `code`). */
    responseMappingTemplate?: string;
    /**
     * Pipeline function IDs executed in order — required for `PIPELINE`
     * resolvers. Pass `fn.functionId` outputs from {@link Function}.
     */
    pipelineFunctionIds?: string[];
    /** Maximum batch size for batched Lambda invocations (0–2000). */
    maxBatchSize?: number;
    /** Per-resolver caching config (requires an API cache). */
    cachingConfig?: appsync.CachingConfig;
}
export interface AppSyncResolver extends Resource<"AWS.AppSync.Resolver", ResolverProps, {
    /** The API this resolver belongs to. */
    apiId: string;
    /** The schema type the resolver is attached to. */
    typeName: string;
    /** The field the resolver serves. */
    fieldName: string;
    /** The resolver ARN. */
    resolverArn: string;
    /** The data source a UNIT resolver targets. */
    dataSourceName: string | undefined;
    /** The resolver kind. */
    kind: "UNIT" | "PIPELINE";
}, never, Providers> {
}
/**
 * An AppSync resolver — attaches request/response logic to a schema field.
 *
 * `UNIT` resolvers target a single data source; `PIPELINE` resolvers run a
 * sequence of {@link Function}s. The modern default is `APPSYNC_JS` code
 * (a module exporting `request(ctx)` / `response(ctx)`); VTL mapping
 * templates remain supported.
 * ### Unit Resolvers
 * **Example:** JavaScript unit resolver over a Lambda data source
 * ```typescript
 * const resolver = yield* AppSync.Resolver("AddResolver", {
 *   api,
 *   typeName: "Query",
 *   fieldName: "add",
 *   dataSource: lambdaDS,
 *   code: `
 *     export function request(ctx) {
 *       return { operation: "Invoke", payload: { args: ctx.args } };
 *     }
 *     export function response(ctx) {
 *       return ctx.result;
 *     }
 *   `,
 * });
 * ```
 *
 * ### Pipeline Resolvers
 * **Example:** Pipeline resolver running one function
 * ```typescript
 * const fn = yield* AppSync.Function("Step", {
 *   api,
 *   dataSource: lambdaDS,
 *   code: fnCode,
 * });
 * const resolver = yield* AppSync.Resolver("PipelineResolver", {
 *   api,
 *   typeName: "Query",
 *   fieldName: "double",
 *   kind: "PIPELINE",
 *   pipelineFunctionIds: [fn.functionId],
 *   code: `
 *     export function request(ctx) { return {}; }
 *     export function response(ctx) { return ctx.prev.result; }
 *   `,
 * });
 * ```
 *
 * @resource
 */
export declare const ResolverResource: import("../../Resource.ts").ResourceClass<AppSyncResolver>;
export interface ResolverInputProps extends Omit<{
    [K in keyof ResolverProps]?: Input<ResolverProps[K]>;
}, "apiId" | "typeName" | "fieldName" | "dataSourceName"> {
    /**
     * The `GraphqlApi` this resolver belongs to (preferred). Alternatively
     * pass a raw `apiId`.
     */
    api?: GraphqlApi;
    apiId?: Input<string>;
    typeName: Input<string>;
    fieldName: Input<string>;
    /**
     * The data source a UNIT resolver targets (preferred). Alternatively
     * pass a raw `dataSourceName`.
     */
    dataSource?: AppSyncDataSource;
    dataSourceName?: Input<string>;
}
/**
 * User-facing wrapper for the Resolver resource. Accepts `api: GraphqlApi`
 * and `dataSource: DataSource` as the idiomatic way to wire a resolver.
 */
export declare const Resolver: (id: string, props: ResolverInputProps) => Effect.Effect<AppSyncResolver, never, Providers>;
export declare const ResolverProvider: () => import("effect/Layer").Layer<Provider.Provider<AppSyncResolver>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=Resolver.d.ts.map