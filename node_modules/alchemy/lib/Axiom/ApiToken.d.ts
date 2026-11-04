import * as Axiom from "@distilled.cloud/axiom";
import * as Redacted from "effect/Redacted";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
export type ApiTokenProps = Omit<Axiom.CreateAPITokenRequest, never>;
export type ApiToken = Resource<"Axiom.ApiToken", ApiTokenProps, Omit<Axiom.CreateAPITokenResponse, "token"> & {
    /**
     * The bearer token. Returned only by `create` (and `regenerate`); Axiom
     * does not return it on subsequent reads. Persisted in resource state via
     * `Redacted` — handle with care.
     */
    token: Redacted.Redacted<string>;
}, never, Providers>;
/**
 * An Axiom API token — a scoped bearer token used to authenticate API
 * requests (ingest, query, admin). Capabilities are pinned at creation time;
 * changing any field triggers a **replacement** because Axiom does not
 * expose an update endpoint.
 *
 * The raw token value is returned only by `create`. After that, Axiom
 * never echoes it back, so it is captured into `output.token` (as a
 * {@link Redacted}) on initial create and persisted in resource state.
 * Treat resource state as sensitive — anyone with read access can recover
 * the token. Pair with a secret store for downstream consumption.
 * @see https://axiom.co/docs/reference/tokens
 *
 * ### Creating an API Token
 * **Example:** Ingest-only token scoped to one dataset
 * ```typescript
 * const ingest = yield* Axiom.ApiToken("ingest", {
 *   name: "prod-ingest",
 *   description: "OTEL collector ingest",
 *   datasetCapabilities: {
 *     "my-app-traces": { ingest: ["create"] },
 *   },
 * });
 * ```
 *
 * **Example:** Read-only query token
 * ```typescript
 * yield* Axiom.ApiToken("query", {
 *   name: "grafana-reader",
 *   datasetCapabilities: {
 *     "my-app-traces": { query: ["read"] },
 *     "my-app-logs":   { query: ["read"] },
 *   },
 * });
 * ```
 *
 * ### Consuming the Token
 * **Example:** Forward the token via Cloudflare Secrets
 * ```typescript
 * const secret = yield* Cloudflare.SecretsStore.Secret("axiom-token", {
 *   value: ingest.token,
 * });
 * ```
 *
 * @resource
 */
export declare const ApiToken: import("../Resource.ts").ResourceClass<ApiToken>;
export declare const ApiTokenProvider: () => import("effect/Layer").Layer<Provider.Provider<ApiToken>, never, Axiom.AxiomOpContext>;
//# sourceMappingURL=ApiToken.d.ts.map