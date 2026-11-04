import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { Credentials } from "../Credentials.ts";
import type { SearchIndexClient } from "./SearchIndex.ts";
/**
 * Injectable auth shared by the Local (current-credentials) impl and a future
 * Http (scoped-token) impl. `authorize` discharges the
 * `Credentials | HttpClient` requirement of a distilled op; `accountId` is the
 * Cloudflare account the ops run against.
 */
export interface SearchIndexAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E>;
    accountId: string;
}
/**
 * Build a {@link SearchIndexClient} over the Vectorize HTTP API.
 *
 * `indexName` is an Effect so the resolution stays deferred to each call —
 * inside an Action it resolves through the apply-time RuntimeContext. The
 * credentials are provided ONLY around the distilled op (via `auth.authorize`),
 * never around the name accessor, matching the D1 / KV Local variants. `orDie`
 * mirrors the native binding, whose client methods surface transport failures
 * as defects.
 *
 * Two methods have no Cloudflare HTTP equivalent and `Effect.die`:
 * - `raw` — there is no HTTP-backed `runtime.Vectorize` object to hand back.
 * - `queryById` — the HTTP query endpoint only accepts a raw vector, not an id.
 */
export declare const makeHttpSearchIndexClient: (auth: SearchIndexAuth, indexName: Effect.Effect<string>) => SearchIndexClient;
//# sourceMappingURL=SearchIndexHttpClient.d.ts.map