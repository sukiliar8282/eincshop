import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicTransit.SiteWan";
type TypeId = typeof TypeId;
/**
 * Static addressing configuration for a Magic WAN site WAN — omit to use
 * DHCP. Submit `secondaryAddress` when the site is in high availability
 * mode.
 */
export interface MagicSiteWanStaticAddressing {
    /** A valid CIDR notation representing the WAN address. */
    address: string;
    /** A valid IPv4 address for the WAN gateway. */
    gatewayAddress: string;
    /** Secondary address, required when the site is in HA mode. */
    secondaryAddress?: string;
}
export interface MagicSiteWanProps {
    /**
     * The site this WAN belongs to. Changing it triggers a replacement.
     */
    siteId: string;
    /**
     * The physical port number on the connector this WAN is attached to.
     */
    physport: number;
    /**
     * The name of the WAN. If omitted, a unique name is generated from the
     * app, stage, and logical ID.
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * Priority of the WAN for traffic load balancing. Lower is preferred.
     */
    priority?: number;
    /**
     * VLAN ID. Use zero for untagged.
     * @default 0
     */
    vlanTag?: number;
    /**
     * Static addressing configuration; omit to use DHCP.
     */
    staticAddressing?: MagicSiteWanStaticAddressing;
}
export interface MagicSiteWanAttributes {
    /** Cloudflare-assigned identifier of the WAN. */
    wanId: string;
    /** The site the WAN belongs to. */
    siteId: string;
    /** The Cloudflare account the WAN belongs to. */
    accountId: string;
    /** The name of the WAN. */
    name: string;
    /** The physical port number. */
    physport: number | undefined;
    /** Priority of the WAN for traffic load balancing. */
    priority: number | undefined;
    /** The VLAN ID (zero for untagged). */
    vlanTag: number | undefined;
    /** Magic WAN health-check rate for tunnels created on this link. */
    healthCheckRate: string | undefined;
}
export type MagicSiteWan = Resource<TypeId, MagicSiteWanProps, MagicSiteWanAttributes, never, Providers>;
/**
 * A WAN attached to a Magic WAN site — describes an uplink on a Magic WAN
 * Connector port (addressing, VLAN, load-balancing priority). Cloudflare
 * automatically creates IPsec tunnels over each WAN.
 *
 * Requires a Magic WAN subscription — accounts without it receive a typed
 * `MagicWanUnauthorized` error (Cloudflare code 1025).
 *
 * `siteId` is create-only — changing it triggers a replacement. Everything
 * else is updated in place.
 * ### Creating a WAN
 * **Example:** DHCP uplink
 * ```typescript
 * const wan = yield* Cloudflare.MagicTransit.MagicSiteWan("hq-wan", {
 *   siteId: site.siteId,
 *   physport: 1,
 * });
 * ```
 *
 * **Example:** Static uplink with priority
 * ```typescript
 * const wan = yield* Cloudflare.MagicTransit.MagicSiteWan("hq-wan", {
 *   siteId: site.siteId,
 *   physport: 1,
 *   priority: 10,
 *   staticAddressing: {
 *     address: "203.0.113.10/24",
 *     gatewayAddress: "203.0.113.1",
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/configuration/connector/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export declare const MagicSiteWan: import("../../Resource.ts").ResourceClass<MagicSiteWan>;
/**
 * Returns true if the given value is a MagicSiteWan resource.
 */
export declare const isMagicSiteWan: (value: unknown) => value is MagicSiteWan;
export declare const MagicSiteWanProvider: () => import("effect/Layer").Layer<Provider.Provider<MagicSiteWan>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | magicTransit.CloudflareOpContext>;
export {};
//# sourceMappingURL=SiteWan.d.ts.map