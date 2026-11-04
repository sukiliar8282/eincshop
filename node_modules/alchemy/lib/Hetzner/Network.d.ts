import { Services } from "@distilled.cloud/hetzner";
import * as Provider from "../Provider.ts";
import { Resource } from "../Resource.ts";
import type { Providers } from "./Providers.ts";
declare const NetworkNotCreated_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "Hetzner.NetworkNotCreated";
} & Readonly<A>;
export declare class NetworkNotCreated extends NetworkNotCreated_base<{
    name: string;
}> {
}
export type NetworkSubnetType = "cloud" | "server" | "vswitch";
export interface NetworkSubnet {
    /**
     * Subnet type. `cloud` is the usual choice for Cloud Servers and Load
     * Balancers. `vswitch` attaches a Robot vSwitch and requires `vswitchId`.
     */
    type: NetworkSubnetType;
    /**
     * IPv4 range of the subnet in CIDR notation. Must be a subnet of the
     * parent network `ipRange` and must not overlap other subnets or route
     * destinations. Minimum size is `/30`. If omitted on create, Hetzner
     * allocates the first free `/24`.
     */
    ipRange?: string;
    /**
     * Network zone this subnet lives in (`eu-central`, `us-east`, `us-west`,
     * `ap-southeast`). `nbg1` / `fsn1` / `hel1` are in `eu-central`.
     */
    networkZone: string;
    /**
     * Robot vSwitch id. Required when `type` is `vswitch`.
     */
    vswitchId?: number;
}
export interface NetworkRoute {
    /**
     * Destination prefix. Must be an RFC1918 IPv4 range or `0.0.0.0/0`, and
     * must not overlap any subnet or other route destination.
     */
    destination: string;
    /**
     * Next-hop IP inside the network. Cannot be the first IP of the
     * network's `ipRange` or `172.31.1.1`.
     */
    gateway: string;
}
export interface NetworkProps {
    /**
     * Name of the Network. Must be unique per project. If omitted, a unique
     * name is generated from the app, stage, and logical ID.
     */
    name?: string;
    /**
     * IPv4 range of the whole Network in CIDR notation. Must be RFC1918 and
     * at least `/24`. Can only be **extended** later (`change_ip_range`);
     * shrinking or moving to a non-superset range replaces the Network.
     */
    ipRange: string;
    /**
     * Subnets allocated in this Network. Synced via `add_subnet` /
     * `delete_subnet` — they are not their own resources.
     */
    subnets?: NetworkSubnet[];
    /**
     * Static routes in this Network. Synced via `add_route` / `delete_route`.
     */
    routes?: NetworkRoute[];
    /**
     * Expose this Network's routes to a connected Robot vSwitch.
     * @default false
     */
    exposeRoutesToVswitch?: boolean;
    /**
     * Prevent the Network from being deleted in the Cloud Console / API
     * until this is cleared. The provider disables protection before delete.
     * @default false
     */
    deleteProtection?: boolean;
    /**
     * User-defined labels. Alchemy ownership labels (`alchemy.stack` /
     * `alchemy.stage` / `alchemy.id`) are merged in automatically.
     */
    labels?: Record<string, string>;
}
export interface NetworkSubnetAttr extends NetworkSubnet {
    /** Gateway Hetzner assigned to this subnet. */
    gateway: string;
}
export type Network = Resource<"Hetzner.Network", NetworkProps, {
    /** Numeric Hetzner Network id. */
    networkId: number;
    /** Observed Network name. */
    name: string;
    /** Observed IPv4 range (CIDR). */
    ipRange: string;
    /** Observed subnets, including the assigned gateway. */
    subnets: NetworkSubnetAttr[];
    /** Observed static routes. */
    routes: NetworkRoute[];
    /** Server ids currently attached to this Network. */
    servers: number[];
    /** Load Balancer ids currently attached to this Network. */
    loadBalancers: number[];
    /** Whether delete protection is enabled. */
    deleteProtection: boolean;
    /** Whether routes are exposed to a connected vSwitch. */
    exposeRoutesToVswitch: boolean;
    /** User-facing labels (Alchemy ownership labels stripped). */
    labels: Record<string, string>;
    /** RFC3339 creation timestamp. */
    created: string;
}, never, Providers>;
/**
 * A Hetzner Cloud private Network — an isolated IPv4 range that Cloud
 * Servers and Load Balancers attach to. Subnets, routes, delete protection,
 * and labels are synced on the Network itself; `network_actions` are not
 * modeled as their own resources.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#networks
 *
 * ### Creating a Network
 * **Example:** Basic Network
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 * });
 * ```
 *
 * **Example:** Network with a cloud subnet
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   subnets: [
 *     { type: "cloud", ipRange: "10.0.1.0/24", networkZone: "eu-central" },
 *   ],
 * });
 * ```
 *
 * ### Routes and protection
 * **Example:** Static route and delete protection
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   subnets: [
 *     { type: "cloud", ipRange: "10.0.1.0/24", networkZone: "eu-central" },
 *   ],
 *   routes: [{ destination: "10.10.0.0/24", gateway: "10.0.1.2" }],
 *   deleteProtection: true,
 * });
 * ```
 *
 * ### Labels
 * **Example:** User labels
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   labels: { env: "prod", role: "vpc" },
 * });
 * ```
 *
 * @resource
 */
export declare const Network: import("../Resource.ts").ResourceClass<Network>;
export declare const NetworkProvider: () => import("effect/Layer").Layer<Provider.Provider<Network>, never, import("../Stack.ts").Stack | import("../Stage.ts").Stage | Services.actions.HetznerOpContext>;
export {};
//# sourceMappingURL=Network.d.ts.map