import * as Effect from "effect/Effect";
/**
 * Build the impl Effect for an endpoint-invocation operation
 * (`InvokeEndpoint`, `InvokeEndpointAsync`,
 * `InvokeEndpointWithResponseStream`). The binding accepts one or more
 * endpoint names, grants `actions` on exactly those endpoint ARNs, and the
 * runtime callable defaults `EndpointName` to the first bound endpoint (it
 * may be overridden per call with any of the bound names).
 */
export declare const makeEndpointInvocationHttpBinding: <I extends {
    EndpointName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.SageMakerRuntime.InvokeEndpoint`. */
    tag: string;
    /** The distilled operation; `EndpointName` defaults to the first bound endpoint. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the bound endpoint ARNs. */
    actions: readonly string[];
}) => Effect.Effect<(endpoint: string, ...additionalEndpoints: string[]) => Effect.Effect<(request: Omit<I, "EndpointName"> & {
    EndpointName?: string;
}) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map