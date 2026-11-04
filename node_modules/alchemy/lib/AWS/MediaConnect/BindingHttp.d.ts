import * as Effect from "effect/Effect";
import type { Flow } from "./Flow.ts";
/**
 * Shared scaffolding for AWS Elemental MediaConnect HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service
 * is a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation and the IAM action list
 * is boilerplate: flow-scoped bindings inject the bound flow's ARN as the
 * request's `FlowArn` and grant `actions` on that ARN; account-scoped
 * bindings pass the request through and grant `actions` on `*`.
 */
/**
 * Build the impl Effect for a MediaConnect operation scoped to a
 * {@link Flow}: the deploy-time half grants `actions` on the bound flow's
 * ARN (plus any `extraResources` — e.g. the entitlement wildcard for
 * Grant/RevokeFlowEntitlement, whose IAM resource types are both the flow
 * AND the entitlement, a sibling ARN not derived from the flow ARN), and
 * the runtime half injects the flow's ARN into every request as `FlowArn`.
 */
export declare const makeMediaConnectFlowHttpBinding: <I extends {
    FlowArn: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaConnect.StartFlow`. */
    tag: string;
    /** The distilled operation; `FlowArn` is injected from the flow. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the flow ARN + `extraResources`. */
    actions: readonly string[];
    /**
     * Additional IAM resource ARNs granted alongside the flow ARN — for
     * operations whose IAM resource types include more than the flow (e.g.
     * entitlement ops act on `…:entitlement:*` ARNs too).
     */
    extraResources?: readonly string[];
}) => Effect.Effect<(flow: Flow) => Effect.Effect<(request?: Omit<I, "FlowArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level MediaConnect operation (e.g.
 * enumerating the account's flows or granted entitlements). The
 * deploy-time half grants `actions` on `*` — these list operations are
 * not scoped to a single flow resource.
 */
export declare const makeMediaConnectAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MediaConnect.ListFlows`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map