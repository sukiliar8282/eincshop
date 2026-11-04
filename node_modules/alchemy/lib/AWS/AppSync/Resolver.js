import * as appsync from "@distilled.cloud/aws/appsync";
import * as Effect from "effect/Effect";
import { deepEqual, isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { retryConcurrentModification } from "./common.js";
/** The modern JavaScript resolver runtime. */
export const APPSYNC_JS = {
    name: "APPSYNC_JS",
    runtimeVersion: "1.0.0",
};
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
export const ResolverResource = Resource("AWS.AppSync.Resolver");
/**
 * User-facing wrapper for the Resolver resource. Accepts `api: GraphqlApi`
 * and `dataSource: DataSource` as the idiomatic way to wire a resolver.
 */
export const Resolver = (id, props) => Effect.gen(function* () {
    const { api, dataSource, ...rest } = props;
    const apiId = rest.apiId ?? api?.apiId;
    if (!apiId) {
        return yield* Effect.die("Resolver requires either `api` (preferred) or an explicit `apiId`.");
    }
    const dataSourceName = rest.dataSourceName ?? dataSource?.name;
    return yield* ResolverResource(id, {
        ...rest,
        apiId,
        dataSourceName,
    });
});
export const ResolverProvider = () => Provider.effect(ResolverResource, Effect.gen(function* () {
    const getResolverSafe = (apiId, typeName, fieldName) => appsync.getResolver({ apiId, typeName, fieldName }).pipe(Effect.map((response) => response.resolver), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    const desiredWire = (news) => ({
        dataSourceName: news.dataSourceName,
        kind: news.kind ?? "UNIT",
        code: news.code,
        runtime: news.code !== undefined ? APPSYNC_JS : undefined,
        requestMappingTemplate: news.requestMappingTemplate,
        responseMappingTemplate: news.responseMappingTemplate,
        pipelineConfig: news.pipelineFunctionIds === undefined
            ? undefined
            : { functions: news.pipelineFunctionIds },
        maxBatchSize: news.maxBatchSize,
        cachingConfig: news.cachingConfig,
    });
    const surface = (resolver) => JSON.parse(JSON.stringify({
        dataSourceName: resolver.dataSourceName,
        kind: resolver.kind ?? "UNIT",
        code: resolver.code,
        runtime: resolver.runtime,
        requestMappingTemplate: resolver.requestMappingTemplate,
        responseMappingTemplate: resolver.responseMappingTemplate,
        pipelineFunctions: resolver.pipelineConfig?.functions ?? [],
        maxBatchSize: resolver.maxBatchSize ?? 0,
        cachingConfig: resolver.cachingConfig,
    }));
    const toAttributes = (apiId, resolver) => ({
        apiId,
        typeName: resolver.typeName,
        fieldName: resolver.fieldName,
        resolverArn: resolver.resolverArn,
        dataSourceName: resolver.dataSourceName,
        kind: (resolver.kind ?? "UNIT"),
    });
    return ResolverResource.Provider.of({
        stables: ["apiId", "typeName", "fieldName", "resolverArn"],
        // Sub-resource keyed entirely by its GraphQL API (apiId/typeName) with no global
        // enumeration API of its own — nuke reaches it through the parent's
        // deletion, so enumeration returns empty per the ProviderService
        // doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ olds, output }) {
            const apiId = output?.apiId ?? olds?.apiId;
            const typeName = output?.typeName ?? olds?.typeName;
            const fieldName = output?.fieldName ?? olds?.fieldName;
            if (apiId === undefined ||
                typeName === undefined ||
                fieldName === undefined) {
                return undefined;
            }
            const resolver = yield* getResolverSafe(apiId, typeName, fieldName);
            if (resolver?.resolverArn == null)
                return undefined;
            return toAttributes(apiId, resolver);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.apiId !== olds.apiId ||
                news.typeName !== olds.typeName ||
                news.fieldName !== olds.fieldName) {
                return { action: "replace" };
            }
            // data source / code / kind / pipeline converge via update
        }),
        reconcile: Effect.fn(function* ({ news, output, session }) {
            const apiId = output?.apiId ?? news.apiId;
            const typeName = news.typeName;
            const fieldName = news.fieldName;
            const desired = desiredWire(news);
            // 1. OBSERVE
            let observed = yield* getResolverSafe(apiId, typeName, fieldName);
            if (observed?.resolverArn == null) {
                // 2. ENSURE
                const created = yield* retryConcurrentModification(appsync.createResolver({
                    apiId,
                    typeName,
                    fieldName,
                    ...desired,
                }));
                observed = created.resolver;
                yield* session.note(`Created resolver ${typeName}.${fieldName}`);
            }
            else if (!deepEqual(surface(observed), surface(desired))) {
                // 3. SYNC
                const updated = yield* retryConcurrentModification(appsync.updateResolver({
                    apiId,
                    typeName,
                    fieldName,
                    ...desired,
                }));
                observed = updated.resolver ?? observed;
                yield* session.note(`Updated resolver ${typeName}.${fieldName}`);
            }
            yield* session.note(`${typeName}.${fieldName}`);
            return toAttributes(apiId, observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryConcurrentModification(appsync
                .deleteResolver({
                apiId: output.apiId,
                typeName: output.typeName,
                fieldName: output.fieldName,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
        }),
    });
}));
//# sourceMappingURL=Resolver.js.map