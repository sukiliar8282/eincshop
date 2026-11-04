import * as aisearch from "@distilled.cloud/cloudflare/aisearch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.AI.SearchNamespace";
type TypeId = typeof TypeId;
export type SearchNamespaceProps = {
    /**
     * Namespace name. Lowercase letters, digits, and hyphens; must start and
     * end with an alphanumeric character; 1-28 characters. The name is the
     * namespace's identity (it appears in the API path) and cannot be
     * renamed — changing it triggers a replacement. If omitted, a unique
     * name is generated from the app, stage, and logical ID.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    name?: string;
    /**
     * Optional human-readable description for the namespace.
     * Max 256 characters.
     */
    description?: string;
};
export type SearchNamespaceAttributes = {
    /**
     * Namespace name (its identity within the account).
     */
    name: string;
    /**
     * The Cloudflare account the namespace belongs to.
     */
    accountId: string;
    /**
     * Human-readable description, when set.
     */
    description: string | undefined;
    /**
     * When the namespace was created.
     */
    createdAt: string | undefined;
};
export type SearchNamespace = Resource<TypeId, SearchNamespaceProps, SearchNamespaceAttributes, never, Providers>;
/**
 * A Cloudflare.AI. Search namespace — a logical grouping for AI Search
 * instances within an account.
 *
 * Namespaces partition AI Search (formerly AutoRAG) instances: each
 * namespace owns its own set of namespace-scoped instances and can be
 * searched or queried as a unit. The namespace `name` is its identity —
 * changing it triggers a replacement; only the `description` is mutable
 * in place.
 *
 * The account-provided `default` namespace is reserved: it always exists
 * and Cloudflare disallows modifying or deleting it. Alchemy adopts it so
 * it can be referenced and bound, but never updates or tears it down.
 *
 * ### Creating a Namespace
 * **Example:** Generated name
 * ```typescript
 * const ns = yield* Cloudflare.AI.SearchNamespace("docs", {});
 * ```
 *
 * **Example:** Explicit name and description
 * ```typescript
 * const ns = yield* Cloudflare.AI.SearchNamespace("docs", {
 *   name: "docs-search",
 *   description: "Search over the product documentation",
 * });
 * ```
 *
 * ### Updating a Namespace
 * **Example:** Change the description in place
 * Only the `description` is mutable; changing `name` replaces the namespace.
 * ```typescript
 * const ns = yield* Cloudflare.AI.SearchNamespace("docs", {
 *   name: "docs-search",
 *   description: "Search over docs and changelogs",
 * });
 * ```
 *
 * ### Grouping pipelines
 * Group {@link Search} pipelines under the namespace by passing the
 * namespace resource itself to each pipeline's `namespace` prop. The engine
 * orders each pipeline after the namespace on deploy and tears them down
 * before it on destroy.
 * **Example:** Two pipelines in one namespace
 * ```typescript
 * const ns = yield* Cloudflare.AI.SearchNamespace("docs", {});
 * const guides = yield* Cloudflare.AI.Search("guides", {
 *   source: guidesBucket,
 *   namespace: ns,
 * });
 * const api = yield* Cloudflare.AI.Search("api", {
 *   source: apiBucket,
 *   namespace: ns,
 * });
 * ```
 *
 * ### Binding to an Effect Worker
 * Bind the namespace with `Cloudflare.AI.QuerySearchNamespace(namespace)`,
 * which attaches the `ai_search_namespace` binding and returns a client
 * whose `.get(name)` selects an instance within the namespace at runtime.
 * Provide {@link QuerySearchNamespaceBinding} in the Worker's runtime
 * layer.
 * **Example:** Select an instance per request
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * export default class Api extends Cloudflare.Worker<Api>()(
 *   "api",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const ns = yield* Cloudflare.AI.QuerySearchNamespace(Docs);
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const url = new URL((yield* HttpServerRequest).url);
 *         const instance = url.searchParams.get("instance") ?? "guides";
 *         const query = url.searchParams.get("q") ?? "";
 *         const answer = yield* ns.get(instance).chatCompletions({
 *           messages: [{ role: "user", content: query }],
 *         });
 *         return yield* HttpServerResponse.json(answer);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.AI.QuerySearchNamespaceBinding)),
 * ) {}
 * ```
 *
 * ### Binding to an Async Worker
 * For a vanilla `async fetch` Worker, pass the namespace under `Worker.env`.
 * `InferEnv` types `env.SEARCH` as the runtime `SearchNamespace` handle.
 * **Example:** Async Worker via `env`
 * ```typescript
 * export const Api = Cloudflare.Worker("api", {
 *   main: "./worker.ts",
 *   env: { SEARCH: namespace },
 * });
 * export type ApiEnv = Cloudflare.InferEnv<typeof Api>;
 *
 * // worker.ts
 * export default {
 *   async fetch(request: Request, env: ApiEnv): Promise<Response> {
 *     const query = new URL(request.url).searchParams.get("q") ?? "";
 *     return Response.json(
 *       await env.SEARCH.get("guides").chatCompletions({
 *         messages: [{ role: "user", content: query }],
 *       }),
 *     );
 *   },
 * };
 * ```
 *
 * @see https://developers.cloudflare.com/ai-search/
 *
 * @resource
 * @product AI Search
 * @category AI
 */
export declare const SearchNamespace: import("../../Resource.ts").ResourceClass<SearchNamespace>;
/**
 * Returns true if the given value is a SearchNamespace resource.
 */
export declare const isSearchNamespace: (value: unknown) => value is SearchNamespace;
export declare const SearchNamespaceProvider: () => import("effect/Layer").Layer<Provider.Provider<SearchNamespace>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | aisearch.CloudflareOpContext>;
export {};
//# sourceMappingURL=SearchNamespace.d.ts.map