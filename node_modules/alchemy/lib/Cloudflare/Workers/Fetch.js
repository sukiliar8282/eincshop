import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Result from "effect/Result";
import * as Stream from "effect/Stream";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as Url from "effect/unstable/http/Url";
import * as Binding from "../../Binding.js";
import { isWorker, WorkerEnvironment } from "./Worker.js";
export const Fetch = Binding.Service("Cloudflare.Workers.Fetch");
export const FetchBinding = Layer.effect(Fetch, Effect.gen(function* () {
    const env = yield* WorkerEnvironment;
    return Effect.fn(function* (worker) {
        if (!globalThis.__ALCHEMY_RUNTIME__) {
            // Deploy-time only: register the service binding for the *target*
            // worker on the host Worker.
            const host = yield* Binding.Host;
            if (isWorker(host)) {
                yield* host.bind `${worker}`({
                    bindings: [
                        {
                            type: "service",
                            name: worker.LogicalId,
                            service: worker.workerName,
                        },
                    ],
                });
            }
        }
        // Lazy — the `WorkerEnvironment` bindings are only populated at exec
        // phase, so the fetcher must be resolved per call, not at bind time.
        const fetcher = Effect.sync(() => env[worker.LogicalId]);
        return (request) => Effect.flatMap(fetcher, (f) => doFetch(f, request));
    });
}));
const doFetch = (fetcher, request) => {
    const urlResult = Url.make(request.url, request.urlParams, request.hash.pipe(Option.getOrUndefined));
    if (Result.isFailure(urlResult)) {
        return Effect.fail(new HttpClientError.InvalidUrlError({
            request,
            cause: urlResult.failure,
            description: "Failed to construct URL",
        }));
    }
    const url = urlResult.success;
    const send = (body) => Effect.mapError(Effect.map(Effect.tryPromise({
        try: () => fetcher.fetch(url.toString(), {
            method: request.method,
            headers: request.headers,
            body,
            duplex: request.body._tag === "Stream" ? "half" : undefined,
        }),
        catch: (cause) => cause,
    }), (response) => HttpClientResponse.fromWeb(request, response)), (cause) => new HttpClientError.TransportError({
        request,
        cause,
        description: "Service binding fetch failed",
    }));
    switch (request.body._tag) {
        case "Raw":
        case "Uint8Array":
            return send(request.body.body);
        case "FormData":
            return send(request.body.formData);
        case "Stream":
            return Effect.flatMap(Effect.mapError(Stream.toReadableStreamEffect(request.body.stream), (cause) => new HttpClientError.EncodeError({
                request,
                cause,
                description: "Failed to encode stream body",
            })), send);
        default:
            return send(undefined);
    }
};
//# sourceMappingURL=Fetch.js.map