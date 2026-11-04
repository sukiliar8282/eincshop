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
const TypeId = "Cloudflare.MagicTransit.SiteLan";
/**
 * A LAN attached to a Magic WAN site — describes a local network segment
 * behind a Magic WAN Connector port (VLAN, addressing, routed subnets,
 * NAT).
 *
 * Requires a Magic WAN subscription — accounts without it receive a typed
 * `MagicWanUnauthorized` error (Cloudflare code 1025).
 *
 * `siteId` and `haLink` are create-only — changing either triggers a
 * replacement. Everything else is updated in place.
 * ### Creating a LAN
 * **Example:** Untagged LAN with DHCP
 * ```typescript
 * const lan = yield* Cloudflare.MagicTransit.MagicSiteLan("hq-lan", {
 *   siteId: site.siteId,
 *   physport: 2,
 *   vlanTag: 0,
 * });
 * ```
 *
 * **Example:** LAN with static addressing and a routed subnet
 * ```typescript
 * const lan = yield* Cloudflare.MagicTransit.MagicSiteLan("hq-lan", {
 *   siteId: site.siteId,
 *   physport: 2,
 *   vlanTag: 10,
 *   staticAddressing: { address: "192.168.10.1/24" },
 *   routedSubnets: [
 *     { prefix: "10.10.0.0/24", nextHop: "192.168.10.254" },
 *   ],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-wan/configuration/connector/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export const MagicSiteLan = Resource(TypeId);
/**
 * Returns true if the given value is a MagicSiteLan resource.
 */
export const isMagicSiteLan = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const MagicSiteLanProvider = () => Provider.succeed(MagicSiteLan, {
    stables: ["lanId", "siteId", "accountId"],
    diff: Effect.fn(function* ({ olds, news }) {
        if (!isResolved(news))
            return undefined;
        if (olds === undefined)
            return undefined;
        // LANs cannot move between sites.
        if (typeof olds.siteId === "string" &&
            typeof news.siteId === "string" &&
            olds.siteId !== news.siteId) {
            return { action: "replace" };
        }
        // ha_link is create-only — the update API has no such field.
        if ((olds.haLink ?? false) !== (news.haLink ?? false)) {
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
        if (output?.lanId) {
            const observed = yield* getLan(acct, siteId, output.lanId);
            if (observed)
                return toAttributes(observed, siteId, acct);
        }
        // Cold read — match the deterministic physical name. LANs carry no
        // ownership markers; report as Unowned so takeover is gated behind
        // the adopt policy.
        const name = yield* createLanName(id, olds?.name);
        const observed = yield* findByName(acct, siteId, name);
        if (observed)
            return Unowned(toAttributes(observed, siteId, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Inputs have been resolved to concrete strings by Plan.
        const siteId = news.siteId;
        const name = yield* createLanName(id, news.name);
        // Observe — the id on `output` is a hint; fall back to a name scan.
        let observed = output?.lanId
            ? yield* getLan(accountId, siteId, output.lanId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, siteId, name);
        }
        // Ensure — create when missing. The create API returns the site's
        // LAN list; pick the created LAN by name.
        if (!observed) {
            const created = yield* magicTransit.createSiteLan({
                accountId,
                siteId,
                name,
                physport: news.physport,
                vlanTag: news.vlanTag,
                haLink: news.haLink,
                isBreakout: news.isBreakout,
                isPrioritized: news.isPrioritized,
                nat: news.nat,
                routedSubnets: news.routedSubnets,
                staticAddressing: news.staticAddressing,
                bondId: news.bondId,
            });
            observed =
                created.result.find((lan) => lan.name === name) ??
                    created.result.at(0);
            if (!observed) {
                // Defensive: converge via the list if the create response shape
                // is unexpected.
                observed = yield* findByName(accountId, siteId, name);
            }
            if (observed)
                return toAttributes(observed, siteId, accountId);
            return yield* Effect.fail(new Error(`Magic WAN site LAN ${name} not visible after create`));
        }
        // Sync — the update API is a PUT; send the full desired state, but
        // skip the call entirely on a no-op of the observable fields.
        const dirty = (observed.name ?? undefined) !== name ||
            (observed.physport ?? undefined) !== news.physport ||
            (news.vlanTag !== undefined &&
                (observed.vlanTag ?? undefined) !== news.vlanTag) ||
            (news.isBreakout !== undefined &&
                (observed.isBreakout ?? false) !== news.isBreakout) ||
            (news.isPrioritized !== undefined &&
                (observed.isPrioritized ?? false) !== news.isPrioritized) ||
            (news.nat !== undefined &&
                (observed.nat?.staticPrefix ?? undefined) !==
                    news.nat.staticPrefix) ||
            (news.routedSubnets !== undefined &&
                !sameRoutedSubnets(observed.routedSubnets, news.routedSubnets)) ||
            (news.staticAddressing !== undefined &&
                (observed.staticAddressing?.address ?? undefined) !==
                    news.staticAddressing.address) ||
            (news.bondId !== undefined &&
                (observed.bondId ?? undefined) !== news.bondId);
        if (dirty) {
            const updated = yield* magicTransit.updateSiteLan({
                accountId,
                siteId,
                lanId: observed.id,
                name,
                physport: news.physport,
                vlanTag: news.vlanTag,
                isBreakout: news.isBreakout,
                isPrioritized: news.isPrioritized,
                nat: news.nat,
                routedSubnets: news.routedSubnets,
                staticAddressing: news.staticAddressing,
                bondId: news.bondId,
            });
            observed = { ...updated, id: updated.id ?? observed.id };
        }
        return toAttributes(observed, siteId, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* magicTransit
            .deleteSiteLan({
            accountId: output.accountId,
            siteId: output.siteId,
            lanId: output.lanId,
        })
            .pipe(Effect.catchTag("SiteLanNotFound", () => Effect.void));
    }),
    // LANs are sub-resources keyed by their parent Magic WAN site, which is
    // not enumerable by LAN. Fan out: list every account-scoped site, then
    // exhaustively paginate the LANs of each site (bounded concurrency) and
    // hydrate into the same Attributes shape `read` returns. Accounts (or
    // individual sites) without Magic WAN entitlement reject with the typed
    // `MagicWanUnauthorized` (Cloudflare code 1025) — nothing to enumerate,
    // so skip → [].
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const siteIds = yield* magicTransit.listSites.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .map((site) => site.id)
            .filter((id) => typeof id === "string"))), Effect.catchTag("MagicWanUnauthorized", () => Effect.succeed([])));
        const rows = yield* Effect.forEach(siteIds, (siteId) => magicTransit.listSiteLans.pages({ accountId, siteId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((lan) => toAttributes(lan, siteId, accountId)))), Effect.catchTag("MagicWanUnauthorized", () => Effect.succeed([]))), { concurrency: 10 });
        return rows.flat();
    }),
});
/**
 * Read a LAN by id, mapping "gone" (`SiteLanNotFound`, HTTP 404) to
 * `undefined`.
 */
const getLan = (accountId, siteId, lanId) => magicTransit.getSiteLan({ accountId, siteId, lanId }).pipe(Effect.map((lan) => lan), Effect.catchTag("SiteLanNotFound", () => Effect.succeed(undefined)));
/**
 * Find a LAN by exact name within a site. Names are not enforced unique;
 * pick the first match deterministically by id.
 */
const findByName = (accountId, siteId, name) => magicTransit.listSiteLans({ accountId, siteId }).pipe(Effect.map((r) => r.result
    .filter((lan) => lan.name === name)
    .sort((a, b) => (a.id ?? "").localeCompare(b.id ?? ""))
    .at(0)));
const createLanName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const sameRoutedSubnets = (observed, desired) => {
    const key = (s) => `${s.prefix}>${s.nextHop}`;
    return ([...(observed ?? [])].map(key).sort().join(",") ===
        [...desired].map(key).sort().join(","));
};
const toAttributes = (lan, siteId, accountId) => ({
    lanId: lan.id ?? "",
    siteId,
    accountId,
    name: lan.name ?? "",
    physport: lan.physport ?? undefined,
    vlanTag: lan.vlanTag ?? undefined,
    haLink: lan.haLink ?? undefined,
});
//# sourceMappingURL=SiteLan.js.map