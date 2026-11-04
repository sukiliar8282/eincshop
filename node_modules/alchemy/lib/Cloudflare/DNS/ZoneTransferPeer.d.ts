import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import { CloudflareEnvironment } from "../CloudflareEnvironment.ts";
import type { Providers } from "../Providers.ts";
declare const TypeId: "Cloudflare.DNS.ZoneTransferPeer";
type TypeId = typeof TypeId;
export interface ZoneTransferPeerProps {
    /**
     * Human-readable name of the peer. If omitted, a unique name is
     * generated from the app, stage, and logical ID.
     *
     * Mutable — updated in place (PUT).
     * @default ${app}-${stage}-${id}
     */
    name?: string;
    /**
     * IPv4/IPv6 address of the primary or secondary nameserver, depending
     * on what zone this peer is linked to. For primary (outgoing) zones
     * this is the secondary nameserver Cloudflare will NOTIFY; for
     * secondary (incoming) zones it is the primary Cloudflare transfers
     * from.
     *
     * Mutable — updated in place (PUT).
     */
    ip?: string;
    /**
     * DNS port of the primary or secondary nameserver.
     *
     * Mutable — updated in place (PUT).
     * @default 53
     */
    port?: number;
    /**
     * TSIG used to authenticate zone transfers with this peer. Reference
     * a {@link ZoneTransferTsig} via its `tsigId` attribute.
     *
     * Mutable — updated in place (PUT).
     */
    tsigId?: string;
    /**
     * Use the IXFR (incremental) transfer protocol instead of AXFR. Only
     * applicable to secondary zones.
     *
     * Mutable — updated in place (PUT).
     * @default false
     */
    ixfrEnable?: boolean;
}
export interface ZoneTransferPeerAttributes {
    /** Identifier of the peer. */
    peerId: string;
    /** The Cloudflare account the peer belongs to. */
    accountId: string;
    /** Human-readable name of the peer. */
    name: string;
    /** Nameserver IP, if configured. */
    ip: string | undefined;
    /** Nameserver DNS port, if configured. */
    port: number | undefined;
    /** TSIG used to authenticate transfers, if configured. */
    tsigId: string | undefined;
    /** Whether IXFR transfers are enabled. */
    ixfrEnable: boolean | undefined;
}
export type ZoneTransferPeer = Resource<TypeId, ZoneTransferPeerProps, ZoneTransferPeerAttributes, never, Providers>;
/**
 * A Secondary DNS zone-transfer peer
 * (`/accounts/{account_id}/secondary_dns/peers`) — an external
 * nameserver Cloudflare exchanges zone transfers with. Link peers to a
 * zone via {@link ZoneTransferIncoming} (secondary zones) or
 * {@link ZoneTransferOutgoing} (primary zones).
 *
 * Requires the Secondary DNS (zone transfer) entitlement on the
 * account. Cloudflare's create API only accepts a name; the provider
 * follows up with an update when `ip`, `port`, `tsigId`, or
 * `ixfrEnable` are declared, all of which remain mutable in place.
 * ### Creating a Peer
 * **Example:** Primary nameserver to transfer from
 * ```typescript
 * const peer = yield* Cloudflare.DNS.ZoneTransferPeer("Primary", {
 *   ip: "192.0.2.53",
 *   port: 53,
 * });
 * ```
 *
 * **Example:** Peer with TSIG authentication
 * ```typescript
 * const tsig = yield* Cloudflare.DNS.ZoneTransferTsig("TransferKey", {
 *   algo: "hmac-sha512.",
 *   secret: Redacted.make(process.env.TSIG_SECRET!),
 * });
 * const peer = yield* Cloudflare.DNS.ZoneTransferPeer("Primary", {
 *   ip: "192.0.2.53",
 *   tsigId: tsig.tsigId,
 *   ixfrEnable: true,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/zone-setups/zone-transfers/
 *
 * @resource
 * @product DNS
 * @category Domains & DNS
 */
export declare const ZoneTransferPeer: import("../../Resource.ts").ResourceClass<ZoneTransferPeer>;
/**
 * Returns true if the given value is a ZoneTransferPeer resource.
 */
export declare const isZoneTransferPeer: (value: unknown) => value is ZoneTransferPeer;
export declare const ZoneTransferPeerProvider: () => import("effect/Layer").Layer<Provider.Provider<ZoneTransferPeer>, never, CloudflareEnvironment | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage | dns.CloudflareOpContext>;
export {};
//# sourceMappingURL=ZoneTransferPeer.d.ts.map