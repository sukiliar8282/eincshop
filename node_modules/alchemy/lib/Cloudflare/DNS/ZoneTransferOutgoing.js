import * as dns from "@distilled.cloud/cloudflare/dns";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import { Unowned } from "../../AdoptPolicy.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.DNS.ZoneTransferOutgoing";
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
export const ZoneTransferOutgoing = Resource(TypeId, {
    aliases: ["Cloudflare.Dns.ZoneTransferOutgoing"],
});
/**
 * Returns true if the given value is a ZoneTransferOutgoing resource.
 */
export const isZoneTransferOutgoing = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const ZoneTransferOutgoingProvider = () => Provider.succeed(ZoneTransferOutgoing, {
    stables: ["zoneId", "id", "createdTime"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // The outgoing transfer config is a per-zone singleton with no
        // account-wide enumeration API — walk every zone and read its
        // config. Most zones have none (or lack the Secondary DNS
        // entitlement); skip those via the typed not-found/not-allowed
        // tags rather than failing the whole enumeration.
        const allZones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(allZones.map((zone) => zone.id), (zoneId) => getOutgoing(zoneId).pipe(Effect.catchTag("OutgoingZoneTransfersNotAllowed", () => Effect.succeed(undefined)), Effect.flatMap((observed) => observed === undefined
            ? Effect.succeed(undefined)
            : getEnabled(zoneId).pipe(Effect.map((enabled) => toAttributes(observed, zoneId, enabled))))), { concurrency: 10 });
        return rows.filter((row) => row !== undefined);
    }),
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const o = olds;
        const n = news;
        // zoneId is the resource's identity (per-zone singleton).
        // Input<string> — compare only once concrete.
        const oldZoneId = output?.zoneId ?? (typeof o.zoneId === "string" ? o.zoneId : undefined);
        if (oldZoneId !== undefined &&
            typeof n.zoneId === "string" &&
            oldZoneId !== n.zoneId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        if (!zoneId)
            return undefined;
        const observed = yield* getOutgoing(zoneId);
        if (observed === undefined)
            return undefined;
        const enabled = yield* getEnabled(zoneId);
        const attrs = toAttributes(observed, zoneId, enabled);
        // The configuration carries no ownership markers. With no prior
        // state, gate takeover of an existing configuration behind
        // adoption.
        return output === undefined ? Unowned(attrs) : attrs;
    }),
    reconcile: Effect.fn(function* ({ news }) {
        // Inputs are resolved to concrete values by Plan.
        const zoneId = news.zoneId;
        const peers = news.peers;
        const desiredEnabled = news.enabled ?? true;
        // Observe — singleton keyed by the zone itself.
        let observed = yield* getOutgoing(zoneId);
        if (!observed) {
            // Ensure — first-time link of the zone to its peers.
            observed = yield* dns.createZoneTransferOutgoing({
                zoneId,
                name: news.name,
                peers,
            });
        }
        else {
            // Sync — PUT with the full desired body; skip the call when the
            // observed configuration already matches.
            const dirty = undef(observed.name) !== news.name ||
                !samePeers(observed.peers ?? [], peers);
            if (dirty) {
                observed = yield* dns.updateZoneTransferOutgoing({
                    zoneId,
                    name: news.name,
                    peers,
                });
            }
        }
        // Sync enabled state — the enable/disable toggle lives on its own
        // endpoints; diff the observed status and only call on a delta.
        const observedEnabled = yield* getEnabled(zoneId);
        if (observedEnabled !== desiredEnabled) {
            yield* desiredEnabled
                ? dns.enableZoneTransferOutgoing({ zoneId })
                : dns.disableZoneTransferOutgoing({ zoneId });
        }
        return toAttributes(observed, zoneId, desiredEnabled);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* dns.deleteZoneTransferOutgoing({ zoneId: output.zoneId }).pipe(Effect.catchTag("OutgoingZoneTransferNotFound", () => Effect.void), 
        // Cloudflare answers DELETE on a zone without the outgoing
        // entitlement (or with no configuration) with a 401 — if we
        // could never have created it, there is nothing to delete.
        Effect.catchTag("OutgoingZoneTransfersNotAllowed", () => Effect.void));
    }),
});
const undef = (v) => v == null ? undefined : v;
/** Read the outgoing configuration, mapping "not linked" to undefined. */
const getOutgoing = (zoneId) => dns
    .getZoneTransferOutgoing({ zoneId })
    .pipe(Effect.catchTag("OutgoingZoneTransferNotFound", () => Effect.succeed(undefined)));
/** Observe the enable/disable toggle (reported as e.g. "Enabled"). */
const getEnabled = (zoneId) => dns
    .getZoneTransferOutgoingStatus({ zoneId })
    .pipe(Effect.map((status) => status.toLowerCase().startsWith("enabled")));
const samePeers = (observed, desired) => observed.length === desired.length &&
    [...observed].sort().join(",") === [...desired].sort().join(",");
const toAttributes = (outgoing, zoneId, enabled) => ({
    zoneId,
    id: undef(outgoing.id),
    name: undef(outgoing.name),
    peers: [...(undef(outgoing.peers) ?? [])],
    enabled,
    soaSerial: undef(outgoing.soaSerial),
    lastTransferredTime: undef(outgoing.lastTransferredTime),
    checkedTime: undef(outgoing.checkedTime),
    createdTime: undef(outgoing.createdTime),
});
//# sourceMappingURL=ZoneTransferOutgoing.js.map