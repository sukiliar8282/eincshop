import * as Effect from "effect/Effect";
import type { Cluster } from "./Cluster.ts";
/**
 * Shared scaffolding for AWS EKS HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeEKS…HttpBinding({ … }))` over one of the
 * builders below. Everything except the operation, the request key carrying
 * the cluster name, and the IAM action list is boilerplate.
 */
/**
 * Build the impl Effect for an account-level operation (cluster enumeration,
 * managed access-policy catalog, Kubernetes/add-on version catalogs). The
 * deploy-time half grants `actions` on `*` — these read-only catalog and
 * enumeration actions span the whole account/region and take no resource ARN.
 */
export declare const makeEKSAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EKS.ListClusters`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Which ARNs an action authorizes against, per the EKS service authorization
 * reference:
 *
 * - `cluster` — the cluster ARN itself (`DescribeCluster`, the `List*`
 *   enumerations, insights).
 * - `subresources` — the cluster's sub-resources. Nodegroups, add-ons,
 *   Fargate profiles, pod identity associations, and access entries all share
 *   the ARN shape `arn:aws:eks:{region}:{acct}:{type}/{clusterName}/…`, so a
 *   single wildcard pattern derived from the cluster ARN (resource type
 *   replaced by a `*` and a trailing `/{star}` appended) covers them without
 *   granting anything on other clusters.
 * - `both` — actions like `ListUpdates`/`DescribeUpdate` that authorize
 *   against the cluster OR a sub-resource depending on the request.
 */
export type EKSIamScope = "cluster" | "subresources" | "both";
/**
 * Build the impl Effect for a cluster-scoped operation: the runtime callable
 * injects the bound {@link Cluster}'s name under `key` (`clusterName` for the
 * sub-resource lists and insights, `name` for `DescribeCluster`) and the
 * deploy-time half grants `actions` on the cluster ARN and/or its
 * sub-resource ARNs per `scope`.
 */
export declare const makeEKSClusterHttpBinding: <I extends {
    clusterName?: string;
} | {
    name?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.EKS.ListNodegroups`. */
    tag: string;
    /** The distilled operation; the cluster name is injected from the cluster. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted per `scope`. */
    actions: readonly string[];
    /** Request key carrying the cluster name. */
    key: "clusterName" | "name";
    /** Which ARNs the actions authorize against. */
    scope: EKSIamScope;
}) => Effect.Effect<(cluster: Cluster) => Effect.Effect<(request?: Omit<I, "clusterName" | "name"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map