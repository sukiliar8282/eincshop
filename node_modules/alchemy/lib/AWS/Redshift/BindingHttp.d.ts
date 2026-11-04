import * as Effect from "effect/Effect";
import type { Cluster } from "./Cluster.ts";
/**
 * Shared scaffolding for provisioned Amazon Redshift HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service (except
 * the bespoke `ConnectHttp`) is a thin `Layer.effect(Cap, make…HttpBinding({
 * … }))` over one of the builders below. Everything except the operation,
 * the identifier resolver, and the IAM action list is boilerplate.
 */
/**
 * Build the impl Effect for an account-level operation (cluster discovery,
 * event history, snapshot administration). The deploy-time half grants
 * `actions` on `*` — these operations span every cluster in the account and
 * the identifiers they filter on are runtime data.
 */
export declare const makeRedshiftAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Redshift.DescribeEvents`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a cluster-scoped operation: the runtime callable
 * injects the bound {@link Cluster}'s identifier as `ClusterIdentifier` and
 * the deploy-time half grants `actions` on the cluster ARN (plus any
 * `extraResources`, e.g. the `snapshot:{cluster}/*` ARN pattern for snapshot
 * creation).
 */
export declare const makeRedshiftClusterHttpBinding: <I extends {
    ClusterIdentifier?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Redshift.PauseCluster`. */
    tag: string;
    /** The distilled operation; `ClusterIdentifier` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the cluster ARN. */
    actions: readonly string[];
    /** Additional IAM resource ARNs derived from the cluster ARN. */
    extraResources?: (clusterArn: string) => string[];
}) => Effect.Effect<(cluster: Cluster) => Effect.Effect<(request?: Omit<I, "ClusterIdentifier"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * The `snapshot:{cluster}/*` ARN derived from a cluster ARN — the extra IAM
 * resource snapshot-writing operations are scoped to.
 */
export declare const clusterSnapshotArnPattern: (clusterArn: string) => string;
//# sourceMappingURL=BindingHttp.d.ts.map