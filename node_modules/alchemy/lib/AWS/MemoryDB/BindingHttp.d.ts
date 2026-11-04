import * as Effect from "effect/Effect";
import type { Cluster } from "./Cluster.ts";
/**
 * Shared scaffolding for Amazon MemoryDB HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the identifier resolver, and the
 * IAM action list is boilerplate. The env-only side of `ConnectHttp` stays
 * bespoke — it attaches environment variables in addition to IAM policy.
 */
/**
 * MemoryDB snapshot ARNs embed the snapshot name, which is runtime data for
 * every snapshot-addressed operation, so snapshot-scoped grants use this
 * wildcard.
 */
export declare const SNAPSHOT_ARN_WILDCARD = "arn:aws:memorydb:*:*:snapshot/*";
/**
 * Build the impl Effect for an account-level operation (snapshot management,
 * cluster/event monitoring). The deploy-time half grants `actions` on
 * `resources` (default `*`) — these operations address clusters and
 * snapshots by names that are runtime data.
 */
export declare const makeMemoryDBAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MemoryDB.DescribeEvents`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted. */
    actions: readonly string[];
    /**
     * IAM resources the actions are granted on.
     * @default ["*"]
     */
    resources?: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a cluster-scoped operation: the runtime callable
 * injects the bound {@link Cluster}'s name as `ClusterName` and the
 * deploy-time half grants `actions` on the cluster ARN (plus any
 * `extraResources`, e.g. the snapshot ARN wildcard for snapshot creation).
 */
export declare const makeMemoryDBClusterHttpBinding: <I extends {
    ClusterName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.MemoryDB.FailoverShard`. */
    tag: string;
    /** The distilled operation; `ClusterName` is injected from the cluster. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the cluster ARN. */
    actions: readonly string[];
    /** Static IAM resources granted in addition to the cluster ARN. */
    extraResources?: readonly string[];
}) => Effect.Effect<(cluster: Cluster) => Effect.Effect<(request?: Omit<I, "ClusterName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map