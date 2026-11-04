import * as Effect from "effect/Effect";
/**
 * Shared scaffolding for AWS CloudHSM (v2) HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeCloudHsmHttpBinding({ … }))` over the builder
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 *
 * All CloudHSM bindings are account-level: the identifiers the operations
 * act on (cluster ids, backup ids, backup ARNs) are runtime data produced by
 * the service itself — backups are auto-created, ids are auto-assigned and
 * the API exposes no resource ARNs on clusters — so the deploy-time half
 * grants `actions` on `*`.
 */
export declare const makeCloudHsmHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CloudHSMV2.DescribeClusters`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map