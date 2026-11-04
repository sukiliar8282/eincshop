import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { AppSyncDataSource } from "./DataSource.ts";
import type { GraphqlApi } from "./GraphqlApi.ts";
export interface FunctionProps {
    /**
     * ID of the GraphQL API. Usually derived from `api.apiId` by the
     * {@link Function} wrapper.
     */
    apiId: string;
    /**
     * Name of the function (`[_A-Za-z][_0-9A-Za-z]*` — no dashes). If
     * omitted, a deterministic name is generated (dashes sanitized to
     * underscores). Names are mutable.
     */
    name?: string;
    /** Description of the function. */
    description?: string;
    /** Name of the data source this function targets. */
    dataSourceName: string;
    /**
     * `APPSYNC_JS` function code exporting `request(ctx)` and
     * `response(ctx)`. When set, the runtime defaults to APPSYNC_JS 1.0.0.
     */
    code?: string;
    /** VTL request mapping template (legacy alternative to `code`). */
    requestMappingTemplate?: string;
    /** VTL response mapping template (legacy alternative to `code`). */
    responseMappingTemplate?: string;
    /**
     * The VTL function version — only used with mapping templates.
     * @default "2018-05-29" (when templates are used)
     */
    functionVersion?: string;
    /** Maximum batch size for batched Lambda invocations (0–2000). */
    maxBatchSize?: number;
}
export interface AppSyncFunction extends Resource<"AWS.AppSync.Function", FunctionProps, {
    /** The API this function belongs to. */
    apiId: string;
    /** The immutable function ID (referenced by pipeline resolvers). */
    functionId: string;
    /** The function ARN. */
    functionArn: string;
    /** The function name. */
    name: string;
    /** The data source this function targets. */
    dataSourceName: string;
}, never, Providers> {
}
/**
 * An AppSync pipeline function — a reusable step composed by `PIPELINE`
 * resolvers.
 * ### Creating Pipeline Functions
 * **Example:** JavaScript pipeline function over a Lambda data source
 * ```typescript
 * const step = yield* AppSync.Function("InvokeStep", {
 *   api,
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
 * // reference from a PIPELINE resolver:
 * // pipelineFunctionIds: [step.functionId]
 * ```
 *
 * @resource
 */
export declare const FunctionResource: import("../../Resource.ts").ResourceClass<AppSyncFunction>;
export interface FunctionInputProps extends Omit<{
    [K in keyof FunctionProps]?: Input<FunctionProps[K]>;
}, "apiId" | "dataSourceName"> {
    /**
     * The `GraphqlApi` this function belongs to (preferred). Alternatively
     * pass a raw `apiId`.
     */
    api?: GraphqlApi;
    apiId?: Input<string>;
    /**
     * The data source this function targets (preferred). Alternatively pass
     * a raw `dataSourceName`.
     */
    dataSource?: AppSyncDataSource;
    dataSourceName?: Input<string>;
}
/**
 * User-facing wrapper for the pipeline Function resource. Accepts
 * `api: GraphqlApi` and `dataSource: DataSource` directly.
 */
export declare const Function: (id: string, props: FunctionInputProps) => Effect.Effect<AppSyncFunction, never, Providers>;
export declare const FunctionProvider: () => import("effect/Layer").Layer<Provider.Provider<AppSyncFunction>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Function.d.ts.map