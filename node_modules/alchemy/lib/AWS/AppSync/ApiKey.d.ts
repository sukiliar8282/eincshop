import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type { Input } from "../../Input.ts";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
import type { GraphqlApi } from "./GraphqlApi.ts";
export interface ApiKeyProps {
    /**
     * ID of the GraphQL API. Usually derived from `api.apiId` by the
     * {@link ApiKey} wrapper.
     */
    apiId: string;
    /** Description of the key. */
    description?: string;
    /**
     * Expiry as epoch seconds, between 1 and 365 days from creation. AWS
     * rounds the value **down to the nearest hour**. When omitted, the key
     * expires 7 days after creation and expiry is left unmanaged.
     */
    expires?: number;
}
export interface AppSyncApiKey extends Resource<"AWS.AppSync.ApiKey", ApiKeyProps, {
    /** The API this key belongs to. */
    apiId: string;
    /**
     * The API key ID — this IS the secret key value (`da2-…`) clients send
     * in the `x-api-key` header. Wrapped in `Redacted` — unwrap with
     * `Redacted.value(key.id)` where the raw header value is needed.
     */
    id: Redacted.Redacted<string>;
    /** The key's expiry (epoch seconds, rounded down to the hour). */
    expires: number | undefined;
    /** The key's description. */
    description: string | undefined;
}, never, Providers> {
}
/**
 * An AppSync API key for `API_KEY`-authenticated GraphQL APIs.
 *
 * The key's `id` attribute is the secret value (`da2-…`) sent in the
 * `x-api-key` request header. It is wrapped in `Redacted`; unwrap with
 * `Redacted.value(key.id)` where the raw header value is needed.
 * ### Creating API Keys
 * **Example:** Key with the default 7-day expiry
 * ```typescript
 * const key = yield* AppSync.ApiKey("Key", { api });
 * // Redacted.value(key.id) → "da2-…" — send as the x-api-key header
 * ```
 *
 * **Example:** Key with a managed expiry
 * ```typescript
 * const key = yield* AppSync.ApiKey("Key", {
 *   api,
 *   description: "mobile clients",
 *   expires: 1893456000, // rounded down to the hour by AWS
 * });
 * ```
 *
 * @resource
 */
export declare const ApiKeyResource: import("../../Resource.ts").ResourceClass<AppSyncApiKey>;
export interface ApiKeyInputProps extends Omit<{
    [K in keyof ApiKeyProps]?: Input<ApiKeyProps[K]>;
}, "apiId"> {
    /**
     * The `GraphqlApi` this key belongs to (preferred). Alternatively pass a
     * raw `apiId`.
     */
    api?: GraphqlApi;
    apiId?: Input<string>;
}
/**
 * User-facing wrapper for the ApiKey resource. Accepts `api: GraphqlApi`
 * as the idiomatic way to mint a key for an API.
 */
export declare const ApiKey: (id: string, props?: ApiKeyInputProps) => Effect.Effect<AppSyncApiKey, never, Providers>;
export declare const ApiKeyProvider: () => import("effect/Layer").Layer<Provider.Provider<AppSyncApiKey>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=ApiKey.d.ts.map