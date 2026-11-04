import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.ZoneTransferOutgoing";
type TypeId = typeof TypeId;
export interface ZoneTransferOutgoingProps {
    /**
     * Primary zone whose outgoing transfer configuration is managed.
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
     * Peers (by id) Cloudflare NOTIFYs and serves AXFR/IXFR to.
     * Reference {@link ZoneTransferPeer} resources via their `peerId`
     * attribute.
     *
     * Mutable — updated in place (PUT).
     */
    peers: string[];
    /**
     * Whether outgoing transfers are enabled for the zone. Mapped to the
     * dedicated enable/disable endpoints, separate from the
     * configuration's CRUD.
     *
     * Mutable — toggled in place.
     * @default true
     */
    enabled?: boolean;
}
export interface ZoneTransferOutgoingAttributes {
    /** Zone whose outgoing transfer configuration is managed. */
    zoneId: string;
    /** Identifier of the configuration (mirrors the zone id). */
    id: string | undefined;
    /** Zone name. */
    name: string | undefined;
    /** Peer ids the zone is served to. */
    peers: string[];
    /** Whether outgoing transfers are enabled. */
    enabled: boolean;
    /** SOA serial of the most recent transfer. */
    soaSerial: number | undefined;
    /** When the zone was last transferred out. */
    lastTransferredTime: string | undefined;
    /** When the zone was last checked. */
    checkedTime: string | undefined;
    /** When the configuration was created. */
    createdTime: string | undefined;
}
export type ZoneTransferOutgoing = Resource<TypeId, ZoneTransferOutgoingProps, ZoneTransferOutgoingAttributes, never, Providers>;
/**
 * The outgoing zone-transfer configuration of a primary zone
 * (`/zones/{zone_id}/secondary_dns/outgoing`) — links the zone to the
 * {@link ZoneTransferPeer | peers} Cloudflare NOTIFYs and serves
 * AXFR/IXFR to, and toggles transfers on or off via the dedicated
 * enable/disable endpoints.
 *
 * Requires the Secondary DNS (zone transfer) entitlement on the zone.
 * The configuration is a per-zone singleton: `zoneId` is the identity
 * (replacement on change), everything else is mutable in place.
 * ### Configuring outgoing transfers
 * **Example:** Serve a primary zone to an external secondary
 * ```typescript
 * const peer = yield* Cloudflare.DNS.ZoneTransferPeer("Secondary", {
 *   ip: "192.0.2.53",
 *   port: 53,
 * });
 * yield* Cloudflare.DNS.ZoneTransferOutgoing("Outgoing", {
 *   zoneId: zone.zoneId,
 *   name: "example.com.",
 *   peers: [peer.peerId],
 * });
 * ```
 *
 * **Example:** Configure transfers but keep them disabled
 * ```typescript
 * yield* Cloudflare.DNS.ZoneTransferOutgoing("Outgoing", {
 *   zoneId: zone.zoneId,
 *   name: "example.com.",
 *   peers: [peer.peerId],
 *   enabled: false,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/zone-setups/zone-transfers/setup/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const ZoneTransferOutgoing: import("../../Resource.ts").ResourceClass<ZoneTransferOutgoing>;
/**
 * Returns true if the given value is a ZoneTransferOutgoing resource.
 */
export declare const isZoneTransferOutgoing: (value: unknown) => value is ZoneTransferOutgoing;
export declare const ZoneTransferOutgoingProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneTransferOutgoing>, never, CloudflareEnvironment | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=ZoneTransferOutgoing.d.ts.map