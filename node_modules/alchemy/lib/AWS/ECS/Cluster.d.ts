import * as ecs from "@distilled.cloud/aws/ecs";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { AWSEnvironment, type AccountID } from "../Environment.ts";
import type { Providers } from "../Providers.ts";
import type { RegionID } from "../Region.ts";
export type ClusterName = string;
export type ClusterArn = `arn:aws:ecs:${RegionID}:${AccountID}:cluster/${ClusterName}`;
export interface ClusterProps {
    /**
     * Cluster name. If omitted, a unique name is generated.
     */
    clusterName?: string;
    /**
     * ECS cluster settings such as container insights.
     */
    settings?: ecs.ClusterSetting[];
    /**
     * Cluster configuration such as execute command logging.
     */
    configuration?: ecs.ClusterConfiguration;
    /**
     * Optional capacity providers associated with the cluster.
     */
    capacityProviders?: string[];
    /**
     * Default capacity provider strategy for the cluster.
     */
    defaultCapacityProviderStrategy?: ecs.CapacityProviderStrategyItem[];
    /**
     * Optional Service Connect defaults for the cluster.
     */
    serviceConnectDefaults?: ecs.ClusterServiceConnectDefaultsRequest;
    /**
     * User-defined tags to apply to the cluster.
     */
    tags?: Record<string, string>;
}
export interface Cluster extends Resource<"AWS.ECS.Cluster", ClusterProps, {
    /** The ARN of the cluster. */
    clusterArn: ClusterArn;
    /** The name of the cluster. */
    clusterName: ClusterName;
    /** The current status of the cluster, e.g. `ACTIVE`. */
    status: string;
    /** The cluster settings, e.g. Container Insights. */
    settings: ecs.ClusterSetting[];
    /** The execute-command configuration of the cluster. */
    configuration?: ecs.ClusterConfiguration;
    /** The capacity providers associated with the cluster. */
    capacityProviders: string[];
    /** The default capacity provider strategy for the cluster. */
    defaultCapacityProviderStrategy: ecs.CapacityProviderStrategyItem[];
    /** The default Service Connect namespace. */
    serviceConnectDefaults?: ecs.ClusterServiceConnectDefaultsRequest;
    /** The tags attached to the cluster. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon ECS cluster for running tasks and services.
 * ### Creating Clusters
 * **Example:** Default Cluster
 * ```typescript
 * const cluster = yield* Cluster("AppCluster", {});
 * ```
 *
 * @resource
 */
export declare const Cluster: import("../../Resource.ts").ResourceClass<Cluster>;
export declare const ClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<Cluster>, never, AWSEnvironment | import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Cluster.d.ts.map