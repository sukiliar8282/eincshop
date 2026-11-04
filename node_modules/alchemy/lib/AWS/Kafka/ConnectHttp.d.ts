import * as Effect from "effect/Effect";
import type { ServerlessCluster } from "./ServerlessCluster.ts";
/**
 * Shared scaffolding for the MSK connect bindings.
 *
 * NOT exported from `index.ts` — `ConnectReadHttp.ts` / `ConnectWriteHttp.ts`
 * / `ConnectReadWriteHttp.ts` are thin
 * `Layer.effect(Cap, makeKafkaConnectHttpBinding({ … }))` calls over the
 * builder below. Only the IAM action sets differ per access level.
 */
/** Cluster-level actions every MSK IAM-auth client needs. */
export declare const KAFKA_CONNECT_ACTIONS: readonly ["kafka-cluster:Connect", "kafka-cluster:DescribeCluster", "kafka-cluster:DescribeClusterDynamicConfiguration"];
/** Topic-level consumer actions. */
export declare const KAFKA_READ_TOPIC_ACTIONS: readonly ["kafka-cluster:DescribeTopic", "kafka-cluster:ReadData"];
/** Consumer-group actions (join a group, commit offsets). */
export declare const KAFKA_READ_GROUP_ACTIONS: readonly ["kafka-cluster:DescribeGroup", "kafka-cluster:AlterGroup"];
/** Topic-level producer actions. */
export declare const KAFKA_WRITE_TOPIC_ACTIONS: readonly ["kafka-cluster:DescribeTopic", "kafka-cluster:WriteData"];
/** Cluster-level producer actions (idempotent producers). */
export declare const KAFKA_WRITE_CLUSTER_ACTIONS: readonly ["kafka-cluster:WriteDataIdempotently"];
/** Transactional-id actions (transactional producers). */
export declare const KAFKA_WRITE_TRANSACTION_ACTIONS: readonly ["kafka-cluster:DescribeTransactionalId", "kafka-cluster:AlterTransactionalId"];
/**
 * Build the impl Effect for a connect binding. At deploy time it grants the
 * given action sets on the cluster / topic / group / transactional-id ARN
 * namespaces and publishes the SASL/IAM bootstrap endpoint as
 * `MSK_{LOGICAL_ID}_{BROKERS,ARN}` environment variables on the host
 * Function; at runtime it resolves the same values into a typed connection
 * descriptor.
 */
export declare const makeKafkaConnectHttpBinding: (options: {
    /** Fully-qualified binding tag, e.g. `AWS.Kafka.ConnectReadWrite`. */
    tag: string;
    /** IAM actions granted on the cluster ARN. */
    clusterActions: readonly string[];
    /** IAM actions granted on the cluster's `topic/…/*` ARNs. */
    topicActions: readonly string[];
    /** IAM actions granted on the cluster's `group/…/*` ARNs. */
    groupActions?: readonly string[];
    /** IAM actions granted on the cluster's `transactional-id/…/*` ARNs. */
    transactionActions?: readonly string[];
}) => Effect.Effect<(cluster: ServerlessCluster) => Effect.Effect<Effect.Effect<{
    bootstrapServers: string;
    brokers: string[];
    clusterArn: string;
    authentication: "iam";
}, never, never>, never, never>, never, never>;
//# sourceMappingURL=ConnectHttp.d.ts.map