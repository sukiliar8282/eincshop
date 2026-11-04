import * as loadBalancers from "@distilled.cloud/cloudflare/load-balancers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.LoadBalancer.Pool";
type TypeId = typeof TypeId;
/**
 * A single origin server within a Load Balancing pool.
 */
export interface PoolOrigin {
    /**
     * The IP address (IPv4 or IPv6) or publicly-resolvable hostname of the
     * origin server.
     */
    address: string;
    /**
     * A human-identifiable name for the origin.
     */
    name?: string;
    /**
     * Whether to enable (the default) this origin within the pool.
     * @default true
     */
    enabled?: boolean;
    /**
     * Relative weight of this origin (`0`–`1`) for traffic distribution.
     * @default 1
     */
    weight?: number;
    /**
     * The port to override the standard port for this origin.
     */
    port?: number;
    /**
     * Request headers to send to this origin — typically a `Host` header.
     */
    header?: {
        host?: ReadonlyArray<string>;
    };
    /**
     * Whether to flatten a CNAME `address` to its final IP.
     */
    flattenCname?: boolean;
    /**
     * The virtual network subnet the origin belongs to (private origins).
     */
    virtualNetworkId?: string;
}
/**
 * Load shedding configuration for a pool.
 */
export interface PoolLoadShedding {
    /** Percent (0–100) of new (non-affine) traffic to shed. @default 0 */
    defaultPercent?: number;
    /** Policy for shedding new traffic. @default "random" */
    defaultPolicy?: "random" | "hash";
    /** Percent (0–100) of session-affine traffic to shed. @default 0 */
    sessionPercent?: number;
    /** Policy for shedding session-affine traffic. */
    sessionPolicy?: "hash";
}
/**
 * Filters pool/origin health notifications by resource type or health
 * status.
 */
export interface PoolNotificationFilter {
    origin?: {
        disable?: boolean;
        healthy?: boolean;
    };
    pool?: {
        disable?: boolean;
        healthy?: boolean;
    };
}
export interface PoolProps {
    /**
     * A short name (tag) for the pool. Only alphanumeric characters, hyphens,
     * and underscores are allowed. If omitted, a unique name is generated
     * from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The list of origins within this pool. Traffic directed at this pool is
     * balanced across all currently healthy origins.
     */
    origins: ReadonlyArray<PoolOrigin>;
    /**
     * A human-readable description of the pool.
     */
    description?: string;
    /**
     * Whether to enable (the default) or disable this pool. Disabled pools
     * receive no traffic and are excluded from health checks.
     * @default true
     */
    enabled?: boolean;
    /**
     * The ID of the Monitor to use for checking the health of origins within
     * this pool. Mutually exclusive with `monitorGroup`.
     */
    monitor?: string;
    /**
     * The ID of the Monitor Group to use for checking the health of origins
     * within this pool. Mutually exclusive with `monitor`.
     */
    monitorGroup?: string;
    /**
     * The minimum number of origins that must be healthy for this pool to
     * serve traffic.
     * @default 1
     */
    minimumOrigins?: number;
    /**
     * The latitude of the data center containing this pool's origins, in
     * decimal degrees. Must be set together with `longitude`.
     */
    latitude?: number;
    /**
     * The longitude of the data center containing this pool's origins, in
     * decimal degrees. Must be set together with `latitude`.
     */
    longitude?: number;
    /**
     * Load shedding policies and percentages for the pool.
     */
    loadShedding?: PoolLoadShedding;
    /**
     * How origins are selected for new sessions / traffic without session
     * affinity.
     * @default { policy: "random" }
     */
    originSteering?: {
        policy?: "random" | "hash" | "least_outstanding_requests" | "least_connections";
    };
    /**
     * Filter pool and origin health notifications by resource type or health
     * status.
     */
    notificationFilter?: PoolNotificationFilter;
    /**
     * Deprecated upstream — the email address to send health status
     * notifications to. Prefer Cloudflare's centralized notification service.
     */
    notificationEmail?: string;
}
export interface PoolAttributes {
    /** Cloudflare-assigned pool identifier. */
    poolId: string;
    /** The Cloudflare account the pool belongs to. */
    accountId: string;
    /** Pool name. */
    name: string;
    /** Whether the pool is enabled. */
    enabled: boolean;
    /** Resolved monitor id attached to the pool, if any. */
    monitor: string | undefined;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type Pool = Resource<TypeId, PoolProps, PoolAttributes, never, Providers>;
/**
 * A Cloudflare Load Balancing pool — an account-scoped group of origin
 * servers that Load Balancers route traffic to. Pools optionally reference
 * a {@link Monitor} for active health checking.
 *
 * Requires the Load Balancing subscription on the account; without it, pool
 * creation fails with the typed `PoolAccessFailed` error.
 * ### Creating a Pool
 * **Example:** Pool with one origin
 * ```typescript
 * const pool = yield* Cloudflare.LoadBalancer.Pool("ApiPool", {
 *   origins: [{ name: "origin-1", address: "203.0.113.10" }],
 * });
 * ```
 *
 * **Example:** Health-checked pool
 * ```typescript
 * const monitor = yield* Cloudflare.LoadBalancer.Monitor("ApiMonitor", {
 *   type: "https",
 *   path: "/health",
 *   expectedCodes: "2xx",
 * });
 *
 * const pool = yield* Cloudflare.LoadBalancer.Pool("ApiPool", {
 *   origins: [
 *     { name: "origin-1", address: "203.0.113.10", weight: 0.7 },
 *     { name: "origin-2", address: "203.0.113.11", weight: 0.3 },
 *   ],
 *   monitor: monitor.monitorId,
 *   minimumOrigins: 1,
 * });
 * ```
 *
 * ### Using with a Load Balancer
 * **Example:** Pool as default and fallback
 * ```typescript
 * yield* Cloudflare.LoadBalancer.LoadBalancer("ApiLb", {
 *   zoneId: zone.zoneId,
 *   name: "api.example.com",
 *   defaultPools: [pool.poolId],
 *   fallbackPool: pool.poolId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/load-balancing/pools/
 *
 * @resource
 * @product Load Balancers
 * @category Performance & Reliability
 */
export declare const Pool: import("../../Resource.ts").ResourceClass<Pool>;
/**
 * Returns true if the given value is a Pool resource.
 */
export declare const isPool: (value: unknown) => value is Pool;
export declare const PoolProvider: () => import("effect/Layer").Layer<Provider.Provider<Pool>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | loadBalancers.CloudflareOpContext>;
export {};
//# sourceMappingURL=Pool.d.ts.map