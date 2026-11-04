import * as Effect from "effect/Effect";
import type { Key } from "./Key.ts";
/**
 * Shared scaffolding for the AWS Payment Cryptography HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the IAM action, and (for two-key
 * operations) the injected request fields is boilerplate.
 *
 * Payment Cryptography data-plane operations authorize against the key ARN,
 * so every builder grants `actions` on the bound {@link Key}(s) and the
 * runtime callable injects the key ARN(s) into every request.
 */
/**
 * Build the impl Effect for an operation scoped to a single {@link Key}
 * whose input carries the key ARN in a `KeyIdentifier` field (all
 * single-key Payment Cryptography operations use this field name).
 */
export declare const makePaymentCryptographyKeyHttpBinding: <I extends {
    KeyIdentifier: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.PaymentCryptography.EncryptData`. */
    tag: string;
    /** The distilled operation; `KeyIdentifier` is injected from the key. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bound key's ARN. */
    actions: readonly `payment-cryptography:${string}`[];
}) => Effect.Effect<<K extends Key>(key: K) => Effect.Effect<(request?: Omit<I, "KeyIdentifier"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an operation spanning two {@link Key}s (e.g.
 * `ReEncryptData` with incoming + outgoing keys, `GeneratePinData` with
 * generation + encryption keys). The deploy-time half grants `actions` on
 * both key ARNs, and the runtime callable injects each key's ARN into the
 * request field named by `keyFields` (in bind-argument order).
 */
export declare const makePaymentCryptographyKeyPairHttpBinding: <F1 extends string, F2 extends string, I extends Record<F1 | F2, string>, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.PaymentCryptography.ReEncryptData`. */
    tag: string;
    /** The distilled operation; both key fields are injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on both bound keys' ARNs. */
    actions: readonly `payment-cryptography:${string}`[];
    /** Request fields carrying the two keys' ARNs, in bind-argument order. */
    keyFields: readonly [F1, F2];
}) => Effect.Effect<<A1 extends Key, A2 extends Key>(first: A1, second: A2) => Effect.Effect<(request: Omit<I, F1 | F2>) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map