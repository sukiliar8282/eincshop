import * as dnsFirewall from "@distilled.cloud/cloudflare/dns-firewall";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.DNS.Firewall";
/**
 * A Cloudflare DNS Firewall cluster.
 *
 * DNS Firewall sits in front of your authoritative DNS infrastructure,
 * caching responses on Cloudflare's anycast network and shielding the
 * upstream nameservers from attack traffic. Creating a cluster assigns a
 * set of Cloudflare anycast IPs (`dnsFirewallIps`) that you point NS glue
 * records at; queries hitting those IPs are answered from cache or
 * forwarded to your `upstreamIps`.
 *
 * DNS Firewall is a paid add-on (typically Enterprise / contract). On
 * accounts without the entitlement, creation fails with the typed
 * `DnsFirewallNotEntitled` error (Cloudflare error code 10101).
 *
 * All settings are mutable in place; only `name` (the cold-state recovery
 * identity) triggers a replacement.
 * ### Creating a Cluster
 * **Example:** Basic cluster
 * ```typescript
 * const cluster = yield* Cloudflare.DNS.Firewall("dns-shield", {
 *   upstreamIps: ["192.0.2.1", "192.0.2.2"],
 * });
 * // Point NS glue records at the assigned anycast IPs:
 * const ips = cluster.dnsFirewallIps;
 * ```
 *
 * **Example:** Tuned caching and attack mitigation
 * ```typescript
 * const cluster = yield* Cloudflare.DNS.Firewall("dns-shield", {
 *   upstreamIps: ["192.0.2.1"],
 *   minimumCacheTtl: 120,
 *   maximumCacheTtl: 3600,
 *   negativeCacheTtl: 300,
 *   ratelimit: 600,
 *   retries: 2,
 *   attackMitigation: {
 *     enabled: true,
 *     onlyWhenUpstreamUnhealthy: true,
 *   },
 * });
 * ```
 *
 * ### Reverse DNS
 * **Example:** Managing PTR records for cluster IPs
 * ```typescript
 * const cluster = yield* Cloudflare.DNS.Firewall("dns-shield", {
 *   upstreamIps: ["192.0.2.1"],
 *   reverseDns: {
 *     "203.0.113.1": "ns1.example.com",
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/dns/dns-firewall/
 *
 * @resource
 * @product DNS Firewall
 * @category Domains & DNS
 */
export const Firewall = Resource(TypeId, {
    aliases: ["Cloudflare.DnsFirewall"],
});
/**
 * Returns true if the given value is a DnsFirewall resource.
 */
export const isFirewall = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const FirewallProvider = () => Provider.succeed(Firewall, {
    stables: ["dnsFirewallId", "accountId", "dnsFirewallIps"],
    diff: Effect.fn(function* ({ id, olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The name is the cold-state recovery identity — renames replace.
        const oldName = output?.name ?? (yield* createClusterName(id, olds.name));
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a replace.
        const name = news.name ?? oldName;
        if (name !== oldName) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.dnsFirewallId) {
            const observed = yield* getCluster(acct, output.dnsFirewallId);
            if (!observed)
                return undefined;
            const reverseDns = olds?.reverseDns !== undefined
                ? yield* getReverseDns(acct, observed.id)
                : undefined;
            return toAttributes(observed, acct, reverseDns);
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. Cluster names are not guaranteed unique and carry
        // no ownership markers, so report the match as `Unowned`: the
        // engine refuses to take it over unless `adopt` is set.
        const name = yield* createClusterName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (!match)
            return undefined;
        const reverseDns = olds?.reverseDns !== undefined
            ? yield* getReverseDns(acct, match.id)
            : undefined;
        return Unowned(toAttributes(match, acct, reverseDns));
    }),
    list: Effect.fn(function* () {
        // Account-scoped collection: exhaustively paginate the DNS Firewall
        // list for the ambient account. Each list item already carries the
        // full cluster shape (identical to `getDnsFirewall`), so it maps
        // directly into the `read` Attributes shape — no per-item hydration
        // needed. `reverseDns` is left `undefined` (the same shape `read`
        // produces when no managed PTR map is tracked).
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* dnsFirewall.listDnsFirewalls.pages({ accountId }).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.result.map((cluster) => toAttributes({ ...cluster, accountId }, accountId, undefined)))));
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Prefer the deployed name: regenerating would rename the deployed
        // cluster if the generator's output for this id ever drifts.
        const name = output?.name ?? (yield* createClusterName(id, news.name));
        // Observe — the id cached on `output` is a hint, not a guarantee: a
        // missing cluster falls through to "missing" and we recreate.
        const observed = output?.dnsFirewallId
            ? yield* getCluster(output.accountId ?? accountId, output.dnsFirewallId)
            : undefined;
        let synced;
        if (!observed) {
            // Ensure — greenfield (or out-of-band delete): create with the
            // full desired body. Names are not unique on Cloudflare's side,
            // so there is no AlreadyExists race to tolerate.
            const created = yield* dnsFirewall.createDnsFirewall({
                accountId,
                name,
                upstreamIps: news.upstreamIps,
                attackMitigation: news.attackMitigation,
                deprecateAnyRequests: news.deprecateAnyRequests,
                ecsFallback: news.ecsFallback,
                maximumCacheTtl: news.maximumCacheTtl,
                minimumCacheTtl: news.minimumCacheTtl,
                negativeCacheTtl: news.negativeCacheTtl,
                ratelimit: news.ratelimit,
                retries: news.retries,
            });
            synced = { ...created, accountId };
        }
        else {
            // Sync — diff observed cloud state against the desired settings
            // (props with their documented defaults applied) and PATCH only
            // when something actually differs.
            const desired = {
                name,
                upstreamIps: news.upstreamIps,
                attackMitigation: {
                    enabled: news.attackMitigation?.enabled ?? false,
                    onlyWhenUpstreamUnhealthy: news.attackMitigation?.onlyWhenUpstreamUnhealthy ?? false,
                },
                deprecateAnyRequests: news.deprecateAnyRequests ?? false,
                ecsFallback: news.ecsFallback ?? false,
                maximumCacheTtl: news.maximumCacheTtl ?? 900,
                minimumCacheTtl: news.minimumCacheTtl ?? 60,
                negativeCacheTtl: news.negativeCacheTtl ?? null,
                ratelimit: news.ratelimit ?? null,
                retries: news.retries ?? 2,
            };
            const observedMitigation = normalizeMitigation(observed.attackMitigation);
            const dirty = observed.name !== desired.name ||
                !sameIps(observed.upstreamIps, desired.upstreamIps) ||
                observedMitigation.enabled !== desired.attackMitigation.enabled ||
                observedMitigation.onlyWhenUpstreamUnhealthy !==
                    desired.attackMitigation.onlyWhenUpstreamUnhealthy ||
                observed.deprecateAnyRequests !== desired.deprecateAnyRequests ||
                observed.ecsFallback !== desired.ecsFallback ||
                observed.maximumCacheTtl !== desired.maximumCacheTtl ||
                observed.minimumCacheTtl !== desired.minimumCacheTtl ||
                observed.negativeCacheTtl !== desired.negativeCacheTtl ||
                observed.ratelimit !== desired.ratelimit ||
                observed.retries !== desired.retries;
            synced = dirty
                ? {
                    ...(yield* dnsFirewall.patchDnsFirewall({
                        accountId: observed.accountId,
                        dnsFirewallId: observed.id,
                        ...desired,
                    })),
                    accountId: observed.accountId,
                }
                : observed;
        }
        // Sync reverse DNS (PTR) entries when managed. Only the entries in
        // the desired map are reconciled — observed entries outside the map
        // are left untouched.
        let reverseDns;
        if (news.reverseDns !== undefined) {
            const observedPtr = yield* getReverseDns(synced.accountId, synced.id);
            const dirtyPtr = Object.entries(news.reverseDns).some(([ip, ptr]) => observedPtr[ip] !== ptr);
            if (dirtyPtr) {
                yield* dnsFirewall.patchReverseDn({
                    accountId: synced.accountId,
                    dnsFirewallId: synced.id,
                    ptr: news.reverseDns,
                });
            }
            reverseDns = { ...observedPtr, ...news.reverseDns };
        }
        return toAttributes(synced, synced.accountId, reverseDns);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* dnsFirewall
            .deleteDnsFirewall({
            accountId: output.accountId,
            dnsFirewallId: output.dnsFirewallId,
        })
            .pipe(Effect.catchTag("DnsFirewallNotFound", () => Effect.void));
    }),
});
/**
 * Read a cluster by id, mapping "gone" (`DnsFirewallNotFound`, Cloudflare
 * error code 11001) to `undefined`.
 */
const getCluster = (accountId, dnsFirewallId) => dnsFirewall.getDnsFirewall({ accountId, dnsFirewallId }).pipe(Effect.map((c) => ({ ...c, accountId })), Effect.catchTag("DnsFirewallNotFound", () => Effect.succeed(undefined)));
/**
 * Read the reverse DNS (PTR) map of a cluster, narrowing the distilled
 * `Record<string, unknown>` values to strings.
 */
const getReverseDns = (accountId, dnsFirewallId) => dnsFirewall
    .getReverseDn({ accountId, dnsFirewallId })
    .pipe(Effect.map((r) => Object.fromEntries(Object.entries(r.ptr).flatMap(([ip, ptr]) => typeof ptr === "string" && ptr !== "" ? [[ip, ptr]] : []))));
/**
 * Find a cluster by exact name. The list API has no name filter, so scan
 * the (paginated) account list client-side. If several clusters carry the
 * same name, pick the lexicographically smallest id for determinism.
 */
const findByName = (accountId, name) => dnsFirewall.listDnsFirewalls.items({ accountId }).pipe(Stream.filter((c) => c.name === name), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => a.id.localeCompare(b.id))
    .at(0)), Effect.map((match) => match ? { ...match, accountId } : undefined));
const createClusterName = (id, name) => Effect.gen(function* () {
    return name ?? (yield* createPhysicalName({ id, lowercase: true }));
});
const normalizeMitigation = (mitigation) => ({
    enabled: mitigation?.enabled ?? false,
    onlyWhenUpstreamUnhealthy: mitigation?.onlyWhenUpstreamUnhealthy ?? false,
});
const sameIps = (observed, desired) => observed.length === desired.length &&
    [...observed].sort().join(",") === [...desired].sort().join(",");
const toAttributes = (cluster, accountId, reverseDns) => ({
    dnsFirewallId: cluster.id,
    accountId,
    name: cluster.name,
    dnsFirewallIps: [...cluster.dnsFirewallIps],
    upstreamIps: [...cluster.upstreamIps],
    attackMitigation: normalizeMitigation(cluster.attackMitigation),
    deprecateAnyRequests: cluster.deprecateAnyRequests,
    ecsFallback: cluster.ecsFallback,
    maximumCacheTtl: cluster.maximumCacheTtl,
    minimumCacheTtl: cluster.minimumCacheTtl,
    negativeCacheTtl: cluster.negativeCacheTtl,
    ratelimit: cluster.ratelimit,
    retries: cluster.retries,
    reverseDns,
    modifiedOn: cluster.modifiedOn,
});
//# sourceMappingURL=Firewall.js.map