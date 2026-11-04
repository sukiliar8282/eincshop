import * as Effect from "effect/Effect";
/**
 * Shared scaffolding for AWS Security Hub HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeSecurityHubHttpBinding({ … }))` over the builder
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 *
 * Security Hub is an account/region singleton service: every operation is
 * implicitly scoped to the caller's Hub, so there is no identifier to inject —
 * the caller's request is passed through as-is. The deploy-time half grants
 * `actions` on `*`: Security Hub IAM actions are evaluated against the
 * account's `hub/default` ARN (or take no resource at all), which is not
 * known until runtime and gains nothing from ARN-scoping within one account.
 */
export declare const makeSecurityHubHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SecurityHub.GetFindings`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map