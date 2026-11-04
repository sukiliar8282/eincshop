import * as elasticache from "@distilled.cloud/aws/elasticache";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/**
 * Cache engine for a serverless cache.
 */
export type ServerlessCacheEngine = "valkey" | "redis" | "memcached";
/**
 * Usage limits that cap how much a serverless cache can consume. Setting
 * low maximums is the primary cost-control lever — serverless caches bill
 * for data stored (GB-hours) and compute (ECPUs) with a monthly floor.
 */
export interface ServerlessCacheUsageLimits {
    /**
     * Cached data storage limits in GB.
     * The service-minimum for `maximum` is 1 GB.
     */
    dataStorage?: {
        /** Maximum data storage in GB. */
        maximum?: number;
        /** Minimum (pre-provisioned) data storage in GB. */
        minimum?: number;
    };
    /**
     * ElastiCache Processing Unit (ECPU) rate limits.
     * The service-minimum for `maximum` is 1000 ECPUs/second.
     */
    ecpuPerSecond?: {
        /** Maximum ECPUs per second. */
        maximum?: number;
        /** Minimum (pre-provisioned) ECPUs per second. */
        minimum?: number;
    };
}
export interface ServerlessCacheProps {
    /**
     * Name of the serverless cache. Must be 1-40 alphanumeric characters or
     * hyphens. If omitted, a deterministic physical name is generated.
     * Changing the name replaces the cache.
     */
    serverlessCacheName?: string;
    /**
     * Cache engine.
     * @default "valkey"
     */
    engine?: ServerlessCacheEngine;
    /**
     * Major engine version, e.g. `"8"` for valkey or `"7"` for redis.
     * @default latest for the engine
     */
    majorEngineVersion?: string;
    /**
     * Human-readable description of the cache.
     */
    description?: string;
    /**
     * Usage limits capping storage (GB) and compute (ECPUs/second).
     * Strongly recommended for cost control.
     */
    cacheUsageLimits?: ServerlessCacheUsageLimits;
    /**
     * Customer-managed KMS key for encryption at rest. Changing the key
     * replaces the cache.
     * @default AWS-owned key
     */
    kmsKeyId?: string;
    /**
     * VPC security groups that control network access to the cache endpoint.
     * @default the VPC's default security group
     */
    securityGroupIds?: string[];
    /**
     * VPC subnets the cache is reachable from. Changing subnets replaces the
     * cache.
     * @default subnets of the account's default VPC
     */
    subnetIds?: string[];
    /**
     * User group for RBAC authentication (valkey/redis only).
     */
    userGroupId?: string;
    /**
     * Days to retain automatic daily snapshots. 0 disables automatic
     * snapshots.
     * @default 0
     */
    snapshotRetentionLimit?: number;
    /**
     * Daily time window (UTC, `HH:MM`) when automatic snapshots are taken.
     */
    dailySnapshotTime?: string;
    /**
     * IP discovery network type. Changing this replaces the cache.
     * @default "ipv4"
     */
    networkType?: elasticache.NetworkType;
    /**
     * ARNs of snapshots to seed the cache from at creation (create-only).
     */
    snapshotArnsToRestore?: string[];
    /**
     * User-defined tags for the cache.
     */
    tags?: Record<string, string>;
}
export interface ServerlessCache extends Resource<"AWS.ElastiCache.ServerlessCache", ServerlessCacheProps, {
    /** The name of the serverless cache. */
    serverlessCacheName: string;
    /** The ARN of the serverless cache. */
    serverlessCacheArn: string;
    /** The cache status (e.g. `creating`, `available`, `modifying`). */
    status: string;
    /** The cache engine (`valkey`, `redis`, or `memcached`). */
    engine: string;
    /** The major engine version (e.g. `8`). */
    majorEngineVersion: string | undefined;
    /** The full engine version the cache is running. */
    fullEngineVersion: string | undefined;
    /** The DNS hostname of the primary endpoint. */
    endpointAddress: string;
    /** The port of the primary endpoint (6379 for valkey/redis, 11211 for memcached). */
    endpointPort: number;
    /** The DNS hostname of the reader endpoint, when the engine exposes one. */
    readerEndpointAddress: string | undefined;
    /** The port of the reader endpoint, when the engine exposes one. */
    readerEndpointPort: number | undefined;
    /** The IDs of the security groups associated with the cache. */
    securityGroupIds: string[];
    /** The IDs of the subnets the cache is deployed in. */
    subnetIds: string[];
    /** The tags applied to the cache. */
    tags: Record<string, string>;
}, never, Providers> {
}
/**
 * An Amazon ElastiCache serverless cache (valkey, redis, or memcached).
 *
 * Serverless caches scale storage and compute automatically and are only
 * reachable from inside a VPC. They are metered while they exist (with a
 * monthly minimum), so set `cacheUsageLimits` and destroy caches you are
 * not using.
 * ### Creating a Serverless Cache
 * **Example:** Valkey Cache with Cost-Control Limits
 * ```typescript
 * const cache = yield* ServerlessCache("SessionCache", {
 *   engine: "valkey",
 *   cacheUsageLimits: {
 *     dataStorage: { maximum: 1 },
 *     ecpuPerSecond: { maximum: 1000 },
 *   },
 * });
 * ```
 *
 * **Example:** Redis Cache in Specific Subnets
 * ```typescript
 * const cache = yield* ServerlessCache("Cache", {
 *   engine: "redis",
 *   majorEngineVersion: "7",
 *   subnetIds: [subnetA.subnetId, subnetB.subnetId],
 *   securityGroupIds: [cacheSecurityGroup.securityGroupId],
 * });
 * ```
 *
 * ### Connecting from a Lambda Function
 * **Example:** Bind Connection Info into a Function
 * ```typescript
 * const connect = yield* ElastiCache.Connect(cache);
 * // inside a handler:
 * const { host, port, tls } = yield* connect;
 * ```
 *
 * @resource
 */
export declare const ServerlessCache: import("../../Resource.ts").ResourceClass<ServerlessCache>;
export declare const ServerlessCacheProvider: () => import("effect/Layer").Layer<Provider.Provider<ServerlessCache>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=ServerlessCache.d.ts.map