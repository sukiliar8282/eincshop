import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { SearchIndex } from "./SearchIndex.js";
export const SearchIndexBinding = Layer.effect(SearchIndex, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (index) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${index}`({
                bindings: [
                    {
                        type: "vectorize",
                        name: index.LogicalId,
                        indexName: index.indexName,
                    },
                ],
            });
        }
        const rawEff = Effect.sync(() => env[index.LogicalId]);
        const withRuntime = (fn) => Effect.flatMap(rawEff, (raw) => Effect.promise(() => fn(raw)));
        return {
            raw: rawEff,
            describe: () => withRuntime((raw) => raw.describe()),
            query: (vector, options) => withRuntime((raw) => raw.query(vector, options)),
            queryById: (vectorId, options) => withRuntime((raw) => raw.queryById(vectorId, options)),
            insert: (vectors) => withRuntime((raw) => raw.insert(vectors)),
            upsert: (vectors) => withRuntime((raw) => raw.upsert(vectors)),
            deleteByIds: (ids) => withRuntime((raw) => raw.deleteByIds(ids)),
            getByIds: (ids) => withRuntime((raw) => raw.getByIds(ids)),
        };
    });
}));
//# sourceMappingURL=SearchIndexBinding.js.map