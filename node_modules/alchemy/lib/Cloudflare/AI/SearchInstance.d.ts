import * as aisearch from "@distilled.cloud/cloudflare/aisearch";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.AI.Search";
type TypeId = typeof TypeId;
/**
 * The kind of data source an AI Search instance indexes.
 */
export type SearchInstanceSourceType = "r2" | "web-crawler";
/**
 * Generation model used to answer AI Search queries.
 */
export type Model = Exclude<NonNullable<aisearch.CreateInstanceRequest["aiSearchModel"]>, "">;
/**
 * Embedding model used to vectorize indexed content. Cannot be changed
 * after creation (it defines the vector space).
 */
export type EmbeddingModel = Exclude<NonNullable<aisearch.CreateInstanceRequest["embeddingModel"]>, "">;
/**
 * Reranking model applied to retrieved results.
 */
export type RerankingModel = "@cf/baai/bge-reranker-base";
/**
 * Data-source specific indexing parameters (R2 prefix / include / exclude
 * filters, or web-crawler options).
 */
export type SourceParams = NonNullable<aisearch.CreateInstanceRequest["sourceParams"]>;
/**
 * Controls which storage backends are used during indexing.
 */
export type IndexMethod = NonNullable<aisearch.CreateInstanceRequest["indexMethod"]>;
/**
 * Keyword indexing options.
 */
export type IndexingOptions = NonNullable<aisearch.CreateInstanceRequest["indexingOptions"]>;
/**
 * Custom metadata fields extracted at indexing time.
 */
export type CustomMetadata = NonNullable<aisearch.CreateInstanceRequest["customMetadata"]>;
/**
 * Retrieval-time options (boosting and keyword match mode).
 */
export type RetrievalOptions = NonNullable<aisearch.CreateInstanceRequest["retrievalOptions"]>;
/**
 * Public REST endpoint configuration for the instance.
 */
export type PublicEndpointParams = NonNullable<aisearch.CreateInstanceRequest["publicEndpointParams"]>;
/**
 * Similarity-cache threshold preset.
 */
export type CacheThreshold = "super_strict_match" | "close_enough" | "flexible_friend" | "anything_goes";
export type SearchInstanceProps = {
    /**
     * SearchInstance identifier (the AI Search "name" shown in the dashboard).
     * Lowercase alphanumeric, hyphens, and underscores. If omitted, a unique
     * id is generated from the app, stage, and logical ID. Changing it
     * triggers a replacement.
     * @default ${app}-${id}-${stage}-${suffix}
     */
    instanceId?: string;
    /**
     * Namespace this instance belongs to. AI Search instances are
     * namespace-scoped; omitting this places the instance in the
     * account-provided `default` namespace. Pass a `SearchNamespace`'s
     * `name` output to group instances under a custom namespace (which also
     * orders this instance after that namespace on deploy and before it on
     * destroy). The namespace is immutable — changing it triggers a
     * replacement.
     * @default "default"
     */
    namespace?: string;
    /**
     * Data source kind: `r2` indexes objects in an R2 bucket, `web-crawler`
     * crawls a seed URL. Changing it triggers a replacement.
     * @default "r2"
     */
    type?: SearchInstanceSourceType;
    /**
     * Data source: the R2 bucket name (for `type: "r2"`) or the crawl seed
     * URL (for `type: "web-crawler"`). Changing it triggers a replacement —
     * the index must be rebuilt from scratch.
     */
    source: string;
    /**
     * Source-specific indexing parameters (R2 prefix / include / exclude
     * filters, web-crawler crawl and parse options).
     */
    sourceParams?: SourceParams;
    /**
     * Id of the AI Search service token used to access the data source on
     * sync. When omitted, Cloudflare provisions one automatically.
     */
    tokenId?: string;
    /**
     * AI Gateway to route model inference calls through.
     */
    aiGatewayId?: string;
    /**
     * Embedding model used to vectorize content. Cannot be changed after
     * creation — updating this property triggers a replacement.
     * @default service default
     */
    embeddingModel?: EmbeddingModel;
    /**
     * Generation model used to answer AI Search queries.
     * @default service default
     */
    aiSearchModel?: Model;
    /**
     * Whether to rewrite the user query before retrieval.
     * @default false
     */
    rewriteQuery?: boolean;
    /**
     * Model used to rewrite queries when `rewriteQuery` is enabled.
     */
    rewriteModel?: Model;
    /**
     * Whether custom chunking settings are applied during indexing.
     */
    chunk?: boolean;
    /**
     * Chunk size (in tokens) used when splitting documents for indexing.
     * Only affects future indexing runs.
     */
    chunkSize?: number;
    /**
     * Overlap between consecutive chunks, as a percentage (0–30). Only
     * affects future indexing runs.
     */
    chunkOverlap?: number;
    /**
     * Controls which storage backends are used during indexing. Defaults to
     * vector-only.
     */
    indexMethod?: IndexMethod;
    /**
     * Keyword indexing options (tokenizer selection).
     */
    indexingOptions?: IndexingOptions;
    /**
     * Custom metadata fields extracted at indexing time.
     */
    customMetadata?: CustomMetadata;
    /**
     * Whether the similarity cache is enabled.
     * @default false
     */
    cache?: boolean;
    /**
     * Similarity-cache match strictness preset.
     */
    cacheThreshold?: CacheThreshold;
    /**
     * Cache entry TTL in seconds. Allowed values: 600, 1800, 3600, 7200,
     * 21600, 43200, 86400, 172800, 259200, 518400.
     */
    cacheTtl?: number;
    /**
     * Whether retrieved results are reranked before generation.
     * @default false
     */
    reranking?: boolean;
    /**
     * Model used for reranking when `reranking` is enabled.
     */
    rerankingModel?: RerankingModel;
    /**
     * Retrieval-time options (boosting and keyword match mode).
     */
    retrievalOptions?: RetrievalOptions;
    /**
     * How vector and keyword results are fused: `max` or `rrf`
     * (reciprocal rank fusion).
     */
    fusionMethod?: "max" | "rrf";
    /**
     * Maximum number of results returned by retrieval.
     */
    maxNumResults?: number;
    /**
     * Minimum similarity score for a result to be returned.
     */
    scoreThreshold?: number;
    /**
     * Public REST endpoint configuration (search / chat-completions / MCP).
     */
    publicEndpointParams?: PublicEndpointParams;
    /**
     * Interval between automatic syncs, in seconds. Allowed values: 900,
     * 1800, 3600, 7200, 14400, 21600, 43200, 86400.
     */
    syncInterval?: number;
    /**
     * Kick off an initial indexing job right after the instance is first
     * created, instead of waiting for the first scheduled sync. The job is
     * triggered best-effort and not awaited — the deploy does not block on
     * indexing, which can take much longer than a provisioning step should.
     * Has no effect on updates or when no `source` is configured.
     * @default false
     */
    indexOnCreate?: boolean;
};
export type SearchInstanceAttributes = {
    /**
     * AI Search instance id. Lowercase alphanumeric, hyphens, underscores.
     */
    instanceId: string;
    /**
     * The Cloudflare account the instance belongs to.
     */
    accountId: string;
    /**
     * Namespace the instance belongs to (`default` when unspecified).
     */
    namespace: string;
    /**
     * Data source kind (`r2` or `web-crawler`).
     */
    type: SearchInstanceSourceType;
    /**
     * Data source (R2 bucket name or crawl seed URL).
     */
    source: string | undefined;
    /**
     * Id of the AI Search service token used to access the data source.
     */
    tokenId: string | undefined;
    /**
     * AI Gateway inference calls are routed through.
     */
    aiGatewayId: string | undefined;
    /**
     * Embedding model used to vectorize content.
     */
    embeddingModel: string | undefined;
    /**
     * Generation model used to answer queries.
     */
    aiSearchModel: string | undefined;
    /**
     * Current instance status (indexing is asynchronous).
     */
    status: string | undefined;
    /**
     * Whether the instance is paused.
     */
    paused: boolean | undefined;
    /**
     * Id of the public REST endpoint, when enabled.
     */
    publicEndpointId: string | undefined;
    /**
     * When the instance was created.
     */
    createdAt: string | undefined;
    /**
     * When the instance was last modified.
     */
    modifiedAt: string | undefined;
};
export type SearchInstance = Resource<TypeId, SearchInstanceProps, SearchInstanceAttributes, never, Providers>;
/**
 * A Cloudflare.AI. Search (formerly AutoRAG) instance — a fully managed
 * retrieval-augmented generation pipeline over your own data.
 *
 * An instance continuously indexes a data source (an R2 bucket or a web
 * crawl), embeds it into a managed Vectorize index, and answers search and
 * chat queries against it. Creation returns immediately; the initial
 * indexing run happens asynchronously.
 *
 * The instance `instanceId`, `namespace`, `type`, `source`, and
 * `embeddingModel` are fixed at creation — changing any of them triggers a
 * replacement. Everything else (models, chunking, caching, reranking,
 * public endpoint, sync interval) is mutable in place.
 *
 * For the common R2 case, prefer the {@link Search} construct, which also
 * mints the service token the indexer needs to read your bucket. Use this
 * low-level resource directly when you manage the token yourself, share one
 * token across instances, or group instances under a {@link SearchNamespace}.
 *
 * ### Creating a SearchInstance
 * **Example:** R2-backed instance
 * An R2 source needs a service token to read the bucket. Either pass a
 * `tokenId` (see {@link SearchToken}) or let the {@link Search}
 * construct provision one for you.
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("docs", {});
 * const instance = yield* Cloudflare.AI.SearchInstance("docs-search", {
 *   source: bucket.bucketName,
 *   tokenId: serviceToken.id,
 * });
 * ```
 *
 * **Example:** Tuned retrieval settings
 * ```typescript
 * const instance = yield* Cloudflare.AI.SearchInstance("docs-search", {
 *   source: bucket.bucketName,
 *   aiSearchModel: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
 *   chunkSize: 512,
 *   chunkOverlap: 64,
 *   maxNumResults: 20,
 *   cache: true,
 *   cacheThreshold: "close_enough",
 * });
 * ```
 *
 * ### R2 source options
 * For an `r2` source, `sourceParams` filters which objects are indexed (all
 * fields optional):
 * - `prefix` — only index keys under this prefix.
 * - `includeItems` / `excludeItems` — micromatch glob patterns (`*` within a
 *   path segment, `**` across segments; max 10 each). Only objects matching an
 *   `includeItems` pattern are indexed; `excludeItems` takes precedence.
 * - `r2Jurisdiction` — R2 data-residency jurisdiction of the source bucket.
 * **Example:** Index only part of a bucket
 * ```typescript
 * const instance = yield* Cloudflare.AI.SearchInstance("docs-search", {
 *   source: bucket.bucketName,
 *   tokenId: serviceToken.id,
 *   sourceParams: {
 *     prefix: "docs/",
 *     includeItems: ["/docs/**"],
 *     excludeItems: ["/docs/drafts/**"],
 *   },
 * });
 * ```
 *
 * ### Web-crawler source options
 * `sourceParams.webCrawler` tunes how a `web-crawler` source is fetched,
 * parsed, and stored. All fields are optional.
 *
 * `parseType` selects how pages are discovered:
 * - `"sitemap"` (Cloudflare default) — read `<seed>/sitemap.xml` (discovered
 *   via `robots.txt`) and index the URLs it lists.
 * - `"discover"` — start at `source` and follow links.
 *
 * `crawlOptions` is no longer accepted by the API — Cloudflare removed it;
 * discovery behavior is controlled solely by `parseType`.
 *
 * `parseOptions` controls how each page is parsed:
 * - `useBrowserRendering` — render JS in a headless browser before parsing.
 * - `includeImages` — index image content.
 * - `specificSitemaps` — explicit sitemap URLs to read (for `"sitemap"`).
 * - `contentSelector` — `{ path, selector }[]` CSS selectors scoping which
 *   part of a page is indexed per URL path.
 * - `includeHeaders` — extra request headers sent while crawling.
 *
 * `storeOptions` overrides where crawled content is stored — Cloudflare
 * provisions managed storage by default:
 * - `storageId` — R2 bucket name to store crawl output in.
 * - `storageType` — `"r2"`.
 * - `r2Jurisdiction` — R2 data-residency jurisdiction for the store bucket.
 * **Example:** Basic web-crawler instance
 * ```typescript
 * const instance = yield* Cloudflare.AI.SearchInstance("site-search", {
 *   type: "web-crawler",
 *   source: "https://example.com",
 *   sourceParams: { webCrawler: { parseType: "discover" } },
 * });
 * ```
 * **Example:** Fully-configured crawl
 * ```typescript
 * const instance = yield* Cloudflare.AI.SearchInstance("site-search", {
 *   type: "web-crawler",
 *   source: "https://example.com",
 *   sourceParams: {
 *     webCrawler: {
 *       parseType: "discover",
 *       parseOptions: {
 *         useBrowserRendering: true,
 *         includeImages: false,
 *         contentSelector: [{ path: "/docs", selector: "main" }],
 *       },
 *     },
 *   },
 * });
 * ```
 * **Example:** Sitemap source
 * ```typescript
 * // Index the URLs listed in one or more sitemaps (the default parse mode).
 * const fromSitemap = yield* Cloudflare.AI.SearchInstance("sitemap-search", {
 *   type: "web-crawler",
 *   source: "https://example.com",
 *   sourceParams: {
 *     webCrawler: {
 *       parseType: "sitemap",
 *       parseOptions: { specificSitemaps: ["https://example.com/sitemap.xml"] },
 *     },
 *   },
 * });
 * ```
 * **Example:** Store crawl output in a specific R2 bucket
 * ```typescript
 * const instance = yield* Cloudflare.AI.SearchInstance("site-search", {
 *   type: "web-crawler",
 *   source: "https://example.com",
 *   sourceParams: {
 *     webCrawler: {
 *       parseType: "discover",
 *       storeOptions: { storageId: "my-crawl-bucket", storageType: "r2" },
 *     },
 *   },
 * });
 * ```
 *
 * ### Grouping under a namespace
 * SearchInstances live in a namespace (the account-provided `default` when
 * unspecified). Pass a {@link SearchNamespace}'s `name` to group related
 * instances — the engine then orders this instance after the namespace on
 * deploy. The namespace is immutable; changing it replaces the instance.
 * **Example:** Place the instance in a custom namespace
 * ```typescript
 * const ns = yield* Cloudflare.AI.SearchNamespace("docs-ns", {});
 * const instance = yield* Cloudflare.AI.SearchInstance("docs-search", {
 *   source: bucket.bucketName,
 *   namespace: ns.name,
 * });
 * ```
 *
 * ### Binding to an Effect Worker
 * Bind the instance during the Worker's init phase with
 * `Cloudflare.AI.QuerySearch(instance)`, which attaches the
 * single-instance `ai_search` binding and returns an Effect-native client
 * whose `search` / `chatCompletions` methods return `Effect`s. Provide
 * {@link QuerySearchBinding} in the Worker's runtime layer.
 * **Example:** Effect Worker that answers from AI Search
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
 *     const bucket = yield* Cloudflare.R2.Bucket("docs", {});
 *     const instance = yield* Cloudflare.AI.SearchInstance("docs-search", {
 *       source: bucket.bucketName,
 *     });
 *     const search = yield* Cloudflare.AI.QuerySearch(instance);
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const request = yield* HttpServerRequest;
 *         const query = new URL(request.url).searchParams.get("q") ?? "";
 *         const answer = yield* search.chatCompletions({
 *           messages: [{ role: "user", content: query }],
 *         });
 *         return yield* HttpServerResponse.json(answer);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.AI.QuerySearchBinding)),
 * ) {}
 * ```
 *
 * ### Binding to an Async Worker
 * For a vanilla `async fetch` Worker, pass the instance under `Worker.env`.
 * The engine attaches the same `ai_search` binding and `InferEnv` types
 * `env.SEARCH` as the runtime `SearchInstance` handle.
 * **Example:** Async Worker via `env`
 * ```typescript
 * export const Api = Cloudflare.Worker("api", {
 *   main: "./worker.ts",
 *   env: { SEARCH: search },
 * });
 * export type ApiEnv = Cloudflare.InferEnv<typeof Api>;
 *
 * // worker.ts
 * export default {
 *   async fetch(request: Request, env: ApiEnv): Promise<Response> {
 *     const query = new URL(request.url).searchParams.get("q") ?? "";
 *     return Response.json(
 *       await env.SEARCH.chatCompletions({
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
export declare const SearchInstance: import("../../Resource.ts").ResourceClass<SearchInstance>;
/**
 * Returns true if the given value is a SearchInstance resource.
 */
export declare const isSearchInstance: (value: unknown) => value is SearchInstance;
export declare const SearchInstanceProvider: () => import("effect/Layer").Layer<Provider.Provider<SearchInstance>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | aisearch.CloudflareOpContext>;
export {};
//# sourceMappingURL=SearchInstance.d.ts.map