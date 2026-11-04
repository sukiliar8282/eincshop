import { Services } from "@distilled.cloud/hetzner";
import * as Effect from "effect/Effect";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Certificate } from "./Certificate.ts";
import type { Network } from "./Network.ts";
import type { Providers } from "./Providers.ts";
/**
 * A resource-valued prop: the resource itself, or an Effect that produces
 * it (so `yield* Server(...)` and `Server(...)` both type-check).
 */
type Ref<T> = T | Effect.Effect<T, never, Providers>;
/**
 * Server identity a Load Balancer target can point at. A `Hetzner.Server`
 * resource satisfies this via `serverId`.
 */
export type LoadBalancerServer = {
    readonly serverId: number;
};
export type LoadBalancerAlgorithm = "round_robin" | "least_connections";
export type LoadBalancerProtocol = "tcp" | "http" | "https";
export type HealthCheckProtocol = "tcp" | "http";
export type TargetHealthStatus = "healthy" | "unhealthy" | "unknown";
export interface LoadBalancerHealthCheckHttp {
    /**
     * Host header sent with the HTTP health check. `null` omits the header.
     */
    domain?: string | null;
    /**
     * HTTP path used for the health check.
     * @default "/"
     */
    path?: string;
    /**
     * Substring that must appear in the health-check response body.
     */
    response?: string;
    /**
     * Status codes that count as healthy. `?` and `*` wildcards are allowed.
     * @default ["2??", "3??"]
     */
    statusCodes?: string[];
    /**
     * Use HTTPS for the health-check request.
     * @default false
     */
    tls?: boolean;
}
export interface LoadBalancerHealthCheck {
    /**
     * Health-check protocol. `tcp` for a connect check; `http` for an HTTP GET.
     */
    protocol: HealthCheckProtocol;
    /**
     * Port the health check is performed on.
     */
    port: number;
    /**
     * Interval between checks, in seconds.
     * @default 15
     */
    interval?: number;
    /**
     * Per-attempt timeout, in seconds.
     * @default 10
     */
    timeout?: number;
    /**
     * Consecutive failures (or successes) before flipping healthy/unhealthy.
     * @default 3
     */
    retries?: number;
    /**
     * Extra options when `protocol` is `http`.
     */
    http?: LoadBalancerHealthCheckHttp;
}
export interface LoadBalancerServiceHttp {
    /**
     * Cookie name used for sticky sessions.
     * @default "HCLBSTICKY"
     */
    cookieName?: string;
    /**
     * Sticky-session cookie lifetime in seconds.
     * @default 300
     */
    cookieLifetime?: number;
    /**
     * Idle timeout in seconds for client and server connections.
     * @default 15
     */
    timeoutIdle?: number;
    /**
     * Pin a client to one target via a cookie.
     * @default false
     */
    stickySessions?: boolean;
    /**
     * Redirect HTTP to HTTPS. Only valid when the service protocol is `https`.
     * @default false
     */
    redirectHttp?: boolean;
    /**
     * Certificates used for TLS termination. Empty means TLS passthrough.
     * Accepts `Hetzner.Certificate` resources.
     */
    certificates?: Array<Ref<Certificate>>;
}
export interface LoadBalancerService {
    /**
     * Listener protocol.
     */
    protocol: LoadBalancerProtocol;
    /**
     * Port the Load Balancer listens on. Unique per Load Balancer.
     */
    listenPort: number;
    /**
     * Port traffic is forwarded to on each target.
     */
    destinationPort: number;
    /**
     * Enable the PROXY protocol on this service.
     * @default false
     */
    proxyprotocol?: boolean;
    /**
     * Health check. Defaults to a TCP (or HTTP, for `http`/`https` services)
     * check on `destinationPort`.
     */
    healthCheck?: LoadBalancerHealthCheck;
    /**
     * HTTP/HTTPS options. Ignored for `tcp` services.
     */
    http?: LoadBalancerServiceHttp;
}
export type LoadBalancerTarget = {
    type: "server";
    /**
     * Server to receive traffic. Accepts a `Hetzner.Server` or `{ serverId }`.
     */
    server: Ref<LoadBalancerServer>;
    /**
     * Route via the Server's private IP. Requires the Server and Load
     * Balancer to share a Network.
     * @default false
     */
    usePrivateIp?: boolean;
    /**
     * Optional public IP of the Server to use as the target (Primary IPv4
     * or an IPv6 host in the Server's `/64`).
     */
    ip?: string;
} | {
    type: "label_selector";
    /**
     * Label selector used to pick target Servers.
     */
    selector: string;
    /**
     * Route via each Server's private IP.
     * @default false
     */
    usePrivateIp?: boolean;
} | {
    type: "ip";
    /**
     * Public or vSwitch IP of a Hetzner Online Root Server owned by the
     * project owner.
     */
    ip: string;
};
export interface LoadBalancerProps {
    /**
     * Name of the Load Balancer. Must be unique per project, 1–64 characters.
     * If omitted, a unique name is generated from the stack, stage and
     * logical ID.
     */
    name?: string;
    /**
     * Load Balancer type (`lb11`, `lb21`, `lb31`, …). Changing to a larger
     * type updates in place; Hetzner cannot downgrade a type.
     * @default "lb11"
     */
    loadBalancerType?: string;
    /**
     * Location to create the Load Balancer in (`nbg1`, `fsn1`, `hel1`, …).
     * Mutually exclusive with `networkZone`. Cannot be changed after
     * creation — changing it replaces the Load Balancer.
     * @default "nbg1"
     */
    location?: string;
    /**
     * Network zone (`eu-central`, `us-east`, …). Mutually exclusive with
     * `location`. Cannot be changed after creation.
     */
    networkZone?: string;
    /**
     * Balancing algorithm.
     * @default "round_robin"
     */
    algorithm?: LoadBalancerAlgorithm;
    /**
     * Listeners. Synced via add/update/delete service actions, keyed by
     * `listenPort`.
     */
    services?: LoadBalancerService[];
    /**
     * Backend targets. Server targets take a `Hetzner.Server` (or `{ serverId }`).
     */
    targets?: LoadBalancerTarget[];
    /**
     * Private Networks to attach. Accepts `Hetzner.Network` resources.
     */
    networks?: Array<Ref<Network>>;
    /**
     * Expose the public IPv4/IPv6 interface.
     * @default true
     */
    publicInterface?: boolean;
    /**
     * Prevent the Load Balancer from being deleted in the Cloud Console /
     * API until this is cleared. The provider disables protection before
     * delete.
     * @default false
     */
    deleteProtection?: boolean;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack` /
     * `alchemy.stage` / `alchemy.id`) are always merged in.
     */
    labels?: Record<string, string>;
}
export interface LoadBalancerServiceAttr {
    protocol: LoadBalancerProtocol;
    listenPort: number;
    destinationPort: number;
    proxyprotocol: boolean;
    healthCheck: {
        protocol: HealthCheckProtocol;
        port: number;
        interval: number;
        timeout: number;
        retries: number;
        http?: {
            domain: string | null;
            path: string;
            response?: string;
            statusCodes?: string[];
            tls?: boolean;
        };
    };
    http?: {
        cookieName: string;
        cookieLifetime: number;
        timeoutIdle: number;
        stickySessions: boolean;
        redirectHttp?: boolean;
        certificates?: number[];
    };
}
export type LoadBalancerTargetAttr = {
    type: "server";
    serverId: number;
    ip?: string;
    usePrivateIp: boolean;
    healthStatus: {
        listenPort: number;
        status: TargetHealthStatus;
    }[];
} | {
    type: "label_selector";
    selector: string;
    usePrivateIp: boolean;
} | {
    type: "ip";
    ip: string;
    healthStatus: {
        listenPort: number;
        status: TargetHealthStatus;
    }[];
};
export type LoadBalancer = Resource<"Hetzner.LoadBalancer", LoadBalancerProps, {
    /** Numeric Hetzner Load Balancer ID. */
    id: number;
    /** Load Balancer name (unique per project). */
    name: string;
    /** Load Balancer type name (`lb11`, …). */
    loadBalancerType: string;
    /** Numeric Load Balancer type ID. */
    loadBalancerTypeId: number;
    /** Location name (`nbg1`, `fsn1`, …). */
    location: string;
    /** Numeric location ID. */
    locationId: number;
    /** Network zone (`eu-central`, …). */
    networkZone: string;
    /** Balancing algorithm. */
    algorithm: LoadBalancerAlgorithm;
    /** Public IPv4, or `null` when the public interface is disabled. */
    ipv4: string | null;
    /** Public IPv6, or `null` when the public interface is disabled. */
    ipv6: string | null;
    /** Whether the public interface is enabled. */
    publicInterface: boolean;
    /** Whether delete protection is enabled. */
    deleteProtection: boolean;
    /** Observed listeners. */
    services: LoadBalancerServiceAttr[];
    /** Observed targets. */
    targets: LoadBalancerTargetAttr[];
    /** Attached private Networks and the assigned IPs. */
    privateNetworks: {
        networkId: number;
        ip: string;
    }[];
    /** User-defined labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
    /** RFC3339 creation timestamp. */
    created: string;
}, never, Providers>;
/**
 * A Hetzner Cloud Load Balancer. Create it in a Location (`nbg1` by
 * default) with type `lb11`, then sync algorithm, listeners, targets,
 * private Networks, delete protection, and labels.
 *
 * Location and network zone are immutable (changing either replaces the
 * Load Balancer). Type can grow in place. Server targets take a
 * `Hetzner.Server`; HTTPS listeners take `Hetzner.Certificate`s.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#load-balancers
 *
 * ### Creating a Load Balancer
 * **Example:** Basic TCP Load Balancer
 * ```typescript
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   location: "nbg1",
 *   loadBalancerType: "lb11",
 *   services: [
 *     { protocol: "tcp", listenPort: 80, destinationPort: 80 },
 *   ],
 * });
 * ```
 *
 * **Example:** With a Server target
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cx23",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   algorithm: "round_robin",
 *   services: [
 *     { protocol: "tcp", listenPort: 80, destinationPort: 80 },
 *   ],
 *   targets: [{ type: "server", server }],
 * });
 * ```
 *
 * ### HTTPS with a Certificate
 * **Example:** Terminate TLS
 * ```typescript
 * const cert = yield* Hetzner.Certificate("web", {
 *   certificate: pem,
 *   privateKey: key,
 * });
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   services: [
 *     {
 *       protocol: "https",
 *       listenPort: 443,
 *       destinationPort: 80,
 *       http: { certificates: [cert], redirectHttp: true },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Private Networks
 * **Example:** Attach to a Network
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   subnets: [
 *     { type: "cloud", ipRange: "10.0.1.0/24", networkZone: "eu-central" },
 *   ],
 * });
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   networks: [network],
 *   services: [
 *     { protocol: "tcp", listenPort: 80, destinationPort: 80 },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export declare const LoadBalancer: import("../Resource.ts").ResourceClass<LoadBalancer>;
declare const LoadBalancerNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.LoadBalancerNotCreated";
} & Readonly<A>;
export declare class LoadBalancerNotCreated extends LoadBalancerNotCreated_base<{
    name: string;
}> {
}
export declare const LoadBalancerProvider: () => import("effect/Layer").Layer<Provider.Provider<LoadBalancer>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=LoadBalancer.d.ts.map