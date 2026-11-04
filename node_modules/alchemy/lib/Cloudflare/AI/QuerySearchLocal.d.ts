import * as Layer from "effect/Layer";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import { QuerySearch } from "./QuerySearch.ts";
/**
 * Local implementation of the {@link QuerySearch} binding — queries an AI
 * Search instance over the Cloudflare HTTP API using the **current
 * credentials** instead of a native Worker binding (`QuerySearchBinding`).
 *
 * Provide it on an {@link Action} (or any deploy-time Effect) to run
 * `search` / `chatCompletions` / `info` / `stats` against an instance with the
 * same client you'd use inside a Worker. The instance id and namespace are
 * resolved at apply time through the ambient RuntimeContext, so
 * `QuerySearch(instance)` works even when the instance is created in the same
 * deploy.
 *
 * `raw` (the native `AiSearchInstance` runtime handle) is unavailable outside a
 * deployed Worker and dies if forced.
 *
 * @example Read an instance's status from an Action
 * ```typescript
 * const Probe = Alchemy.Action(
 *   "Probe",
 *   Effect.gen(function* () {
 *     const search = yield* Cloudflare.AI.QuerySearch(instance);
 *     return Effect.fn(function* () {
 *       const info = yield* search.info();
 *       const stats = yield* search.stats();
 *       return { status: info.status, indexed: stats.completed };
 *     });
 *   }).pipe(Effect.provide(Cloudflare.AI.QuerySearchLocal)),
 * );
 * ```
 */
export declare const QuerySearchLocal: Layer.Layer<QuerySearch, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=QuerySearchLocal.d.ts.map