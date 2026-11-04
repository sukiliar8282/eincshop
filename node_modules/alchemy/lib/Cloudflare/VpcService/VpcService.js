import * as connectivity from "@distilled.cloud/cloudflare/connectivity";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { isResourceOfType, Resource } from "../../Resource.js";
import { CloudflareEnvironment } from "../CloudflareEnvironment.js";
/**
 * A Cloudflare VPC service that exposes a private host (IP or hostname)
 * reachable through a Cloudflare Tunnel for Workers VPC.
 * ### Creating a VPC Service
 * **Example:** Hostname through a tunnel
 * ```typescript
 * const tunnel = yield* Cloudflare.Tunnel.Tunnel("MyTunnel");
 * const service = yield* Cloudflare.VpcService.VpcService("Internal", {
 *   host: {
 *     hostname: "internal.example.com",
 *     resolverNetwork: { tunnelId: tunnel.tunnelId, resolverIps: ["10.0.0.53"] },
 *   },
 * });
 * ```
 *
 * **Example:** IPv4 with explicit ports
 * ```typescript
 * const service = yield* Cloudflare.VpcService.VpcService("DevServer", {
 *   httpPort: 5173,
 *   host: { ipv4: "192.168.1.100", network: { tunnelId: tunnel.tunnelId } },
 * });
 * ```
 *
 * @resource
 * @product Workers VPC
 * @category Network
 */
export const VpcService = Resource("Cloudflare.VpcService.VpcService", { aliases: ["Cloudflare.VpcService"] });
export const isVpcService = (value) => isResourceOfType(value, "Cloudflare.VpcService.VpcService");
const createServiceName = (id, name) => Effect.gen(function* () {
    if (name)
        return name;
    return yield* createPhysicalName({
        id,
        lowercase: true,
        maxLength: 63,
    });
});
const findServiceByName = Effect.fn(function* (name) {
    const { accountId } = yield* yield* CloudflareEnvironment;
    return yield* connectivity.listDirectoryServices.items({ accountId }).pipe(Stream.filter((s) => s.name === name), Stream.runHead, Effect.map(Option.getOrUndefined));
});
export const VpcServiceProvider = () => Provider.succeed(VpcService, {
    stables: ["serviceId", "accountId"],
    list: Effect.fn(function* () {
        const { accountId } = yield* yield* CloudflareEnvironment;
        return yield* connectivity.listDirectoryServices
            .pages({ accountId })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.result ?? [])
            .filter((s) => s.serviceId != null)
            .map((s) => formatVpcService(s, accountId)))), 
        // VPC/Workers connectivity is plan-gated; an un-entitled
        // account rejects the list route. Treat as nothing to enumerate.
        Effect.catchTag("Forbidden", () => Effect.succeed([])));
    }),
    diff: Effect.fn(function* ({ id, olds, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (!isResolved(news))
            return undefined;
        if ((output?.accountId ?? accountId) !== accountId) {
            return { action: "replace" };
        }
        const oldName = output?.serviceName ?? (yield* createServiceName(id, olds?.name));
        // Auto-generated names are engine-owned: the deployed name stays
        // authoritative even if the generator would name this id differently
        // today. Only an explicit user-provided name can force a rename.
        const name = news.name ?? oldName;
        if (name !== oldName) {
            return { action: "update" };
        }
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        // Prefer the deployed name: regenerating would rename the deployed
        // service if the generator's output for this id ever drifts. An
        // explicit user-provided name still wins (renames apply in place).
        const name = news.name ??
            output?.serviceName ??
            (yield* createServiceName(id, news.name));
        const acct = output?.accountId ?? accountId;
        // Observe — re-fetch the cached service; fall back to a name
        // scan so we recover from out-of-band deletes or partial state
        // persistence failures.
        let observed;
        if (output?.serviceId) {
            observed = yield* connectivity
                .getDirectoryService({
                accountId: acct,
                serviceId: output.serviceId,
            })
                .pipe(Effect.catch(() => Effect.succeed(undefined)));
        }
        if (!observed) {
            const match = yield* findServiceByName(name);
            observed = match;
        }
        // Ensure — create if missing. Cloudflare rejects a duplicate
        // name with a generic error; tolerate by adopting the existing
        // service (when the caller opted in) and re-applying the
        // desired configuration.
        if (!observed || !observed.serviceId) {
            const result = yield* connectivity
                .createDirectoryService({
                accountId: acct,
                name,
                type: news.serviceType ?? "http",
                httpPort: news.httpPort,
                httpsPort: news.httpsPort,
                host: news.host,
            })
                .pipe(Effect.catch((err) => Effect.gen(function* () {
                if (!news.adopt)
                    return yield* Effect.fail(err);
                const existing = yield* findServiceByName(name);
                if (!existing || !existing.serviceId) {
                    return yield* Effect.fail(err);
                }
                return yield* connectivity.updateDirectoryService({
                    accountId: acct,
                    serviceId: existing.serviceId,
                    name,
                    type: news.serviceType ?? "http",
                    httpPort: news.httpPort,
                    httpsPort: news.httpsPort,
                    host: news.host,
                });
            })));
            return formatVpcService(result, acct);
        }
        // Sync — the Cloudflare update API replaces all mutable fields
        // (name, ports, host) atomically, so always issue it so
        // adoption and routine updates converge.
        const result = yield* connectivity.updateDirectoryService({
            accountId: acct,
            serviceId: observed.serviceId,
            name,
            type: news.serviceType ?? observed.type ?? "http",
            httpPort: news.httpPort,
            httpsPort: news.httpsPort,
            host: news.host,
        });
        return formatVpcService(result, acct);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* connectivity
            .deleteDirectoryService({
            accountId: output.accountId,
            serviceId: output.serviceId,
        })
            .pipe(Effect.catch(() => Effect.void));
    }),
    read: Effect.fn(function* ({ id, output, olds }) {
        const { accountId } = yield* yield* CloudflareEnvironment;
        if (output?.serviceId) {
            return yield* connectivity
                .getDirectoryService({
                accountId: output.accountId,
                serviceId: output.serviceId,
            })
                .pipe(Effect.map((s) => formatVpcService(s, output.accountId)), Effect.catch(() => Effect.succeed(undefined)));
        }
        const name = yield* createServiceName(id, olds?.name);
        const existing = yield* findServiceByName(name);
        if (!existing || !existing.serviceId)
            return undefined;
        return formatVpcService(existing, accountId);
    }),
});
export const formatVpcService = (service, accountId) => {
    let host;
    if ("hostname" in service.host) {
        host = {
            hostname: service.host.hostname,
            resolverNetwork: {
                tunnelId: service.host.resolverNetwork.tunnelId,
                resolverIps: service.host.resolverNetwork.resolverIps ?? undefined,
            },
        };
    }
    else if ("ipv4" in service.host && "ipv6" in service.host) {
        host = {
            ipv4: service.host.ipv4,
            ipv6: service.host.ipv6,
            network: { tunnelId: service.host.network.tunnelId },
        };
    }
    else if ("ipv4" in service.host) {
        host = {
            ipv4: service.host.ipv4,
            network: { tunnelId: service.host.network.tunnelId },
        };
    }
    else {
        host = {
            ipv6: service.host.ipv6,
            network: { tunnelId: service.host.network.tunnelId },
        };
    }
    return {
        serviceId: service.serviceId,
        serviceName: service.name,
        serviceType: service.type,
        httpPort: service.httpPort ?? undefined,
        httpsPort: service.httpsPort ?? undefined,
        host,
        accountId,
        createdAt: service.createdAt
            ? new Date(service.createdAt).getTime()
            : undefined,
        updatedAt: service.updatedAt
            ? new Date(service.updatedAt).getTime()
            : undefined,
    };
};
//# sourceMappingURL=VpcService.js.map