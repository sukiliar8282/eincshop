import * as Effect from "effect/Effect";
import type { Collection } from "./Collection.ts";
/**
 * Shared scaffolding for the OpenSearch Serverless runtime bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeAoss…HttpBinding({ … }))` over one of the two
 * builders below. Everything except the operation, the IAM action list, and
 * (for collection-scoped operations) the injected collection `id` is
 * boilerplate.
 */
/**
 * Build the impl Effect for a collection-scoped operation: the runtime
 * callable injects the bound {@link Collection}'s ID as `id` and the
 * deploy-time half grants `actions` on the collection's ARN.
 */
export declare const makeAossCollectionHttpBinding: <I extends {
    id?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.OpenSearchServerless.CreateIndex`. */
    tag: string;
    /** The distilled operation; `id` is injected from the collection. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the collection ARN. */
    actions: readonly string[];
}) => Effect.Effect<(collection: Collection) => Effect.Effect<(request: Omit<I, "id">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level operation (no collection
 * argument): the deploy-time half grants `actions` on `*` — the account
 * settings, policy stats, and lifecycle-policy read actions do not support
 * resource-level scoping.
 */
export declare const makeAossAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.OpenSearchServerless.GetAccountSettings`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map