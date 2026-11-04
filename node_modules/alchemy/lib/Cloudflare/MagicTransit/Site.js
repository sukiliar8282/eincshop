import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.MagicTransit.Site";
/**
 * A Magic WAN site — represents a physical or logical network location
 * (typically backed by a Magic WAN Connector appliance) under which LANs,
 * WANs, and ACLs are configured.
 *
 * Requires a Magic WAN subscription — accounts without it receive a typed
 * `MagicWanUnauthorized` error (Cloudflare code 1025).
 *
 * `haMode` is create-only — changing it triggers a replacement. Everything
 * else is updated in place.
 * ### Creating a site
 * **Example:** Basic site
 * ```typescript
 * const site = yield* Cloudflare.MagicTransit.MagicSite("hq", {
 *   description: "Headquarters",
 *   location: { lat: "37.7749", lon: "-122.4194" },
 * });
 * ```
 *
 * **Example:** Site with LAN and WAN
 * ```typescript
 * const site = yield* Cloudflare.MagicTransit.MagicSite("hq", {});
 *
 * const wan = yield* Cloudflare.MagicTransit.MagicSiteWan("hq-wan", {
 *   siteId: site.siteId,
 *   physport: 1,
 * });
 *
 * const lan = yield* Cloudflare.MagicTransit.MagicSiteLan("hq-lan", {
 *   siteId: site.siteId,
 *   physport: 2,
 *   vlanTag: 0,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/configuration/connector/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export const MagicSite = Resource(TypeId);
/**
 * Returns true if the given value is a MagicSite resource.
 */
export const isMagicSite = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const MagicSiteProvider = () => Provider.succeed(MagicSite, {
    stables: ["siteId", "accountId", "haMode"],
    // Account collection — Magic WAN sites are account-scoped and enumerated
    // via the paginated list API. Accounts without a Magic WAN subscription
    // reject with the typed `MagicWanUnauthorized` (code 1025) → return [].
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* magicTransit.listSites.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((site) => toAttributes(site, accountId)))), Effect.catchTag("MagicWanUnauthorized", () => Effect.succeed([])));
    }),
    diff: Effect.fn(function* ({ olds, news }) {
        if (!isResolved(news))
            return undefined;
        if (olds === undefined)
            return undefined;
        // haMode is create-only — the update API has no such field.
        if ((olds.haMode ?? false) !== (news.haMode ?? false)) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.siteId) {
            const observed = yield* getSite(acct, output.siteId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. Sites carry no ownership markers; report as
        // Unowned so takeover is gated behind the adopt policy.
        const name = yield* createSiteName(id, olds?.name);
        const observed = yield* findByName(acct, name);
        if (observed)
            return Unowned(toAttributes(observed, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* createSiteName(id, news.name);
        // Inputs have been resolved to concrete strings by Plan.
        const connectorId = news.connectorId;
        const secondaryConnectorId = news.secondaryConnectorId;
        // Observe — the id on `output` is a hint; fall back to a name scan.
        let observed = output?.siteId
            ? yield* getSite(accountId, output.siteId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // Ensure — create when missing.
        if (!observed) {
            const created = yield* magicTransit.createSite({
                accountId,
                name,
                description: news.description,
                connectorId,
                secondaryConnectorId,
                haMode: news.haMode,
                location: news.location,
            });
            return toAttributes({ ...created, id: created.id ?? undefined }, accountId);
        }
        // Sync — diff observed cloud state against desired; skip on no-op.
        const dirty = (observed.name ?? undefined) !== name ||
            (news.description !== undefined &&
                (observed.description ?? undefined) !== news.description) ||
            (connectorId !== undefined &&
                (observed.connectorId ?? undefined) !== connectorId) ||
            (secondaryConnectorId !== undefined &&
                (observed.secondaryConnectorId ?? undefined) !==
                    secondaryConnectorId) ||
            locationDirty(observed.location, news.location);
        if (dirty) {
            const updated = yield* magicTransit.updateSite({
                accountId,
                siteId: observed.id,
                name,
                description: news.description,
                connectorId,
                secondaryConnectorId,
                location: news.location,
            });
            observed = { ...updated, id: updated.id ?? observed.id };
        }
        return toAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* magicTransit
            .deleteSite({
            accountId: output.accountId,
            siteId: output.siteId,
        })
            .pipe(Effect.catchTag("SiteNotFound", () => Effect.void));
    }),
});
/**
 * Read a site by id, mapping "gone" (`SiteNotFound`, HTTP 404) to
 * `undefined`.
 */
const getSite = (accountId, siteId) => magicTransit.getSite({ accountId, siteId }).pipe(Effect.map((s) => s), Effect.catchTag("SiteNotFound", () => Effect.succeed(undefined)));
/**
 * Find a site by exact name. Site names are not enforced unique on
 * Cloudflare's side, so pick the first match deterministically by id.
 */
const findByName = (accountId, name) => magicTransit.listSites({ accountId }).pipe(Effect.map((r) => r.result
    .filter((s) => s.name === name)
    .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
    .at(0)));
const createSiteName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const locationDirty = (observed, desired) => {
    if (desired === undefined)
        return false;
    return ((desired.lat !== undefined &&
        (observed?.lat ?? undefined) !== desired.lat) ||
        (desired.lon !== undefined && (observed?.lon ?? undefined) !== desired.lon));
};
const toAttributes = (site, accountId) => ({
    siteId: site.id ?? "",
    accountId,
    name: site.name ?? "",
    description: site.description ?? undefined,
    connectorId: site.connectorId ?? undefined,
    secondaryConnectorId: site.secondaryConnectorId ?? undefined,
    haMode: site.haMode ?? undefined,
    location: site.location
        ? {
            lat: site.location.lat ?? undefined,
            lon: site.location.lon ?? undefined,
        }
        : undefined,
});
//# sourceMappingURL=Site.js.map