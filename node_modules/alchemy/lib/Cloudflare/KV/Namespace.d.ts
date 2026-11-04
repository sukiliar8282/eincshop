import * as kv from "@distilled.cloud/cloudflare/kv";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export declare const isNamespace: (value: unknown) => value is Namespace;
export type NamespaceProps = {
    /**
     * A human-readable string name for the namespace.
     * If omitted, a unique name will be generated.
     * @default ${app}-${stage}-${id}
     */
    title?: string;
};
export type Namespace = Resource<"Cloudflare.KV.Namespace", NamespaceProps, {
    title: string;
    namespaceId: string;
    supportsUrlEncoding: boolean | undefined;
    accountId: string;
}, never, Providers>;
/**
 * A Cloudflare Workers KV namespace for key-value storage at the edge.
 *
 * KV provides eventually-consistent, low-latency reads with global
 * replication. Create a namespace as a resource, then bind it to a Worker
 * to get/put values at runtime.
 * ### Creating a Namespace
 * **Example:** Basic KV namespace
 * ```typescript
 * const kv = yield* Cloudflare.KV.Namespace("MyKV");
 * ```
 *
 * ### Binding to a Worker
 * **Example:** Using KV inside a Worker
 * ```typescript
 * const kv = yield* Cloudflare.KV.ReadWriteNamespace(MyKV);
 *
 * // Read a value
 * const value = yield* kv.get("my-key");
 *
 * // Write a value
 * yield* kv.put("my-key", "hello world");
 * ```
 *
 * Provide `Cloudflare.KV.ReadWriteNamespaceBinding` (native Worker
 * binding) or `Cloudflare.KV.ReadWriteNamespaceHttp` (scoped HTTP
 * token) in the worker's runtime layer. Use `Cloudflare.KV.ReadNamespace`
 * / `Cloudflare.KV.WriteNamespace` for least-privilege read- or
 * write-only access.
 *
 * @resource
 * @product KV
 * @category Storage & Databases
 */
export declare const Namespace: import("../../Resource.ts").ResourceClass<Namespace>;
export declare const ProviderLive: () => import("effect/Layer").Layer<Provider.Provider<Namespace>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | kv.CloudflareOpContext>;
/**
 * Local (dev) provider — the namespace is purely virtual: a `dev:` id keyed
 * into the local workerd KV simulator. `toRuntimeBinding` lowers a
 * `kv_namespace` binding whose id is `dev:`-prefixed onto the local KV
 * service; data persists under `.alchemy/local/kv`.
 */
export declare const ProviderLocal: () => import("effect/Layer").Layer<Provider.Provider<Namespace>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export declare const NamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<Namespace>, never, import("../../AlchemyContext.ts").AlchemyContext | CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | kv.CloudflareOpContext>;
//# sourceMappingURL=Namespace.d.ts.map