import * as Effect from "effect/Effect";
/**
 * Shared scaffolding for Amazon DevOps Guru HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeDevOpsGuruAccountHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action is
 * boilerplate.
 *
 * All DevOps Guru actions are account-level: the service does not support
 * resource-level IAM permissions (insights, anomalies, and health summaries
 * are account/region-scoped API objects, not ARN-addressable resources), so
 * the deploy-time half always grants the action on `*`.
 */
/**
 * Build the impl Effect for an account-level DevOps Guru operation. The
 * runtime callable passes the caller's request through unchanged; the
 * deploy-time half grants `actions` on `*`.
 */
export declare const makeDevOpsGuruAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DevOpsGuru.ListInsights`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map