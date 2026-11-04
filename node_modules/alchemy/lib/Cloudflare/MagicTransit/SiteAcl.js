import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.MagicTransit.SiteAcl";
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
export const MagicSiteAcl = Resource(TypeId);
/**
 * Returns true if the given value is a MagicSiteAcl resource.
 */
export const isMagicSiteAcl = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const MagicSiteAclProvider = () => Provider.succeed(MagicSiteAcl, {
    stables: ["aclId", "siteId", "accountId"],
    diff: Effect.fn(function* ({ olds, news }) {
        if (!isResolved(news))
            return undefined;
        if (olds === undefined)
            return undefined;
        // ACLs cannot move between sites.
        if (typeof olds.siteId === "string" &&
            typeof news.siteId === "string" &&
            olds.siteId !== news.siteId) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const siteId = output?.siteId ??
            (typeof olds?.siteId === "string" ? olds.siteId : undefined);
        if (!siteId)
            return undefined;
        if (output?.aclId) {
            const observed = yield* getAcl(acct, siteId, output.aclId);
            if (observed)
                return toAttributes(observed, siteId, acct);
        }
        // Cold read — match by name within the site. ACLs carry no
        // ownership markers; report as Unowned so takeover is gated behind
        // the adopt policy.
        const name = output?.name ?? olds?.name;
        if (name) {
            const observed = yield* findByName(acct, siteId, name);
            if (observed)
                return Unowned(toAttributes(observed, siteId, acct));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Inputs have been resolved to concrete strings by Plan.
        const siteId = news.siteId;
        const lan1 = toLanRequest(news.lan1);
        const lan2 = toLanRequest(news.lan2);
        // Observe — the id on `output` is a hint; fall back to a name scan.
        let observed = output?.aclId
            ? yield* getAcl(accountId, siteId, output.aclId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, siteId, news.name);
        }
        // Ensure — create when missing.
        if (!observed) {
            const created = yield* magicTransit.createSiteAcl({
                accountId,
                siteId,
                name: news.name,
                lan_1: lan1,
                lan_2: lan2,
                description: news.description,
                forwardLocally: news.forwardLocally,
                protocols: news.protocols,
                unidirectional: news.unidirectional,
            });
            return toAttributes(created, siteId, accountId);
        }
        // Sync — the update API is a PUT; send the full desired state, but
        // skip the call entirely on a no-op.
        const dirty = (observed.name ?? undefined) !== news.name ||
            (news.description !== undefined &&
                (observed.description ?? undefined) !== news.description) ||
            (news.forwardLocally !== undefined &&
                (observed.forwardLocally ?? false) !== news.forwardLocally) ||
            (news.unidirectional !== undefined &&
                (observed.unidirectional ?? false) !== news.unidirectional) ||
            (news.protocols !== undefined &&
                !sameList(observed.protocols, news.protocols)) ||
            lanDirty(observed.lan_1, lan1) ||
            lanDirty(observed.lan_2, lan2);
        if (dirty) {
            const updated = yield* magicTransit.updateSiteAcl({
                accountId,
                siteId,
                aclId: observed.id,
                name: news.name,
                lan_1: lan1,
                lan_2: lan2,
                description: news.description,
                forwardLocally: news.forwardLocally,
                protocols: news.protocols,
                unidirectional: news.unidirectional,
            });
            observed = { ...updated, id: updated.id ?? observed.id };
        }
        return toAttributes(observed, siteId, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* magicTransit
            .deleteSiteAcl({
            accountId: output.accountId,
            siteId: output.siteId,
            aclId: output.aclId,
        })
            .pipe(Effect.catchTag("SiteAclNotFound", () => Effect.void));
    }),
    // Parent fan-out: ACLs are sub-resources keyed by site, and there is no
    // account-wide ACL enumeration API. Enumerate every Magic site (account
    // scope), then list ACLs per site with bounded concurrency, paginating
    // each list exhaustively. Magic WAN-gated accounts (and partial-scope
    // tokens) reject these routes with the typed `MagicWanUnauthorized`
    // (code 1025) / `Forbidden` tags — treat those as "nothing to list".
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const siteIds = yield* magicTransit.listSites.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).flatMap((site) => (site.id ? [site.id] : [])))), Effect.catchTag(["MagicWanUnauthorized", "Forbidden"], () => Effect.succeed([])));
        const rows = yield* Effect.forEach(siteIds, (siteId) => magicTransit.listSiteAcls.pages({ accountId, siteId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((acl) => toAttributes(acl, siteId, accountId)))), 
        // Site vanished or became inaccessible mid-enumeration — skip it.
        Effect.catchTag(["MagicWanUnauthorized", "Forbidden"], () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Read an ACL by id, mapping "gone" (`SiteAclNotFound`, HTTP 404) to
 * `undefined`.
 */
const getAcl = (accountId, siteId, aclId) => magicTransit.getSiteAcl({ accountId, siteId, aclId }).pipe(Effect.map((acl) => acl), Effect.catchTag("SiteAclNotFound", () => Effect.succeed(undefined)));
/**
 * Find an ACL by exact name within a site. Names are not enforced unique;
 * pick the first match deterministically by id.
 */
const findByName = (accountId, siteId, name) => magicTransit.listSiteAcls({ accountId, siteId }).pipe(Effect.map((r) => r.result
    .filter((acl) => acl.name === name)
    .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
    .at(0)));
const toLanRequest = (lan) => ({
    // Inputs have been resolved to concrete strings by Plan.
    lanId: lan.lanId,
    lanName: lan.lanName,
    ports: lan.ports,
    portRanges: lan.portRanges,
    subnets: lan.subnets,
});
const sameList = (a, b) => [...(a ?? [])].sort().join(",") === [...(b ?? [])].sort().join(",");
const lanDirty = (observed, desired) => (observed?.lanId ?? undefined) !== desired.lanId ||
    (desired.ports !== undefined && !sameList(observed?.ports, desired.ports)) ||
    (desired.portRanges !== undefined &&
        !sameList(observed?.portRanges, desired.portRanges)) ||
    (desired.subnets !== undefined &&
        !sameList(observed?.subnets, desired.subnets));
const toAttributes = (acl, siteId, accountId) => ({
    aclId: acl.id ?? "",
    siteId,
    accountId,
    name: acl.name ?? "",
    description: acl.description ?? undefined,
    forwardLocally: acl.forwardLocally ?? undefined,
    protocols: acl.protocols
        ? acl.protocols.map((p) => p)
        : undefined,
    unidirectional: acl.unidirectional ?? undefined,
});
//# sourceMappingURL=SiteAcl.js.map