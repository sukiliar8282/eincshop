import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface ServiceDnsRecord {
    /**
     * The DNS record type Cloud Map creates in the namespace's hosted zone
     * when an instance is registered. Changing the set of record types
     * replaces the service.
     */
    type: "A" | "AAAA" | "SRV" | "CNAME";
    /**
     * The TTL of the DNS record (e.g. `"10 seconds"` or
     * `Duration.seconds(10)`; a bare number is milliseconds). Mutable.
     */
    ttl: Duration.Input;
}
export interface ServiceProps {
    /**
     * Name of the service — for DNS namespaces this becomes the DNS label
     * (`{name}.{namespace}`). Changing the name replaces the service.
     * @default a generated DNS-compatible physical name
     */
    name?: string;
    /**
     * The ID of the namespace to register the service in. Changing the
     * namespace replaces the service.
     */
    namespaceId: string;
    /**
     * A description for the service.
     */
    description?: string;
    /**
     * DNS records Cloud Map creates when instances are registered. Omit for
     * API-only (HTTP namespace) services. TTLs are mutable; changing the set
     * of record types replaces the service.
     */
    dnsRecords?: ServiceDnsRecord[];
    /**
     * How Route 53 responds to DNS queries: `MULTIVALUE` returns up to eight
     * healthy records, `WEIGHTED` returns one. Create-only — changing it
     * replaces the service.
     * @default "MULTIVALUE"
     */
    routingPolicy?: "MULTIVALUE" | "WEIGHTED";
    /**
     * A Route 53 health check for instances (public DNS namespaces only).
     * Mutually exclusive with `healthCheckCustomConfig`.
     */
    healthCheckConfig?: {
        /** The endpoint protocol Route 53 health-checks: HTTP, HTTPS, or TCP. */
        type: "HTTP" | "HTTPS" | "TCP";
        /** The path Route 53 requests, e.g. `/health` (HTTP/HTTPS only). */
        resourcePath?: string;
        /** Consecutive failures before the instance is considered unhealthy. */
        failureThreshold?: number;
    };
    /**
     * Custom health checking — instance health is pushed via
     * `UpdateInstanceCustomHealthStatus` instead of probed by Route 53.
     * Create-only: it cannot be added, changed, or removed after creation, so
     * any change replaces the service.
     */
    healthCheckCustomConfig?: {
        /** Deprecated by AWS (always behaves as 1); retained for parity. */
        failureThreshold?: number;
    };
    /**
     * Set to `"HTTP"` to force API-only discovery even inside a DNS namespace.
     * Create-only — changing it replaces the service.
     */
    type?: "HTTP";
    /**
     * Custom service-level attributes (up to 30 key/value pairs) stored on the
     * service and readable at runtime via `GetServiceAttributes`. Mutable —
     * reconcile diffs the observed attributes against this map, upserting
     * changed keys and deleting keys no longer declared.
     */
    attributes?: Record<string, string>;
    /**
     * Tags to apply to the service. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface Service extends Resource<"AWS.CloudMap.Service", ServiceProps, {
    /**
     * The unique identifier of the service.
     */
    serviceId: string;
    /**
     * The ARN of the service.
     */
    serviceArn: string;
    /**
     * Name of the service.
     */
    serviceName: string;
    /**
     * The namespace the service belongs to.
     */
    namespaceId: string;
    /**
     * Name of the namespace the service belongs to.
     */
    namespaceName: string;
}, {}, Providers> {
}
/**
 * An AWS Cloud Map service — a named entry in a namespace that instances
 * register against. For DNS namespaces, Cloud Map creates the configured DNS
 * records per registered instance; every service is also queryable via the
 * `DiscoverInstances` API. This is what ECS `serviceRegistries[].registryArn`
 * consumes.
 * ### Creating Services
 * **Example:** DNS Service with A Records
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const namespace = yield* AWS.CloudMap.PrivateDnsNamespace("AppNamespace", {
 *   name: "internal.example.com",
 *   vpc: vpc.vpcId,
 * });
 *
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 *   dnsRecords: [{ type: "A", ttl: "10 seconds" }],
 *   routingPolicy: "MULTIVALUE",
 * });
 * ```
 *
 * **Example:** API-only Service in an HTTP Namespace
 * ```typescript
 * const namespace = yield* AWS.CloudMap.HttpNamespace("AppNamespace");
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 * });
 * ```
 *
 * **Example:** Service with Custom Health Checks
 * ```typescript
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 *   dnsRecords: [{ type: "SRV", ttl: "10 seconds" }],
 *   healthCheckCustomConfig: {},
 * });
 * ```
 *
 * **Example:** Service with Custom Attributes
 * ```typescript
 * const service = yield* AWS.CloudMap.Service("Backend", {
 *   namespaceId: namespace.namespaceId,
 *   attributes: { tier: "backend", version: "2" },
 * });
 * ```
 *
 * ### Discovering Instances
 * **Example:** Discover Healthy Instances from a Lambda
 * ```typescript
 * // init
 * const discover = yield* AWS.CloudMap.DiscoverInstances(service);
 *
 * // runtime
 * const { Instances } = yield* discover({ HealthStatus: "HEALTHY" });
 * ```
 *
 * @resource
 */
export declare const Service: import("../../Resource.ts").ResourceClass<Service>;
export declare const ServiceProvider: () => import("effect/Layer").Layer<Provider.Provider<Service>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Service.d.ts.map