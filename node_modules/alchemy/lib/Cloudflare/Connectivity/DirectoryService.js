import * as connectivity from "@distilled.cloud/cloudflare/connectivity";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
const TypeId = "Cloudflare.Connectivity.DirectoryService";
/**
 * A Cloudflare Connectivity Directory service — a named entry in the
 * account's private-network service directory that maps a service name to
 * a private host (IP or hostname) reachable through a Cloudflare Tunnel.
 *
 * Directory services are the registry behind Workers VPC and Zero Trust
 * private-network connectivity: a `tcp` service describes a database-style
 * origin (with an optional `appProtocol` hint), an `http` service describes
 * an HTTP/HTTPS origin with explicit ports.
 *
 * Names are unique within the account. All properties — including the host
 * and even the protocol type — are mutable in place via a full PUT; nothing
 * forces a replacement except moving accounts.
 * ### Creating a Directory Service
 * **Example:** TCP database service through a tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("DbTunnel", {
 *   ingress: [{ service: "tcp://localhost:5432" }],
 * });
 * const db = yield* Cloudflare.Connectivity.DirectoryService("Postgres", {
 *   type: "tcp",
 *   tcpPort: 5432,
 *   appProtocol: "postgresql",
 *   host: { ipv4: "10.0.0.21", network: { tunnelId: tunnel.tunnelId } },
 * });
 * ```
 *
 * **Example:** HTTP service on a private hostname
 * ```typescript
 * const api = yield* Cloudflare.Connectivity.DirectoryService("InternalApi", {
 *   type: "http",
 *   httpPort: 8080,
 *   httpsPort: 8443,
 *   host: {
 *     hostname: "api.internal",
 *     resolverNetwork: { tunnelId: tunnel.tunnelId, resolverIps: ["10.0.0.53"] },
 *   },
 * });
 * ```
 *
 * ### Updating
 * **Example:** Changing the host in place
 * ```typescript
 * // Host, ports, name, and TLS settings are all mutable — the service
 * // keeps its serviceId across updates.
 * const db = yield* Cloudflare.Connectivity.DirectoryService("Postgres", {
 *   type: "tcp",
 *   tcpPort: 5432,
 *   host: {
 *     hostname: "db.internal",
 *     resolverNetwork: { tunnelId: tunnel.tunnelId },
 *   },
 * });
 * ```
 *
 * @see https://developers.cloudflare.com/cloudflare-one/
 *
 * @resource
 * @product Connectivity
 * @category Cloudflare One (Zero Trust)
 */
export const DirectoryService = Resource(TypeId);
/**
 * Returns true if the given value is a DirectoryService resource.
 */
export const isDirectoryService = (value) => Predicate.hasProperty(value, "Type") && value.Type === TypeId;
export const DirectoryServiceProvider = () => Provider.succeed(DirectoryService, {
    stables: ["serviceId", "accountId", "createdAt"],
    diff: Effect.fn(function* ({ news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        // Directory services are account-scoped; moving accounts replaces.
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        // Everything else (name, type, host, ports, appProtocol, TLS) is
        // mutable via the full-body PUT — let the engine default to update.
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        // Owned path: refresh by the persisted service id.
        if (output?.serviceId) {
            const observed = yield* getService(acct, output.serviceId);
            return observed ? toAttributes(observed, acct) : undefined;
        }
        // Cold read — recover from lost state by matching the deterministic
        // physical name. Names are unique within the account (the API
        // rejects duplicates), but the service carries no ownership markers,
        // so brand the match `Unowned` and let the engine gate takeover
        // behind the adopt policy.
        const name = yield* createServiceName(id, olds?.name);
        const match = yield* findByName(acct, name);
        if (match)
            return Unowned(toAttributes(match, acct));
        return undefined;
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        const acct = output?.accountId ?? accountId;
        const name = yield* createServiceName(id, news.name);
        // Observe — the serviceId cached on `output` is a hint, not a
        // guarantee: a missing service falls through to a name scan
        // (adoption / lost-state recovery) and then to create.
        let observed = output?.serviceId
            ? yield* getService(acct, output.serviceId)
            : undefined;
        if (!observed) {
            observed = yield* findByName(acct, name);
        }
        // Ensure — create when missing. A concurrent create surfaces as
        // the typed `VpcServiceNameAlreadyExists` (Cloudflare code 5101):
        // converge by re-scanning for the service that won the race.
        if (!observed) {
            const created = yield* connectivity
                .createDirectoryService({
                accountId: acct,
                name,
                ...toRequestBody(news),
            })
                .pipe(Effect.catchTag("VpcServiceNameAlreadyExists", (error) => findByName(acct, name).pipe(Effect.flatMap((existing) => existing ? Effect.succeed(existing) : Effect.fail(error)))));
            observed = created;
        }
        // Sync — diff observed cloud state against desired. The update API
        // is a full-body PUT, so send everything, but skip the call
        // entirely on a no-op.
        const current = toAttributes(observed, acct);
        if (!isDirty(current, name, news)) {
            return current;
        }
        const updated = yield* connectivity.updateDirectoryService({
            accountId: acct,
            serviceId: current.serviceId,
            name,
            ...toRequestBody(news),
        });
        return toAttributes(updated, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        // Idempotent — an already-gone service surfaces as the typed
        // `VpcServiceNotFound` (Cloudflare code 5104).
        yield* connectivity
            .deleteDirectoryService({
            accountId: output.accountId,
            serviceId: output.serviceId,
        })
            .pipe(Effect.catchTag("VpcServiceNotFound", () => Effect.void));
    }),
    // Account-scoped collection: enumerate every directory service in the
    // account, exhaustively paginating the list API, and hydrate each into
    // the same Attributes shape `read` returns.
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* connectivity.listDirectoryServices
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? []).map((service) => toAttributes(service, accountId)))));
    }),
});
const createServiceName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    return yield* createPhysicalName({ id, lowercase: true, maxLength: 63 });
});
/**
 * Read a directory service by id, mapping "gone" (`VpcServiceNotFound`,
 * Cloudflare error code 5104) to `undefined`.
 */
const getService = (accountId, serviceId) => connectivity
    .getDirectoryService({ accountId, serviceId })
    .pipe(Effect.catchTag("VpcServiceNotFound", () => Effect.succeed(undefined)));
/**
 * Find a directory service by its (account-unique) name.
 */
const findByName = (accountId, name) => connectivity.listDirectoryServices.items({ accountId }).pipe(Stream.filter((s) => s.name === name), Stream.runHead, Effect.map(Option.getOrUndefined));
/**
 * Build the shared create/update request body from desired props. Inputs
 * (tunnel references) have been resolved to concrete strings by the Plan
 * layer before reconcile runs.
 */
const toRequestBody = (news) => {
    const host = news.host;
    const requestHost = "hostname" in host
        ? {
            hostname: host.hostname,
            resolverNetwork: {
                tunnelId: host.resolverNetwork.tunnelId,
                resolverIps: host.resolverNetwork.resolverIps,
            },
        }
        : "ipv4" in host && "ipv6" in host
            ? {
                ipv4: host.ipv4,
                ipv6: host.ipv6,
                network: { tunnelId: host.network.tunnelId },
            }
            : "ipv4" in host
                ? { ipv4: host.ipv4, network: { tunnelId: host.network.tunnelId } }
                : { ipv6: host.ipv6, network: { tunnelId: host.network.tunnelId } };
    return {
        type: news.type,
        host: requestHost,
        tcpPort: news.tcpPort,
        httpPort: news.httpPort,
        httpsPort: news.httpsPort,
        appProtocol: news.appProtocol,
        tlsSettings: news.tlsSettings,
    };
};
/**
 * Compare observed attributes against the desired props (with the resolved
 * physical name) to decide whether the full-body PUT can be skipped.
 */
const isDirty = (current, name, news) => {
    if (current.name !== name)
        return true;
    if (current.type !== news.type)
        return true;
    if (news.tcpPort !== undefined && current.tcpPort !== news.tcpPort) {
        return true;
    }
    if (news.httpPort !== undefined && current.httpPort !== news.httpPort) {
        return true;
    }
    if (news.httpsPort !== undefined && current.httpsPort !== news.httpsPort) {
        return true;
    }
    if (news.appProtocol !== undefined &&
        current.appProtocol !== news.appProtocol) {
        return true;
    }
    if (news.tlsSettings !== undefined &&
        current.certVerificationMode !== news.tlsSettings.certVerificationMode) {
        return true;
    }
    return !sameHost(current.host, news.host);
};
/**
 * Structural host equality between the observed (resolved) host and the
 * desired host props.
 */
const sameHost = (observed, desired) => {
    const canon = (h) => JSON.stringify([
        h.hostname,
        h.ipv4,
        h.ipv6,
        h.tunnelId,
        [...(h.resolverIps ?? [])].sort(),
    ]);
    const flat = (h) => Predicate.hasProperty(h, "hostname")
        ? {
            hostname: h.hostname,
            tunnelId: h.resolverNetwork.tunnelId,
            resolverIps: h.resolverNetwork.resolverIps ?? undefined,
        }
        : {
            ...(Predicate.hasProperty(h, "ipv4") ? { ipv4: h.ipv4 } : {}),
            ...(Predicate.hasProperty(h, "ipv6") ? { ipv6: h.ipv6 } : {}),
            tunnelId: h.network.tunnelId,
        };
    return canon(flat(observed)) === canon(flat(desired));
};
const toHostAttributes = (host) => {
    if ("hostname" in host) {
        return {
            hostname: host.hostname,
            resolverNetwork: {
                tunnelId: host.resolverNetwork.tunnelId,
                ...(host.resolverNetwork.resolverIps
                    ? { resolverIps: [...host.resolverNetwork.resolverIps] }
                    : {}),
            },
        };
    }
    if ("ipv4" in host && "ipv6" in host) {
        return {
            ipv4: host.ipv4,
            ipv6: host.ipv6,
            network: { tunnelId: host.network.tunnelId },
        };
    }
    if ("ipv4" in host) {
        return { ipv4: host.ipv4, network: { tunnelId: host.network.tunnelId } };
    }
    return { ipv6: host.ipv6, network: { tunnelId: host.network.tunnelId } };
};
const toAttributes = (service, accountId) => ({
    serviceId: service.serviceId,
    accountId,
    name: service.name,
    type: service.type,
    host: toHostAttributes(service.host),
    tcpPort: service.tcpPort ?? undefined,
    httpPort: service.httpPort ?? undefined,
    httpsPort: service.httpsPort ?? undefined,
    appProtocol: service.appProtocol ?? undefined,
    certVerificationMode: service.tlsSettings?.certVerificationMode ?? undefined,
    createdAt: service.createdAt ?? undefined,
    updatedAt: service.updatedAt ?? undefined,
});
//# sourceMappingURL=DirectoryService.js.map