import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { DatasetError, WriteDataset, } from "./WriteDataset.js";
export const WriteDatasetBinding = Layer.effect(WriteDataset, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (dataset) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind(dataset.name, {
                bindings: [
                    {
                        type: "analytics_engine",
                        name: dataset.name,
                        dataset: dataset.dataset,
                    },
                ],
            });
        }
        const raw = Effect.sync(() => env[dataset.name]);
        return {
            raw,
            writeDataPoint: (dataPoint) => raw.pipe(Effect.flatMap((raw) => Effect.try({
                try: () => raw.writeDataPoint(dataPoint),
                catch: (error) => new DatasetError({
                    message: error?.message ?? "Unknown error",
                    cause: error,
                }),
            }))),
        };
    });
}));
//# sourceMappingURL=WriteDatasetBinding.js.map