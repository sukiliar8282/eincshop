import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/**
 * A Cloudflare Tunnel Route attaches a private CIDR to a `cfd_tunnel` so that
 * WARP clients (and other Zero Trust egress paths) can reach private IPs
 * through the tunnel.
 * ### Creating a Route
 * **Example:** Basic route
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("MyTunnel");
 * const route = yield* Cloudflare.Tunnel.Route("PrivateNet", {
 *   tunnelId: tunnel.tunnelId,
 *   network: "10.4.0.0/16",
 * });
 * ```
 *
 * **Example:** Route with a comment and explicit virtual network
 * ```typescript
 * const route = yield* Cloudflare.Tunnel.Route("DcRoute", {
 *   tunnelId: tunnel.tunnelId,
 *   network: "10.50.0.0/16",
 *   comment: "Datacenter A private subnet",
 *   virtualNetworkId: vnet.id,
 *   adopt: true,
 * });
 * ```
 *
 * @resource
 * @product Tunnels
 * @category Cloudflare One (Zero Trust)
 */
export const Route = Resource("Cloudflare.Tunnel.Route", {
    aliases: ["Cloudflare.TunnelRoute"],
});
export const RouteProvider = () => Provider.succeed(Route, {
    stables: [
        "routeId",
        "accountId",
        "tunnelId",
        "network",
        "virtualNetworkId",
    ],
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        const acct = output?.accountId ?? accountId;
        if (acct !== accountId) {
            return { action: "replace" };
        }
        if (output?.network !== undefined && output.network !== news.network) {
            return { action: "replace" };
        }
        if (olds.network !== undefined && olds.network !== news.network) {
            return { action: "replace" };
        }
        const oldTunnelId = output?.tunnelId ?? olds.tunnelId;
        if (oldTunnelId !== undefined && oldTunnelId !== news.tunnelId) {
            return { action: "replace" };
        }
        // virtualNetworkId is auto-assigned by Cloudflare when omitted
        // (every account has a "default" virtual network that absorbs
        // routes without an explicit assignment). If the caller didn't
        // ask for a specific vnet (`news.virtualNetworkId === undefined`),
        // they're delegating to CF — don't force a replace just because
        // CF auto-assigned one. Only mark replace when the caller has
        // EXPLICITLY chosen a vnet and it differs from what's deployed.
        if (news.virtualNetworkId !== undefined &&
            (output?.virtualNetworkId ?? olds.virtualNetworkId) !==
                news.virtualNetworkId) {
            return { action: "replace" };
        }
    }),
    reconcile: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const tunnelId = news.tunnelId;
        const network = news.network;
        const virtualNetworkId = news.virtualNetworkId;
        // Observe — cached id first, then an account-wide list scan by
        // network so we recover from out-of-band deletes, partial state
        // writes, or a route left attached to another tunnel.
        let observed = yield* observe(acct, network, virtualNetworkId, output?.routeId);
        // Ensure — create when missing. Cloudflare returns a generic
        // conflict on duplicate (network, tunnel, vnet) tuples; on any
        // such race re-observe and either adopt or rethrow.
        if (!observed) {
            // Cloudflare returns an untagged generic error on a
            // duplicate (network, tunnel, vnet) tuple. distilled
            // surfaces it as the untyped Cloudflare error bucket,
            // so we can't `catchTag` -- we narrow by re-observing
            // and only swallowing the error when adoption is
            // requested AND a matching route actually exists.
            const createdOrAdopted = yield* zeroTrust
                .createNetworkRoute({
                accountId: acct,
                network,
                tunnelId,
                comment: news.comment,
                virtualNetworkId,
            })
                .pipe(Effect.catch((err) => Effect.gen(function* () {
                if (!news.adopt)
                    return yield* Effect.fail(err);
                const existing = yield* observe(acct, network, virtualNetworkId, undefined);
                if (!existing)
                    return yield* Effect.fail(err);
                // Sentinel: undefined means "adoption path; use re-observed value".
                return undefined;
            })));
            observed = createdOrAdopted
                ? toObserved(createdOrAdopted)
                : yield* observe(acct, network, virtualNetworkId, undefined);
        }
        if (!observed) {
            return yield* Effect.die(`Route create returned no id for network ${network} on tunnel ${tunnelId}`);
        }
        // Sync — `comment` is mutable, and an adopted route may be
        // attached to a different tunnel (the account-wide network
        // uniqueness means we adopt whatever route owns the CIDR) so we
        // repoint `tunnelId` too. Skip the PATCH entirely on no-op so we
        // avoid churn on every reconcile. Clearing a comment must send
        // `""` explicitly — omitting every body field produces an empty
        // PATCH body which Cloudflare rejects with a JSON parse error.
        const desiredComment = news.comment ?? "";
        const needsComment = (observed.comment ?? "") !== desiredComment;
        const needsTunnel = observed.tunnelId !== tunnelId;
        if (needsComment || needsTunnel) {
            const patched = yield* zeroTrust.patchNetworkRoute({
                accountId: acct,
                routeId: observed.id,
                ...(needsComment ? { comment: desiredComment } : {}),
                ...(needsTunnel ? { tunnelId } : {}),
            });
            observed = {
                id: patched.id ?? observed.id,
                network: normalize(patched.network) ?? observed.network,
                tunnelId: normalize(patched.tunnelId) ?? observed.tunnelId,
                virtualNetworkId: normalize(patched.virtualNetworkId) ?? observed.virtualNetworkId,
                comment: normalize(patched.comment),
                createdAt: normalize(patched.createdAt) ?? observed.createdAt,
            };
        }
        return {
            routeId: observed.id,
            network: observed.network ?? network,
            tunnelId: observed.tunnelId ?? tunnelId,
            accountId: acct,
            comment: observed.comment,
            virtualNetworkId: observed.virtualNetworkId ?? virtualNetworkId,
            createdAt: observed.createdAt,
        };
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* zeroTrust
            .deleteNetworkRoute({
            accountId: output.accountId,
            routeId: output.routeId,
        })
            .pipe(
        // Idempotent delete: distilled doesn't tag NotFound on
        // teamnet/routes/{id}, so we swallow read-side failure
        // wholesale. A "delete a deleted route" is not an error.
        Effect.catch(() => Effect.succeed(undefined)));
    }),
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Account-scoped collection: enumerate every Zero Trust network
        // route in the account, exhaustively paginating. Drop soft-deleted
        // routes and anything missing an id, then hydrate into the exact
        // `read` Attributes shape so each element is delete-ready.
        return yield* zeroTrust.listNetworkRoutes
            .pages({ accountId, isDeleted: false })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((r) => r.id != null && !r.deletedAt)
            .map((r) => ({
            routeId: r.id,
            network: normalize(r.network) ?? "",
            tunnelId: normalize(r.tunnelId) ?? "",
            accountId,
            comment: normalize(r.comment),
            virtualNetworkId: normalize(r.virtualNetworkId),
            createdAt: normalize(r.createdAt),
        })))));
    }),
    read: Effect.fn(function* ({ olds, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const tunnelId = output?.tunnelId ?? olds?.tunnelId;
        const network = output?.network ?? olds?.network;
        const virtualNetworkId = output?.virtualNetworkId ?? olds?.virtualNetworkId;
        if (!tunnelId || !network)
            return undefined;
        const observed = yield* observe(acct, network, virtualNetworkId, output?.routeId);
        if (!observed)
            return undefined;
        return {
            routeId: observed.id,
            network: observed.network ?? network,
            tunnelId: observed.tunnelId ?? tunnelId,
            accountId: acct,
            comment: observed.comment,
            virtualNetworkId: observed.virtualNetworkId ?? virtualNetworkId,
            createdAt: observed.createdAt,
        };
    }),
});
// Route networks are unique per virtual network across the WHOLE
// account (Cloudflare rejects a duplicate CIDR with a Conflict no
// matter which tunnel it's attached to), so the scan must NOT be
// scoped to a tunnel — otherwise a route left on another tunnel is
// invisible to observation and the create Conflict is unrecoverable.
const findRouteByNetwork = (accountId, network, virtualNetworkId) => zeroTrust.listNetworkRoutes
    .items({
    accountId,
    isDeleted: false,
    // subset + superset of the same CIDR == exact match
    networkSubset: network,
    networkSuperset: network,
})
    .pipe(Stream.filter((r) => !r.deletedAt &&
    r.network === network &&
    (virtualNetworkId === undefined ||
        r.virtualNetworkId === virtualNetworkId)), Stream.runHead, Effect.map(Option.getOrUndefined), 
// The distilled cloudflare SDK only tags transport-shaped
// errors (Unauthorized / 5xx / TooManyRequests / parse
// errors) on this endpoint -- there's no `NotFound` or
// `Forbidden` tag to discriminate on. Mirror the
// canonical `Tunnel.ts` template: swallow read-side
// errors so observation falls through to "missing" and
// the ensure step can recover.
Effect.catch(() => Effect.succeed(undefined)));
const toObserved = (r) => r.id
    ? {
        id: r.id,
        network: normalize(r.network),
        tunnelId: normalize(r.tunnelId),
        virtualNetworkId: normalize(r.virtualNetworkId),
        comment: normalize(r.comment),
        createdAt: normalize(r.createdAt),
    }
    : undefined;
const observe = Effect.fn(function* (acct, network, virtualNetworkId, routeId) {
    if (routeId) {
        // See `findRouteByNetwork` -- distilled doesn't tag
        // NotFound on this endpoint, so we tolerate any read
        // error and fall through to the list scan.
        const raw = yield* zeroTrust
            .getNetworkRoute({ accountId: acct, routeId })
            .pipe(Effect.catch((_) => Effect.succeed(undefined)));
        const got = raw ? toObserved(raw) : undefined;
        if (got)
            return got;
    }
    const match = yield* findRouteByNetwork(acct, network, virtualNetworkId);
    if (!match)
        return undefined;
    return toObserved(match);
});
const normalize = (v) => v == null ? undefined : v;
//# sourceMappingURL=Route.js.map