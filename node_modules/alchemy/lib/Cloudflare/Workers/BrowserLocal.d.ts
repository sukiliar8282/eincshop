import * as Layer from "effect/Layer";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import { Browser } from "./Browser.ts";
/**
 * Local implementation of the {@link Browser} binding — drives Cloudflare
 * Browser Rendering over its REST data-plane (`/accounts/{id}/browser-rendering/*`)
 * using the **current credentials** instead of a native Worker binding
 * (`BrowserBinding`).
 *
 * Provide it on an {@link Action} (or any deploy-time Effect) to run the JSON
 * quick actions — `content`, `markdown`, `scrape`, `links`, `snapshot`,
 * `json` — with the same client you'd use inside a Worker; no Worker host, no
 * `host.bind`, no minted token:
 *
 * @example Convert a page to Markdown from an Action
 * ```typescript
 * const Scrape = Alchemy.Action(
 *   "Scrape",
 *   Effect.gen(function* () {
 *     const browser = yield* Cloudflare.Browser("BROWSER");
 *     return Effect.fn(function* () {
 *       const { result } = yield* browser.markdown({
 *         url: "https://example.com",
 *       });
 *       return result;
 *     });
 *   }).pipe(Effect.provide(Cloudflare.Workers.BrowserLocal)),
 * );
 * ```
 *
 * `raw`, `fetch`, and the binary actions (`screenshot`/`pdf`) have no
 * Cloudflare REST equivalent and die — see {@link makeHttpBrowserClient}.
 */
export declare const BrowserLocal: Layer.Layer<Browser, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=BrowserLocal.d.ts.map