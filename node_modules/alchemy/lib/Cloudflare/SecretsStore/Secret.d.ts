import type { RuntimeServices } from "@alchemy.run/cloudflare-runtime/core";
import * as secretsStore from "@distilled.cloud/cloudflare/secrets-store";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type StoreSecretProps = {
    /**
     * The Secrets Store that owns this secret.
     */
    store: {
        storeId: string;
        accountId: string;
    };
    /**
     * The name of the secret within the store.
     * If omitted, the resource's logical ID is used.
     */
    name?: string;
    /**
     * The secret value. Treated as redacted and never logged.
     */
    value: Redacted.Redacted<string>;
    /**
     * Services allowed to reference this secret.
     * @default ["workers"]
     */
    scopes?: string[];
    /**
     * Optional free-form description.
     */
    comment?: string;
};
export type Secret = Resource<"Cloudflare.SecretsStore.Secret", StoreSecretProps, {
    secretId: string;
    secretName: string;
    storeId: string;
    accountId: string;
    status: SecretStatus;
    scopes: string[];
    comment: string | undefined;
}, never, Providers>;
export declare const isSecret: (value: unknown) => value is Secret;
export type SecretStatus = "pending" | "active" | "deleted";
/**
 * A single secret stored inside a Cloudflare Secrets Store.
 *
 * The secret value is treated as redacted and is only ever sent to
 * Cloudflare at create time. Updating `scopes` or `comment` issues a
 * PATCH; changing `value` or `name` replaces the secret.
 * ### Creating a Secret
 * **Example:** Basic Secret
 * ```typescript
 * const store = yield* Cloudflare.SecretsStore.Store("MyStore");
 * const apiKey = yield* Cloudflare.SecretsStore.Secret("ApiKey", {
 *   store,
 *   value: Redacted.make(process.env.API_KEY!),
 * });
 * ```
 *
 * ### Binding to a Worker
 * **Example:** Reading a secret at runtime
 * ```typescript
 * const apiKey = yield* Cloudflare.SecretsStore.ReadSecret(ApiKey);
 * // `apiKey` is itself an Effect that resolves to the secret value:
 * const value = yield* apiKey;
 * // Or call `.get()` explicitly:
 * const value = yield* apiKey.get();
 * ```
 *
 * @resource
 * @product Secrets Store
 * @category Storage & Databases
 */
export declare const Secret: import("../../Resource.ts").ResourceClass<Secret>;
export declare const SecretProviderLive: () => Layer.Layer<Provider.Provider<Secret>, never, CloudflareEnvironment | secretsStore.CloudflareOpContext>;
/**
 * Local (dev) provider — the secret's identity is virtual (a `dev:` id) but
 * its VALUE is real: reconcile seeds it into the local workerd Secrets
 * Store simulator (through the `SecretsStore.admin` gateway, see
 * `LocalSecretsStoreGateway.ts`) so a dev worker's `env.SECRET.get()`
 * returns it, and delete removes the key again. Data lands in the same
 * `.alchemy/local/secrets-store` directory the worker's lowered
 * `secrets_store_secret` binding reads.
 *
 * RPC-backed: under `alchemy dev` (an `RpcProviderProxy` in context) the
 * whole lifecycle runs in the Cloudflare sidecar process — where
 * `localRuntimeServices()` is real and shared with the Worker/Queue/D1
 * local providers — instead of in the user's process where that layer is
 * gated empty (the class of bug behind #1007). In-process runs (no proxy:
 * `sidecar: false` tests, a plain deploy deleting a local-mode row) build
 * the provider directly with the un-gated runtime from the `dual`
 * registration.
 */
export declare const SecretProviderLocal: () => Layer.Layer<Provider.Provider<Secret>, never, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | HttpClient.HttpClient | import("../../Stack.ts").Stack | RuntimeServices>;
export declare const StoreSecretProvider: () => Layer.Layer<Provider.Provider<Secret>, import("effect/Config").ConfigError | import("@alchemy.run/cloudflare-runtime/core").ConfigError | import("effect/PlatformError").PlatformError | import("@alchemy.run/cloudflare-runtime/core").SystemError, import("../../AlchemyContext.ts").AlchemyContext | import("../../Artifacts.ts").ArtifactStore | import("effect/unstable/process/ChildProcessSpawner").ChildProcessSpawner | CloudflareEnvironment | import("effect/FileSystem").FileSystem | import("effect/Path").Path | import("../../Stack.ts").Stack | secretsStore.CloudflareOpContext>;
//# sourceMappingURL=Secret.d.ts.map