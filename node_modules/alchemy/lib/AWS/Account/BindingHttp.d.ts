import * as Effect from "effect/Effect";
/**
 * Shared HTTP scaffolding for the AWS Account Management runtime bindings.
 *
 * Account Management is an account-singleton global service: every runtime
 * operation reads settings of the calling account (account information,
 * primary/alternate contacts, Region opt statuses), so every binding is
 * account-level and grants its action(s) on `Resource: ["*"]` (the account
 * ARN is the caller's own account, fixed by the credentials rather than
 * chosen per resource).
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeAccountHttpBinding({ … }))` over the builder
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
export declare const makeAccountHttpBinding: <I, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"GetContactInformation"`.
     */
    capability: string;
    /**
     * IAM actions granted on `Resource: ["*"]` (Account Management operations
     * target the calling account itself).
     */
    iamActions: readonly string[];
    /**
     * The distilled operation implementing the capability.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map