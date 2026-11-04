import * as Effect from "effect/Effect";
import { makeBindingLayer } from "../Workers/BindingLayer.js";
import { Stream, StreamError, } from "./Stream.js";
/**
 * The layer that provides the Effect-native interface for the Cloudflare
 * Stream binding.
 *
 * Provide it on the Worker effect (`Effect.provide(Cloudflare.Stream.StreamBinding)`)
 * so that yielding a {@link Stream} binding attaches the native `stream`
 * binding to the surrounding Worker at deploy time and, at runtime, resolves to
 * the Effect-native {@link StreamClient} (wrapping the raw `cf.StreamBinding`
 * handle so every operation returns an `Effect`).
 */
export const StreamBinding = makeBindingLayer(Stream, (raw) => {
    const call = (fn) => raw.pipe(Effect.flatMap((binding) => tryPromise(() => fn(binding))));
    const video = (id) => ({
        id,
        details: () => call((binding) => binding.video(id).details()),
        update: (params) => call((binding) => binding.video(id).update(params)),
        delete: () => call((binding) => binding.video(id).delete()),
        generateToken: () => call((binding) => binding.video(id).generateToken()),
        downloads: {
            generate: (downloadType) => call((binding) => binding.video(id).downloads.generate(downloadType)),
            get: () => call((binding) => binding.video(id).downloads.get()),
            delete: (downloadType) => call((binding) => binding.video(id).downloads.delete(downloadType)),
        },
        captions: {
            upload: (language, input) => call((binding) => binding
                .video(id)
                .captions.upload(language, input)),
            generate: (language) => call((binding) => binding.video(id).captions.generate(language)),
            list: (language) => call((binding) => binding.video(id).captions.list(language)),
            delete: (language) => call((binding) => binding.video(id).captions.delete(language)),
        },
    });
    return {
        raw,
        upload: (url, params) => call((binding) => binding.upload(url, params)),
        createDirectUpload: (params) => call((binding) => binding.createDirectUpload(params)),
        video,
        videos: {
            list: (params) => call((binding) => binding.videos.list(params)),
        },
        watermarks: {
            generate: (input, params) => call((binding) => 
            // The runtime accepts a stream or a URL string for the first
            // argument; the published types declare the two as overloads.
            binding.watermarks.generate(input, params)),
            list: () => call((binding) => binding.watermarks.list()),
            get: (watermarkId) => call((binding) => binding.watermarks.get(watermarkId)),
            delete: (watermarkId) => call((binding) => binding.watermarks.delete(watermarkId)),
        },
    };
});
const tryPromise = (fn) => Effect.tryPromise({
    try: fn,
    catch: (error) => new StreamError({
        message: error?.message ?? "Unknown Cloudflare Stream error",
        code: typeof error?.code === "number" ? error.code : undefined,
        statusCode: typeof error?.statusCode === "number" ? error.statusCode : undefined,
        cause: error,
    }),
});
//# sourceMappingURL=StreamBinding.js.map