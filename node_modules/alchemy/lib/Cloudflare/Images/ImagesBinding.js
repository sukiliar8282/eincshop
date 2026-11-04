import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Binding from "../Workers/Binding.js";
import { makeBindingLayer } from "../Workers/BindingLayer.js";
import { Images, ImagesError, } from "./Images.js";
/**
 * The layer that provides the Effect-native interface for the Cloudflare
 * Workers Images binding.
 *
 * Provide it on the Worker effect (`Effect.provide(Cloudflare.Images.ImagesBinding)`)
 * so that yielding an {@link Images} binding attaches the native `images`
 * binding to the surrounding Worker at deploy time and, at runtime, resolves to
 * the Effect-native {@link ImagesClient} (wrapping the raw `cf.ImagesBinding` so every
 * `info` / `input(...).transform(...).output(...)` call returns an `Effect`).
 */
export const ImagesBinding = makeBindingLayer(Images, (raw) => ({
    raw,
    info: (stream, options) => Effect.gen(function* () {
        const binding = yield* raw;
        const readable = yield* toCfReadable(stream);
        return yield* tryPromise(() => binding.info(readable, options));
    }),
    input: (stream, options) => Effect.gen(function* () {
        const binding = yield* raw;
        const readable = yield* toCfReadable(stream);
        return wrapTransformer(binding.input(readable, options));
    }),
}));
/**
 * Wrap a runtime `ImageTransformer` as the Effect-native chainable client.
 * `transform`/`draw` stay pure; `output` crosses into the runtime.
 */
const wrapTransformer = (raw) => ({
    raw,
    transform: (transform) => wrapTransformer(raw.transform(transform)),
    draw: (image, options) => {
        if (isTransformerClient(image)) {
            return Effect.succeed(wrapTransformer(raw.draw(image.raw, options)));
        }
        return toCfReadable(image).pipe(Effect.map((readable) => wrapTransformer(raw.draw(readable, options))));
    },
    output: (options) => tryPromise(() => raw.output(options)).pipe(Effect.map(wrapResult)),
});
/** Wrap a runtime `ImageTransformationResult` as the Effect-native result client. */
const wrapResult = (raw) => ({
    raw,
    response: Effect.sync(() => raw.response()),
    contentType: Effect.sync(() => raw.contentType()),
    image: (options) => Effect.sync(() => raw.image(options)),
});
/**
 * Convert an Effect `Stream<Uint8Array>` into the `cf.ReadableStream<Uint8Array>`
 * shape the Images runtime binding expects (identical at runtime).
 */
const toCfReadable = (stream) => Stream.toReadableStreamEffect(stream).pipe(Effect.map((s) => s));
const tryPromise = (fn) => Effect.tryPromise({
    try: fn,
    catch: (error) => new ImagesError({
        message: error?.message ?? "Unknown error",
        code: typeof error?.code === "number" ? error.code : undefined,
        cause: error,
    }),
});
const isTransformerClient = (image) => typeof image === "object" && image !== null && "raw" in image;
//# sourceMappingURL=ImagesBinding.js.map