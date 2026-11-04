/**
 * Shared HTTP-binding scaffolding for the AppIntegrations service.
 * NOT exported from the service barrel — each `{Op}Http.ts` is a thin
 * one-call `Layer.effect(Cap, makeAppIntegrations*HttpBinding({ ... }))`.
 */
import * as Effect from "effect/Effect";
import type { Input } from "../../Input.ts";
import type { Output } from "../../Output.ts";
/** Deploy-time environment handed to the `resources` IAM builder. */
export interface AppIntegrationsIamEnv {
    region: string;
    accountId: string;
}
/**
 * Build the implementation effect for a resource-scoped AppIntegrations HTTP
 * binding: resolve the resource identifier at init, grant the IAM actions on
 * the host at deploy time, and inject the identifier into every request at
 * runtime under `requestKey`.
 */
export declare const makeAppIntegrationsHttpBinding: <Res extends {
    LogicalId: string;
}, IdKey extends string, WireReq extends { [K in IdKey]?: unknown; }, Out, Err, OpR>(options: {
    /** Capability name used in the bind sid and runtime span. */
    name: string;
    /** The distilled AppIntegrations operation backing the binding. */
    operation: Effect.Effect<(input: WireReq) => Effect.Effect<Out, Err>, never, OpR>;
    /** Wire key the resolved resource identifier is injected under. */
    requestKey: IdKey;
    /** The resource attribute used as the wire identifier. */
    identifier: (resource: Res) => Output<string, never>;
    /** IAM actions granted on the host at deploy time. */
    iamActions: string[];
    /** IAM resources the actions are granted on. */
    resources: (resource: Res, env: AppIntegrationsIamEnv) => Input<string>[];
    /**
     * Dependent actions the AppIntegrations service invokes on the caller's
     * behalf (e.g. `appflow:CreateFlow` for data-integration associations).
     * Granted on `*` in a second statement — these AWS-managed side resources
     * have no stable ARN at deploy time.
     */
    dependentActions?: string[];
}) => Effect.Effect<(resource: Res) => Effect.Effect<(request?: Omit<WireReq, IdKey> | undefined) => Effect.Effect<Out, Err, never>, never, never>, never, OpR>;
/**
 * Build the implementation effect for an account-scoped AppIntegrations HTTP
 * binding (no resource argument): grant the IAM actions on `*` at deploy time
 * and forward requests to the operation at runtime.
 */
export declare const makeAppIntegrationsAccountHttpBinding: <WireReq, Out, Err, OpR>(options: {
    /** Capability name used in the bind sid and runtime span. */
    name: string;
    /** The distilled AppIntegrations operation backing the binding. */
    operation: Effect.Effect<(input: WireReq) => Effect.Effect<Out, Err>, never, OpR>;
    /** IAM actions granted on the host at deploy time. */
    iamActions: string[];
}) => Effect.Effect<() => Effect.Effect<(request?: WireReq | undefined) => Effect.Effect<Out, Err, never>, never, never>, never, OpR>;
//# sourceMappingURL=BindingHttp.d.ts.map