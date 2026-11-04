/**
 * Node-side seeding path into the local workerd Secrets Store simulator,
 * built on the runtime's platform proxy (`PlatformProxy.open` — our
 * `getPlatformProxy`).
 *
 * For a `dev:` store there is no cloud API to speak REST to. The local
 * `Secret` provider instead writes values through the runtime's
 * `SecretsStore.admin` hook — the raw KV-namespace view of a store (the
 * equivalent of Miniflare's `getSecretsStoreSecretAPI` admin surface): a
 * scoped platform proxy hosts the binding and Node drives it natively.
 *
 *   Node ── proxy.env.STORE.put(name, value) ──▶ secrets-store service
 *
 * Data lands in the same `{storage}/secrets-store` directory every local
 * worker's `secrets_store_secret` binding reads.
 *
 * NOT exported from `index.ts` — provider-internal scaffolding.
 */
import type * as runtime from "@cloudflare/workers-types";
import { SecretsStore } from "@alchemy.run/cloudflare-runtime/core/bindings";
import * as Effect from "effect/Effect";
declare const LocalSecretsStoreError_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "LocalSecretsStoreError";
} & Readonly<A>;
export declare class LocalSecretsStoreError extends LocalSecretsStoreError_base<{
    message: string;
    cause?: unknown;
}> {
}
/**
 * Boot a scoped platform proxy for `storeId`, hand `use` the store's raw
 * KV-namespace admin surface, and tear the instance down when `use`
 * completes. One proxy boot per operation — slow but correct; callers are
 * provider lifecycle operations, not a request path.
 */
export declare const withLocalSecretsStore: <A, E, R>(storeId: string, use: (store: runtime.KVNamespace<string>) => Effect.Effect<A, E, R>) => Effect.Effect<A, E | import("@alchemy.run/cloudflare-runtime/core").RuntimeError, import("@alchemy.run/cloudflare-runtime/core").Runtime | SecretsStore.SecretsStore | Exclude<R, import("effect/Scope").Scope>>;
/** Write a secret value into the local store (idempotent overwrite). */
export declare const seedLocalSecret: (storeId: string, secretName: string, value: string) => Effect.Effect<void, LocalSecretsStoreError | import("@alchemy.run/cloudflare-runtime/core").RuntimeError, import("@alchemy.run/cloudflare-runtime/core").Runtime | SecretsStore.SecretsStore>;
/** Remove a secret from the local store (idempotent). */
export declare const deleteLocalSecret: (storeId: string, secretName: string) => Effect.Effect<void, LocalSecretsStoreError | import("@alchemy.run/cloudflare-runtime/core").RuntimeError, import("@alchemy.run/cloudflare-runtime/core").Runtime | SecretsStore.SecretsStore>;
export {};
//# sourceMappingURL=LocalSecretsStoreGateway.d.ts.map