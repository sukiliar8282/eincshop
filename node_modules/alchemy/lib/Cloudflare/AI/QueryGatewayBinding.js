/// <reference types="@cloudflare/workers-types" />
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { makeLanguageModelLayer } from "./LanguageModel.js";
import { GatewayError, QueryGateway, } from "./QueryGateway.js";
/**
 * Runtime layer for {@link QueryGateway}.
 */
export const QueryGatewayBinding = Layer.effect(QueryGateway, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (gateway) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${gateway}`({
                bindings: [
                    {
                        type: "ai",
                        name: gateway.LogicalId,
                    },
                ],
            });
        }
        const gatewayIdAccessor = yield* gateway.gatewayId;
        const ai = Effect.sync(() => env[gateway.LogicalId]);
        const runtimeGateway = yield* Effect.zip(ai, gatewayIdAccessor).pipe(Effect.map(([ai, gatewayId]) => ai.gateway(gatewayId)), Effect.cached);
        const use = (fn) => runtimeGateway.pipe(Effect.flatMap((gateway) => tryPromise(() => fn(gateway))));
        const self = {
            raw: ai,
            gateway: runtimeGateway,
            id: gatewayIdAccessor,
            patchLog: (logId, data) => use((gateway) => gateway.patchLog(logId, data)),
            getLog: (logId) => use((gateway) => gateway.getLog(logId)),
            getUrl: (provider) => use((gateway) => gateway.getUrl(provider)),
            run: (data, options) => use((gateway) => gateway.run(data, options)),
            model: (options) => makeLanguageModelLayer({
                ...options,
                client: self,
            }),
        };
        return self;
    });
}));
const tryPromise = (fn) => Effect.tryPromise({
    try: fn,
    catch: (error) => new GatewayError({
        message: error instanceof Error
            ? error.message
            : "Unknown AI Gateway runtime error",
        cause: error,
    }),
});
//# sourceMappingURL=QueryGatewayBinding.js.map