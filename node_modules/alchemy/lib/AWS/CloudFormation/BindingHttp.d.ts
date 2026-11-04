import * as Effect from "effect/Effect";
import type { Stack } from "./Stack.ts";
/**
 * Shared scaffolding for AWS CloudFormation HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation, the IAM action list, and
 * (for stack-scoped operations) the injected `StackName` is boilerplate.
 */
/**
 * Build the impl Effect for a stack-scoped operation: the runtime callable
 * injects the bound {@link Stack}'s stack id (the stack ARN, which every
 * CloudFormation API accepts as `StackName`) and the deploy-time half grants
 * `actions` on the stack ARN.
 */
export declare const makeCloudFormationStackHttpBinding: <I extends {
    StackName?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CloudFormation.DescribeStacks`. */
    tag: string;
    /** The distilled operation; `StackName` is injected from the stack. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the stack ARN. */
    actions: readonly string[];
}) => Effect.Effect<(stack: Stack) => Effect.Effect<(request?: Omit<I, "StackName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (cross-stack export
 * discovery, drift-detection polling, template validation). The deploy-time
 * half grants `actions` on `*` — these CloudFormation actions are not
 * resource-scoped.
 */
export declare const makeCloudFormationAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.CloudFormation.ListExports`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map