import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.MagicTransit.SiteAcl";
type TypeId = typeof TypeId;
/**
 * Protocols a Magic WAN site ACL can match.
 */
export type MagicSiteAclProtocol = "tcp" | "udp" | "icmp";
/**
 * One side of a Magic WAN site ACL — selects a LAN and optionally narrows
 * the match to specific ports, port ranges, and subnets.
 */
export interface MagicSiteAclLan {
    /** The LAN identifier this side of the ACL applies to. */
    lanId: string;
    /** Display name of the LAN (informational). */
    lanName?: string;
    /** Specific ports to match. */
    ports?: number[];
    /** Port ranges to match, e.g. `"8080-8090"`. */
    portRanges?: string[];
    /** Subnets to match (IPv4 CIDR or address). */
    subnets?: string[];
}
export interface MagicSiteAclProps {
    /**
     * The site this ACL belongs to. Changing it triggers a replacement.
     */
    siteId: string;
    /**
     * The name of the ACL.
     */
    name: string;
    /**
     * The first LAN of the ACL pair.
     */
    lan1: MagicSiteAclLan;
    /**
     * The second LAN of the ACL pair.
     */
    lan2: MagicSiteAclLan;
    /**
     * Description for the ACL.
     */
    description?: string;
    /**
     * If `true`, traffic is forwarded locally on the Magic Connector; if
     * `false`, traffic is forwarded to Cloudflare.
     * @default false
     */
    forwardLocally?: boolean;
    /**
     * Protocols the ACL matches. Omit to match all protocols.
     */
    protocols?: MagicSiteAclProtocol[];
    /**
     * If `true`, the policy allows traffic in one direction only
     * (lan1 → lan2); if `false`, traffic is bidirectional.
     * @default false
     */
    unidirectional?: boolean;
}
export interface MagicSiteAclAttributes {
    /** Cloudflare-assigned identifier of the ACL. */
    aclId: string;
    /** The site the ACL belongs to. */
    siteId: string;
    /** The Cloudflare account the ACL belongs to. */
    accountId: string;
    /** The name of the ACL. */
    name: string;
    /** The ACL description, if set. */
    description: string | undefined;
    /** Whether traffic is forwarded locally on the connector. */
    forwardLocally: boolean | undefined;
    /** Protocols the ACL matches, if narrowed. */
    protocols: MagicSiteAclProtocol[] | undefined;
    /** Whether the ACL is unidirectional. */
    unidirectional: boolean | undefined;
}
export type MagicSiteAcl = Resource<TypeId, MagicSiteAclProps, MagicSiteAclAttributes, never, Providers>;
/**
 * An ACL between two LANs of a Magic WAN site — allows traffic between
 * LAN segments behind a Magic WAN Connector (all inter-LAN traffic is
 * denied by default).
 *
 * Requires a Magic WAN subscription — accounts without it receive a typed
 * `MagicWanUnauthorized` error (Cloudflare code 1025).
 *
 * `siteId` is create-only — changing it triggers a replacement. Everything
 * else is updated in place.
 * ### Creating an ACL
 * **Example:** Allow TCP between two LANs
 * ```typescript
 * yield* Cloudflare.MagicTransit.MagicSiteAcl("lan-to-lan", {
 *   siteId: site.siteId,
 *   name: "office-to-lab",
 *   lan1: { lanId: officeLan.lanId, ports: [443] },
 *   lan2: { lanId: labLan.lanId },
 *   protocols: ["tcp"],
 * });
 * ```
 *
 * **Example:** Unidirectional ACL forwarded locally
 * ```typescript
 * yield* Cloudflare.MagicTransit.MagicSiteAcl("one-way", {
 *   siteId: site.siteId,
 *   name: "sensors-to-collector",
 *   lan1: { lanId: sensorsLan.lanId },
 *   lan2: { lanId: collectorLan.lanId, ports: [9000] },
 *   unidirectional: true,
 *   forwardLocally: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/configuration/connector/network-options/site-acls/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export declare const MagicSiteAcl: import("../../Resource.ts").ResourceClass<MagicSiteAcl>;
/**
 * Returns true if the given value is a MagicSiteAcl resource.
 */
export declare const isMagicSiteAcl: (value: unknown) => value is MagicSiteAcl;
export declare const MagicSiteAclProvider: () => import("effect/Layer").Layer<Provider.Provider<MagicSiteAcl>, never, CloudflareEnvironment | magicTransit.CloudflareOpContext>;
export {};
//# sourceMappingURL=SiteAcl.d.ts.map