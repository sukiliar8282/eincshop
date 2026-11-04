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
const TypeId = "Cloudflare.MagicTransit.SiteWan";
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
export const MagicSiteWan = Resource(TypeId);
/**
 * Returns true if the given value is a MagicSiteWan resource.
 */
export const isMagicSiteWan = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const MagicSiteWanProvider = () => Provider.succeed(MagicSiteWan, {
    stables: ["wanId", "siteId", "accountId"],
    diff: Effect.fn(function* ({ olds, news }) {
        if (!isResolved(news))
            return undefined;
        if (olds === undefined)
            return undefined;
        // WANs cannot move between sites.
        if (typeof olds.siteId === "string" &&
            typeof news.siteId === "string" &&
            olds.siteId !== news.siteId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const siteId = output?.siteId ??
            (typeof olds?.siteId === "string" ? olds.siteId : undefined);
        if (!siteId)
            return undefined;
        if (output?.wanId) {
            const observed = yield* getWan(acct, siteId, output.wanId);
            if (observed)
                return toAttributes(observed, siteId, acct);
        }
        // Cold read — match the deterministic physical name. WANs carry no
        // ownership markers; report as Unowned so takeover is gated behind
        // the adopt policy.
        const name = yield* createWanName(id, olds?.name);
        const observed = yield* findByName(acct, siteId, name);
        if (observed)
            return Unowned(toAttributes(observed, siteId, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Inputs have been resolved to concrete strings by Plan.
        const siteId = news.siteId;
        const name = yield* createWanName(id, news.name);
        // Observe — the id on `output` is a hint; fall back to a name scan.
        let observed = output?.wanId
            ? yield* getWan(accountId, siteId, output.wanId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, siteId, name);
        }
        // Ensure — create when missing. The create API returns the site's
        // WAN list; pick the created WAN by name.
        if (!observed) {
            const created = yield* magicTransit.createSiteWan({
                accountId,
                siteId,
                name,
                physport: news.physport,
                priority: news.priority,
                vlanTag: news.vlanTag,
                staticAddressing: news.staticAddressing,
            });
            observed =
                created.result.find((wan) => wan.name === name) ??
                    created.result.at(0) ??
                    (yield* findByName(accountId, siteId, name));
            if (observed)
                return toAttributes(observed, siteId, accountId);
            return yield* Effect.fail(new Error(`Magic WAN site WAN ${name} not visible after create`));
        }
        // Sync — the update API is a PUT; send the full desired state, but
        // skip the call entirely on a no-op of the observable fields.
        const dirty = (observed.name ?? undefined) !== name ||
            (observed.physport ?? undefined) !== news.physport ||
            (news.priority !== undefined &&
                (observed.priority ?? undefined) !== news.priority) ||
            (news.vlanTag !== undefined &&
                (observed.vlanTag ?? undefined) !== news.vlanTag) ||
            staticAddressingDirty(observed.staticAddressing, news.staticAddressing);
        if (dirty) {
            const updated = yield* magicTransit.updateSiteWan({
                accountId,
                siteId,
                wanId: observed.id,
                name,
                physport: news.physport,
                priority: news.priority,
                vlanTag: news.vlanTag,
                staticAddressing: news.staticAddressing,
            });
            observed = { ...updated, id: updated.id ?? observed.id };
        }
        return toAttributes(observed, siteId, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* magicTransit
            .deleteSiteWan({
            accountId: output.accountId,
            siteId: output.siteId,
            wanId: output.wanId,
        })
            .pipe(Effect.catchTag("SiteWanNotFound", () => Effect.void));
    }),
    // Parent fan-out: WANs are sub-resources keyed by site, and there is no
    // account-wide WAN enumeration API. Enumerate every Magic site (account
    // scope), then list WANs per site with bounded concurrency, paginating
    // each list exhaustively. Magic WAN-gated accounts (and partial-scope
    // tokens) reject these routes with the typed `MagicWanUnauthorized`
    // (code 1025) / `Forbidden` tags — treat those as "nothing to list".
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const siteIds = yield* magicTransit.listSites.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).flatMap((site) => (site.id ? [site.id] : [])))), Effect.catchTag(["MagicWanUnauthorized", "Forbidden"], () => Effect.succeed([])));
        const rows = yield* Effect.forEach(siteIds, (siteId) => magicTransit.listSiteWans.pages({ accountId, siteId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((wan) => toAttributes(wan, siteId, accountId)))), 
        // Site vanished or became inaccessible mid-enumeration — skip it.
        Effect.catchTag(["MagicWanUnauthorized", "Forbidden"], () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Read a WAN by id, mapping "gone" (`SiteWanNotFound`, HTTP 404) to
 * `undefined`.
 */
const getWan = (accountId, siteId, wanId) => magicTransit.getSiteWan({ accountId, siteId, wanId }).pipe(Effect.map((wan) => wan), Effect.catchTag("SiteWanNotFound", () => Effect.succeed(undefined)));
/**
 * Find a WAN by exact name within a site. Names are not enforced unique;
 * pick the first match deterministically by id.
 */
const findByName = (accountId, siteId, name) => magicTransit.listSiteWans({ accountId, siteId }).pipe(Effect.map((r) => r.result
    .filter((wan) => wan.name === name)
    .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
    .at(0)));
const createWanName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const staticAddressingDirty = (observed, desired) => {
    if (desired === undefined)
        return false;
    return ((observed?.address ?? undefined) !== desired.address ||
        (observed?.gatewayAddress ?? undefined) !== desired.gatewayAddress ||
        (desired.secondaryAddress !== undefined &&
            (observed?.secondaryAddress ?? undefined) !== desired.secondaryAddress));
};
const toAttributes = (wan, siteId, accountId) => ({
    wanId: wan.id ?? "",
    siteId,
    accountId,
    name: wan.name ?? "",
    physport: wan.physport ?? undefined,
    priority: wan.priority ?? undefined,
    vlanTag: wan.vlanTag ?? undefined,
    healthCheckRate: wan.healthCheckRate ?? undefined,
});
//# sourceMappingURL=SiteWan.js.map