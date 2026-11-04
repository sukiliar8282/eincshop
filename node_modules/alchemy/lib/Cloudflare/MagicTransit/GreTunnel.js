import * as magicTransit from "@distilled.cloud/cloudflare/magic-transit";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.MagicTransit.GreTunnel";
/**
 * A Magic Transit / Magic WAN GRE tunnel between Cloudflare and a customer
 * router.
 *
 * Requires a Magic Transit or Magic WAN subscription on the account —
 * accounts that are not onboarded receive a typed
 * `MagicTransitNotOnboarded` error (Cloudflare code 1012).
 *
 * The tunnel `name` is its routing identity (unique, ≤15 chars) — changing
 * it triggers a replacement, as does changing `bgp` (the update API cannot
 * modify BGP settings). Everything else is updated in place via PUT.
 * ### Creating a GRE tunnel
 * **Example:** Basic tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.MagicTransit.GreTunnel("office", {
 *   name: "office-gre-1",
 *   cloudflareGreEndpoint: "203.0.113.1",
 *   customerGreEndpoint: "198.51.100.1",
 *   interfaceAddress: "10.213.0.8/31",
 * });
 * ```
 *
 * **Example:** Tunnel with health checks and MTU
 * ```typescript
 * const tunnel = yield* Cloudflare.MagicTransit.GreTunnel("office", {
 *   name: "office-gre-1",
 *   cloudflareGreEndpoint: "203.0.113.1",
 *   customerGreEndpoint: "198.51.100.1",
 *   interfaceAddress: "10.213.0.8/31",
 *   mtu: 1476,
 *   ttl: 64,
 *   healthCheck: { enabled: true, rate: "mid", type: "reply" },
 * });
 * ```
 *
 * ### Routing traffic over the tunnel
 * **Example:** Static route via the tunnel interface
 * ```typescript
 * yield* Cloudflare.MagicTransit.MagicStaticRoute("office-route", {
 *   prefix: "10.100.0.0/24",
 *   nexthop: "10.213.0.9",
 *   priority: 100,
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/magic-transit/
 *
 * @resource
 * @product Magic Transit
 * @category Network
 */
export const GreTunnel = Resource(TypeId);
/**
 * Returns true if the given value is a GreTunnel resource.
 */
export const isGreTunnel = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const GreTunnelProvider = () => Provider.succeed(GreTunnel, {
    stables: ["tunnelId", "accountId", "createdOn"],
    diff: Effect.fn(function* ({ olds, news }) {
        if (!isResolved(news))
            return undefined;
        if (olds === undefined)
            return undefined;
        // The tunnel name is its routing identity; renames are rejected.
        if (olds.name !== news.name)
            return { action: "replace" };
        // The update API has no `bgp` field — BGP changes require recreate.
        if (!sameBgp(olds.bgp, news.bgp))
            return { action: "replace" };
        return undefined;
    }),
    read: Effect.fn(function* ({ output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        if (output?.tunnelId) {
            const observed = yield* getTunnel(acct, output.tunnelId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Cold read — tunnel names are unique per account, so an exact name
        // match identifies the tunnel. Tunnels carry no ownership markers;
        // report as Unowned so takeover is gated behind the adopt policy.
        const name = output?.name ?? olds?.name;
        if (name) {
            const observed = yield* findByName(acct, name);
            if (observed)
                return Unowned(toAttributes(observed, acct));
        }
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Observe — the id on `output` is a hint; fall through to the
        // unique-name lookup when it is gone.
        let observed = output?.tunnelId
            ? yield* getTunnel(accountId, output.tunnelId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, news.name);
        }
        // Ensure — create when missing.
        if (!observed) {
            const created = yield* magicTransit.createGreTunnel({
                accountId,
                xMagicNewHcTarget: true,
                name: news.name,
                cloudflareGreEndpoint: news.cloudflareGreEndpoint,
                customerGreEndpoint: news.customerGreEndpoint,
                interfaceAddress: news.interfaceAddress,
                interfaceAddress6: news.interfaceAddress6,
                description: news.description,
                ttl: news.ttl,
                mtu: news.mtu,
                automaticReturnRouting: news.automaticReturnRouting,
                bgp: news.bgp
                    ? {
                        customerAsn: news.bgp.customerAsn,
                        extraPrefixes: news.bgp.extraPrefixes,
                        md5Key: news.bgp.md5Key
                            ? Redacted.value(news.bgp.md5Key)
                            : undefined,
                    }
                    : undefined,
                healthCheck: news.healthCheck
                    ? {
                        enabled: news.healthCheck.enabled,
                        target: news.healthCheck.target
                            ? { saved: news.healthCheck.target }
                            : undefined,
                    }
                    : undefined,
            });
            observed = created;
        }
        // Sync — diff observed cloud state against desired; the update API
        // is a full PUT, so send everything, but skip the call on a no-op.
        // This also converges health-check fields the create API does not
        // accept (direction/rate/type).
        if (dirty(observed, news)) {
            const updated = yield* magicTransit.updateGreTunnel({
                accountId,
                greTunnelId: observed.id,
                xMagicNewHcTarget: true,
                name: news.name,
                cloudflareGreEndpoint: news.cloudflareGreEndpoint,
                customerGreEndpoint: news.customerGreEndpoint,
                interfaceAddress: news.interfaceAddress,
                interfaceAddress6: news.interfaceAddress6,
                description: news.description,
                ttl: news.ttl,
                mtu: news.mtu,
                automaticReturnRouting: news.automaticReturnRouting,
                healthCheck: news.healthCheck
                    ? {
                        enabled: news.healthCheck.enabled,
                        direction: news.healthCheck.direction,
                        rate: news.healthCheck.rate,
                        type: news.healthCheck.type,
                        target: news.healthCheck.target
                            ? { saved: news.healthCheck.target }
                            : undefined,
                    }
                    : undefined,
            });
            if (updated.modifiedGreTunnel) {
                observed = updated.modifiedGreTunnel;
            }
            else {
                // Defensive: re-read when the PUT response omits the tunnel.
                observed = (yield* getTunnel(accountId, observed.id)) ?? observed;
            }
        }
        return toAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* magicTransit
            .deleteGreTunnel({
            accountId: output.accountId,
            greTunnelId: output.tunnelId,
            xMagicNewHcTarget: true,
        })
            .pipe(Effect.catchTag("GreTunnelNotFound", () => Effect.void));
    }),
    // Account-scoped collection. `listGreTunnels` returns the full set in one
    // (non-paginated) call, so there is nothing to paginate. Accounts without
    // a Magic Transit subscription reject with the typed
    // `MagicTransitNotOnboarded` tag (code 1012) — and, depending on token
    // scope, a typed `Forbidden` (403). Both mean the account cannot enumerate
    // Magic Transit, so treat them as non-listable → [].
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* magicTransit
            .listGreTunnels({ accountId, xMagicNewHcTarget: true })
            .pipe(Effect.map((r) => (r.greTunnels ?? []).map((tunnel) => toAttributes(tunnel, accountId))), Effect.catchTag(["MagicTransitNotOnboarded", "Forbidden"], () => Effect.succeed([])));
    }),
});
/**
 * Read a tunnel by id, mapping "gone" (`GreTunnelNotFound`, Cloudflare
 * error code 1029) to `undefined`.
 */
const getTunnel = (accountId, greTunnelId) => magicTransit
    .getGreTunnel({ accountId, greTunnelId, xMagicNewHcTarget: true })
    .pipe(Effect.map((r) => r.greTunnel ?? undefined), Effect.catchTag("GreTunnelNotFound", () => Effect.succeed(undefined)));
/**
 * Find a tunnel by exact name. Names are unique per account, so at most
 * one tunnel can match.
 */
const findByName = (accountId, name) => magicTransit
    .listGreTunnels({ accountId, xMagicNewHcTarget: true })
    .pipe(Effect.map((r) => (r.greTunnels ?? []).find((t) => t.name === name)));
const observedHealthTarget = (healthCheck) => {
    const target = healthCheck?.target;
    if (typeof target === "string")
        return target;
    return target?.saved ?? undefined;
};
const dirty = (observed, news) => observed.cloudflareGreEndpoint !== news.cloudflareGreEndpoint ||
    observed.customerGreEndpoint !== news.customerGreEndpoint ||
    observed.interfaceAddress !== news.interfaceAddress ||
    (news.interfaceAddress6 !== undefined &&
        (observed.interfaceAddress6 ?? undefined) !== news.interfaceAddress6) ||
    (news.description !== undefined &&
        (observed.description ?? undefined) !== news.description) ||
    (news.ttl !== undefined && (observed.ttl ?? undefined) !== news.ttl) ||
    (news.mtu !== undefined && (observed.mtu ?? undefined) !== news.mtu) ||
    healthCheckDirty(observed, news.healthCheck);
const healthCheckDirty = (observed, desired) => {
    if (desired === undefined)
        return false;
    const hc = observed.healthCheck ?? {};
    return ((desired.enabled !== undefined &&
        (hc.enabled ?? undefined) !== desired.enabled) ||
        (desired.direction !== undefined &&
            (hc.direction ?? undefined) !== desired.direction) ||
        (desired.rate !== undefined && (hc.rate ?? undefined) !== desired.rate) ||
        (desired.type !== undefined && (hc.type ?? undefined) !== desired.type) ||
        (desired.target !== undefined &&
            observedHealthTarget(hc) !== desired.target));
};
const sameBgp = (a, b) => {
    if (a === undefined && b === undefined)
        return true;
    if (a === undefined || b === undefined)
        return false;
    const aKey = a.md5Key ? Redacted.value(a.md5Key) : undefined;
    const bKey = b.md5Key ? Redacted.value(b.md5Key) : undefined;
    return (a.customerAsn === b.customerAsn &&
        aKey === bKey &&
        (a.extraPrefixes ?? []).join(",") === (b.extraPrefixes ?? []).join(","));
};
const toAttributes = (tunnel, accountId) => ({
    tunnelId: tunnel.id,
    accountId,
    name: tunnel.name,
    cloudflareGreEndpoint: tunnel.cloudflareGreEndpoint,
    customerGreEndpoint: tunnel.customerGreEndpoint,
    interfaceAddress: tunnel.interfaceAddress,
    interfaceAddress6: tunnel.interfaceAddress6 ?? undefined,
    description: tunnel.description ?? undefined,
    ttl: tunnel.ttl ?? undefined,
    mtu: tunnel.mtu ?? undefined,
    createdOn: tunnel.createdOn ?? undefined,
    modifiedOn: tunnel.modifiedOn ?? undefined,
});
//# sourceMappingURL=GreTunnel.js.map