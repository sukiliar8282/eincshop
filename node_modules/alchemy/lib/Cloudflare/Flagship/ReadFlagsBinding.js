import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { FlagshipError, ReadFlags } from "./ReadFlags.js";
export const ReadFlagsBinding = Layer.effect(ReadFlags, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (app) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind(app.LogicalId, {
                bindings: [
                    {
                        type: "flagship",
                        name: app.LogicalId,
                        appId: app.appId,
                    },
                ],
            });
        }
        const raw = Effect.sync(() => env[app.LogicalId]);
        return makeFlagshipClient(raw);
    });
}));
const tryPromise = (fn) => Effect.tryPromise({
    try: fn,
    catch: (error) => new FlagshipError({
        message: error instanceof Error ? error.message : "Unknown Flagship error",
        cause: error,
    }),
});
/** @internal */
export const makeFlagshipClient = (raw) => {
    const call = (fn) => raw.pipe(Effect.flatMap((binding) => tryPromise(() => fn(binding))));
    return {
        raw,
        get: (flagKey, defaultValue, context) => call((b) => b.get(flagKey, defaultValue, context)),
        getBooleanValue: (flagKey, defaultValue, context) => call((b) => b.getBooleanValue(flagKey, defaultValue, context)),
        getStringValue: (flagKey, defaultValue, context) => call((b) => b.getStringValue(flagKey, defaultValue, context)),
        getNumberValue: (flagKey, defaultValue, context) => call((b) => b.getNumberValue(flagKey, defaultValue, context)),
        getObjectValue: (flagKey, defaultValue, context) => call((b) => b.getObjectValue(flagKey, defaultValue, context)),
        getBooleanDetails: (flagKey, defaultValue, context) => call((b) => b.getBooleanDetails(flagKey, defaultValue, context)),
        getStringDetails: (flagKey, defaultValue, context) => call((b) => b.getStringDetails(flagKey, defaultValue, context)),
        getNumberDetails: (flagKey, defaultValue, context) => call((b) => b.getNumberDetails(flagKey, defaultValue, context)),
        getObjectDetails: (flagKey, defaultValue, context) => call((b) => b.getObjectDetails(flagKey, defaultValue, context)),
    };
};
//# sourceMappingURL=ReadFlagsBinding.js.map