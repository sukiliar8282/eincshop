import { DEFAULT_COMPATIBILITY_DATE } from "@alchemy.run/cloudflare-runtime/core/internal/constants";
import { Credentials } from "@distilled.cloud/cloudflare/Credentials";
import * as workers from "@distilled.cloud/cloudflare/workers";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as HttpClient from "effect/unstable/http/HttpClient";
import { Access } from "./Access.js";
import { CloudflareEnvironment } from "./CloudflareEnvironment.js";
export class EdgeSessionError extends Data.TaggedError("EdgeSessionError") {
}
const wrap = (effect, message) => effect.pipe(Effect.mapError((cause) => new EdgeSessionError({ message, cause })));
/**
 * Ask Cloudflare for a preview upload token. Some accounts return an
 * `exchangeUrl` that must be GET'd to swap the session token for a
 * short-lived upload token; when present we do the swap, falling back
 * to the original if the exchange fails.
 */
const createUploadToken = Effect.gen(function* () {
    const env = yield* yield* CloudflareEnvironment;
    const http = yield* HttpClient.HttpClient;
    const createSubdomainEdgePreviewSession = yield* workers.createSubdomainEdgePreviewSession;
    const { token, exchangeUrl } = yield* createSubdomainEdgePreviewSession({
        accountId: env.accountId,
    });
    if (!exchangeUrl)
        return token;
    const json = yield* http.get(exchangeUrl).pipe(Effect.flatMap((r) => r.json), Effect.timeout(30_000), Effect.catch(() => Effect.succeed(null)));
    if (typeof json === "object" &&
        json !== null &&
        "token" in json &&
        typeof json.token === "string") {
        return json.token;
    }
    return token;
});
const uploadScript = (options, uploadToken) => Effect.gen(function* () {
    const env = yield* yield* CloudflareEnvironment;
    const createScriptEdgePreview = yield* workers.createScriptEdgePreview;
    return yield* createScriptEdgePreview({
        accountId: env.accountId,
        scriptName: options.scriptName,
        cfPreviewUploadConfigToken: uploadToken,
        wranglerSessionConfig: { workersDev: true, minimalMode: true },
        metadata: {
            compatibilityDate: options.compatibilityDate ?? DEFAULT_COMPATIBILITY_DATE,
            bindings: options.bindings,
            mainModule: options.files[0].name,
        },
        // Distilled's generated schema expects a mutable array; our
        // public surface keeps `readonly` so callers can pass a frozen
        // tuple without a cast on their side.
        files: options.files.slice(),
    }).pipe(Effect.timeout(30_000));
});
const workerHost = (scriptName) => Effect.gen(function* () {
    const env = yield* yield* CloudflareEnvironment;
    const { subdomain } = yield* workers.getSubdomain({
        accountId: env.accountId,
    });
    return `${scriptName}.${subdomain}.workers.dev`;
});
/**
 * Upload a short-lived preview worker to Cloudflare's edge and
 * return its URL plus the headers needed to reach it.
 *
 * Preview workers are ephemeral: they live only while a client keeps
 * sending requests with the returned preview token and expire soon
 * after. Nothing is deployed or billed.
 */
export const createEdgeSession = (options) => Effect.gen(function* () {
    const [{ previewToken }, { url, headers }] = yield* Effect.all([
        createUploadToken.pipe(Effect.flatMap((t) => uploadScript(options, t))),
        workerHost(options.scriptName).pipe(Effect.flatMap(Effect.fn(function* (host) {
            const headers = yield* Access.use((access) => access.getAccessHeaders(host));
            return { url: `https://${host}`, headers };
        }))),
    ], { concurrency: "unbounded" });
    return {
        url,
        headers: { ...headers, "cf-workers-preview-token": previewToken },
    };
}).pipe((e) => wrap(e, "Failed to create edge preview session"));
//# sourceMappingURL=EdgeSession.js.map