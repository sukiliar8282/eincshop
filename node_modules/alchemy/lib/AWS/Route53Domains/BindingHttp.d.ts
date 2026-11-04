import * as Effect from "effect/Effect";
/**
 * Shared HTTP scaffolding for the Route 53 Domains runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeRoute53DomainsHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action is
 * boilerplate.
 *
 * Route 53 Domains is a global registration API with no resource-level IAM:
 * every action authorizes account-wide, so the builder always grants on
 * `Resource: ["*"]` and the capability takes no arguments. The API is only
 * served from `us-east-1`, so the captured client is pinned to that region
 * regardless of where the calling function runs.
 */
export declare const makeRoute53DomainsHttpBinding: <I extends object, A, E, R>(options: {
    /**
     * Short capability name used in the binding sid and runtime span, e.g.
     * `"CheckDomainAvailability"`.
     */
    capability: string;
    /** IAM actions granted on `Resource: ["*"]`. */
    iamActions: readonly string[];
    /** The distilled operation implementing the capability. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, Exclude<R, import("@distilled.cloud/aws/Region").Region>>;
//# sourceMappingURL=BindingHttp.d.ts.map