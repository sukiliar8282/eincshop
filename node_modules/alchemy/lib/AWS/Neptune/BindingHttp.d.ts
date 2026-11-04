import * as Effect from "effect/Effect";
import type { DBCluster } from "./DBCluster.ts";
import type { DBInstance } from "./DBInstance.ts";
/**
 * Shared scaffolding for Amazon Neptune HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the builders
 * below. Everything except the operation, the identifier resolver, and the
 * IAM action list is boilerplate.
 *
 * Neptune shares the RDS control plane, so its management IAM actions live
 * under the `rds:` service prefix (`rds:FailoverDBCluster`,
 * `rds:DescribeDBClusters`, …) and its ARNs use the `rds` service segment.
 */
/**
 * Build the impl Effect for an account-level operation (cluster discovery,
 * event history, snapshot administration). The deploy-time half grants
 * `actions` on `*` — these operations span every cluster in the account and
 * the identifiers they filter on are runtime data.
 */
export declare const makeNeptuneAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Neptune.DescribeEvents`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request?: I | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a cluster-scoped operation: the runtime callable
 * injects the bound {@link DBCluster}'s identifier as `DBClusterIdentifier`
 * and the deploy-time half grants `actions` on the cluster ARN (plus any
 * `extraResources`, e.g. the `cluster-snapshot` ARN pattern for snapshot
 * creation).
 */
export declare const makeNeptuneClusterHttpBinding: <I extends {
    DBClusterIdentifier?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Neptune.FailoverDBCluster`. */
    tag: string;
    /** The distilled operation; `DBClusterIdentifier` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the cluster ARN. */
    actions: readonly string[];
    /** Additional IAM resource ARNs derived from the cluster ARN. */
    extraResources?: (clusterArn: string) => string[];
}) => Effect.Effect<(cluster: DBCluster) => Effect.Effect<(request?: Omit<I, "DBClusterIdentifier"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an instance-scoped operation: the runtime
 * callable injects the bound {@link DBInstance}'s identifier as
 * `DBInstanceIdentifier` and the deploy-time half grants `actions` on the
 * instance ARN.
 */
export declare const makeNeptuneInstanceHttpBinding: <I extends {
    DBInstanceIdentifier?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Neptune.RebootDBInstance`. */
    tag: string;
    /** The distilled operation; `DBInstanceIdentifier` is injected. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the instance ARN. */
    actions: readonly string[];
}) => Effect.Effect<(instance: DBInstance) => Effect.Effect<(request?: Omit<I, "DBInstanceIdentifier"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map