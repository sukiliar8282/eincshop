import * as Effect from "effect/Effect";
import type { Vault } from "./Vault.ts";
/**
 * Shared scaffolding for the Glacier runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeGlacierVaultHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action list is
 * boilerplate: Glacier's REST API scopes every data-plane operation to a
 * vault, so the runtime callable injects the bound {@link Vault}'s name (and
 * the `-` account-id path segment, meaning "the account that signed the
 * request") and the deploy-time half grants `actions` on the vault's ARN.
 */
export declare const makeGlacierVaultHttpBinding: <I extends {
    accountId: string;
    vaultName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Glacier.UploadArchive`. */
    tag: string;
    /**
     * The distilled operation; `accountId` (always `-`) and `vaultName` are
     * injected from the bound vault.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the vault ARN. */
    actions: readonly string[];
}) => Effect.Effect<(vault: Vault) => Effect.Effect<(request?: Omit<I, "accountId" | "vaultName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map