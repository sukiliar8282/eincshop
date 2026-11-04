import * as zeroTrust from "@distilled.cloud/cloudflare/zero-trust";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { arrayEqualsUnordered } from "../../Util/equal.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Gateway.ProxyEndpoint";
/**
 * A Cloudflare Zero Trust Gateway proxy endpoint — an agentless HTTP
 * proxy for forwarding traffic to Gateway without installing the WARP
 * client, typically wired up via a PAC file pointing at the endpoint's
 * server-assigned `subdomain`.
 *
 * `ip`-kind endpoints admit traffic from a source-CIDR allowlist and
 * require an Enterprise plan (Cloudflare error code 2009 otherwise);
 * `identity`-kind endpoints authenticate individual users and work on all
 * Zero Trust plans. The kind is immutable; name and `ips` converge in
 * place. Accounts are limited to a small number of proxy endpoints, so
 * prefer reusing one per account.
 * ### Creating a Proxy Endpoint
 * **Example:** Identity-based endpoint (all plans)
 * ```typescript
 * const proxy = yield* Cloudflare.Gateway.ProxyEndpoint("UserProxy", {
 *   kind: "identity",
 * });
 * // PAC file target:
 * const host = `${proxy.subdomain}.proxy.cloudflare-gateway.com`;
 * ```
 *
 * **Example:** IP allowlist endpoint (Enterprise)
 * ```typescript
 * const proxy = yield* Cloudflare.Gateway.ProxyEndpoint("OfficeProxy", {
 *   kind: "ip",
 *   ips: ["203.0.113.1/32"],
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/connections/connect-devices/agentless/pac-files/
 *
 * @resource
 * @product Gateway
 * @category Cloudflare One (Zero Trust)
 */
export const ProxyEndpoint = Resource(TypeId);
/**
 * Returns true if the given value is a ProxyEndpoint resource.
 */
export const isProxyEndpoint = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const ProxyEndpointProvider = () => Provider.succeed(ProxyEndpoint, {
    stables: ["proxyEndpointId", "accountId", "kind", "subdomain", "createdAt"],
    diff: Effect.fn(function* ({ olds = {}, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // The endpoint kind is immutable on Cloudflare's side.
        const oldKind = output?.kind ?? olds.kind ?? undefined;
        if (oldKind !== undefined && oldKind !== (news.kind ?? "ip")) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path — refresh by the cached endpoint id.
        if (output?.proxyEndpointId) {
            const observed = yield* getEndpoint(acct, output.proxyEndpointId);
            if (observed)
                return toAttributes(observed, acct);
        }
        // Cold read — locate by deterministic name. Proxy endpoints carry no
        // ownership markers, so report the match as Unowned to gate adoption.
        const name = yield* resolveName(id, olds?.name ?? output?.name);
        const match = yield* findByName(acct, name);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const name = yield* resolveName(id, news.name);
        const kind = news.kind ?? "ip";
        // 1. Observe — the cached id is a hint; fall back to a name scan.
        //    Accounts are limited to very few proxy endpoints, so converging
        //    onto an existing same-named endpoint matters more than usual.
        let observed = output?.proxyEndpointId
            ? yield* getEndpoint(accountId, output.proxyEndpointId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(accountId, name);
        }
        // 2. Ensure — create with the full desired body when missing.
        //    `ip`-kind endpoints on a non-Enterprise account fail with the
        //    typed entitlement error IpProxyEndpointsRequireEnterprise
        //    (Cloudflare code 2009), which propagates.
        if (!observed) {
            observed = yield* zeroTrust.createGatewayProxyEndpoint({
                accountId,
                name,
                kind,
                ...(kind === "ip" ? { ips: news.ips ?? [] } : {}),
            });
        }
        // 3. Sync — diff observed name/ips against desired and PATCH only
        //    the delta; skip the call entirely on a no-op. `ips` compares as
        //    an unordered set and only applies to ip-kind endpoints.
        const observedIps = observedIpsOf(observed);
        const dirty = observed.name !== name ||
            (kind === "ip" &&
                news.ips !== undefined &&
                !arrayEqualsUnordered(observedIps, news.ips));
        if (dirty) {
            observed = yield* zeroTrust.patchGatewayProxyEndpoint({
                accountId,
                proxyEndpointId: observed.id ?? "",
                name,
                ...(kind === "ip" && news.ips !== undefined ? { ips: news.ips } : {}),
            });
        }
        return toAttributes(observed, accountId);
    }),
    delete: Effect.fn(function* ({ output }) {
        // A missing endpoint (ProxyEndpointNotFound, code 2002) means we're
        // done.
        yield* zeroTrust
            .deleteGatewayProxyEndpoint({
            accountId: output.accountId,
            proxyEndpointId: output.proxyEndpointId,
        })
            .pipe(Effect.catchTag("ProxyEndpointNotFound", () => Effect.void));
    }),
    // Account-scoped collection: the proxy-endpoints list op returns each
    // endpoint's full body, so no per-item hydration is needed. Exhaustively
    // paginate (`.items` flattens `result` across pages) and map straight into
    // the `read` Attributes shape.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* zeroTrust.listGatewayProxyEndpoints
            .items({ accountId })
            .pipe(Stream.map((e) => toAttributes(e, accountId)), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
    }),
});
/**
 * Read a proxy endpoint by id, mapping "gone" (`ProxyEndpointNotFound`,
 * Cloudflare error code 2002) to `undefined`.
 */
const getEndpoint = (accountId, proxyEndpointId) => zeroTrust.getGatewayProxyEndpoint({ accountId, proxyEndpointId }).pipe(Effect.map((e) => e), Effect.catchTag("ProxyEndpointNotFound", () => Effect.succeed(undefined)));
/**
 * Find a proxy endpoint by exact name. Pick the oldest match for
 * determinism.
 */
const findByName = (accountId, name) => zeroTrust.listGatewayProxyEndpoints.items({ accountId }).pipe(Stream.filter((e) => e.name === name), Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
    .sort((a, b) => (a.createdAt ?? "").localeCompare(b.createdAt ?? ""))
    .at(0)));
const resolveName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    return yield* createPhysicalName({ id, lowercase: true });
});
/**
 * Identity-kind endpoints report `ips: null` on the wire (previously `[]`),
 * so a key-presence check is not enough — only a real array counts.
 */
const observedIpsOf = (endpoint) => "ips" in endpoint && Array.isArray(endpoint.ips) ? [...endpoint.ips] : [];
const toAttributes = (endpoint, accountId) => ({
    proxyEndpointId: endpoint.id ?? "",
    accountId,
    name: endpoint.name,
    kind: (endpoint.kind ?? "ip"),
    ips: observedIpsOf(endpoint),
    subdomain: endpoint.subdomain ?? undefined,
    createdAt: endpoint.createdAt ?? undefined,
    updatedAt: endpoint.updatedAt ?? undefined,
});
//# sourceMappingURL=ProxyEndpoint.js.map