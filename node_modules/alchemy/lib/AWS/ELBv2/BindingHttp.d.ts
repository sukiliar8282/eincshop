import * as Effect from "effect/Effect";
import type { LoadBalancer } from "./LoadBalancer.ts";
import type { TargetGroup } from "./TargetGroup.ts";
import type { TrustStore } from "./TrustStore.ts";
/**
 * Build the impl Effect for a target-group-addressed operation: the runtime
 * callable injects the bound {@link TargetGroup}'s ARN as `TargetGroupArn`;
 * the deploy-time half grants `actions` on the target-group ARN
 * (`"target-group"`, the default) or on `*` (`Describe*` actions do not
 * support resource-level permissions).
 */
export declare const makeTargetGroupHttpBinding: <I extends {
    TargetGroupArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ELBv2.RegisterTargets`. */
    tag: string;
    /** The distilled operation; `TargetGroupArn` is injected from the group. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted by the binding. */
    actions: readonly string[];
    /**
     * IAM resource scope. Write actions support resource-level permissions on
     * the target-group ARN (`"target-group"`, the default); `Describe*`
     * actions do not (`"*"`).
     */
    resource?: "target-group" | "*";
}) => Effect.Effect<(targetGroup: TargetGroup) => Effect.Effect<(request: Omit<I, "TargetGroupArn">) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a load-balancer-addressed operation: the runtime
 * callable injects the bound {@link LoadBalancer}'s ARN as `LoadBalancerArn`;
 * the deploy-time half grants `actions` on the load-balancer ARN
 * (`"load-balancer"`, the default) or on `*` (`Describe*` actions do not
 * support resource-level permissions).
 */
export declare const makeLoadBalancerHttpBinding: <I extends {
    LoadBalancerArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ELBv2.ModifyCapacityReservation`. */
    tag: string;
    /** The distilled operation; `LoadBalancerArn` is injected from the LB. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted by the binding. */
    actions: readonly string[];
    /**
     * IAM resource scope. Write actions support resource-level permissions on
     * the load-balancer ARN (`"load-balancer"`, the default); `Describe*`
     * actions do not (`"*"`).
     */
    resource?: "load-balancer" | "*";
}) => Effect.Effect<(loadBalancer: LoadBalancer) => Effect.Effect<(request?: Omit<I, "LoadBalancerArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for a trust-store-addressed operation: the runtime
 * callable injects the bound {@link TrustStore}'s ARN as `TrustStoreArn`;
 * the deploy-time half grants `actions` on the trust-store ARN (mTLS
 * `GetTrustStore*` reads support resource-level permissions).
 */
export declare const makeTrustStoreHttpBinding: <I extends {
    TrustStoreArn?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.ELBv2.GetTrustStoreCaCertificatesBundle`. */
    tag: string;
    /** The distilled operation; `TrustStoreArn` is injected from the store. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the trust-store ARN. */
    actions: readonly string[];
}) => Effect.Effect<(trustStore: TrustStore) => Effect.Effect<(request?: Omit<I, "TrustStoreArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map