import * as Effect from "effect/Effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import type { Credentials } from "../Credentials.ts";
import { type QuerySearchClient } from "./QuerySearch.ts";
import type { QuerySearchNamespaceClient } from "./QuerySearchNamespace.ts";
/**
 * Injectable auth shared by a future Http (scoped-token) impl and the Local
 * (current-credentials) impl. `authorize` discharges the
 * `Credentials | HttpClient` requirement of a distilled op; `accountId` is the
 * Cloudflare account the ops run against.
 */
export interface SearchAuth {
    authorize: <A, E>(eff: Effect.Effect<A, E, Credentials | HttpClient.HttpClient>) => Effect.Effect<A, E>;
    accountId: string;
}
/** Effect resolving `{ name (namespace), id (instanceId) }` at apply time. */
export type InstanceRef = Effect.Effect<{
    name: string;
    id: string;
}>;
/** Effect resolving the namespace `name` at apply time. */
export type NamespaceRef = Effect.Effect<string>;
/**
 * Build a single-instance {@link QuerySearchClient} over the HTTP API. `ref`
 * resolves the `{ namespace, instanceId }` at apply time.
 */
export declare const makeLocalSearchClient: (auth: SearchAuth, ref: InstanceRef) => QuerySearchClient;
/**
 * Build a namespace {@link QuerySearchNamespaceClient} over the HTTP API.
 * `.get(instanceName)` scopes a single-instance client to `(namespace,
 * instanceName)`.
 */
export declare const makeLocalSearchNamespaceClient: (auth: SearchAuth, ref: NamespaceRef) => QuerySearchNamespaceClient;
//# sourceMappingURL=SearchHttpClient.d.ts.map