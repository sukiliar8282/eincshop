import * as wfp from "@distilled.cloud/cloudflare/workers-for-platforms";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Workers.DispatchNamespace";
type TypeId = typeof TypeId;
export interface DispatchNamespaceProps {
    /**
     * Name of the dispatch namespace. Must be lowercase, alphanumeric, and
     * contain no spaces or special characters except dashes. The name is the
     * namespace's identity — there is no rename API, so changing it triggers
     * a replacement. If omitted, a unique name is generated from the app,
     * stage, and logical ID.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
}
export interface DispatchNamespaceAttributes {
    /**
     * API Resource UUID tag assigned by Cloudflare.
     */
    namespaceId: string;
    /**
     * Name of the dispatch namespace.
     */
    name: string;
    /**
     * The Cloudflare account the namespace belongs to.
     */
    accountId: string;
    /**
     * The current number of scripts in this dispatch namespace.
     */
    scriptCount: number;
    /**
     * Whether the Workers in the namespace are executed in a "trusted"
     * manner (access to shared zone caches and `request.cf`).
     */
    trustedWorkers: boolean;
    /**
     * When the namespace was created.
     */
    createdOn: string | undefined;
    /**
     * When the namespace was last modified.
     */
    modifiedOn: string | undefined;
}
export type DispatchNamespace = Resource<TypeId, DispatchNamespaceProps, DispatchNamespaceAttributes, never, Providers>;
/**
 * A Workers for Platforms dispatch namespace — a container for customer
 * ("user") Workers that a platform Worker dispatches to at runtime via a
 * dynamic-dispatch binding.
 *
 * The namespace has no mutable properties: its `name` is its identity, so
 * changing the name triggers a replacement. Deleting a namespace also
 * deletes every script uploaded into it.
 *
 * Note: Workers for Platforms is a paid add-on. On accounts without the
 * subscription, namespace creation fails with an entitlement error.
 * ### Creating a Dispatch Namespace
 * **Example:** Namespace with a generated name
 * ```typescript
 * const namespace = yield* Cloudflare.WorkersForPlatforms.DispatchNamespace("Customers", {});
 * ```
 *
 * **Example:** Namespace with an explicit name
 * ```typescript
 * const namespace = yield* Cloudflare.WorkersForPlatforms.DispatchNamespace("Customers", {
 *   name: "my-platform-customers",
 * });
 * ```
 *
 * ### Uploading user Workers
 * **Example:** Upload a customer Worker into the namespace
 * A {@link Cloudflare.Worker} deploys into the namespace as a "user worker"
 * (rather than as a routable account-level script) when its `namespace` prop is
 * set. Reference the namespace by its `name` output so it deploys first.
 * ```typescript
 * const namespace = yield* Cloudflare.WorkersForPlatforms.DispatchNamespace("Customers", {});
 *
 * const customerA = yield* Cloudflare.Worker("CustomerA", {
 *   namespace: namespace.name,
 *   script: `export default { fetch() { return new Response("hi"); } }`,
 * });
 * ```
 *
 * ### Dispatching from a platform Worker
 * **Example:** Effect-native binding via `Get`
 * `Cloudflare.WorkersForPlatforms.Get(namespace)` binds the namespace and
 * returns an Effect-native client; `get(name)` resolves a user Worker by script
 * name. Provide {@link GetBinding} on the Worker's runtime layer.
 * ```typescript
 * const dispatch = yield* Cloudflare.WorkersForPlatforms.Get(namespace);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     const request = yield* HttpServerRequest;
 *     const userWorker = yield* dispatch.get("CustomerA");
 *     return yield* Effect.promise(() => userWorker.fetch(request));
 *   }),
 * };
 * ```
 *
 * **Example:** Async binding via `env` + `InferEnv`
 * Passing the namespace on a Worker's `env` binds it as a native
 * `dispatch_namespace` binding; `Cloudflare.InferEnv` types `env.DISPATCH` as
 * the runtime `DispatchNamespace`, so the async handler calls `.get(name)`
 * directly.
 * ```typescript
 * const platform = Cloudflare.Worker("Platform", {
 *   main: "./handler.ts",
 *   env: { DISPATCH: namespace },
 * });
 * type Env = Cloudflare.InferEnv<typeof platform>;
 *
 * // handler.ts
 * export default {
 *   async fetch(request: Request, env: Env) {
 *     return env.DISPATCH.get("CustomerA").fetch(request);
 *   },
 * };
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-for-platforms/workers-for-platforms/
 *
 * @resource
 * @product Workers for Platforms
 * @category Workers & Compute
 */
export declare const DispatchNamespace: import("../../Resource.ts").ResourceClass<DispatchNamespace>;
/**
 * Returns true if the given value is a DispatchNamespace resource.
 */
export declare const isDispatchNamespace: (value: unknown) => value is DispatchNamespace;
export declare const DispatchNamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<DispatchNamespace>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | wfp.CloudflareOpContext>;
export {};
//# sourceMappingURL=DispatchNamespace.d.ts.map