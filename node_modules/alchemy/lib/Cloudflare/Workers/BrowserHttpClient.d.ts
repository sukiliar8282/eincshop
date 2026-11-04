import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { Credentials } from "../Credentials.ts";
import { type BrowserClient } from "./Browser.ts";
/**
 * Injectable auth shared by the Local (current-credentials) impl and a future
 * Http (scoped-token) impl. `authorize` discharges the
 * `Credentials | HttpClient` requirement of a distilled op; `accountId` is the
 * Cloudflare account the ops run against.
 */
export interface BrowserAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E>;
    accountId: string;
}
/**
 * Build a {@link BrowserClient} over the Browser Rendering REST data-plane
 * (`/accounts/{id}/browser-rendering/*`).
 *
 * The following client members `Effect.die` (or fail the stream) because they
 * have no Cloudflare REST equivalent — use a native `BrowserBinding` inside a
 * deployed Worker for them:
 * - `raw` / `fetch` — the raw `BrowserRun` transport used by
 *   `@cloudflare/puppeteer` is a Worker-runtime object, not an HTTP call.
 * - `screenshot` / `pdf` — the binary endpoints stream image/PDF bytes, which
 *   the distilled REST codec models as JSON status, not a byte stream.
 *
 * Because the REST data-plane only returns the action `result` (not the
 * runtime binding's `meta` envelope), JSON actions populate `meta` with a
 * best-effort placeholder.
 */
export declare const makeHttpBrowserClient: (auth: BrowserAuth) => BrowserClient;
//# sourceMappingURL=BrowserHttpClient.d.ts.map