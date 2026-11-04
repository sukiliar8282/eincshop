import * as Effect from "effect/Effect";
import type { LifecyclePolicy } from "./LifecyclePolicy.ts";
/**
 * Shared scaffolding for Amazon Data Lifecycle Manager (DLM) HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for a DLM operation scoped to a
 * {@link LifecyclePolicy}: the deploy-time half grants `actions` on the bound
 * policy's ARN, and the runtime half injects the policy's `PolicyId` into
 * every request.
 */
export declare const makeDlmPolicyHttpBinding: <I extends {
    PolicyId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DLM.GetLifecyclePolicy`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the lifecycle policy ARN. */
    actions: readonly string[];
}) => Effect.Effect<(policy: LifecyclePolicy) => Effect.Effect<(request?: Omit<I, "PolicyId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level DLM operation (enumerating the
 * account's lifecycle policies). The deploy-time half grants `actions` on
 * `*` — `dlm:GetLifecyclePolicies` is a list action that is not scoped to a
 * single policy resource.
 */
export declare const makeDlmAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DLM.GetLifecyclePolicies`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map