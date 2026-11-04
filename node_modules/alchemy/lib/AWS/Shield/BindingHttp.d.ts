import * as Effect from "effect/Effect";
/**
 * Shared scaffolding for AWS Shield HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeShieldHttpBinding({ … }))` over the builder below.
 * Everything except the operation and the IAM action list is boilerplate.
 *
 * Shield is an account-level, us-east-1-pinned service: its IAM actions do
 * not support resource-level permissions for the visibility operations bound
 * here (attacks, subscription state, DRT access), and the group-membership
 * read targets groups whose ids are only known at runtime — so the
 * deploy-time half grants `actions` on `*` and the caller's request passes
 * through as-is.
 */
export declare const makeShieldHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Shield.ListAttacks`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map