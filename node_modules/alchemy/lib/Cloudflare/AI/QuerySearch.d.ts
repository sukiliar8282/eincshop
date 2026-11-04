import type * as runtime from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.ts";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import type { SearchInstance } from "./SearchInstance.ts";
/**
 * Bind a {@link SearchInstance} to a Worker and obtain the Effect-native
 * AI Search client (`search`, `chatCompletions`, `info`, `stats`). The
 * single-instance `ai_search` binding resolves directly to a runtime
 * `SearchInstance`.
 *
 * `QuerySearch` is a single identifier that is simultaneously the binding's Context
 * tag, its type, and the callable — `yield* Cloudflare.AI.QuerySearch(instance)`.
 *
 * Provide {@link QuerySearchBinding} in the Worker's runtime layer.
 *
 *
 * ### Querying AI Search
 * **Example:** Retrieve and generate from a Worker
 * Bind the instance during the Worker's init phase, then use `search`
 * (retrieval only) or `chatCompletions` (retrieval + generation) from request
 * handlers.
 * ```typescript
 * const search = yield* Cloudflare.AI.QuerySearch(instance);
 *
 * return {
 *   fetch: Effect.gen(function* () {
 *     const answer = yield* search.chatCompletions({
 *       messages: [{ role: "user", content: "How do I deploy?" }],
 *     });
 *     return yield* HttpServerResponse.json(answer);
 *   }),
 * };
 * ```
 *
 * @binding
 * @category AI
 */
export interface QuerySearch extends Binding.Service<QuerySearch, "Cloudflare.AI.QuerySearch", (instance: SearchInstance) => Effect.Effect<QuerySearchClient>> {
}
export declare const QuerySearch: QuerySearch;
declare const SearchError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "AiSearchError";
} & Readonly<A>;
/**
 * Error raised by AI Search runtime binding operations.
 */
export declare class SearchError extends SearchError_base<{
    /**
     * Human-readable runtime error message.
     */
    message: string;
    /**
     * Original error thrown by the Cloudflare.AI. Search runtime binding.
     */
    cause: unknown;
}> {
}
/**
 * Effect-native client for a Cloudflare.AI. Search Worker binding.
 *
 * Wraps the standalone `SearchInstance` runtime binding (the binding the
 * `ai_search` type resolves to — the deprecated `AutoRAG` shape is gone) so
 * each operation returns an Effect tagged with {@link SearchError}. Obtain
 * one from `Cloudflare.AI.QuerySearch(instance)` (or a namespace client's
 * `.get(instanceName)`) during the Worker's init phase.
 */
export interface QuerySearchClient {
    /**
     * Effect resolving to the raw underlying Cloudflare `SearchInstance`
     * binding. Use this for operations not surfaced below (`items`, `jobs`,
     * `update`, or streaming `chatCompletions`).
     */
    raw: Effect.Effect<runtime.AiSearchInstance, never, RuntimeContext>;
    /**
     * Retrieve the chunks most relevant to a query without generation.
     */
    search(params: runtime.AiSearchSearchRequest): Effect.Effect<runtime.AiSearchSearchResponse, SearchError, RuntimeContext>;
    /**
     * Run retrieval-augmented generation: retrieve relevant chunks and answer
     * with the configured model (non-streaming).
     */
    chatCompletions(params: runtime.AiSearchChatCompletionsRequest): Effect.Effect<runtime.AiSearchChatCompletionsResponse, SearchError, RuntimeContext>;
    /**
     * Metadata about this instance (id, models, source, status, …).
     */
    info(): Effect.Effect<runtime.AiSearchInstanceInfo, SearchError, RuntimeContext>;
    /**
     * Indexing statistics (item counts per status, last activity, engine).
     */
    stats(): Effect.Effect<runtime.AiSearchStatsResponse, SearchError, RuntimeContext>;
}
export declare const tryAiSearch: <A>(fn: () => Promise<A>) => Effect.Effect<A, SearchError>;
/**
 * Build a {@link QuerySearchClient} from an Effect that lazily resolves the raw
 * `SearchInstance` runtime binding.
 */
export declare const makeClient: (rawEff: Effect.Effect<runtime.AiSearchInstance>) => QuerySearchClient;
export {};
//# sourceMappingURL=QuerySearch.d.ts.map