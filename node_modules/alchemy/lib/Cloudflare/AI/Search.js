import * as Effect from "effect/Effect";
import * as CoreNamespace from "../../Namespace.js";
import { isResource } from "../../Resource.js";
import { AccountApiToken } from "../ApiToken/AccountApiToken.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { SearchInstance, } from "./SearchInstance.js";
import { SearchToken } from "./SearchToken.js";
/**
 * A convenience construct over {@link SearchInstance} that auto-creates the
 * sub-resources an AI Search instance typically needs, so a single call wires
 * up a working pipeline. The data source is chosen by what you pass as
 * `source` — an {@link Bucket} for R2, or a URL for a web crawl:
 *
 * - For an R2 source, it mints a least-privilege {@link AccountApiToken}
 *   (`AI Search Index Engine`, stable child `ApiToken`) and an
 *   {@link SearchToken} wrapping it (stable child `Token`), then passes
 *   that token to the instance.
 *   Cloudflare requires a service token to read an R2 bucket and only
 *   provisions one through the dashboard / Wrangler — never on a
 *   programmatic API create — so the construct provisions it for you. Pass
 *   your own `tokenId` to skip minting and reuse an existing token.
 * - It creates the {@link SearchInstance} (child `SearchInstance`) with the
 *   remaining props.
 *
 * Drop down to the low-level resources directly when you need to share a
 * token across instances, adopt an existing one, or bind a namespace.
 *
 * The returned value *is* an {@link SearchInstance} (augmented with the
 * managed `serviceToken`, `undefined` for a web crawler), so a `Search`
 * is usable anywhere a `SearchInstance` is expected — pass it straight to
 * `Cloudflare.AI.QuerySearch(search)` or a Worker's `env`.
 *
 * ### Creating an AI Search pipeline
 * **Example:** R2-backed instance (token provisioned for you)
 * Pass an {@link Bucket} as `source` — its presence selects R2.
 * ```typescript
 * const bucket = yield* Cloudflare.R2.Bucket("docs");
 * const search = yield* Cloudflare.AI.Search("docs-search", {
 *   source: bucket,
 * });
 * ```
 *
 * **Example:** Index only part of a bucket
 * ```typescript
 * const search = yield* Cloudflare.AI.Search("docs-search", {
 *   source: bucket,
 *   prefix: "docs/",
 *   include: ["/docs/**"],
 *   exclude: ["/docs/drafts/**"],
 * });
 * ```
 *
 * **Example:** Reuse an existing service token
 * ```typescript
 * const search = yield* Cloudflare.AI.Search("docs-search", {
 *   source: bucket,
 *   tokenId: existingToken.id,
 * });
 * ```
 *
 * **Example:** Web-crawler source
 * Pass a URL as `source` to crawl and index a website (no service token
 * needed). `parse.type` defaults to `"sitemap"`; use `"discover"` to follow
 * links from the seed instead.
 * ```typescript
 * const search = yield* Cloudflare.AI.Search("site-search", {
 *   source: "https://example.com",
 *   parse: { type: "discover", contentSelector: [{ path: "/docs", selector: "main" }] },
 * });
 * ```
 *
 * **Example:** Store crawl output in your own bucket
 * ```typescript
 * const store = yield* Cloudflare.R2.Bucket("crawl-store");
 * const search = yield* Cloudflare.AI.Search("site-search", {
 *   source: "https://example.com",
 *   parse: { type: "discover" },
 *   store: { bucket: store },
 * });
 * ```
 *
 * ### Binding to an Effect Worker
 *
 * The returned `search` is an {@link SearchInstance}. Bind it during the
 * Worker's init phase with `Cloudflare.AI.QuerySearch(search)`, which
 * attaches the single-instance `ai_search` binding and hands back an
 * Effect-native client whose `search` / `chatCompletions` methods return
 * `Effect`s. Provide `Cloudflare.AI.QuerySearchBinding` in the Worker's
 * runtime layer.
 *
 * **Example:** Effect Worker that answers from AI Search
 * ```typescript
 * import * as Cloudflare from "alchemy/Cloudflare";
 * import * as Effect from "effect/Effect";
 * import { HttpServerRequest } from "effect/unstable/http/HttpServerRequest";
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
 *
 * export default class Api extends Cloudflare.Worker<Api>()(
 *   "api",
 *   { main: import.meta.url },
 *   Effect.gen(function* () {
 *     const bucket = yield* Cloudflare.R2.Bucket("docs");
 *     const aiSearch = yield* Cloudflare.AI.Search("docs-search", {
 *       source: bucket,
 *     });
 *     const search = yield* Cloudflare.AI.QuerySearch(aiSearch);
 *
 *     return {
 *       fetch: Effect.gen(function* () {
 *         const request = yield* HttpServerRequest;
 *         const query = new URL(request.url).searchParams.get("q") ?? "";
 *         const answer = yield* search.chatCompletions({
 *           messages: [{ role: "user", content: query }],
 *         });
 *         return yield* HttpServerResponse.json(answer);
 *       }),
 *     };
 *   }).pipe(Effect.provide(Cloudflare.AI.QuerySearchBinding)),
 * ) {}
 * ```
 *
 * ### Binding to an Async Worker
 *
 * For a vanilla `async fetch` Worker, pass the `search` under `Worker.env`.
 * The engine attaches the same single-instance `ai_search` binding (see
 * `toBinding` in `WorkerAsyncBindings.ts`), orders the deploy
 * bucket → instance → worker, and `InferEnv` types `env.SEARCH` as the
 * runtime `SearchInstance` handle — no hand-written types.
 *
 * **Example:** Async Worker that answers from AI Search
 * ```typescript
 * // stack.ts
 * const bucket = yield* Cloudflare.R2.Bucket("docs");
 * const search = yield* Cloudflare.AI.Search("docs-search", {
 *   source: bucket,
 * });
 *
 * export const Api = Cloudflare.Worker("api", {
 *   main: "./worker.ts",
 *   env: { SEARCH: search },
 * });
 * export type ApiEnv = Cloudflare.InferEnv<typeof Api>;
 *
 * // worker.ts
 * import type { ApiEnv } from "./stack.ts";
 * export default {
 *   async fetch(request: Request, env: ApiEnv): Promise<Response> {
 *     const query = new URL(request.url).searchParams.get("q") ?? "";
 *     const answer = await env.SEARCH.chatCompletions({
 *       messages: [{ role: "user", content: query }],
 *     });
 *     return Response.json(answer);
 *   },
 * };
 * ```
 *
 * @see https://developers.cloudflare.com/ai-search/
 *
 * @resource
 * @product AI Search
 * @category AI
 */
export const Search = (id, props) => Effect.gen(function* () {
    const { source, prefix, include, exclude, jurisdiction, parse, store, namespace, ...shared } = props;
    let tokenId = shared.tokenId;
    let serviceToken;
    let type;
    let instanceSource;
    let sourceParams;
    // Discriminate the data source on what `source` is: an Bucket (a resource)
    // indexes a bucket and needs a service token to read it; a URL crawls a seed
    // and doesn't.
    if (isResource(source)) {
        const bucket = source;
        type = "r2";
        instanceSource = bucket.bucketName;
        sourceParams = clean({
            prefix,
            includeItems: include,
            excludeItems: exclude,
            r2Jurisdiction: jurisdiction,
        });
        // Cloudflare requires a service token to read an R2 source and only
        // auto-creates one via the dashboard/Wrangler — not on a programmatic
        // API create. Mint one ourselves unless the caller passed a `tokenId`.
        if (tokenId === undefined) {
            const { accountId } = yield* yield* CloudflareEnvironment;
            const apiToken = yield* AccountApiToken("ApiToken", {
                policies: [
                    {
                        effect: "allow",
                        permissionGroups: ["AI Search Index Engine"],
                        resources: {
                            [`com.cloudflare.api.account.${accountId}`]: "*",
                        },
                    },
                ],
            });
            serviceToken = yield* SearchToken("Token", {
                cfApiId: apiToken.tokenId,
                cfApiKey: apiToken.value,
            });
            tokenId = serviceToken.id;
        }
    }
    else {
        type = "web-crawler";
        instanceSource = source;
        const { type: parseType, ...parseOptions } = parse ?? {};
        const webCrawler = clean({
            parseType,
            parseOptions: clean(parseOptions),
            storeOptions: store
                ? clean({
                    storageId: store.bucket.bucketName,
                    storageType: "r2",
                    r2Jurisdiction: store.jurisdiction,
                })
                : undefined,
        });
        sourceParams = webCrawler
            ? { webCrawler }
            : undefined;
    }
    const instance = yield* SearchInstance("Instance", {
        ...shared,
        // The instance is keyed by namespace name; pass the namespace's `name`
        // output so the engine orders instance-after-namespace.
        namespace: namespace?.name,
        type,
        source: instanceSource,
        tokenId,
        sourceParams,
    });
    // Return the instance itself (augmented with the managed `serviceToken`)
    // so a `Search` is usable anywhere a `SearchInstance` is expected —
    // `Cloudflare.AI.QuerySearch(search)`, `env: { SEARCH: search }`, etc.
    return Object.assign(instance, { serviceToken });
}).pipe(CoreNamespace.push(id));
/** Drop `undefined` entries; return `undefined` when nothing is left. */
const clean = (obj) => {
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
    return entries.length
        ? Object.fromEntries(entries)
        : undefined;
};
//# sourceMappingURL=Search.js.map