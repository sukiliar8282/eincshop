import * as appsync from "@distilled.cloud/aws/appsync";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { deepEqual, isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { retryConcurrentModification, sanitizeAppSyncName } from "./common.js";
import { APPSYNC_JS } from "./Resolver.js";
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
export const FunctionResource = Resource("AWS.AppSync.Function");
/**
 * User-facing wrapper for the pipeline Function resource. Accepts
 * `api: GraphqlApi` and `dataSource: DataSource` directly.
 */
export const Function = (id, props) => Effect.gen(function* () {
    const { api, dataSource, ...rest } = props;
    const apiId = rest.apiId ?? api?.apiId;
    if (!apiId) {
        return yield* Effect.die("AppSync.Function requires either `api` (preferred) or an explicit `apiId`.");
    }
    const dataSourceName = rest.dataSourceName ?? dataSource?.name;
    if (!dataSourceName) {
        return yield* Effect.die("AppSync.Function requires either `dataSource` (preferred) or an explicit `dataSourceName`.");
    }
    return yield* FunctionResource(id, {
        ...rest,
        apiId,
        dataSourceName,
    });
});
export const FunctionProvider = () => Provider.effect(FunctionResource, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ??
            sanitizeAppSyncName(yield* createPhysicalName({ id, maxLength: 64 })));
    });
    const getFunctionSafe = (apiId, functionId) => appsync.getFunction({ apiId, functionId }).pipe(Effect.map((response) => response.functionConfiguration), Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
    /** Find a function by name (fallback when no functionId is cached). */
    const findFunctionByName = Effect.fn(function* (apiId, name) {
        const pages = yield* appsync.listFunctions.pages({ apiId }).pipe(Stream.runCollect, Effect.catchTag("NotFoundException", () => Effect.succeed([])));
        return Array.from(pages)
            .flatMap((page) => page.functions ?? [])
            .find((fn) => fn.name === name);
    });
    const desiredWire = (news, name) => ({
        name,
        description: news.description,
        dataSourceName: news.dataSourceName,
        code: news.code,
        runtime: news.code !== undefined ? APPSYNC_JS : undefined,
        requestMappingTemplate: news.requestMappingTemplate,
        responseMappingTemplate: news.responseMappingTemplate,
        functionVersion: news.functionVersion ??
            (news.code === undefined ? "2018-05-29" : undefined),
        maxBatchSize: news.maxBatchSize,
    });
    const surface = (fn) => JSON.parse(JSON.stringify({
        name: fn.name,
        description: fn.description,
        dataSourceName: fn.dataSourceName,
        code: fn.code,
        runtime: fn.runtime,
        requestMappingTemplate: fn.requestMappingTemplate,
        responseMappingTemplate: fn.responseMappingTemplate,
        maxBatchSize: fn.maxBatchSize ?? 0,
    }));
    const toAttributes = (apiId, fn) => ({
        apiId,
        functionId: fn.functionId,
        functionArn: fn.functionArn,
        name: fn.name,
        dataSourceName: fn.dataSourceName,
    });
    return FunctionResource.Provider.of({
        stables: ["apiId", "functionId", "functionArn"],
        // Sub-resource keyed entirely by its GraphQL API (apiId) with no global
        // enumeration API of its own — nuke reaches it through the parent's
        // deletion, so enumeration returns empty per the ProviderService
        // doctrine.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const apiId = output?.apiId ?? olds?.apiId;
            if (apiId === undefined)
                return undefined;
            const fn = output?.functionId !== undefined
                ? yield* getFunctionSafe(apiId, output.functionId)
                : yield* findFunctionByName(apiId, yield* createName(id, olds ?? {}));
            if (fn?.functionId == null)
                return undefined;
            return toAttributes(apiId, fn);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (news.apiId !== olds.apiId) {
                return { action: "replace" };
            }
            // name/code/data source converge via updateFunction
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const apiId = output?.apiId ?? news.apiId;
            const name = news.name ?? (yield* createName(id, news));
            const desired = desiredWire(news, name);
            // 1. OBSERVE — functionId cache first, then name scan.
            let observed = output?.functionId !== undefined
                ? yield* getFunctionSafe(apiId, output.functionId)
                : yield* findFunctionByName(apiId, name);
            if (observed?.functionId == null) {
                // 2. ENSURE
                const created = yield* retryConcurrentModification(appsync.createFunction({ apiId, ...desired }));
                observed = created.functionConfiguration;
                yield* session.note(`Created pipeline function ${name}`);
            }
            else if (!deepEqual(surface(observed), surface(desired))) {
                // 3. SYNC
                const updated = yield* retryConcurrentModification(appsync.updateFunction({
                    apiId,
                    functionId: observed.functionId,
                    ...desired,
                }));
                observed = updated.functionConfiguration ?? observed;
                yield* session.note(`Updated pipeline function ${name}`);
            }
            yield* session.note(name);
            return toAttributes(apiId, observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* retryConcurrentModification(appsync
                .deleteFunction({
                apiId: output.apiId,
                functionId: output.functionId,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void)));
        }),
    });
}));
//# sourceMappingURL=Function.js.map