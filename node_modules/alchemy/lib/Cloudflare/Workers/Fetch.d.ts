import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import * as Binding from "../../Binding.ts";
import type { RuntimeContext } from "../../RuntimeContext.ts";
import { type Worker, WorkerEnvironment } from "./Worker.ts";
/**
 * @binding
 * @product Workers
 * @category Workers & Compute
 */
export interface Fetch extends Binding.Service<Fetch, "Cloudflare.Workers.Fetch", (worker: Worker) => Effect.Effect<(request: HttpClientRequest.HttpClientRequest) => Effect.Effect<HttpClientResponse.HttpClientResponse, HttpClientError.RequestError, RuntimeContext>>> {
}
export declare const Fetch: Fetch;
export declare const FetchBinding: Layer.Layer<Fetch, never, WorkerEnvironment>;
//# sourceMappingURL=Fetch.d.ts.map