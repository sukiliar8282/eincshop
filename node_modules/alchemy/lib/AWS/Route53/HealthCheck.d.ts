import * as route53 from "@distilled.cloud/aws/route-53";
import type * as Duration from "effect/Duration";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface HealthCheckProps {
    /**
     * Health check protocol/type (e.g. `"HTTP"`, `"HTTPS"`, `"TCP"`,
     * `"CALCULATED"`, `"CLOUDWATCH_METRIC"`). Immutable — changing it forces
     * replacement.
     */
    type: route53.HealthCheckType;
    /**
     * IP address of the endpoint to check.
     */
    ipAddress?: string;
    /**
     * Port of the endpoint to check.
     */
    port?: number;
    /**
     * Path requested for HTTP/HTTPS checks (e.g. `"/health"`).
     */
    resourcePath?: string;
    /**
     * Fully qualified domain name of the endpoint.
     */
    fullyQualifiedDomainName?: string;
    /**
     * String the response body must contain for the check to pass.
     */
    searchString?: string;
    /**
     * Time between checks, e.g. `"30 seconds"` or `Duration.seconds(10)` (a
     * bare number is milliseconds). Rounded to whole seconds on the wire
     * (10 or 30). Immutable — changing it forces replacement.
     * @default 30 seconds
     */
    requestInterval?: Duration.Input;
    /**
     * Number of consecutive failures before the endpoint is considered unhealthy.
     * @default 3
     */
    failureThreshold?: number;
    /**
     * Whether Route 53 measures latency. Immutable — changing it forces
     * replacement.
     */
    measureLatency?: boolean;
    /**
     * Invert the health check result.
     */
    inverted?: boolean;
    /**
     * Disable the health check (treated as healthy).
     */
    disabled?: boolean;
    /**
     * For CALCULATED checks, the number of child checks that must be healthy.
     */
    healthThreshold?: number;
    /**
     * For CALCULATED checks, the child health check IDs.
     */
    childHealthChecks?: string[];
    /**
     * Send SNI to the endpoint for HTTPS checks.
     */
    enableSNI?: boolean;
    /**
     * Regions from which Route 53 checks the endpoint.
     */
    regions?: route53.HealthCheckRegion[];
    /**
     * Tags applied to the health check.
     */
    tags?: Record<string, string>;
}
export interface HealthCheck extends Resource<"AWS.Route53.HealthCheck", HealthCheckProps, {
    /**
     * Health check ID.
     */
    id: string;
    /**
     * Alias of `id`.
     */
    healthCheckId: string;
    /**
     * Health check type.
     */
    type: route53.HealthCheckType;
}, never, Providers> {
}
/**
 * A Route 53 health check.
 *
 * `HealthCheck` monitors the health of an endpoint and can gate failover and
 * other routing policies on a `Record` via `record.healthCheckId`.
 * ### Creating a Health Check
 * **Example:** HTTP Health Check
 * ```typescript
 * const check = yield* HealthCheck("ApiHealth", {
 *   type: "HTTP",
 *   fullyQualifiedDomainName: "api.example.com",
 *   resourcePath: "/health",
 *   port: 80,
 *   requestInterval: "30 seconds",
 *   failureThreshold: 3,
 * });
 * ```
 *
 * ### Gating DNS Failover
 * **Example:** Fail Over a Record When the Check Fails
 * ```typescript
 * const check = yield* HealthCheck("PrimaryHealth", {
 *   type: "HTTPS",
 *   fullyQualifiedDomainName: "primary.example.com",
 *   resourcePath: "/health",
 *   port: 443,
 * });
 * // Route 53 answers with the PRIMARY record only while the check passes;
 * // see `Record` for the matching SECONDARY record.
 * const primary = yield* Record("Primary", {
 *   hostedZoneId: zone.id,
 *   name: "app.example.com",
 *   type: "A",
 *   ttl: "60 seconds",
 *   records: ["1.2.3.4"],
 *   setIdentifier: "primary",
 *   failover: "PRIMARY",
 *   healthCheckId: check.id,
 * });
 * ```
 *
 * @resource
 */
export declare const HealthCheck: import("../../Resource.ts").ResourceClass<HealthCheck>;
/**
 * Whether a Route 53 health check can be managed directly through Route 53.
 *
 * Health checks with `LinkedService` are owned by another AWS service (for
 * example, Cloud Map). Route 53 refuses direct deletion of those checks, and
 * the owning service may retain them as tombstones after its resource is
 * deleted. They therefore must not be returned to account-wide nuke inventory.
 */
export declare const isNukeableHealthCheck: (check: {
    LinkedService?: route53.LinkedService;
}) => boolean;
export declare const HealthCheckProvider: () => import("effect/Layer").Layer<Provider.Provider<HealthCheck>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=HealthCheck.d.ts.map