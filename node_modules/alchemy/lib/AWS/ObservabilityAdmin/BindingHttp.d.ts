import * as Effect from "effect/Effect";
/**
 * Shared HTTP scaffolding for the CloudWatch Observability Admin runtime
 * bindings.
 *
 * Every account-level Observability Admin read (`ListResourceTelemetry`,
 * `GetTelemetryEvaluationStatus`, ...) targets account configuration rather
 * than a discrete ARN, so each binding grants its action on
 * `Resource: ["*"]`. The only variation between bindings is the distilled
 * operation and the IAM action.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, makeObservabilityAdminHttpBinding({ … }))`.
 */
export declare const makeObservabilityAdminHttpBinding: <I, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"ListResourceTelemetry"`.
     */
    capability: string;
    /**
     * IAM actions granted on `Resource: ["*"]` (account-level configuration
     * reads have no resource ARN to scope to).
     */
    iamActions: readonly string[];
    /**
     * The distilled operation implementing the capability.
     */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map