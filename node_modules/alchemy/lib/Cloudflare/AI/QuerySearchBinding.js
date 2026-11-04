import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { makeClient, QuerySearch } from "./QuerySearch.js";
/**
 * Runtime layer for {@link QuerySearch}.
 */
export const QuerySearchBinding = Layer.effect(QuerySearch, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (instance) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${instance}`({
                bindings: [
                    {
                        type: "ai_search",
                        name: instance.LogicalId,
                        instanceName: instance.instanceId,
                        namespace: instance.namespace,
                    },
                ],
            });
        }
        const rawEff = Effect.sync(() => env[instance.LogicalId]);
        return makeClient(rawEff);
    });
}));
//# sourceMappingURL=QuerySearchBinding.js.map