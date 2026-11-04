import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.Access.InfrastructureTarget";
type TypeId = typeof TypeId;
/**
 * IPv4/IPv6 address details for an infrastructure target. At least one
 * of `ipv4` / `ipv6` must be provided.
 */
export interface InfrastructureTargetIp {
    /** IPv4 address of the target, optionally scoped to a virtual network. */
    ipv4?: {
        /** The IPv4 address (e.g. `10.0.0.5`). */
        ipAddr: string;
        /**
         * Virtual network the address lives in. Defaults to the account's
         * default virtual network.
         */
        virtualNetworkId?: string;
    };
    /** IPv6 address of the target, optionally scoped to a virtual network. */
    ipv6?: {
        /** The IPv6 address. */
        ipAddr: string;
        /**
         * Virtual network the address lives in. Defaults to the account's
         * default virtual network.
         */
        virtualNetworkId?: string;
    };
}
export interface InfrastructureTargetProps {
    /**
     * Hostname identifying the target. Non-unique, case-insensitive, max
     * 255 characters; supports dashes and periods, no spaces. Mutable —
     * updated in place via PUT.
     */
    hostname: string;
    /**
     * The IPv4/IPv6 address that identifies where to reach the target. At
     * least one of `ipv4` / `ipv6` is required. Mutable — updated in
     * place via PUT.
     */
    ip: InfrastructureTargetIp;
}
export interface InfrastructureTargetAttributes {
    /** UUID of the infrastructure target, assigned by Cloudflare. */
    targetId: string;
    /** Cloudflare account that owns the target. */
    accountId: string;
    /** Hostname identifying the target. */
    hostname: string;
    /** Resolved IPv4/IPv6 addresses of the target. */
    ip: {
        ipv4?: {
            ipAddr?: string;
            virtualNetworkId?: string;
        };
        ipv6?: {
            ipAddr?: string;
            virtualNetworkId?: string;
        };
    };
    /** RFC 3339 timestamp of when the target was created. */
    createdAt: string;
    /** RFC 3339 timestamp of when the target was last modified. */
    modifiedAt: string;
}
export type InfrastructureTarget = Resource<TypeId, InfrastructureTargetProps, InfrastructureTargetAttributes, never, Providers>;
/**
 * A Cloudflare Access Infrastructure Target — a server (hostname +
 * IPv4/IPv6 address) protected by Access for Infrastructure (SSH).
 *
 * Targets are referenced by infrastructure Access applications, which
 * attach SSH access policies to them. Hostname and IP are both mutable
 * in place; the target's identity is its Cloudflare-assigned UUID.
 * ### Creating a Target
 * **Example:** Basic IPv4 target
 * ```typescript
 * const target = yield* Cloudflare.Access.InfrastructureTarget("Bastion", {
 *   hostname: "bastion.internal",
 *   ip: { ipv4: { ipAddr: "10.0.0.5" } },
 * });
 * ```
 *
 * **Example:** Target scoped to a virtual network
 * ```typescript
 * const vnet = yield* Cloudflare.Tunnel.VirtualNetwork("Staging", {});
 * const target = yield* Cloudflare.Access.InfrastructureTarget("DbHost", {
 *   hostname: "db.staging.internal",
 *   ip: {
 *     ipv4: {
 *       ipAddr: "10.4.0.10",
 *       virtualNetworkId: vnet.virtualNetworkId,
 *     },
 *   },
 * });
 * ```
 *
 * ### Updating
 * **Example:** Re-point the target at a new address
 * ```typescript
 * // Hostname and IP update in place — same targetId, no replacement.
 * const target = yield* Cloudflare.Access.InfrastructureTarget("Bastion", {
 *   hostname: "bastion.internal",
 *   ip: { ipv4: { ipAddr: "10.0.0.6" } },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/applications/non-http/infrastructure-apps/
 *
 * @resource
 * @product Access
 * @category Cloudflare One (Zero Trust)
 */
export declare const InfrastructureTarget: import("../../Resource.ts").ResourceClass<InfrastructureTarget>;
/**
 * Returns true if the given value is an InfrastructureTarget resource.
 */
export declare const isInfrastructureTarget: (value: unknown) => value is InfrastructureTarget;
export declare const InfrastructureTargetProvider: () => import("effect/Layer").Layer<Provider.Provider<InfrastructureTarget>, never, CloudflareEnvironment | zeroTrust.CloudflareOpContext>;
export {};
//# sourceMappingURL=InfrastructureTarget.d.ts.map