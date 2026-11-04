import * as Effect from "effect/Effect";
import type { Endpoint } from "./Endpoint.ts";
import type { FeatureGroup } from "./FeatureGroup.ts";
/**
 * Shared scaffolding for Amazon SageMaker HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation, the IAM action list, and the
 * request shaping is boilerplate.
 */
/**
 * Build the impl Effect for a SageMaker Feature Store data-plane operation
 * scoped to a {@link FeatureGroup}: the deploy-time half grants `actions` on
 * the bound feature group's ARN, and the runtime half injects the feature
 * group's name into every request via `prepare`.
 */
export declare const makeFeatureGroupHttpBinding: <Req, I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SageMaker.GetRecord`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the feature group ARN. */
    actions: readonly string[];
    /** Shape the caller's request into the wire request (injecting the name). */
    prepare: (request: Req, featureGroupName: string) => I;
}) => Effect.Effect<(featureGroup: FeatureGroup) => Effect.Effect<(request: Req) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a SageMaker control-plane operation scoped to an
 * {@link Endpoint}: the deploy-time half grants `actions` on the bound
 * endpoint's ARN, and the runtime half injects the endpoint's name into
 * every request.
 */
export declare const makeEndpointHttpBinding: <I extends {
    EndpointName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SageMaker.DescribeEndpoint`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the endpoint ARN. */
    actions: readonly string[];
}) => Effect.Effect<(endpoint: Endpoint) => Effect.Effect<(request?: Omit<I, "EndpointName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map