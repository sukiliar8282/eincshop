import * as Effect from "effect/Effect";
import { type KeyLike } from "./KeyBinding.ts";
/**
 * Shared scaffolding for the AWS KMS HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for a KMS cryptographic operation scoped to a
 * {@link KeyLike} target (a `Key` resource or the `alias/...` name of a
 * pre-existing key): the deploy-time half grants `actions` on the bound key
 * (exact key ARN, or `Resource: "*"` + `kms:RequestAlias` for an alias), and
 * the runtime half injects the key identifier into every request.
 */
export declare const makeKmsKeyHttpBinding: <I extends {
    KeyId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.KMS.Sign`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bound key. */
    actions: readonly `kms:${string}`[];
}) => Effect.Effect<(key: KeyLike) => Effect.Effect<(request?: Omit<I, "KeyId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level KMS operation that is not
 * scoped to a key (e.g. `kms:GenerateRandom`). The deploy-time half grants
 * `actions` on `*`.
 */
export declare const makeKmsAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.KMS.GenerateRandom`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly `kms:${string}`[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map