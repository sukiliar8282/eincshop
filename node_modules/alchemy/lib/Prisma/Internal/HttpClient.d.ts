import * as EffectContext from "effect/Context";
import * as Layer from "effect/Layer";
import * as HttpClient from "effect/unstable/http/HttpClient";
/** Node transport preserves explicit Content-Length on file-backed uploads. */
export declare const PrismaHttpClientLive: Layer.Layer<HttpClient.HttpClient, never, never>;
declare const PrismaUploadClient_base: EffectContext.ServiceClass<PrismaUploadClient, "alchemy/Prisma/UploadClient", HttpClient.HttpClient>;
/**
 * The HTTP client Prisma artifact uploads run on. Kept as a Prisma-scoped
 * service — overriding the global `HttpClient.HttpClient` from
 * `Prisma.providers()` would hijack every other provider in the stack (e.g.
 * Cloudflare Worker script uploads break on node's chunked multipart
 * bodies). Live wiring provides the node transport here because the
 * S3-style presigned upload URLs require an explicit Content-Length, while
 * tests that stub the ambient `HttpClient` simply omit this service and the
 * upload falls back to the ambient client.
 */
export declare class PrismaUploadClient extends PrismaUploadClient_base {
}
export declare const PrismaUploadClientLive: Layer.Layer<PrismaUploadClient, never, never>;
export {};
//# sourceMappingURL=HttpClient.d.ts.map