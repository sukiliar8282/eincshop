import * as ag from "@distilled.cloud/aws/api-gateway";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource as ResourceFactory, } from "../../Resource.js";
/**
 * A path segment under a REST API resource tree.
 *
 * Resources form the URL hierarchy of a REST API: every path segment
 * (`/items`, `/items/{id}`, `/{proxy+}`) is a `Resource` whose `parentId`
 * points either at `api.rootResourceId` (for top-level paths) or at
 * another `Resource`'s `resourceId` (for nested paths). Attach methods
 * to a resource by passing its `resourceId` to `ApiGateway.Method`.
 * ### Path resources
 * **Example:** Top-level path
 * ```typescript
 * const items = yield* ApiGateway.Resource("Items", {
 *   restApi: api,
 *   parentId: api.rootResourceId,
 *   pathPart: "items",
 * });
 * ```
 *
 * **Example:** Nested path with a greedy proxy
 * ```typescript
 * const items = yield* ApiGateway.Resource("Items", {
 *   restApi: api,
 *   parentId: api.rootResourceId,
 *   pathPart: "items",
 * });
 *
 * const anyItem = yield* ApiGateway.Resource("AnyItem", {
 *   restApi: api,
 *   parentId: items.resourceId,
 *   pathPart: "{proxy+}",
 * });
 * ```
 *
 * @resource
 */
export const GatewayResource = ResourceFactory("AWS.ApiGateway.Resource");
/**
 * User-facing wrapper. Accepts `restApi: RestApi` to register this resource
 * as a binding on the API (so deployments wait for it transitively).
 */
const ResourceImpl = (id, props) => Effect.gen(function* () {
    const { restApi, ...rest } = props;
    const restApiId = rest.restApiId ?? restApi?.restApiId;
    if (!restApiId) {
        return yield* Effect.die("ApiGateway.Resource requires either `restApi` (preferred) or " +
            "explicit `restApiId`.");
    }
    const resource = yield* GatewayResource(id, {
        ...rest,
        restApiId,
    });
    if (restApi) {
        yield* restApi.bind `${resource}`({
            kind: "resource",
            resourceId: resource.resourceId,
            parentId: resource.parentId,
            pathPart: resource.pathPart,
        });
    }
    return resource;
});
export const Resource = ResourceImpl;
export const ResourceProvider = () => Provider.effect(GatewayResource, Effect.gen(function* () {
    return {
        stables: ["resourceId", "restApiId", "parentId"],
        diff: Effect.fn(function* ({ news: newsIn, olds }) {
            if (!isResolved(newsIn))
                return;
            const news = newsIn;
            if (news.restApiId !== olds.restApiId ||
                news.pathPart !== olds.pathPart ||
                news.parentId !== olds.parentId) {
                return { action: "replace" };
            }
        }),
        list: () => Effect.gen(function* () {
            // Enumerate parent RestApis, then list the resources under each.
            const apiIds = yield* ag.getRestApis.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.items ?? [])
                .filter((api) => api.id != null)
                .map((api) => api.id))));
            const rows = yield* Effect.forEach(apiIds, (restApiId) => ag.getResources.pages({ restApiId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.items ?? [])
                // The API root resource ("/") has no parentId/pathPart;
                // it isn't a managed `Resource`, so skip it.
                .filter((r) => r.id != null &&
                r.parentId != null &&
                r.pathPart != null)
                .map((r) => ({
                resourceId: r.id,
                restApiId,
                parentId: r.parentId,
                pathPart: r.pathPart,
            })))), 
            // A RestApi can vanish mid-enumeration; skip it.
            Effect.catchTag("NotFoundException", () => Effect.succeed([]))), { concurrency: 10 });
            return rows.flat();
        }),
        read: Effect.fn(function* ({ output }) {
            if (!output?.resourceId)
                return undefined;
            const r = yield* ag
                .getResource({
                restApiId: output.restApiId,
                resourceId: output.resourceId,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)));
            if (!r?.id)
                return undefined;
            return {
                resourceId: r.id,
                restApiId: output.restApiId,
                parentId: r.parentId,
                pathPart: r.pathPart,
            };
        }),
        reconcile: Effect.fn(function* ({ news: newsIn, output, session }) {
            if (!isResolved(newsIn)) {
                return yield* Effect.die("Resource props were not resolved");
            }
            const news = newsIn;
            const restApiId = (output?.restApiId ?? news.restApiId);
            // Observe — fetch the live resource if we have a cached id. We
            // never trust `output.pathPart` for diffing; we re-read the
            // pathPart from cloud state every reconcile.
            let observed = output?.resourceId
                ? yield* ag
                    .getResource({
                    restApiId,
                    resourceId: output.resourceId,
                })
                    .pipe(Effect.catchTag("NotFoundException", () => Effect.succeed(undefined)))
                : undefined;
            // Ensure — create the resource if missing.
            if (!observed?.id) {
                const created = yield* ag.createResource({
                    restApiId: news.restApiId,
                    parentId: news.parentId,
                    pathPart: news.pathPart,
                });
                if (!created.id) {
                    return yield* Effect.die("createResource missing id");
                }
                yield* session.note(`Created API Gateway resource ${created.id} (${news.pathPart})`);
                observed = yield* ag.getResource({
                    restApiId: news.restApiId,
                    resourceId: created.id,
                });
            }
            const resourceId = observed.id;
            // Sync pathPart — observed ↔ desired. parentId moves are modeled
            // as `replace` in `diff`, so we don't try to patch them here.
            if (news.pathPart !== observed.pathPart) {
                yield* ag.updateResource({
                    restApiId,
                    resourceId,
                    patchOperations: [
                        { op: "replace", path: "/pathPart", value: news.pathPart },
                    ],
                });
                yield* session.note(`Updated resource ${resourceId}`);
            }
            return {
                resourceId,
                restApiId,
                parentId: observed.parentId,
                pathPart: news.pathPart,
            };
        }),
        delete: Effect.fn(function* ({ output, session }) {
            yield* ag
                .deleteResource({
                restApiId: output.restApiId,
                resourceId: output.resourceId,
            })
                .pipe(Effect.catchTag("NotFoundException", () => Effect.void));
            yield* session.note(`Deleted resource ${output.resourceId}`);
        }),
    };
}));
//# sourceMappingURL=GatewayResource.js.map