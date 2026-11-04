import * as Effect from "effect/Effect";
import type { ServerlessCluster } from "./ServerlessCluster.ts";
/**
 * Shared scaffolding for AWS MSK (Kafka) HTTP bindings.
 *
 * NOT exported from `index.ts` — every `{Op}Http.ts` in this service is a
 * thin `Layer.effect(Cap, makeKafkaClusterHttpBinding({ … }))` over the
 * builder below. Everything except the operation and the IAM action list is
 * boilerplate.
 */
/**
 * The cluster ARN is `arn:…:cluster/name/uuid`. Topic resources live under a
 * sibling `topic/` namespace scoped to the same cluster path; both the
 * `kafka:*Topic*` control-plane actions and the `kafka-cluster:*` data-plane
 * actions authorize against these ARNs.
 */
export declare const topicArnGlob: (clusterArn: string) => string;
/** Consumer-group ARNs under the cluster's `group/` namespace. */
export declare const groupArnGlob: (clusterArn: string) => string;
/** Transactional-id ARNs under the cluster's `transactional-id/` namespace. */
export declare const transactionalIdArnGlob: (clusterArn: string) => string;
/**
 * Build the impl Effect for a cluster-scoped MSK control-plane operation: the
 * runtime callable injects the bound {@link ServerlessCluster}'s ARN as
 * `ClusterArn` and the deploy-time half grants `actions` on the cluster ARN
 * (plus the cluster's `topic/` ARN namespace when `topicScoped` is set —
 * topic-management actions authorize against topic ARNs).
 */
export declare const makeKafkaClusterHttpBinding: <I extends {
    ClusterArn: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.Kafka.ListTopics`. */
    tag: string;
    /** The distilled operation; `ClusterArn` is injected from the cluster. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the cluster ARN (and topic glob, if scoped). */
    actions: readonly string[];
    /** Also grant `actions` on the cluster's `topic/…/*` ARN namespace. */
    topicScoped?: boolean;
}) => Effect.Effect<(cluster: ServerlessCluster) => Effect.Effect<(request?: Omit<I, "ClusterArn"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map