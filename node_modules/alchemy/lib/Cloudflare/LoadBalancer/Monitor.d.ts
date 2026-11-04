import * as loadBalancers from "@distilled.cloud/cloudflare/load-balancers";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.LoadBalancer.Monitor";
type TypeId = typeof TypeId;
/**
 * Protocol a Load Balancing monitor probes origins with.
 */
export type MonitorType = "http" | "https" | "tcp" | "udp_icmp" | "icmp_ping" | "smtp";
export interface MonitorProps {
    /**
     * The protocol to use for the health check.
     * @default "http"
     */
    type?: MonitorType;
    /**
     * Object description. Monitors have no name field, so the description
     * doubles as the monitor's identity for state recovery — if omitted, a
     * unique name is generated from the app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    description?: string;
    /**
     * The method to use for the health check. Defaults to `GET` for
     * HTTP/HTTPS based checks and `connection_established` for TCP based
     * health checks.
     */
    method?: string;
    /**
     * The endpoint path to conduct the health check against. Only valid for
     * HTTP and HTTPS monitors.
     * @default "/"
     */
    path?: string;
    /**
     * The port number to connect to for the health check. Required for TCP,
     * UDP, and SMTP checks; HTTP/HTTPS checks only need it for non-standard
     * ports.
     */
    port?: number;
    /**
     * The interval between each health check, in seconds. Shorter intervals
     * improve failover time but increase origin load. The allowed range is
     * plan-dependent.
     * @default 60
     */
    interval?: number;
    /**
     * The timeout (in seconds) before marking the health check as failed.
     * @default 5
     */
    timeout?: number;
    /**
     * The number of retries to attempt in case of a timeout before marking
     * the origin as unhealthy. Retries are attempted immediately.
     * @default 2
     */
    retries?: number;
    /**
     * To be marked healthy the monitored origin must pass this healthcheck N
     * consecutive times.
     * @default 0
     */
    consecutiveUp?: number;
    /**
     * To be marked unhealthy the monitored origin must fail this healthcheck
     * N consecutive times.
     * @default 0
     */
    consecutiveDown?: number;
    /**
     * The expected HTTP response code or code range of the health check
     * (e.g. `"2xx"`). Only valid for HTTP and HTTPS monitors.
     */
    expectedCodes?: string;
    /**
     * A case-insensitive sub-string to look for in the response body. If not
     * found, the origin is marked unhealthy. HTTP/HTTPS only.
     */
    expectedBody?: string;
    /**
     * Follow redirects returned by the origin. HTTP/HTTPS only.
     * @default false
     */
    followRedirects?: boolean;
    /**
     * Do not validate the certificate when the monitor uses HTTPS.
     * @default false
     */
    allowInsecure?: boolean;
    /**
     * The HTTP request headers to send in the health check (e.g. a `Host`
     * header). The `User-Agent` header cannot be overridden. HTTP/HTTPS only.
     */
    header?: Record<string, ReadonlyArray<string>>;
    /**
     * Assign this monitor to emulate the specified zone while probing.
     * HTTP/HTTPS only.
     */
    probeZone?: string;
}
export interface MonitorAttributes {
    /** Cloudflare-assigned monitor identifier. */
    monitorId: string;
    /** The Cloudflare account the monitor belongs to. */
    accountId: string;
    /** Monitor description (carries the physical name when generated). */
    description: string;
    /** Probe protocol. */
    type: MonitorType;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type Monitor = Resource<TypeId, MonitorProps, MonitorAttributes, never, Providers>;
/**
 * A Cloudflare Load Balancing monitor — an active health check (HTTP,
 * HTTPS, TCP, ICMP, or SMTP probe) that Load Balancing pools reference to
 * decide which origins are healthy.
 *
 * Monitors are account-scoped and have no name field; the `description`
 * carries the physical name so lost state can be recovered. All properties
 * are mutable in place.
 *
 * Requires the Load Balancing subscription on the account. The allowed
 * `interval` range is plan-dependent.
 * ### Creating a Monitor
 * **Example:** HTTPS health check
 * ```typescript
 * const monitor = yield* Cloudflare.LoadBalancer.Monitor("ApiMonitor", {
 *   type: "https",
 *   path: "/health",
 *   expectedCodes: "2xx",
 * });
 * ```
 *
 * **Example:** TCP port check
 * ```typescript
 * const tcp = yield* Cloudflare.LoadBalancer.Monitor("DbMonitor", {
 *   type: "tcp",
 *   port: 5432,
 * });
 * ```
 *
 * ### Using with a Pool
 * **Example:** Attach the monitor to a pool
 * ```typescript
 * const pool = yield* Cloudflare.LoadBalancer.Pool("ApiPool", {
 *   origins: [{ name: "origin-1", address: "203.0.113.10" }],
 *   monitor: monitor.monitorId,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/load-balancing/monitors/
 *
 * @resource
 * @product Load Balancers
 * @category Performance & Reliability
 */
export declare const Monitor: import("../../Resource.ts").ResourceClass<Monitor>;
/**
 * Returns true if the given value is a Monitor resource.
 */
export declare const isMonitor: (value: unknown) => value is Monitor;
export declare const MonitorProvider: () => import("effect/Layer").Layer<Provider.Provider<Monitor>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | loadBalancers.CloudflareOpContext>;
export {};
//# sourceMappingURL=Monitor.d.ts.map