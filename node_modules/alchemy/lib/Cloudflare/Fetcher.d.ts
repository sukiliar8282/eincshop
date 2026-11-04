import type * as cf from "@cloudflare/workers-types";
import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { HttpClientError } from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import type { HttpServerError } from "effect/unstable/http/HttpServerError";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as Socket from "effect/unstable/socket/Socket";
export type SocketAddress = cf.SocketAddress;
export type SocketOptions = cf.SocketOptions;
export interface Fetcher {
    raw: cf.Fetcher;
    fetch(request: HttpClientRequest.HttpClientRequest): Effect.Effect<HttpClientResponse.HttpClientResponse, HttpClientError>;
    fetch(request: HttpServerRequest.HttpServerRequest): Effect.Effect<HttpServerResponse.HttpServerResponse, HttpServerError>;
    connect(address: SocketAddress | string, options?: SocketOptions): Socket.Socket;
}
export declare const toCloudflareFetcher: (fetcher: Fetcher) => Effect.Effect<{
    fetch: (input: cf.URL | cf.RequestInfo<unknown, cf.CfProperties<unknown>>, init: cf.RequestInit<cf.CfProperties<unknown>> | undefined) => Promise<cf.Response>;
    connect(): never;
}, never, never>;
export declare const fromCloudflareFetcher: (fetcher: cf.Fetcher | globalThis.Fetcher) => Fetcher;
export declare const toHttpClient: (fetcher: {
    fetch: (request: HttpServerRequest.HttpServerRequest) => Effect.Effect<HttpServerResponse.HttpServerResponse, HttpServerError>;
}) => HttpClient.HttpClient;
export declare const fromCloudflareSocket: (cfSocket: globalThis.Socket | cf.Socket) => Socket.Socket;
//# sourceMappingURL=Fetcher.d.ts.map