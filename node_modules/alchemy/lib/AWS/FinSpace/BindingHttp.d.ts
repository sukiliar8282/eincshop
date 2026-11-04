import * as Effect from "effect/Effect";
import type { KxEnvironment } from "./KxEnvironment.ts";
/**
 * Shared scaffolding for Amazon FinSpace Managed kdb HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeFinSpaceKxHttpBinding({ … }))` over the builder
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for a kdb operation scoped to a {@link KxEnvironment}.
 *
 * Every Managed kdb data-plane operation is addressed by `environmentId`,
 * and kdb sub-resources (databases, clusters, dataviews, users, changesets)
 * live under the environment's ARN
 * (`arn:…:kxEnvironment/{envId}/kxDatabase/{db}`, …). The deploy-time half
 * therefore grants `actions` on the bound environment's ARN plus its `/*`
 * sub-resource wildcard; the runtime callable injects the environment's id
 * into every request.
 */
export declare const makeFinSpaceKxHttpBinding: <I extends {
    environmentId: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.FinSpace.GetKxConnectionString`. */
    tag: string;
    /** The distilled operation. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the environment ARN and its sub-resources. */
    actions: readonly string[];
}) => Effect.Effect<<K extends KxEnvironment>(environment: K) => Effect.Effect<(request?: Omit<I, "environmentId"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map