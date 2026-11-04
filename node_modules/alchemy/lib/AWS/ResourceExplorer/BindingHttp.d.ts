import * as Effect from "effect/Effect";
import type { View } from "./View.ts";
/**
 * Shared HTTP scaffolding for the AWS Resource Explorer runtime bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service
 * is a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation and the IAM action list
 * is boilerplate.
 */
/**
 * Build the impl Effect for a Resource Explorer operation scoped to a
 * {@link View}: the deploy-time half grants `actions` on the bound view's
 * ARN, and the runtime half injects the view's `ViewArn` into every
 * request.
 */
export declare const makeResourceExplorerViewHttpBinding: <I extends {
    ViewArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ResourceExplorer.Search`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the view ARN. */
    actions: readonly string[];
}) => Effect.Effect<<V extends View>(view: V) => Effect.Effect<(request?: Omit<I, "ViewArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level Resource Explorer operation
 * (e.g. enumerating the searchable resource types). The deploy-time half
 * grants `actions` on `*` — these operations are not scoped to a single
 * Resource Explorer resource.
 */
export declare const makeResourceExplorerAccountHttpBinding: <I, A, E, R>(options: {
    /**
     * Fully-qualified binding tag, e.g.
     * `AWS.ResourceExplorer.ListSupportedResourceTypes`.
     */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map