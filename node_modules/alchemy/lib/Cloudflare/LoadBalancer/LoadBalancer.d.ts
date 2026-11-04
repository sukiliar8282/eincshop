import * as loadBalancers from "@distilled.cloud/cloudflare/load-balancers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.LoadBalancer.LoadBalancer";
type TypeId = typeof TypeId;
/**
 * Steering policy for a Load Balancer.
 */
export type SteeringPolicy = "off" | "geo" | "random" | "dynamic_latency" | "proximity" | "least_outstanding_requests" | "least_connections" | "";
/**
 * Session affinity mode for a Load Balancer.
 */
export type SessionAffinity = "none" | "cookie" | "ip_cookie" | "header";
/**
 * Session affinity attributes for a Load Balancer.
 */
export interface SessionAffinityAttributes {
    /** Seconds to drain an origin of affine sessions before removal. */
    drainDuration?: number;
    /** Headers to base header-mode session affinity on. */
    headers?: ReadonlyArray<string>;
    /** Whether all configured headers must match. */
    requireAllHeaders?: boolean;
    /** SameSite attribute of the affinity cookie. */
    samesite?: "Auto" | "Lax" | "None" | "Strict";
    /** Secure attribute of the affinity cookie. */
    secure?: "Auto" | "Always" | "Never";
    /** Failover behavior when an affine origin becomes unavailable. */
    zeroDowntimeFailover?: "none" | "temporary" | "sticky";
}
/**
 * Location strategy for non-proxied (DNS-steered) Load Balancers.
 */
export interface LocationStrategy {
    /** Resolution mode used to determine the client's location. */
    mode?: "pop" | "resolver_ip";
    /** When to prefer the EDNS Client Subnet over the resolver IP. */
    preferEcs?: "always" | "never" | "proximity" | "geo";
}
export interface Props {
    /**
     * Zone the load balancer lives in. Stable — changing the zone triggers
     * replacement.
     */
    zoneId: string;
    /**
     * The DNS hostname to associate with the Load Balancer (e.g.
     * `lb.example.com`). If this hostname already exists as a DNS record,
     * the Load Balancer takes precedence. Mutable in place.
     */
    name: string;
    /**
     * Pool IDs ordered by their failover priority. Used by default, or when
     * region/country/PoP pools are not configured for a request.
     */
    defaultPools: ReadonlyArray<string>;
    /**
     * The pool ID to use when all other pools are detected as unhealthy.
     */
    fallbackPool: string;
    /**
     * Object description.
     */
    description?: string;
    /**
     * Whether the hostname is gray clouded (false) or orange clouded /
     * proxied through Cloudflare (true).
     * @default false
     */
    proxied?: boolean;
    /**
     * TTL (seconds) of the DNS entry for the IP address returned by this
     * load balancer. Only applies to unproxied load balancers — the API
     * rejects it when `proxied: true`.
     * @default 30
     */
    ttl?: number;
    /**
     * Steering policy for this load balancer.
     * @default ""
     */
    steeringPolicy?: SteeringPolicy;
    /**
     * Type of session affinity to use.
     * @default "none"
     */
    sessionAffinity?: SessionAffinity;
    /**
     * Time, in seconds, until a client's session expires after being
     * created.
     * @default 82800
     */
    sessionAffinityTtl?: number;
    /**
     * Attributes configuring session affinity behavior.
     */
    sessionAffinityAttributes?: SessionAffinityAttributes;
    /**
     * Routing modifications in response to dynamic conditions (e.g.
     * zero-downtime failover between health probes).
     */
    adaptiveRouting?: {
        failoverAcrossPools?: boolean;
    };
    /**
     * Location-based steering behavior for non-proxied requests.
     */
    locationStrategy?: LocationStrategy;
    /**
     * Pool weights for `random` / `least_outstanding_requests` /
     * `least_connections` steering.
     */
    randomSteering?: {
        defaultWeight?: number;
        poolWeights?: Record<string, number>;
    };
    /**
     * Region code → ordered pool IDs for that region. Regions not defined
     * fall back to `defaultPools`.
     */
    regionPools?: Record<string, ReadonlyArray<string>>;
    /**
     * Country code → ordered pool IDs for that country. Countries not
     * defined fall back to the corresponding region pool mapping.
     */
    countryPools?: Record<string, ReadonlyArray<string>>;
    /**
     * Enterprise only — Cloudflare PoP identifier → ordered pool IDs for
     * that PoP.
     */
    popPools?: Record<string, ReadonlyArray<string>>;
}
export interface Attributes {
    /** Cloudflare-assigned load balancer identifier. */
    loadBalancerId: string;
    /** Zone that owns the load balancer. */
    zoneId: string;
    /** DNS hostname of the load balancer. */
    name: string;
    /** Whether the load balancer is enabled. */
    enabled: boolean;
    /** Whether the hostname is proxied (orange clouded). */
    proxied: boolean;
    /** Resolved steering policy. */
    steeringPolicy: string;
    /** Resolved default pool ids. */
    defaultPools: ReadonlyArray<string>;
    /** Resolved fallback pool id. */
    fallbackPool: string;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type LoadBalancer = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A Cloudflare Load Balancer — a zone-level DNS hostname that distributes
 * traffic across {@link Pool}s with health-based failover,
 * geo/latency steering, and session affinity.
 *
 * Requires the Load Balancing subscription to be enabled for the zone;
 * without it, creation fails with the typed `LoadBalancingNotEnabledForZone`
 * error.
 * ### Creating a Load Balancer
 * **Example:** DNS-only (unproxied) load balancer
 * ```typescript
 * const lb = yield* Cloudflare.LoadBalancer.LoadBalancer("ApiLb", {
 *   zoneId: zone.zoneId,
 *   name: "api.example.com",
 *   defaultPools: [pool.poolId],
 *   fallbackPool: pool.poolId,
 *   proxied: false,
 *   ttl: 30,
 * });
 * ```
 *
 * **Example:** Proxied load balancer with steering and affinity
 * ```typescript
 * const lb = yield* Cloudflare.LoadBalancer.LoadBalancer("AppLb", {
 *   zoneId: zone.zoneId,
 *   name: "app.example.com",
 *   defaultPools: [primary.poolId, secondary.poolId],
 *   fallbackPool: secondary.poolId,
 *   proxied: true,
 *   steeringPolicy: "random",
 *   sessionAffinity: "cookie",
 * });
 * ```
 *
 * ### Geo steering
 * **Example:** Region pools
 * ```typescript
 * yield* Cloudflare.LoadBalancer.LoadBalancer("GeoLb", {
 *   zoneId: zone.zoneId,
 *   name: "geo.example.com",
 *   defaultPools: [us.poolId],
 *   fallbackPool: us.poolId,
 *   steeringPolicy: "geo",
 *   regionPools: {
 *     WEU: [eu.poolId],
 *     ENAM: [us.poolId],
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/load-balancing/
 *
 * @resource
 * @product Load Balancers
 * @category Performance & Reliability
 */
export declare const LoadBalancer: import("../../Resource.ts").ResourceClass<LoadBalancer>;
/**
 * Returns true if the given value is a LoadBalancer resource.
 */
export declare const isLoadBalancer: (value: unknown) => value is LoadBalancer;
export declare const LoadBalancerProvider: () => import("effect/Layer").Layer<Provider.Provider<LoadBalancer>, never, CloudflareEnvironment | loadBalancers.CloudflareOpContext>;
export {};
//# sourceMappingURL=LoadBalancer.d.ts.map