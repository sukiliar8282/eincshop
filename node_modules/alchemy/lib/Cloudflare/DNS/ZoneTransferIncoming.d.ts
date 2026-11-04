import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.ZoneTransferIncoming";
type TypeId = typeof TypeId;
export interface ZoneTransferIncomingProps {
    /**
     * Secondary zone whose incoming transfer configuration is managed.
     * Stable — the configuration is a per-zone singleton, so changing the
     * zone triggers a replacement.
     */
    zoneId: string;
    /**
     * Zone name (e.g. `example.com.`).
     *
     * Mutable — updated in place (PUT).
     */
    name: string;
    /**
     * Peers (by id) Cloudflare transfers the zone in from. Reference
     * {@link ZoneTransferPeer} resources via their `peerId` attribute.
     *
     * Mutable — updated in place (PUT).
     */
    peers: string[];
    /**
     * How often (seconds) the secondary zone auto-refreshes regardless of
     * DNS NOTIFY.
     *
     * Mutable — updated in place (PUT).
     */
    autoRefreshSeconds: number;
}
export interface ZoneTransferIncomingAttributes {
    /** Zone whose incoming transfer configuration is managed. */
    zoneId: string;
    /** Identifier of the configuration (mirrors the zone id). */
    id: string | undefined;
    /** Zone name. */
    name: string | undefined;
    /** Peer ids the zone transfers in from. */
    peers: string[];
    /** Auto-refresh interval in seconds. */
    autoRefreshSeconds: number | undefined;
    /** SOA serial of the most recent transfer. */
    soaSerial: number | undefined;
    /** When the zone was last checked. */
    checkedTime: string | undefined;
    /** When the configuration was created. */
    createdTime: string | undefined;
    /** When the configuration was last modified. */
    modifiedTime: string | undefined;
}
export type ZoneTransferIncoming = Resource<TypeId, ZoneTransferIncomingProps, ZoneTransferIncomingAttributes, never, Providers>;
/**
 * The incoming zone-transfer configuration of a secondary zone
 * (`/zones/{zone_id}/secondary_dns/incoming`) — links the zone to the
 * {@link ZoneTransferPeer | peers} Cloudflare transfers it in from and
 * sets the auto-refresh interval.
 *
 * Requires the Secondary DNS (zone transfer) entitlement, and the zone
 * must be created with `type: "secondary"`. The configuration is a
 * per-zone singleton: `zoneId` is the identity (replacement on change),
 * everything else is mutable in place.
 * ### Configuring incoming transfers
 * **Example:** Transfer a secondary zone in from a primary
 * ```typescript
 * const peer = yield* Cloudflare.DNS.ZoneTransferPeer("Primary", {
 *   ip: "192.0.2.53",
 *   port: 53,
 * });
 * yield* Cloudflare.DNS.ZoneTransferIncoming("Incoming", {
 *   zoneId: zone.zoneId,
 *   name: "example.com.",
 *   peers: [peer.peerId],
 *   autoRefreshSeconds: 86400,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/zone-setups/zone-transfers/setup/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const ZoneTransferIncoming: import("../../Resource.ts").ResourceClass<ZoneTransferIncoming>;
/**
 * Returns true if the given value is a ZoneTransferIncoming resource.
 */
export declare const isZoneTransferIncoming: (value: unknown) => value is ZoneTransferIncoming;
export declare const ZoneTransferIncomingProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneTransferIncoming>, never, CloudflareEnvironment | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=ZoneTransferIncoming.d.ts.map