import * as healthchecks from "@distilled.cloud/cloudflare/healthchecks";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Healthcheck.Healthcheck";
type TypeId = typeof TypeId;
/**
 * Protocol used by a standalone health check probe.
 */
export type Type = "HTTP" | "HTTPS" | "TCP";
/**
 * Region a health check can probe from. `null`/omitted lets Cloudflare pick
 * a default region; multiple regions require a Business or Enterprise plan.
 */
export type Region = "WNAM" | "ENAM" | "WEU" | "EEU" | "NSAM" | "SSAM" | "OC" | "ME" | "NAF" | "SAF" | "IN" | "SEAS" | "NEAS" | "ALL_REGIONS";
/**
 * Health status Cloudflare reports for the monitored origin. New checks
 * start as `unknown` until the first probes complete.
 */
export type Status = "unknown" | "healthy" | "unhealthy" | "suspended";
/**
 * Parameters specific to an HTTP or HTTPS health check.
 */
export interface HttpConfig {
    /**
     * Do not validate the certificate when the health check uses HTTPS.
     * @default false
     */
    allowInsecure?: boolean;
    /**
     * A case-insensitive substring to look for in the response body. If this
     * string is not found, the origin will be marked as unhealthy.
     */
    expectedBody?: string;
    /**
     * The expected HTTP response codes (e.g. `"200"`) or code ranges
     * (e.g. `"2xx"`) of the health check.
     * @default ["200"]
     */
    expectedCodes?: string[];
    /**
     * Follow redirects if the origin returns a 3xx status code.
     * @default false
     */
    followRedirects?: boolean;
    /**
     * HTTP request headers to send in the health check. It is recommended to
     * set a `Host` header by default. The `User-Agent` header cannot be
     * overridden.
     */
    header?: Record<string, string[]>;
    /**
     * The HTTP method to use for the health check.
     * @default "GET"
     */
    method?: "GET" | "HEAD";
    /**
     * The endpoint path to health check against.
     * @default "/"
     */
    path?: string;
    /**
     * Port number to connect to for the health check.
     * @default 80 for HTTP, 443 for HTTPS
     */
    port?: number;
}
/**
 * Parameters specific to a TCP health check.
 */
export interface TcpConfig {
    /**
     * The TCP connection method to use for the health check.
     * @default "connection_established"
     */
    method?: "connection_established";
    /**
     * Port number to connect to for the health check.
     * @default 80
     */
    port?: number;
}
export interface Props {
    /**
     * Zone the health check belongs to. Stable — changing the zone triggers
     * a replacement.
     */
    zoneId: string;
    /**
     * A short name to identify the health check. Only alphanumeric
     * characters, hyphens and underscores are allowed. If omitted, a unique
     * name is generated from the app, stage, and logical ID.
     *
     * Mutable — Cloudflare supports renaming in place.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * The hostname or IP address of the origin server to run health checks
     * on.
     */
    address: string;
    /**
     * The protocol to use for the health check. Currently supported
     * protocols are `HTTP`, `HTTPS` and `TCP`.
     * @default "HTTP"
     */
    type?: Type;
    /**
     * A human-readable description of the health check.
     */
    description?: string;
    /**
     * A list of regions from which to run health checks. Omitting it lets
     * Cloudflare pick a default region. Multiple regions require a Business
     * or Enterprise plan.
     */
    checkRegions?: Region[];
    /**
     * The number of consecutive fails required from a health check before
     * changing the health to unhealthy.
     * @default 1
     */
    consecutiveFails?: number;
    /**
     * The number of consecutive successes required from a health check
     * before changing the health to healthy.
     * @default 1
     */
    consecutiveSuccesses?: number;
    /**
     * The interval between each health check, in seconds. Shorter intervals
     * may give quicker notifications but increase load on the origin.
     * Plan-gated minimums apply (Pro: 60, Business: 15, Enterprise: 10).
     * @default 60
     */
    interval?: number;
    /**
     * The number of retries to attempt in case of a timeout before marking
     * the origin as unhealthy. Retries are attempted immediately.
     * @default 2
     */
    retries?: number;
    /**
     * The timeout (in seconds) before marking the health check as failed.
     * @default 5
     */
    timeout?: number;
    /**
     * If suspended, no health checks are sent to the origin.
     * @default false
     */
    suspended?: boolean;
    /**
     * Parameters specific to an HTTP or HTTPS health check. Only valid when
     * `type` is `HTTP` or `HTTPS`.
     */
    httpConfig?: HttpConfig;
    /**
     * Parameters specific to a TCP health check. Only valid when `type` is
     * `TCP`.
     */
    tcpConfig?: TcpConfig;
}
export interface Attributes {
    /** Cloudflare-assigned health check identifier. */
    healthcheckId: string;
    /** Zone that owns this health check. */
    zoneId: string;
    /** Health check name. */
    name: string;
    /** The hostname or IP address being monitored. */
    address: string;
    /** Probe protocol (`HTTP`, `HTTPS` or `TCP`). */
    type: Type;
    /** Current origin status according to the health check. */
    status: Status;
    /** The current failure reason if status is unhealthy. */
    failureReason: string | undefined;
    /** Whether probing is suspended. */
    suspended: boolean;
    /** Probe interval in seconds. */
    interval: number;
    /** Number of immediate retries on timeout. */
    retries: number;
    /** Probe timeout in seconds. */
    timeout: number;
    /** ISO8601 creation timestamp. */
    createdOn: string | undefined;
    /** ISO8601 last-modified timestamp. */
    modifiedOn: string | undefined;
}
export type Healthcheck = Resource<TypeId, Props, Attributes, never, Providers>;
/**
 * A Cloudflare standalone Health Check — monitors an origin server from
 * Cloudflare's edge and powers Health Check notifications and analytics.
 *
 * Zone-scoped and available on paid zone plans (Pro: 2 checks,
 * Business: 10, Enterprise: more). Distinct from Load Balancing
 * *Monitors*, which are account-scoped and attached to LB pools.
 *
 * Every property except `zoneId` is mutable in place (the API supports
 * full PUT updates, including renames); changing the zone triggers a
 * replacement.
 *
 * Safety: health checks carry no ownership markers, so when there is no
 * prior state `read` matches by deterministic name and reports an
 * existing check as `Unowned` — the engine refuses to take it over
 * unless `--adopt` (or `adopt(true)`) is set.
 * ### Creating a Health Check
 * **Example:** Basic HTTP health check
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("origin-check", {
 *   zoneId: zone.zoneId,
 *   address: "origin.example.com",
 * });
 * ```
 *
 * **Example:** HTTPS health check with custom path and expected codes
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("api-health", {
 *   zoneId: zone.zoneId,
 *   address: "api.example.com",
 *   type: "HTTPS",
 *   interval: 60,
 *   retries: 2,
 *   timeout: 5,
 *   httpConfig: {
 *     path: "/healthz",
 *     expectedCodes: ["200"],
 *     followRedirects: true,
 *   },
 * });
 * ```
 *
 * ### TCP health checks
 * **Example:** Probe a TCP port
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("db-port", {
 *   zoneId: zone.zoneId,
 *   address: "db.example.com",
 *   type: "TCP",
 *   tcpConfig: { port: 5432 },
 * });
 * ```
 *
 * ### Suspending a check
 * **Example:** Temporarily stop probing the origin
 * ```typescript
 * const check = yield* Cloudflare.Healthcheck.Healthcheck("origin-check", {
 *   zoneId: zone.zoneId,
 *   address: "origin.example.com",
 *   suspended: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/health-checks/
 *
 * @resource
 * @product Health Checks
 * @category Performance & Reliability
 */
export declare const Healthcheck: import("../../Resource.ts").ResourceClass<Healthcheck>;
/**
 * Returns true if the given value is a Healthcheck resource.
 */
export declare const isHealthcheck: (value: unknown) => value is Healthcheck;
export declare const HealthcheckProvider: () => import("effect/Layer").Layer<Provider.Provider<Healthcheck>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | healthchecks.CloudflareOpContext>;
export {};
//# sourceMappingURL=Healthcheck.d.ts.map