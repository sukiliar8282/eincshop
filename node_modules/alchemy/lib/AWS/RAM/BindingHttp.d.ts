import * as Effect from "effect/Effect";
/**
 * Shared HTTP scaffolding for the AWS RAM runtime bindings.
 *
 * RAM (Resource Access Manager) is an account-scoped sharing service: every
 * runtime operation targets resource shares, invitations, permissions, or
 * shared resources that are chosen per request at runtime (invitation ARNs
 * arrive from *other* accounts and are unknowable at deploy time), so every
 * binding is account-level and grants its action(s) on `Resource: ["*"]`.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeRAMHttpBinding({ … }))` over the builder below.
 * Everything except the operation and the IAM action list is boilerplate.
 */
export declare const makeRAMHttpBinding: <I, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"GetResourceShares"`.
     */
    capability: string;
    /**
     * IAM actions granted on `Resource: ["*"]` (the target shares/invitations
     * are chosen per request at runtime and unknowable at deploy time).
     */
    iamActions: readonly string[];
    /**
     * The distilled operation implementing the capability.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map