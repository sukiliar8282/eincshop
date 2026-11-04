import * as Effect from "effect/Effect";
/**
 * Shared HTTP scaffolding for the Comprehend Medical runtime bindings.
 *
 * Comprehend Medical is a pure pay-per-call service: none of its actions
 * support resource-level IAM, so every binding is account-level and grants
 * its action(s) on `Resource: ["*"]`. The only variation between bindings is
 * the distilled operation, the IAM action, and whether the operation passes
 * a data-access role to the service (the `Start*Job` operations, which
 * additionally need `iam:PassRole` scoped to
 * `comprehendmedical.amazonaws.com`).
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeComprehendMedicalHttpBinding({ … }))`.
 */
export declare const makeComprehendMedicalHttpBinding: <I, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"DetectEntitiesV2"`.
     */
    capability: string;
    /**
     * IAM actions granted on `Resource: ["*"]` (Comprehend Medical has no
     * resource-level IAM).
     */
    iamActions: readonly string[];
    /**
     * The distilled operation implementing the capability.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /**
     * Grant `iam:PassRole` (conditioned to `comprehendmedical.amazonaws.com`)
     * so the function can hand the service the `DataAccessRoleArn` a batch job
     * assumes to read/write S3. Set on the `Start*Job` bindings.
     */
    passRole?: boolean;
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map