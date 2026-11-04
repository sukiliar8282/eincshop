/**
 * Shared HTTP-binding scaffolding for AppConfig capabilities.
 *
 * INTERNAL — deliberately NOT exported from `index.ts`. Each `{Op}Http.ts`
 * is a thin call to {@link makeAppConfigHttpBinding}; everything except the
 * operation, the identifier resolvers, and the IAM grant is boilerplate:
 * resolve the bound resources' identifiers (which also registers them on the
 * host's environment), register the IAM policy statement on the binding host
 * (skipped inside the deployed function), and return the traced runtime
 * client that merges the identifiers into each wire request.
 */
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Binding from "../../Binding.ts";
import type { Input } from "../../Input.ts";
import type * as Output from "../../Output.ts";
/** Region/account available to an IAM grant factory. */
export interface AppConfigIamContext {
    region: string;
    accountId: string;
}
export interface AppConfigHttpBindingSpec {
    /**
     * Wire-request fields resolved from the bound resources' attributes,
     * keyed by the operation's request field name (e.g. `ApplicationId`).
     */
    identifiers: Record<string, Output.Output<string, never>>;
    /** The IAM actions + resource ARNs the host needs for this capability. */
    iam: (ctx: AppConfigIamContext) => {
        actions: string[];
        resources: Input<string>[];
    };
}
/**
 * Build the `Layer.effect` for an AppConfig HTTP binding from its three
 * distinguishing parts: the distilled operation, the identifier resolvers,
 * and the IAM grant.
 */
export declare const makeAppConfigHttpBinding: <Self, Identifier extends string, Shape extends (...args: any[]) => Effect.Effect<any, any, any>, WireIn extends object, Out, Err, OpReq>(service: Binding.Service<Self, Identifier, Shape>, options: {
    /** The distilled AppConfig operation backing the capability. */
    operation: Effect.Effect<(input: WireIn) => Effect.Effect<Out, Err>, never, OpReq>;
    /** Derive identifiers + IAM grant from the bound resources. */
    spec: (...args: Parameters<Shape>) => AppConfigHttpBindingSpec;
}) => Layer.Layer<Self, never, OpReq>;
//# sourceMappingURL=BindingHttp.d.ts.map