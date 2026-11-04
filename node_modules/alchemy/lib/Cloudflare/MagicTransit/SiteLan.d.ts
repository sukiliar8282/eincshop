import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicTransit.SiteLan";
type TypeId = typeof TypeId;
/**
 * NAT configuration for a Magic WAN site LAN.
 */
export interface MagicSiteLanNat {
    /** A valid CIDR notation representing an IP range. */
    staticPrefix?: string;
}
/**
 * A subnet routed behind a Magic WAN site LAN.
 */
export interface MagicSiteLanRoutedSubnet {
    /** A valid IPv4 address for the subnet's next hop. */
    nextHop: string;
    /** A valid CIDR notation representing an IP range. */
    prefix: string;
    /** Optional NAT configuration for the routed subnet. */
    nat?: MagicSiteLanNat;
}
/**
 * Static addressing configuration for a Magic WAN site LAN. If the site is
 * not in high availability mode this is optional (DHCP is used when
 * omitted); in HA mode it is required along with a secondary address.
 */
export interface MagicSiteLanStaticAddressing {
    /** A valid CIDR notation representing the LAN address. */
    address: string;
    /** Secondary address, required when the site is in HA mode. */
    secondaryAddress?: string;
    /** Virtual address shared by HA connector pairs. */
    virtualAddress?: string;
    /** DHCP relay configuration. */
    dhcpRelay?: {
        /** List of DHCP server addresses. */
        serverAddresses?: string[];
    };
    /** DHCP server configuration. */
    dhcpServer?: {
        /** End of the DHCP address pool. */
        dhcpPoolEnd?: string;
        /** Start of the DHCP address pool. */
        dhcpPoolStart?: string;
        /** A single DNS server address. */
        dnsServer?: string;
        /** DNS server addresses. */
        dnsServers?: string[];
        /** Mapping of MAC addresses to IP addresses. */
        reservations?: Record<string, unknown>;
    };
}
export interface MagicSiteLanProps {
    /**
     * The site this LAN belongs to. Changing it triggers a replacement.
     */
    siteId: string;
    /**
     * The physical port number on the connector this LAN is attached to.
     */
    physport: number;
    /**
     * The name of the LAN. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * VLAN ID. Use zero for untagged.
     * @default 0
     */
    vlanTag?: number;
    /**
     * Mark true to use this LAN for HA probing. Only works for sites with
     * HA turned on; only one LAN can be the ha_link. Create-only — changing
     * it triggers a replacement.
     */
    haLink?: boolean;
    /**
     * Mark true to use this LAN for source-based breakout traffic.
     */
    isBreakout?: boolean;
    /**
     * Mark true to use this LAN for source-based prioritized traffic.
     */
    isPrioritized?: boolean;
    /**
     * NAT configuration for the LAN.
     */
    nat?: MagicSiteLanNat;
    /**
     * Subnets routed behind this LAN.
     */
    routedSubnets?: MagicSiteLanRoutedSubnet[];
    /**
     * Static addressing configuration; omit to use DHCP.
     */
    staticAddressing?: MagicSiteLanStaticAddressing;
    /**
     * Bond identifier when the LAN is part of a link bond.
     */
    bondId?: number;
}
export interface MagicSiteLanAttributes {
    /** Cloudflare-assigned identifier of the LAN. */
    lanId: string;
    /** The site the LAN belongs to. */
    siteId: string;
    /** The Cloudflare account the LAN belongs to. */
    accountId: string;
    /** The name of the LAN. */
    name: string;
    /** The physical port number. */
    physport: number | undefined;
    /** The VLAN ID (zero for untagged). */
    vlanTag: number | undefined;
    /** Whether this LAN is the HA probing link. */
    haLink: boolean | undefined;
}
export type MagicSiteLan = Resource<TypeId, MagicSiteLanProps, MagicSiteLanAttributes, never, Providers>;
/**
 * A LAN attached to a Magic WAN site — describes a local network segment
 * behind a Magic WAN Connector port (VLAN, addressing, routed subnets,
 * NAT).
 *
 * Requires a Magic WAN subscription — accounts without it receive a typed
 * `MagicWanUnauthorized` error (Cloudflare code 1025).
 *
 * `siteId` and `haLink` are create-only — changing either triggers a
 * replacement. Everything else is updated in place.
 * ### Creating a LAN
 * **Example:** Untagged LAN with DHCP
 * ```typescript
 * const lan = yield* Cloudflare.MagicTransit.MagicSiteLan("hq-lan", {
 *   siteId: site.siteId,
 *   physport: 2,
 *   vlanTag: 0,
 * });
 * ```
 *
 * **Example:** LAN with static addressing and a routed subnet
 * ```typescript
 * const lan = yield* Cloudflare.MagicTransit.MagicSiteLan("hq-lan", {
 *   siteId: site.siteId,
 *   physport: 2,
 *   vlanTag: 10,
 *   staticAddressing: { address: "192.168.10.1/24" },
 *   routedSubnets: [
 *     { prefix: "10.10.0.0/24", nextHop: "192.168.10.254" },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/configuration/connector/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export declare const MagicSiteLan: import("../../Resource.ts").ResourceClass<MagicSiteLan>;
/**
 * Returns true if the given value is a MagicSiteLan resource.
 */
export declare const isMagicSiteLan: (value: unknown) => value is MagicSiteLan;
export declare const MagicSiteLanProvider: () => import("effect/Layer").Layer<Provider.Provider<MagicSiteLan>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | magicTransit.CloudflareOpContext>;
export {};
//# sourceMappingURL=SiteLan.d.ts.map