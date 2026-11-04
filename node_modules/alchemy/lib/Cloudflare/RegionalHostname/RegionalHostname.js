import * as addressing from "@distilled.cloud/cloudflare/addressing";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
import { listAllZones } from "../Zone/lookup.js";
const TypeId = "Cloudflare.RegionalHostname.RegionalHostname";
/**
 * A Regional Hostname restricts which Cloudflare data centers decrypt and
 * service HTTPS traffic for a hostname (Data Localization Suite / Regional
 * Services).
 *
 * A DNS record for the hostname must exist in the zone for regionalization
 * to take effect (soft dependency on `Cloudflare.DNS.Record`). Only
 * `regionKey` is mutable; `hostname` is the path identifier and `routing`
 * is create-only, so both force a replacement.
 *
 * Requires the Data Localization Suite (or Enterprise) entitlement on the
 * zone.
 * ### Regionalizing a Hostname
 * **Example:** Pin a hostname to the EU
 * ```typescript
 * const regional = yield* Cloudflare.RegionalHostname.RegionalHostname("eu-only", {
 *   zoneId: zone.zoneId,
 *   hostname: "app.example.com",
 *   regionKey: "eu",
 * });
 * ```
 *
 * **Example:** Move it to the US in place
 * ```typescript
 * const regional = yield* Cloudflare.RegionalHostname.RegionalHostname("eu-only", {
 *   zoneId: zone.zoneId,
 *   hostname: "app.example.com",
 *   regionKey: "us",
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/data-localization/regional-services/
 *
 * @resource
 * @product Regional Hostnames
 * @category Domains & DNS
 */
export const RegionalHostname = Resource(TypeId, {
    aliases: ["Cloudflare.RegionalHostname"],
});
/**
 * Returns true if the given value is a RegionalHostname resource.
 */
export const isRegionalHostname = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const RegionalHostnameProvider = () => Provider.succeed(RegionalHostname, {
    stables: ["zoneId", "hostname", "createdOn"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Regional hostnames are zone-scoped (/zones/{id}/addressing/
        // regional_hostnames) with no account-wide enumeration API — fan out
        // over every zone and list each zone's regional hostnames.
        const zones = yield* listAllZones(accountId);
        const rows = yield* Effect.forEach(zones, (zone) => addressing.listRegionalHostnames.pages({ zoneId: zone.id }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((item) => ({
            zoneId: zone.id,
            hostname: item.hostname,
            regionKey: item.regionKey,
            routing: item.routing ?? undefined,
            createdOn: item.createdOn,
        })))), 
        // Plan-gated zones (no Data Localization Suite entitlement)
        // reject the route, and zones the ambient token cannot access
        // return a 403 `Forbidden`; skip both rather than failing the
        // whole list.
        Effect.catchTag(["InvalidRoute", "Forbidden"], () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
    diff: Effect.fn(function* ({ olds, news, output }) {
        if (olds === undefined)
            return undefined;
        if (!isResolved(news) || !isResolved(olds))
            return undefined;
        // zoneId is Input<string>; by diff time both sides are concrete.
        const oldZoneId = output?.zoneId ?? olds.zoneId;
        if (typeof oldZoneId === "string" &&
            typeof news.zoneId === "string" &&
            news.zoneId !== oldZoneId) {
            return { action: "replace" };
        }
        // The hostname is the API path identifier.
        if (news.hostname !== (output?.hostname ?? olds.hostname)) {
            return { action: "replace" };
        }
        // PATCH only accepts regionKey — routing is create-only.
        if (olds.routing !== undefined &&
            news.routing !== undefined &&
            news.routing !== olds.routing) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        // The hostname is the identifier — cold reads are trivial.
        const zoneId = output?.zoneId ??
            (typeof olds?.zoneId === "string" ? olds.zoneId : undefined);
        const hostname = output?.hostname ?? olds?.hostname;
        if (!zoneId || typeof hostname !== "string")
            return undefined;
        const observed = yield* getHostname(zoneId, hostname);
        return observed ? toAttributes(observed, zoneId) : undefined;
    }),
    reconcile: Effect.fn(function* ({ news }) {
        // Inputs have been resolved to concrete strings by Plan.
        const zoneId = news.zoneId;
        // 1. Observe — the hostname itself is the identifier.
        const observed = yield* getHostname(zoneId, news.hostname);
        // 2. Ensure — create if missing.
        if (!observed) {
            const created = yield* addressing.createRegionalHostname({
                zoneId,
                hostname: news.hostname,
                regionKey: news.regionKey,
                routing: news.routing,
            });
            return toAttributes(created, zoneId);
        }
        // 3. Sync — regionKey is the only patchable field; skip the PATCH
        //    entirely on a no-op.
        if (observed.regionKey !== news.regionKey) {
            const patched = yield* addressing.patchRegionalHostname({
                zoneId,
                hostname: news.hostname,
                regionKey: news.regionKey,
            });
            return toAttributes(patched, zoneId);
        }
        return toAttributes(observed, zoneId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* addressing
            .deleteRegionalHostname({
            zoneId: output.zoneId,
            hostname: output.hostname,
        })
            .pipe(Effect.catchTag(["RegionalHostnameNotFound", "RegionalHostnameEmpty"], () => Effect.void));
    }),
});
/**
 * Read a regional hostname, mapping "gone" (`RegionalHostnameNotFound` —
 * code 1002 — and `RegionalHostnameEmpty` — code 1000 `not_found`, returned
 * when the zone has no regional hostnames at all) to `undefined`.
 */
const getHostname = (zoneId, hostname) => addressing
    .getRegionalHostname({ zoneId, hostname })
    .pipe(Effect.catchTag(["RegionalHostnameNotFound", "RegionalHostnameEmpty"], () => Effect.succeed(undefined)));
const toAttributes = (hostname, zoneId) => ({
    zoneId,
    hostname: hostname.hostname,
    regionKey: hostname.regionKey,
    routing: hostname.routing ?? undefined,
    createdOn: hostname.createdOn,
});
//# sourceMappingURL=RegionalHostname.js.map