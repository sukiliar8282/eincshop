import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServerlessClusterProps {
    /**
     * Name of the MSK Serverless cluster. Must be 1-64 characters. If omitted, a
     * deterministic physical name is generated. Changing the name replaces the
     * cluster.
     */
    clusterName?: string;
    /**
     * VPC subnets the cluster's brokers are reachable from. At least two subnets
     * in different Availability Zones are required. Changing subnets replaces the
     * cluster.
     */
    subnetIds: string[];
    /**
     * VPC security groups that control network access to the cluster. If omitted,
     * the VPC's default security group is used. Changing security groups replaces
     * the cluster.
     */
    securityGroupIds?: string[];
    /**
     * User-defined tags for the cluster.
     */
    tags?: Record<string, string>;
}
export interface ServerlessCluster extends Resource<"AWS.Kafka.ServerlessCluster", ServerlessClusterProps, {
    /** Name of the cluster. */
    clusterName: string;
    /** ARN of the cluster. */
    clusterArn: string;
    /** Cluster type — always `SERVERLESS` for this resource. */
    clusterType: string;
    /** Current state (`CREATING`, `ACTIVE`, `DELETING`, ...). */
    state: string;
    /**
     * SASL/IAM bootstrap broker connection string — the endpoint kafkajs-style
     * clients connect to using IAM authentication.
     */
    bootstrapBrokerStringSaslIam: string | undefined;
    /** Subnets the cluster is reachable from. */
    subnetIds: string[];
    /** Security groups attached to the cluster. */
    securityGroupIds: string[];
    /** Tags observed on the cluster. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon MSK (Managed Streaming for Apache Kafka) **Serverless** cluster.
 *
 * MSK Serverless clusters use IAM authentication exclusively and scale broker
 * capacity automatically — there is no broker count, instance type, or storage
 * to configure. They are reachable only from inside a VPC. Creation takes
 * roughly 5-10 minutes.
 *
 * The provisioned (broker-count) MSK cluster is a separate, much slower
 * (~20-40 minute) resource and is intentionally not modeled here.
 *
 * ### Creating a Serverless Cluster
 * **Example:** Serverless Cluster in a VPC
 * ```typescript
 * const cluster = yield* ServerlessCluster("Events", {
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroupIds: [kafkaSecurityGroup.securityGroupId],
 * });
 * ```
 *
 * ### Consuming from a Lambda Function
 * **Example:** Wire a topic to a Lambda
 * ```typescript
 * yield* Kafka.consumeKafkaTopic(cluster, { topics: ["orders"] }, (records) =>
 *   records.pipe(Stream.runForEach((r) => Effect.log(r.value))),
 * );
 * ```
 *
 * @resource
 */
export declare const ServerlessCluster: import("../../Resource.ts").ResourceClass<ServerlessCluster>;
export declare const ServerlessClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<ServerlessCluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ServerlessCluster.d.ts.map