import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { Worker, WorkerEnvironment } from "../Workers/Worker.js";
import { isLegacyPipeline } from "./LegacyPipeline.js";
import { StreamSendError, WriteStream, } from "./WriteStream.js";
/**
 * Implementation of the {@link WriteStream} service that uses a native
 * Worker `pipelines` binding.
 */
export const WriteStreamBinding = Layer.effect(WriteStream, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    const host = yield* Worker;
    return Effect.fn(function* (stream) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            yield* host.bind `${stream}`({
                bindings: [
                    {
                        type: "pipelines",
                        name: stream.LogicalId,
                        // A stream is bound by id; a legacy pipeline by name (the
                        // API identifier of the legacy generation).
                        pipeline: isLegacyPipeline(stream)
                            ? stream.name
                            : stream.streamId,
                    },
                ],
            });
        }
        return makeWriteStreamClient(env, stream);
    });
}));
/** Build the producer client over a native Worker `pipelines` binding. */
export const makeWriteStreamClient = (env, stream) => {
    const raw = Effect.sync(() => env[stream.LogicalId]);
    return {
        raw,
        send: (records) => raw.pipe(Effect.flatMap((pipeline) => Effect.tryPromise({
            try: () => pipeline.send([...records]),
            catch: (error) => new StreamSendError({
                message: error?.message ?? "Unknown pipeline error",
                cause: error,
            }),
        }))),
    };
};
//# sourceMappingURL=WriteStreamBinding.js.map