import * as Layer from "effect/Layer";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Credentials } from "../Credentials.ts";
import { QuerySearchNamespace } from "./QuerySearchNamespace.ts";
/**
 * Local implementation of the {@link QuerySearchNamespace} binding — queries an
 * AI Search namespace over the Cloudflare HTTP API using the **current
 * credentials** instead of a native Worker binding
 * (`QuerySearchNamespaceBinding`).
 *
 * Provide it on an {@link Action} (or any deploy-time Effect) to `list`
 * instances, run a multi-instance `search`, or `.get(instanceName)` a
 * single-instance client — the same client you'd use inside a Worker. The
 * namespace name is resolved at apply time through the ambient RuntimeContext.
 *
 * `raw` (the native `AiSearchNamespace` runtime handle) is unavailable outside a
 * deployed Worker and dies if forced.
 *
 * @example List a namespace's instances from an Action
 * ```typescript
 * const Probe = Alchemy.Action(
 *   "Probe",
 *   Effect.gen(function* () {
 *     const ns = yield* Cloudflare.AI.QuerySearchNamespace(namespace);
 *     return Effect.fn(function* () {
 *       const { result } = yield* ns.list();
 *       return result.map((i) => i.id);
 *     });
 *   }).pipe(Effect.provide(Cloudflare.AI.QuerySearchNamespaceLocal)),
 * );
 * ```
 */
export declare const QuerySearchNamespaceLocal: Layer.Layer<QuerySearchNamespace, never, CloudflareEnvironment | Credentials | HttpClient.HttpClient>;
//# sourceMappingURL=QuerySearchNamespaceLocal.d.ts.map