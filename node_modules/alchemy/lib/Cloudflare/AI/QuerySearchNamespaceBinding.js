import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { makeClient, tryAiSearch } from "./QuerySearch.js";
import { QuerySearchNamespace, } from "./QuerySearchNamespace.js";
/**
 * Runtime layer for {@link QuerySearchNamespace}.
 */
export const QuerySearchNamespaceBinding = Layer.effect(QuerySearchNamespace, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (namespace) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${namespace}`({
                bindings: [
                    {
                        type: "ai_search_namespace",
                        name: namespace.LogicalId,
                        namespace: namespace.name,
                    },
                ],
            });
        }
        const nsEff = Effect.sync(() => env[namespace.LogicalId]);
        return {
            raw: nsEff,
            get: (instanceName) => makeClient(nsEff.pipe(Effect.map((ns) => ns.get(instanceName)))),
            list: (params) => Effect.flatMap(nsEff, (ns) => tryAiSearch(() => ns.list(params))),
            search: (params) => Effect.flatMap(nsEff, (ns) => tryAiSearch(() => ns.search(params))),
        };
    });
}));
//# sourceMappingURL=QuerySearchNamespaceBinding.js.map