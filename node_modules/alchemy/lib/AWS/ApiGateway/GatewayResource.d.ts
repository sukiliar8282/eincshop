import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { type Resource as ResourceType } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { RestApi } from "./RestApi.ts";
export interface ApiGatewayResourceProps {
    /**
     * The `RestApi` this path segment belongs to. Binding via `restApi`
     * registers this resource on the API so that any `Deployment` of the
     * same API waits for it — and for the methods attached to it — before
     * snapshotting.
     */
    restApi?: RestApi;
    /**
     * Identifier of the parent REST API. Usually derived from `restApi.restApiId`.
     */
    restApiId?: Input<string>;
    /**
     * Parent resource id (use `api.rootResourceId` for top-level paths, or
     * the `resourceId` of another `ApiGateway.Resource` to nest deeper).
     */
    parentId: Input<string>;
    /**
     * Path segment (e.g. `items` or `{proxy+}`).
     */
    pathPart: string;
}
export interface ApiGatewayResource extends ResourceType<"AWS.ApiGateway.Resource", ApiGatewayResourceProps, {
    resourceId: string;
    restApiId: string;
    parentId: string;
    pathPart: string;
}, never, Providers> {
}
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
export declare const GatewayResource: import("../../Resource.ts").ResourceClass<ApiGatewayResource>;
interface ApiGatewayResourceInputProps {
    restApi?: RestApi;
    restApiId?: Input<string>;
    parentId: Input<string>;
    pathPart: Input<string>;
}
/**
 * User-facing wrapper. Accepts `restApi: RestApi` to register this resource
 * as a binding on the API (so deployments wait for it transitively).
 */
declare const ResourceImpl: (id: string, props: ApiGatewayResourceInputProps) => Effect.Effect<ApiGatewayResource, never, Providers>;
export declare const Resource: typeof ResourceImpl;
export declare const ResourceProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiGatewayResource>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
export {};
//# sourceMappingURL=GatewayResource.d.ts.map