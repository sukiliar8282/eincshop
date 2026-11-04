import * as aisearch from "@distilled.cloud/cloudflare/aisearch";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { SearchError } from "./QuerySearch.js";
const u = (v) => v == null ? undefined : v;
const run = (auth, eff) => auth.authorize(eff).pipe(Effect.mapError((cause) => {
    const message = cause instanceof Error
        ? cause.message
        : typeof cause?.message ===
            "string"
            ? cause.message
            : "AI Search HTTP error";
    return new SearchError({ message, cause });
}));
const mapChunk = (c) => ({
    id: c.id,
    type: c.type,
    score: c.score,
    text: c.text,
    item: {
        key: c.item?.key ?? "",
        timestamp: u(c.item?.timestamp),
        metadata: u(c.item?.metadata),
    },
    scoring_details: c.scoringDetails
        ? {
            keyword_score: u(c.scoringDetails.keywordScore),
            vector_score: u(c.scoringDetails.vectorScore),
            keyword_rank: u(c.scoringDetails.keywordRank),
            vector_rank: u(c.scoringDetails.vectorRank),
            reranking_score: u(c.scoringDetails.rerankingScore),
            fusion_method: u(c.scoringDetails.fusionMethod),
        }
        : undefined,
});
const mapSearch = (r) => ({
    search_query: r.searchQuery ?? "",
    chunks: r.chunks.map(mapChunk),
});
const mapChat = (r) => ({
    id: u(r.id),
    object: u(r.object),
    model: u(r.model),
    choices: r.choices.map((choice) => ({
        index: u(choice.index),
        message: {
            role: choice.message.role,
            content: typeof choice.message.content === "string"
                ? choice.message.content
                : choice.message.content == null
                    ? null
                    : JSON.stringify(choice.message.content),
        },
    })),
    chunks: r.chunks.map(mapChunk),
});
const mapStats = (r) => ({
    queued: u(r.queued),
    running: u(r.running),
    completed: u(r.completed),
    error: u(r.error),
    skipped: u(r.skipped),
    outdated: u(r.outdated),
    last_activity: u(r.lastActivity),
    engine: r.engine
        ? {
            vectorize: r.engine.vectorize
                ? {
                    vectorsCount: r.engine.vectorize.vectorsCount,
                    dimensions: r.engine.vectorize.dimensions,
                }
                : undefined,
            r2: r.engine.r2
                ? {
                    payloadSizeBytes: r.engine.r2.payloadSizeBytes,
                    metadataSizeBytes: r.engine.r2.metadataSizeBytes,
                    objectCount: r.engine.r2.objectCount,
                }
                : undefined,
        }
        : undefined,
});
const mapInfo = (r) => ({
    id: r.id,
    type: u(r.type),
    source: u(r.source),
    source_params: u(r.sourceParams),
    paused: u(r.paused),
    status: u(r.status),
    namespace: u(r.namespace),
    created_at: u(r.createdAt),
    modified_at: u(r.modifiedAt),
    token_id: u(r.tokenId),
    ai_gateway_id: u(r.aiGatewayId),
    rewrite_query: u(r.rewriteQuery),
    reranking: u(r.reranking),
    embedding_model: u(r.embeddingModel),
    ai_search_model: u(r.aiSearchModel),
    rewrite_model: u(r.rewriteModel),
    reranking_model: u(r.rerankingModel),
    hybrid_search_enabled: u(r.hybridSearchEnabled),
    index_method: r.indexMethod
        ? { vector: r.indexMethod.vector, keyword: r.indexMethod.keyword }
        : undefined,
    fusion_method: u(r.fusionMethod),
    indexing_options: r.indexingOptions
        ? {
            keyword_tokenizer: u(r.indexingOptions.keywordTokenizer),
        }
        : undefined,
    retrieval_options: r.retrievalOptions
        ? {
            keyword_match_mode: u(r.retrievalOptions.keywordMatchMode),
            boost_by: u(r.retrievalOptions.boostBy)?.map((b) => ({
                field: b.field,
                direction: u(b.direction),
            })),
        }
        : undefined,
    chunk_size: u(r.chunkSize),
    chunk_overlap: u(r.chunkOverlap),
    score_threshold: u(r.scoreThreshold),
    max_num_results: u(r.maxNumResults),
    cache: u(r.cache),
    cache_threshold: u(r.cacheThreshold),
    custom_metadata: u(r.customMetadata)?.map((m) => ({
        field_name: m.fieldName,
        data_type: m.dataType,
    })),
    sync_interval: u(r.syncInterval),
    metadata: u(r.metadata),
});
const mapList = (result) => ({
    result: result.map(mapInfo),
});
const mapMulti = (r) => ({
    search_query: r.searchQuery ?? "",
    chunks: r.chunks.map((c) => ({ ...mapChunk(c), instance_id: c.instanceId })),
    errors: u(r.errors)?.map((e) => ({
        instance_id: e.instanceId,
        message: e.message,
    })),
});
// ── request mappers (runtime snake_case -> distilled camelCase) ──────────────
const mapMessages = (messages) => messages.map((m) => ({
    role: m.role,
    content: typeof m.content === "string" || m.content == null
        ? m.content
        : m.content.map((part) => {
            const p = part;
            if ("image_url" in p || "imageUrl" in p) {
                const img = (p.image_url ?? p.imageUrl);
                return { type: "image_url", imageUrl: { url: img.url } };
            }
            return { type: "text", text: p.text };
        }),
}));
const mapOptions = (o) => {
    if (!o)
        return undefined;
    return {
        cache: o.cache
            ? { enabled: o.cache.enabled, cacheThreshold: o.cache.cache_threshold }
            : undefined,
        queryRewrite: o.query_rewrite
            ? {
                enabled: o.query_rewrite.enabled,
                model: o.query_rewrite.model,
                rewritePrompt: o.query_rewrite.rewrite_prompt,
            }
            : undefined,
        reranking: o.reranking
            ? {
                enabled: o.reranking.enabled,
                model: o.reranking.model,
                matchThreshold: o.reranking.match_threshold,
            }
            : undefined,
        retrieval: o.retrieval
            ? {
                retrievalType: o.retrieval.retrieval_type,
                fusionMethod: o.retrieval.fusion_method,
                keywordMatchMode: o.retrieval.keyword_match_mode,
                matchThreshold: o.retrieval.match_threshold,
                maxNumResults: o.retrieval.max_num_results,
                contextExpansion: o.retrieval.context_expansion,
                returnOnFailure: o.retrieval.return_on_failure,
                // `filters` is a Vectorize metadata filter over user-defined fields —
                // pass through untouched.
                filters: o.retrieval.filters,
                boostBy: o.retrieval.boost_by,
            }
            : undefined,
    };
};
const dieRaw = (kind) => Effect.die(new Error(`The AI Search ${kind} *Local binding runs over the HTTP API; the raw native runtime binding is only available inside a deployed Worker.`));
/**
 * Build a single-instance {@link QuerySearchClient} over the HTTP API. `ref`
 * resolves the `{ namespace, instanceId }` at apply time.
 */
export const makeLocalSearchClient = (auth, ref) => {
    const withRef = (fn) => Effect.flatMap(ref, (r) => run(auth, fn(r)));
    return {
        raw: dieRaw("instance"),
        search: (params) => withRef((r) => aisearch.searchNamespaceInstance({
            accountId: auth.accountId,
            name: r.name,
            id: r.id,
            ...("query" in params && params.query !== undefined
                ? { query: params.query }
                : { messages: mapMessages(params.messages ?? []) }),
            aiSearchOptions: mapOptions(params.ai_search_options),
        })).pipe(Effect.map(mapSearch)),
        chatCompletions: (params) => withRef((r) => aisearch.chatCompletionsNamespaceInstance({
            accountId: auth.accountId,
            name: r.name,
            id: r.id,
            messages: mapMessages(params.messages),
            aiSearchOptions: mapOptions(params.ai_search_options),
        })).pipe(Effect.map(mapChat)),
        info: () => withRef((r) => aisearch.readNamespaceInstance({
            accountId: auth.accountId,
            name: r.name,
            id: r.id,
        })).pipe(Effect.map(mapInfo)),
        stats: () => withRef((r) => aisearch.statsNamespaceInstance({
            accountId: auth.accountId,
            name: r.name,
            id: r.id,
        })).pipe(Effect.map(mapStats)),
    };
};
/**
 * Build a namespace {@link QuerySearchNamespaceClient} over the HTTP API.
 * `.get(instanceName)` scopes a single-instance client to `(namespace,
 * instanceName)`.
 */
export const makeLocalSearchNamespaceClient = (auth, ref) => ({
    raw: dieRaw("namespace"),
    get: (instanceName) => makeLocalSearchClient(auth, Effect.map(ref, (name) => ({ name, id: instanceName }))),
    list: (params) => Effect.flatMap(ref, (name) => run(auth, Stream.runCollect(aisearch.listNamespaceInstances.pages({
        accountId: auth.accountId,
        name,
        perPage: params?.per_page,
        orderBy: params?.order_by,
        orderByDirection: params?.order_by_direction,
        search: params?.search,
    })))).pipe(Effect.map((chunk) => mapList(Array.from(chunk).flatMap((page) => (page.result ??
        []))))),
    search: (params) => Effect.flatMap(ref, (name) => run(auth, aisearch.searchNamespace({
        accountId: auth.accountId,
        name,
        aiSearchOptions: {
            instanceIds: params.ai_search_options.instance_ids,
            ...mapOptions(params.ai_search_options),
        },
        ...("query" in params && params.query !== undefined
            ? { query: params.query }
            : { messages: mapMessages(params.messages ?? []) }),
    }))).pipe(Effect.map(mapMulti)),
});
//# sourceMappingURL=SearchHttpClient.js.map