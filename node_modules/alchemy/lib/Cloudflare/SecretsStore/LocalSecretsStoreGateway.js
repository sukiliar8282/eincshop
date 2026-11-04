import { SecretsStore } from "@alchemy.run/cloudflare-runtime/core/bindings";
import { open } from "@alchemy.run/cloudflare-runtime/core/platform-proxy";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import { gatewayName } from "../LocalGateway.js";
export class LocalSecretsStoreError extends Data.TaggedError("LocalSecretsStoreError") {
}
/**
 * Boot a scoped platform proxy for `storeId`, hand `use` the store's raw
 * KV-namespace admin surface, and tear the instance down when `use`
 * completes. One proxy boot per operation — slow but correct; callers are
 * provider lifecycle operations, not a request path.
 */
export const withLocalSecretsStore = (storeId, use) => Effect.scoped(Effect.gen(function* () {
    const proxy = yield* open({
        name: gatewayName("alchemy-secrets-store-gateway", storeId),
        bindings: [SecretsStore.admin({ binding: "STORE", storeId })],
    });
    const store = proxy.env
        .STORE;
    return yield* use(store);
}));
/** Write a secret value into the local store (idempotent overwrite). */
export const seedLocalSecret = (storeId, secretName, value) => withLocalSecretsStore(storeId, (store) => Effect.tryPromise({
    try: () => store.put(secretName, value),
    catch: (cause) => new LocalSecretsStoreError({
        message: `Failed to seed secret "${secretName}" into the local Secrets Store`,
        cause,
    }),
}));
/** Remove a secret from the local store (idempotent). */
export const deleteLocalSecret = (storeId, secretName) => withLocalSecretsStore(storeId, (store) => Effect.tryPromise({
    try: () => store.delete(secretName),
    catch: (cause) => new LocalSecretsStoreError({
        message: `Failed to delete secret "${secretName}" from the local Secrets Store`,
        cause,
    }),
}));
//# sourceMappingURL=LocalSecretsStoreGateway.js.map