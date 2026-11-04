import * as Effect from "effect/Effect";
import type { Cluster } from "./Cluster.ts";
/**
 * Shared scaffolding for AWS DAX HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * Build the impl Effect for an account-level operation (cluster monitoring,
 * event history). The deploy-time half grants `actions` on `*` — these
 * read-only monitoring actions span every cluster/parameter-group in the
 * account and the names they filter on are runtime data.
 */
export declare const makeDaxAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DAX.DescribeEvents`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a cluster-scoped operation: the runtime callable
 * injects the bound {@link Cluster}'s name as `ClusterName` and the
 * deploy-time half grants `actions` on the cluster ARN.
 */
export declare const makeDaxClusterHttpBinding: <I extends {
    ClusterName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.DAX.RebootNode`. */
    tag: string;
    /** The distilled operation; `ClusterName` is injected from the cluster. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the cluster ARN. */
    actions: readonly string[];
}) => Effect.Effect<(cluster: Cluster) => Effect.Effect<(request: Omit<I, "ClusterName">) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map