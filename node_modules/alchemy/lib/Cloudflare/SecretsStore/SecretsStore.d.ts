import * as secretsStore from "@distilled.cloud/cloudflare/secrets-store";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type Store = Resource<"Cloudflare.SecretsStore", {}, {
    storeId: string;
    storeName: string;
    accountId: string;
}, never, Providers>;
/**
 * A Cloudflare Secrets Store, a per-account container for secrets that
 * can be bound into Workers with full redaction and audit support.
 *
 * Cloudflare enforces a limit of **one Secrets Store per account**.
 * Deleting a store changes its ID and permanently destroys all secrets
 * inside it. Because of this, the provider always **adopts** an existing
 * store rather than creating a new one, and **never deletes** the store
 * on teardown. The `read` lifecycle reports the existing account store
 * (if any) as plain attrs, so the engine silently adopts it on cold
 * start and `create` is only ever invoked when no store exists yet.
 * Once it exists it is treated as account-level infrastructure that
 * outlives any single stack.
 * ### Creating a Store
 * **Example:** Basic Secrets Store (adopts existing or creates one)
 * ```typescript
 * const store = yield* Cloudflare.SecretsStore.Store("MyStore");
 * ```
 *
 * **Example:** Adopt a specific named store
 * ```typescript
 * const store = yield* Cloudflare.SecretsStore.Store("MyStore", {
 *   name: "production-secrets",
 * });
 * ```
 *
 * @resource
 * @product Secrets Store
 * @category Storage & Databases
 */
export declare const Store: import("../../Resource.ts").ResourceClass<Store>;
export declare const StoreProviderLive: () => import("effect/Layer").Layer<Provider.Provider<Store>, never, CloudflareEnvironment | secretsStore.CloudflareOpContext>;
/**
 * Local (dev) provider — the store is purely virtual: a `dev:` id keyed
 * into the local workerd Secrets Store simulator. The local `Secret`
 * provider seeds values into it and `toRuntimeBinding` lowers a
 * `secrets_store_secret` binding whose store id is `dev:`-prefixed onto the
 * local secrets-store service; data persists under
 * `.alchemy/local/secrets-store`.
 */
export declare const StoreProviderLocal: () => import("effect/Layer").Layer<Provider.Provider<Store>, never, CloudflareEnvironment>;
export declare const SecretsStoreProvider: () => import("effect/Layer").Layer<Provider.Provider<Store>, never, import("../../AlchemyContext.ts").AlchemyContext | CloudflareEnvironment | secretsStore.CloudflareOpContext>;
//# sourceMappingURL=SecretsStore.d.ts.map