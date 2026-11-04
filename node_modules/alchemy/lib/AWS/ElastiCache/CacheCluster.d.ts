import * as elasticache from "@distilled.cloud/aws/elasticache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface CacheClusterProps {
    /** Cache cluster identifier. Generated deterministically when omitted. */
    cacheClusterId?: string;
    /** Memcached is the supported topology for this resource. */
    engine?: "memcached";
    engineVersion?: string;
    /** ElastiCache node type. Must start with `cache.`, for example `cache.t4g.micro`. @default cache.t4g.micro */
    nodeType?: `cache.${string}`;
    /** Number of Memcached nodes. */
    numCacheNodes?: number;
    subnetGroupName?: string;
    securityGroupIds?: string[];
    parameterGroupName?: string;
    preferredAvailabilityZones?: string[];
    maintenanceWindow?: string;
    notificationTopicArn?: string;
    autoMinorVersionUpgrade?: boolean;
    port?: number;
    networkType?: elasticache.NetworkType;
    ipDiscovery?: elasticache.IpDiscovery;
    tags?: Record<string, string>;
}
export interface CacheNodeEndpoint {
    address: string;
    port: number;
}
export interface CacheCluster extends Resource<"AWS.ElastiCache.CacheCluster", CacheClusterProps, {
    cacheClusterId: string;
    cacheClusterArn: string;
    status: string;
    engine: string;
    engineVersion: string | undefined;
    nodeType: string | undefined;
    endpoints: CacheNodeEndpoint[];
    transitEncryptionEnabled: boolean;
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * A provisioned Memcached cluster. Use {@link ReplicationGroup} for Valkey or Redis.
 *
 * ### Creating a Memcached Cluster
 * **Example:** Two-node cluster in a VPC
 * ```typescript
 * const cache = yield* CacheCluster("Cache", {
 *   subnetGroupName: subnets.subnetGroupName,
 *   securityGroupIds: [cacheSecurityGroup.groupId],
 *   numCacheNodes: 2,
 * });
 * ```
 *
 * @resource
 */
export declare const CacheCluster: import("../../Resource.ts").ResourceClass<CacheCluster>;
export declare const CacheClusterProvider: () => import("effect/Layer").Layer<Provider.Provider<CacheCluster>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=CacheCluster.d.ts.map