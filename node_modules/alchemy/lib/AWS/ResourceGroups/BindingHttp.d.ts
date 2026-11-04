import * as Effect from "effect/Effect";
import type { Group } from "./Group.ts";
/**
 * Shared scaffolding for the AWS Resource Groups HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service is
 * a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two builders
 * below. Everything except the operation, the IAM action list, and (for
 * group-scoped operations) the injected group identifier is boilerplate.
 */
/**
 * Build the impl Effect for a Resource Groups operation scoped to a
 * {@link Group}: the deploy-time half grants `actions` on the bound group's
 * ARN (plus any `supportingActions` on `*` — e.g. the Resource Groups
 * Tagging API / CloudFormation read-through permissions that member
 * enumeration fans out to), and the runtime half injects the group's name
 * into every request as `Group`.
 */
export declare const makeResourceGroupsGroupHttpBinding: <I extends {
    Group?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ResourceGroups.GroupResources`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the group ARN. */
    actions: readonly string[];
    /**
     * IAM actions granted on `*` that the operation fans out to — member
     * resources are arbitrary ARNs unknowable at deploy time (e.g.
     * `tag:GetResources` for `ListGroupResources`).
     */
    supportingActions?: readonly string[];
}) => Effect.Effect<(group: Group) => Effect.Effect<(request?: Omit<I, "Group" | "GroupName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level Resource Groups operation
 * (search, account settings, tag-sync task audit). The deploy-time half
 * grants `actions` on `*` — the targets (queries, task ARNs) are chosen per
 * request at runtime and unknowable at deploy time.
 */
export declare const makeResourceGroupsAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ResourceGroups.SearchResources`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map