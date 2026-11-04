import * as Effect from "effect/Effect";
/**
 * Shared HTTP scaffolding for the IAM Roles Anywhere runtime bindings.
 *
 * Subjects (the certificate identities Roles Anywhere records for every
 * authentication attempt) are account-scoped audit records chosen per request
 * at runtime, so every binding is account-level and grants its action(s) on
 * `Resource: ["*"]`.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeRolesAnywhereHttpBinding({ … }))` over the builder
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
export declare const makeRolesAnywhereHttpBinding: <I, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListSubjects"`.
     */
    capability: string;
    /**
     * IAM actions granted on `Resource: ["*"]` (the target subjects are chosen
     * per request at runtime and unknowable at deploy time).
     */
    iamActions: readonly string[];
    /**
     * The distilled operation implementing the capability.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map