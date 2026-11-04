import * as connectivity from "@distilled.cloud/cloudflare/connectivity";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
export type VpcServiceProps = {
    /**
     * Display name for the VPC service. If omitted, a unique name is generated.
     *
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Service protocol. Currently only `"http"` is supported.
     *
     * @default "http"
     */
    serviceType?: "http";
    /**
     * Port that Workers should reach for plain HTTP traffic.
     */
    httpPort?: number;
    /**
     * Port that Workers should reach for HTTPS traffic.
     */
    httpsPort?: number;
    /**
     * Host the service is reachable at -- IPv4, IPv6, dual stack, or hostname.
     */
    host: VpcService.Host;
    /**
     * Whether to adopt an existing VPC service with the same name when create
     * fails because of a name conflict.
     *
     * @default false
     */
    adopt?: boolean;
};
export declare namespace VpcService {
    /**
     * Host the VPC service is reachable at.
     */
    type Host = IPv4Host | IPv6Host | DualStackHost | HostnameHost;
    interface IPv4Host {
        ipv4: string;
        network: Network;
    }
    interface IPv6Host {
        ipv6: string;
        network: Network;
    }
    interface DualStackHost {
        ipv4: string;
        ipv6: string;
        network: Network;
    }
    interface HostnameHost {
        hostname: string;
        resolverNetwork: ResolverNetwork;
    }
    interface Network {
        tunnelId: string;
    }
    interface ResolverNetwork extends Network {
        resolverIps?: string[];
    }
}
export type Attributes = {
    serviceId: string;
    serviceName: string;
    serviceType: "http" | "tcp";
    httpPort: number | undefined;
    httpsPort: number | undefined;
    host: VpcService.Host;
    accountId: string;
    createdAt: number | undefined;
    updatedAt: number | undefined;
};
export type VpcService = Resource<"Cloudflare.VpcService.VpcService", VpcServiceProps, Attributes, never, Providers>;
/**
 * A Cloudflare VPC service that exposes a private host (IP or hostname)
 * reachable through a Cloudflare Tunnel for Workers VPC.
 * ### Creating a VPC Service
 * **Example:** Hostname through a tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("MyTunnel");
 * const service = yield* Cloudflare.VpcService.VpcService("Internal", {
 *   host: {
 *     hostname: "internal.example.com",
 *     resolverNetwork: { tunnelId: tunnel.tunnelId, resolverIps: ["10.0.0.53"] },
 *   },
 * });
 * ```
 *
 * **Example:** IPv4 with explicit ports
 * ```typescript
 * const service = yield* Cloudflare.VpcService.VpcService("DevServer", {
 *   httpPort: 5173,
 *   host: { ipv4: "192.168.1.100", network: { tunnelId: tunnel.tunnelId } },
 * });
 * ```
 *
 * @resource
 * @product Workers VPC
 * @category Network
 */
export declare const VpcService: import("../../Resource.ts").ResourceClass<VpcService>;
export declare const isVpcService: (value: unknown) => value is VpcService;
export declare const VpcServiceProvider: () => import("effect/Layer").Layer<Provider.Provider<VpcService>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | connectivity.CloudflareOpContext>;
export declare const formatVpcService: (service: {
    serviceId?: string | null;
    name: string;
    type: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    httpPort?: number | null;
    httpsPort?: number | null;
    host: connectivity.GetDirectoryServiceResponse["host"];
}, accountId: string) => Attributes;
//# sourceMappingURL=VpcService.d.ts.map