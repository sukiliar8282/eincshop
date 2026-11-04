import * as Effect from "effect/Effect";
import type * as Output from "../../Output.ts";
/**
 * Options for {@link makeAppFlowHttpBinding}. Everything except these five
 * inputs is identical across AppFlow's per-operation HTTP bindings.
 */
export interface AppFlowHttpBindingOptions<R extends {
    readonly LogicalId: string;
}, K extends string, I extends {
    [P in K]?: string;
}, A, E, OpR> {
    /**
     * The AppFlow action name, e.g. `"StartFlow"`. Becomes the IAM action
     * (`appflow:StartFlow`), the bind label, and the runtime span name.
     */
    action: string;
    /** The distilled AppFlow operation invoked at runtime. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, OpR>;
    /**
     * Resolve the identifier the operation is keyed by (the flow name or the
     * connector profile name).
     */
    identifier: (resource: R) => Output.Output<string, never>;
    /** The request field the resolved identifier is injected as. */
    requestKey: K;
    /** The IAM policy resources the action is granted on. */
    resources: (resource: R) => Array<string | Output.Output<string, never>>;
}
/**
 * Shared scaffolding for AppFlow per-operation HTTP bindings.
 *
 * Every AppFlow runtime binding follows the same recipe: resolve the
 * identifier (flow name / connector profile name), register the IAM grant on
 * the binding host at deploy time, then invoke the distilled operation with
 * the identifier injected. This factory owns that recipe so each `{Op}Http.ts`
 * is a thin `Layer.effect(Cap, makeAppFlowHttpBinding({ ... }))` call whose
 * request/response/error types are still checked against the capability
 * contract at the `Layer.effect` site.
 *
 * Internal scaffolding — NOT exported from `index.ts`.
 */
export declare const makeAppFlowHttpBinding: <R extends {
    readonly LogicalId: string;
}, K extends string, I extends { [P in K]?: string; }, A, E, OpR>(options: AppFlowHttpBindingOptions<R, K, I, A, E, OpR>) => Effect.Effect<(resource: R) => Effect.Effect<(request?: Omit<I, K> | undefined) => Effect.Effect<A, E, never>, never, never>, never, OpR>;
//# sourceMappingURL=BindingHttp.d.ts.map