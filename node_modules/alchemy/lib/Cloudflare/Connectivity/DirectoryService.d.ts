import * as connectivity from "@distilled.cloud/cloudflare/connectivity";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Connectivity.DirectoryService";
type TypeId = typeof TypeId;
/**
 * Protocol of a Connectivity Directory service.
 */
export type DirectoryServiceType = "tcp" | "http";
/**
 * Application protocol hint for `tcp` services.
 */
export type DirectoryServiceAppProtocol = "postgresql" | "mysql" | (string & {});
export declare namespace DirectoryService {
    /**
     * Network a private IP host is reachable through — identified by the
     * Cloudflare Tunnel that carries the traffic.
     */
    interface Network {
        /**
         * UUID of the `cfd_tunnel` that provides connectivity to the host.
         * Accepts a reference to a `Cloudflare.Tunnel.Tunnel` output.
         */
        tunnelId: string;
    }
    /**
     * Network a private hostname is resolved and reached through.
     */
    interface ResolverNetwork {
        /**
         * UUID of the `cfd_tunnel` that provides connectivity to the host.
         * Accepts a reference to a `Cloudflare.Tunnel.Tunnel` output.
         */
        tunnelId: string;
        /**
         * IP addresses of the DNS resolvers used to resolve the hostname
         * inside the private network.
         */
        resolverIps?: string[];
    }
    /**
     * Private IPv4 host reached through a tunnel.
     */
    interface Ipv4Host {
        /** Private IPv4 address of the service. */
        ipv4: string;
        /** Tunnel-backed network the address lives in. */
        network: Network;
    }
    /**
     * Private IPv6 host reached through a tunnel.
     */
    interface Ipv6Host {
        /** Private IPv6 address of the service. */
        ipv6: string;
        /** Tunnel-backed network the address lives in. */
        network: Network;
    }
    /**
     * Dual-stack (IPv4 + IPv6) host reached through a tunnel.
     */
    interface DualStackHost {
        /** Private IPv4 address of the service. */
        ipv4: string;
        /** Private IPv6 address of the service. */
        ipv6: string;
        /** Tunnel-backed network the addresses live in. */
        network: Network;
    }
    /**
     * Private hostname resolved and reached through a tunnel.
     */
    interface HostnameHost {
        /** Private hostname of the service (e.g. `db.internal`). */
        hostname: string;
        /** Tunnel-backed resolver network used to resolve and reach the host. */
        resolverNetwork: ResolverNetwork;
    }
    /**
     * Host a directory service is reachable at — a private IPv4/IPv6
     * address or a hostname, always reached through a Cloudflare Tunnel.
     */
    type Host = Ipv4Host | Ipv6Host | DualStackHost | HostnameHost;
    /**
     * Fully-resolved host shape returned in Output Attributes (all tunnel
     * references resolved to concrete UUID strings).
     */
    type HostAttributes = {
        ipv4: string;
        network: {
            tunnelId: string;
        };
    } | {
        ipv6: string;
        network: {
            tunnelId: string;
        };
    } | {
        ipv4: string;
        ipv6: string;
        network: {
            tunnelId: string;
        };
    } | {
        hostname: string;
        resolverNetwork: {
            tunnelId: string;
            resolverIps?: string[];
        };
    };
}
export type DirectoryServiceProps = {
    /**
     * Display name of the directory service. Must be unique within the
     * account. If omitted, a unique name is generated from the app, stage,
     * and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Service protocol: `tcp` (arbitrary TCP, e.g. a database) or `http`
     * (plain HTTP/HTTPS origins).
     */
    type: DirectoryServiceType;
    /**
     * Host the service is reachable at — IPv4, IPv6, dual-stack, or
     * hostname, reached through a Cloudflare Tunnel.
     */
    host: DirectoryService.Host;
    /**
     * Port the service listens on. Only valid for `type: "tcp"` services.
     */
    tcpPort?: number;
    /**
     * Port for plain HTTP traffic. Only valid for `type: "http"` services.
     * @default 80
     */
    httpPort?: number;
    /**
     * Port for HTTPS traffic. Only valid for `type: "http"` services.
     * @default 443
     */
    httpsPort?: number;
    /**
     * Application protocol hint for `tcp` services (e.g. `postgresql`).
     */
    appProtocol?: DirectoryServiceAppProtocol;
    /**
     * TLS settings used when connecting to the service.
     * @default { certVerificationMode: "verify_full" }
     */
    tlsSettings?: {
        /** Certificate verification mode (e.g. `verify_full`). */
        certVerificationMode: string;
    };
};
export type DirectoryServiceAttributes = {
    /**
     * Unique identifier of the directory service.
     */
    serviceId: string;
    /**
     * The Cloudflare account the service belongs to.
     */
    accountId: string;
    /**
     * Display name of the service.
     */
    name: string;
    /**
     * Service protocol (`tcp` or `http`).
     */
    type: DirectoryServiceType;
    /**
     * Host the service is reachable at, with tunnel references resolved.
     */
    host: DirectoryService.HostAttributes;
    /**
     * TCP port (only set for `tcp` services).
     */
    tcpPort: number | undefined;
    /**
     * HTTP port (only set for `http` services).
     */
    httpPort: number | undefined;
    /**
     * HTTPS port (only set for `http` services).
     */
    httpsPort: number | undefined;
    /**
     * Application protocol hint (only set for `tcp` services).
     */
    appProtocol: DirectoryServiceAppProtocol | undefined;
    /**
     * Certificate verification mode in effect.
     */
    certVerificationMode: string | undefined;
    /**
     * When the service was created.
     */
    createdAt: string | undefined;
    /**
     * When the service was last updated.
     */
    updatedAt: string | undefined;
};
export type DirectoryService = Resource<TypeId, DirectoryServiceProps, DirectoryServiceAttributes, never, Providers>;
/**
 * A Cloudflare Connectivity Directory service — a named entry in the
 * account's private-network service directory that maps a service name to
 * a private host (IP or hostname) reachable through a Cloudflare Tunnel.
 *
 * Directory services are the registry behind Workers VPC and Zero Trust
 * private-network connectivity: a `tcp` service describes a database-style
 * origin (with an optional `appProtocol` hint), an `http` service describes
 * an HTTP/HTTPS origin with explicit ports.
 *
 * Names are unique within the account. All properties — including the host
 * and even the protocol type — are mutable in place via a full PUT; nothing
 * forces a replacement except moving accounts.
 * ### Creating a Directory Service
 * **Example:** TCP database service through a tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("DbTunnel", {
 *   ingress: [{ service: "tcp://localhost:5432" }],
 * });
 * const db = yield* Cloudflare.Connectivity.DirectoryService("Postgres", {
 *   type: "tcp",
 *   tcpPort: 5432,
 *   appProtocol: "postgresql",
 *   host: { ipv4: "10.0.0.21", network: { tunnelId: tunnel.tunnelId } },
 * });
 * ```
 *
 * **Example:** HTTP service on a private hostname
 * ```typescript
 * const api = yield* Cloudflare.Connectivity.DirectoryService("InternalApi", {
 *   type: "http",
 *   httpPort: 8080,
 *   httpsPort: 8443,
 *   host: {
 *     hostname: "api.internal",
 *     resolverNetwork: { tunnelId: tunnel.tunnelId, resolverIps: ["10.0.0.53"] },
 *   },
 * });
 * ```
 *
 * ### Updating
 * **Example:** Changing the host in place
 * ```typescript
 * // Host, ports, name, and TLS settings are all mutable — the service
 * // keeps its serviceId across updates.
 * const db = yield* Cloudflare.Connectivity.DirectoryService("Postgres", {
 *   type: "tcp",
 *   tcpPort: 5432,
 *   host: {
 *     hostname: "db.internal",
 *     resolverNetwork: { tunnelId: tunnel.tunnelId },
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/
 *
 * @resource
 * @product Connectivity
 * @category Cloudflare One (Zero Trust)
 */
export declare const DirectoryService: import("../../Resource.ts").ResourceClass<DirectoryService>;
/**
 * Returns true if the given value is a DirectoryService resource.
 */
export declare const isDirectoryService: (value: unknown) => value is DirectoryService;
export declare const DirectoryServiceProvider: () => import("effect/Layer").Layer<Provider.Provider<DirectoryService>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | connectivity.CloudflareOpContext>;
export {};
//# sourceMappingURL=DirectoryService.d.ts.map