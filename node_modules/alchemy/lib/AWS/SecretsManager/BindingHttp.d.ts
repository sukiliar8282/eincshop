import * as Effect from "effect/Effect";
import type { Secret } from "./Secret.ts";
/**
 * Shared scaffolding for the AWS Secrets Manager HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for a Secrets Manager operation scoped to a bound
 * {@link Secret}: the deploy-time half grants `actions` on the secret's ARN,
 * and the runtime half injects the secret ARN as `SecretId` into every
 * request.
 */
export declare const makeSecretHttpBinding: <I extends {
    SecretId?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SecretsManager.GetSecretValue`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bound secret. */
    actions: readonly `secretsmanager:${string}`[];
}) => Effect.Effect<(secret: Secret) => Effect.Effect<(request?: Omit<I, "SecretId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level Secrets Manager operation that
 * is not scoped to a secret (e.g. `secretsmanager:GetRandomPassword`,
 * `secretsmanager:ListSecrets`). The deploy-time half grants `actions` on
 * `*`.
 */
export declare const makeSecretsManagerAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SecretsManager.ListSecrets`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly `secretsmanager:${string}`[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map