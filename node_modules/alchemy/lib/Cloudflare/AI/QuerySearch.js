import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Binding from "../../Binding.js";
export const QuerySearch = Binding.Service("Cloudflare.AI.QuerySearch");
/**
 * Error raised by AI Search runtime binding operations.
 */
export class SearchError extends Data.TaggedError("AiSearchError") {
}
export const tryAiSearch = (fn) => Effect.tryPromise({
    try: fn,
    catch: (cause) => new SearchError({
        message: cause instanceof Error
            ? cause.message
            : "Unknown AI Search runtime error",
        cause,
    }),
});
/**
 * Build a {@link QuerySearchClient} from an Effect that lazily resolves the raw
 * `SearchInstance` runtime binding.
 */
export const makeClient = (rawEff) => {
    const use = (fn) => Effect.flatMap(rawEff, (raw) => tryAiSearch(() => fn(raw)));
    return {
        raw: rawEff,
        search: (params) => use((raw) => raw.search(params)),
        chatCompletions: (params) => use((raw) => raw.chatCompletions(params)),
        info: () => use((raw) => raw.info()),
        stats: () => use((raw) => raw.stats()),
    };
};
//# sourceMappingURL=QuerySearch.js.map