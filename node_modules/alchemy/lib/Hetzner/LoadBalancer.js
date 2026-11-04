import { Services } from "@distilled.cloud/hetzner";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../AdoptPolicy.js";
import { isResolved } from "../Diff.js";
import { createPhysicalName } from "../PhysicalName.js";
import * as Provider from "../Provider.js";
import { Resource } from "../Resource.js";
import { tagRecord } from "../Tags.js";
import { waitForAction } from "./actions.js";
import { alchemyStackSelector, createInternalLabels, diffLabels, hasAlchemyLabels, labelSelector, stripInternalLabels, toLabels, } from "./Labels.js";
const DEFAULT_LOCATION = "nbg1";
const DEFAULT_TYPE = "lb11";
const DEFAULT_ALGORITHM = "round_robin";
const MAX_NAME_LENGTH = 64;
const DEFAULT_HC_INTERVAL = 15;
const DEFAULT_HC_TIMEOUT = 10;
const DEFAULT_HC_RETRIES = 3;
const DEFAULT_COOKIE_NAME = "HCLBSTICKY";
const DEFAULT_COOKIE_LIFETIME = 300;
const DEFAULT_TIMEOUT_IDLE = 15;
/**
 * A Hetzner Cloud Load Balancer. Create it in a Location (`nbg1` by
 * default) with type `lb11`, then sync algorithm, listeners, targets,
 * private Networks, delete protection, and labels.
 *
 * Location and network zone are immutable (changing either replaces the
 * Load Balancer). Type can grow in place. Server targets take a
 * `Hetzner.Server`; HTTPS listeners take `Hetzner.Certificate`s.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#load-balancers
 *
 * ### Creating a Load Balancer
 * **Example:** Basic TCP Load Balancer
 * ```typescript
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   location: "nbg1",
 *   loadBalancerType: "lb11",
 *   services: [
 *     { protocol: "tcp", listenPort: 80, destinationPort: 80 },
 *   ],
 * });
 * ```
 *
 * **Example:** With a Server target
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cx23",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   algorithm: "round_robin",
 *   services: [
 *     { protocol: "tcp", listenPort: 80, destinationPort: 80 },
 *   ],
 *   targets: [{ type: "server", server }],
 * });
 * ```
 *
 * ### HTTPS with a Certificate
 * **Example:** Terminate TLS
 * ```typescript
 * const cert = yield* Hetzner.Certificate("web", {
 *   certificate: pem,
 *   privateKey: key,
 * });
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   services: [
 *     {
 *       protocol: "https",
 *       listenPort: 443,
 *       destinationPort: 80,
 *       http: { certificates: [cert], redirectHttp: true },
 *     },
 *   ],
 * });
 * ```
 *
 * ### Private Networks
 * **Example:** Attach to a Network
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   subnets: [
 *     { type: "cloud", ipRange: "10.0.1.0/24", networkZone: "eu-central" },
 *   ],
 * });
 * const lb = yield* Hetzner.LoadBalancer("edge", {
 *   networks: [network],
 *   services: [
 *     { protocol: "tcp", listenPort: 80, destinationPort: 80 },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const LoadBalancer = Resource("Hetzner.LoadBalancer");
export class LoadBalancerNotCreated extends Data.TaggedError("Hetzner.LoadBalancerNotCreated") {
}
const asAlgorithm = (value) => value === "least_connections" ? "least_connections" : "round_robin";
const asProtocol = (value) => value === "https" ? "https" : value === "http" ? "http" : "tcp";
const asHealthProtocol = (value) => value === "http" ? "http" : "tcp";
const asHealthStatus = (value) => value === "healthy" || value === "unhealthy" ? value : "unknown";
const userLabels = (labels) => stripInternalLabels(tagRecord(labels));
const serverIdOf = (value) => {
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = value;
    if (typeof rec.serverId === "number")
        return rec.serverId;
    if (typeof rec.id === "number")
        return rec.id;
    return undefined;
};
const networkIdOf = (value) => {
    if (typeof value === "number")
        return value;
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = value;
    if (typeof rec.networkId === "number")
        return rec.networkId;
    if (typeof rec.id === "number")
        return rec.id;
    return undefined;
};
const certificateIdOf = (value) => {
    if (typeof value === "number")
        return value;
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = value;
    return typeof rec.id === "number" ? rec.id : undefined;
};
const recordOf = (value) => value !== null && typeof value === "object"
    ? value
    : {};
const asNumber = (value) => typeof value === "number" ? value : undefined;
const asString = (value) => typeof value === "string" ? value : undefined;
const asBoolean = (value) => typeof value === "boolean" ? value : undefined;
const asStringArray = (value) => Array.isArray(value)
    ? value.filter((item) => typeof item === "string")
    : undefined;
const defaultHealthCheck = (protocol, destinationPort, override) => {
    const hcProtocol = override?.protocol ?? (protocol === "tcp" ? "tcp" : "http");
    const httpSource = override?.http;
    return {
        protocol: hcProtocol,
        port: override?.port ?? destinationPort,
        interval: override?.interval ?? DEFAULT_HC_INTERVAL,
        timeout: override?.timeout ?? DEFAULT_HC_TIMEOUT,
        retries: override?.retries ?? DEFAULT_HC_RETRIES,
        http: hcProtocol === "http"
            ? {
                domain: httpSource?.domain ?? null,
                path: httpSource?.path ?? "/",
                response: httpSource?.response ?? "",
                statusCodes: [
                    ...(httpSource?.statusCodes ?? ["2??", "3??"]),
                ].sort(),
                tls: httpSource?.tls ?? false,
            }
            : undefined,
    };
};
const defaultServiceHttp = (protocol, http) => {
    if (protocol === "tcp")
        return undefined;
    const certificates = (http?.certificates ?? [])
        .map(certificateIdOf)
        .filter((id) => id !== undefined)
        .sort((a, b) => a - b);
    const userProvided = http !== undefined;
    if (!userProvided && protocol !== "https")
        return undefined;
    return {
        cookieName: http?.cookieName ?? DEFAULT_COOKIE_NAME,
        cookieLifetime: http?.cookieLifetime ?? DEFAULT_COOKIE_LIFETIME,
        timeoutIdle: http?.timeoutIdle ?? DEFAULT_TIMEOUT_IDLE,
        stickySessions: http?.stickySessions ?? false,
        ...(protocol === "https"
            ? {
                redirectHttp: http?.redirectHttp ?? false,
                certificates,
            }
            : {}),
    };
};
const desiredServices = (services) => (services ?? [])
    .map((service) => ({
    protocol: service.protocol,
    listenPort: service.listenPort,
    destinationPort: service.destinationPort,
    proxyprotocol: service.proxyprotocol ?? false,
    healthCheck: defaultHealthCheck(service.protocol, service.destinationPort, service.healthCheck),
    http: defaultServiceHttp(service.protocol, service.http),
}))
    .sort((a, b) => a.listenPort - b.listenPort);
const observedHealthHttp = (value) => {
    if (value === null || typeof value !== "object")
        return undefined;
    const rec = recordOf(value);
    const statusCodes = asStringArray(rec.status_codes) ?? [];
    return {
        domain: rec.domain === undefined ? null : (rec.domain ?? null),
        path: asString(rec.path) ?? "/",
        response: asString(rec.response) ?? "",
        statusCodes: [...statusCodes].sort(),
        tls: asBoolean(rec.tls) ?? false,
    };
};
const observedHealthCheck = (value, destinationPort, protocol) => {
    const rec = recordOf(value);
    const hcProtocol = asHealthProtocol(asString(rec.protocol) ?? (protocol === "tcp" ? "tcp" : "http"));
    return {
        protocol: hcProtocol,
        port: asNumber(rec.port) ?? destinationPort,
        interval: asNumber(rec.interval) ?? DEFAULT_HC_INTERVAL,
        timeout: asNumber(rec.timeout) ?? DEFAULT_HC_TIMEOUT,
        retries: asNumber(rec.retries) ?? DEFAULT_HC_RETRIES,
        http: hcProtocol === "http" ? observedHealthHttp(rec.http) : undefined,
    };
};
const observedServiceHttp = (protocol, value) => {
    if (protocol === "tcp")
        return undefined;
    const rec = recordOf(value);
    const certificates = Array.isArray(rec.certificates)
        ? rec.certificates
            .filter((id) => typeof id === "number")
            .sort((a, b) => a - b)
        : [];
    return {
        cookieName: asString(rec.cookie_name) ?? DEFAULT_COOKIE_NAME,
        cookieLifetime: asNumber(rec.cookie_lifetime) ?? DEFAULT_COOKIE_LIFETIME,
        timeoutIdle: asNumber(rec.timeout_idle) ?? DEFAULT_TIMEOUT_IDLE,
        stickySessions: asBoolean(rec.sticky_sessions) ?? false,
        ...(protocol === "https"
            ? {
                redirectHttp: asBoolean(rec.redirect_http) ?? false,
                certificates,
            }
            : {}),
    };
};
const observedServices = (value) => {
    if (!Array.isArray(value))
        return [];
    return value
        .map((item) => {
        const rec = recordOf(item);
        const protocol = asProtocol(asString(rec.protocol) ?? "tcp");
        const destinationPort = asNumber(rec.destination_port) ?? 80;
        return {
            protocol,
            listenPort: asNumber(rec.listen_port) ?? 0,
            destinationPort,
            proxyprotocol: asBoolean(rec.proxyprotocol) ?? false,
            healthCheck: observedHealthCheck(rec.health_check, destinationPort, protocol),
            http: observedServiceHttp(protocol, rec.http),
        };
    })
        .sort((a, b) => a.listenPort - b.listenPort);
};
const serviceFingerprint = (service) => JSON.stringify(service);
const toServiceAttr = (service) => ({
    protocol: service.protocol,
    listenPort: service.listenPort,
    destinationPort: service.destinationPort,
    proxyprotocol: service.proxyprotocol,
    healthCheck: {
        protocol: service.healthCheck.protocol,
        port: service.healthCheck.port,
        interval: service.healthCheck.interval,
        timeout: service.healthCheck.timeout,
        retries: service.healthCheck.retries,
        ...(service.healthCheck.http
            ? {
                http: {
                    domain: service.healthCheck.http.domain,
                    path: service.healthCheck.http.path,
                    ...(service.healthCheck.http.response
                        ? { response: service.healthCheck.http.response }
                        : {}),
                    ...(service.healthCheck.http.statusCodes.length > 0
                        ? { statusCodes: service.healthCheck.http.statusCodes }
                        : {}),
                    ...(service.healthCheck.http.tls ? { tls: true } : {}),
                },
            }
            : {}),
    },
    ...(service.http
        ? {
            http: {
                cookieName: service.http.cookieName,
                cookieLifetime: service.http.cookieLifetime,
                timeoutIdle: service.http.timeoutIdle,
                stickySessions: service.http.stickySessions,
                ...(service.http.redirectHttp !== undefined
                    ? { redirectHttp: service.http.redirectHttp }
                    : {}),
                ...(service.http.certificates !== undefined
                    ? { certificates: service.http.certificates }
                    : {}),
            },
        }
        : {}),
});
const toHealthCheckRequest = (healthCheck) => ({
    protocol: healthCheck.protocol,
    port: healthCheck.port,
    interval: healthCheck.interval,
    timeout: healthCheck.timeout,
    retries: healthCheck.retries,
    ...(healthCheck.http
        ? {
            http: {
                ...(healthCheck.http.domain !== null
                    ? { domain: healthCheck.http.domain }
                    : {}),
                path: healthCheck.http.path,
                ...(healthCheck.http.response
                    ? { response: healthCheck.http.response }
                    : {}),
                status_codes: healthCheck.http.statusCodes,
                tls: healthCheck.http.tls,
            },
        }
        : {}),
});
const toHttpRequest = (http) => {
    if (http === undefined)
        return undefined;
    return {
        cookie_name: http.cookieName,
        cookie_lifetime: http.cookieLifetime,
        sticky_sessions: http.stickySessions,
        ...(http.redirectHttp !== undefined
            ? { redirect_http: http.redirectHttp }
            : {}),
        ...(http.certificates !== undefined
            ? { certificates: http.certificates }
            : {}),
    };
};
const toCreateService = (service) => ({
    protocol: service.protocol,
    listen_port: service.listenPort,
    destination_port: service.destinationPort,
    proxyprotocol: service.proxyprotocol,
    health_check: toHealthCheckRequest(service.healthCheck),
    ...(service.http ? { http: toHttpRequest(service.http) } : {}),
});
const desiredTargets = (targets) => {
    const next = [];
    for (const target of targets ?? []) {
        if (target.type === "server") {
            const serverId = serverIdOf(target.server);
            if (serverId === undefined)
                continue;
            next.push({
                type: "server",
                serverId,
                ...(target.ip !== undefined ? { ip: target.ip } : {}),
                usePrivateIp: target.usePrivateIp ?? false,
            });
        }
        else if (target.type === "label_selector") {
            next.push({
                type: "label_selector",
                selector: target.selector,
                usePrivateIp: target.usePrivateIp ?? false,
            });
        }
        else {
            next.push({ type: "ip", ip: target.ip });
        }
    }
    return next.sort((a, b) => targetKey(a).localeCompare(targetKey(b)));
};
const targetKey = (target) => {
    if (target.type === "server") {
        return `server:${target.serverId}:${target.usePrivateIp ? 1 : 0}:${target.ip ?? ""}`;
    }
    if (target.type === "label_selector") {
        return `label_selector:${target.selector}:${target.usePrivateIp ? 1 : 0}`;
    }
    return `ip:${target.ip}`;
};
const observedHealthStatus = (value) => {
    if (!Array.isArray(value))
        return [];
    return value.flatMap((item) => {
        const rec = recordOf(item);
        const listenPort = asNumber(rec.listen_port);
        if (listenPort === undefined)
            return [];
        return [
            {
                listenPort,
                status: asHealthStatus(asString(rec.status) ?? "unknown"),
            },
        ];
    });
};
const observedTargets = (value) => {
    if (!Array.isArray(value))
        return [];
    const next = [];
    for (const item of value) {
        const rec = recordOf(item);
        const type = asString(rec.type);
        if (type === "server") {
            const server = recordOf(rec.server);
            const serverId = asNumber(server.id);
            if (serverId === undefined)
                continue;
            const ip = asString(server.ip);
            next.push({
                type: "server",
                serverId,
                ...(ip !== undefined ? { ip } : {}),
                usePrivateIp: asBoolean(rec.use_private_ip) ?? false,
            });
        }
        else if (type === "label_selector") {
            const selector = asString(recordOf(rec.label_selector).selector);
            if (selector === undefined)
                continue;
            next.push({
                type: "label_selector",
                selector,
                usePrivateIp: asBoolean(rec.use_private_ip) ?? false,
            });
        }
        else if (type === "ip") {
            const ip = asString(recordOf(rec.ip).ip);
            if (ip === undefined)
                continue;
            next.push({ type: "ip", ip });
        }
    }
    return next.sort((a, b) => targetKey(a).localeCompare(targetKey(b)));
};
const toTargetAttr = (target, raw) => {
    const rec = recordOf(raw);
    if (target.type === "server") {
        return {
            type: "server",
            serverId: target.serverId,
            ...(target.ip !== undefined ? { ip: target.ip } : {}),
            usePrivateIp: target.usePrivateIp,
            healthStatus: observedHealthStatus(rec.health_status),
        };
    }
    if (target.type === "label_selector") {
        return {
            type: "label_selector",
            selector: target.selector,
            usePrivateIp: target.usePrivateIp,
        };
    }
    return {
        type: "ip",
        ip: target.ip,
        healthStatus: observedHealthStatus(rec.health_status),
    };
};
const desiredNetworkIds = (networks) => {
    const ids = new Set();
    for (const item of networks ?? []) {
        const id = networkIdOf(item);
        if (id !== undefined)
            ids.add(id);
    }
    return [...ids].sort((a, b) => a - b);
};
const observedPrivateNetworks = (value) => {
    if (!Array.isArray(value))
        return [];
    return value
        .flatMap((item) => {
        const rec = recordOf(item);
        const networkId = asNumber(rec.network);
        const ip = asString(rec.ip);
        if (networkId === undefined || ip === undefined)
            return [];
        return [{ networkId, ip }];
    })
        .sort((a, b) => a.networkId - b.networkId);
};
const toAttrs = (lb) => {
    const services = observedServices(lb.services);
    const rawTargets = Array.isArray(lb.targets) ? lb.targets : [];
    const targets = observedTargets(lb.targets);
    const targetAttrs = targets.map((target, index) => toTargetAttr(target, rawTargets[index]));
    return {
        id: lb.id,
        name: lb.name,
        loadBalancerType: lb.load_balancer_type.name,
        loadBalancerTypeId: lb.load_balancer_type.id,
        location: lb.location.name,
        locationId: lb.location.id,
        networkZone: lb.location.network_zone,
        algorithm: asAlgorithm(lb.algorithm.type),
        ipv4: lb.public_net.ipv4.ip,
        ipv6: lb.public_net.ipv6.ip,
        publicInterface: lb.public_net.enabled,
        deleteProtection: lb.protection.delete,
        services: services.map(toServiceAttr),
        targets: targetAttrs,
        privateNetworks: observedPrivateNetworks(lb.private_net),
        labels: userLabels(lb.labels),
        created: lb.created,
    };
};
const retryable = (e) => e._tag === "TooManyRequests" ||
    e._tag === "ServiceUnavailable" ||
    e._tag === "InternalServerError" ||
    e._tag === "BadGateway" ||
    e._tag === "GatewayTimeout" ||
    e._tag === "Locked" ||
    e._tag === "Conflict";
const backoff = Schedule.min([
    Schedule.exponential(Duration.millis(500), 1.5),
    Schedule.spaced(Duration.seconds(5)),
]);
const busyRetry = {
    while: retryable,
    times: 8,
    schedule: backoff,
};
const alreadyThere = (e) => e._tag === "Conflict" || e._tag === "UnprocessableEntity";
const alreadyGone = (e) => e._tag === "NotFound" || e._tag === "UnprocessableEntity";
const createLoadBalancerName = (id, name, existing) => Effect.gen(function* () {
    return (name ??
        existing ??
        (yield* createPhysicalName({
            id,
            maxLength: MAX_NAME_LENGTH,
            lowercase: true,
        })));
});
const getById = (id) => Services.loadBalancers.getLoadBalancer({ id }).pipe(Effect.map(({ load_balancer }) => load_balancer), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const getByName = (name) => Services.loadBalancers
    .listLoadBalancers({ name, per_page: 50 })
    .pipe(Effect.map(({ load_balancers }) => load_balancers.find((item) => item.name === name)));
const getByLabels = (labels) => Services.loadBalancers
    .listLoadBalancers({
    label_selector: labelSelector(labels),
    per_page: 50,
})
    .pipe(Effect.map(({ load_balancers }) => load_balancers[0]));
const observe = Effect.fn(function* ({ id, name, outputId, }) {
    if (outputId !== undefined) {
        const byId = yield* getById(outputId);
        if (byId !== undefined)
            return byId;
    }
    if (name !== undefined) {
        const byName = yield* getByName(name);
        if (byName !== undefined)
            return byName;
    }
    const internal = yield* createInternalLabels(id);
    return yield* getByLabels(internal);
});
const refresh = (id) => Services.loadBalancers.getLoadBalancer({ id }).pipe(Effect.map(({ load_balancer }) => load_balancer), Effect.retry({
    while: (e) => e._tag === "NotFound" || retryable(e),
    times: 8,
    schedule: backoff,
}));
const runAction = (effect) => effect.pipe(Effect.retry(busyRetry), Effect.flatMap(({ action }) => waitForAction(action)));
const matchesPlacement = (current, location, networkZone) => {
    if (location !== undefined && current.location.name !== location) {
        return false;
    }
    if (networkZone !== undefined &&
        current.location.network_zone !== networkZone) {
        return false;
    }
    return true;
};
const syncMetadata = (args) => Effect.gen(function* () {
    const observedLabels = tagRecord(args.current.labels);
    const { removed, upsert } = diffLabels(observedLabels, args.labels);
    const labelsChanged = removed.length > 0 || upsert.length > 0;
    const nameChanged = args.current.name !== args.name;
    if (!labelsChanged && !nameChanged)
        return args.current;
    const updated = yield* Services.loadBalancers
        .updateLoadBalancer({
        id: args.current.id,
        name: nameChanged ? args.name : undefined,
        labels: labelsChanged ? args.labels : undefined,
    })
        .pipe(Effect.retry(busyRetry));
    return updated.load_balancer;
});
const syncAlgorithm = (current, desired) => Effect.gen(function* () {
    if (asAlgorithm(current.algorithm.type) === desired)
        return;
    yield* runAction(Services.loadBalancerActions.changeLoadBalancerAlgorithm({
        id: current.id,
        type: desired,
    }));
});
const syncType = (current, desired) => Effect.gen(function* () {
    if (current.load_balancer_type.name === desired)
        return;
    yield* runAction(Services.loadBalancerActions.changeLoadBalancerType({
        id: current.id,
        load_balancer_type: desired,
    }));
});
const syncProtection = (current, desired) => Effect.gen(function* () {
    if (current.protection.delete === desired)
        return;
    yield* runAction(Services.loadBalancerActions.changeLoadBalancerProtection({
        id: current.id,
        delete: desired,
    }));
});
const syncPublicInterface = (current, desired) => Effect.gen(function* () {
    if (current.public_net.enabled === desired)
        return;
    if (desired) {
        yield* runAction(Services.loadBalancerActions.enableLoadBalancerPublicInterface({
            id: current.id,
        }));
        return;
    }
    yield* runAction(Services.loadBalancerActions.disableLoadBalancerPublicInterface({
        id: current.id,
    }));
});
const syncServices = (loadBalancerId, observed, desired) => Effect.gen(function* () {
    const observedByPort = new Map(observed.map((service) => [service.listenPort, service]));
    const desiredByPort = new Map(desired.map((service) => [service.listenPort, service]));
    for (const service of observed) {
        if (desiredByPort.has(service.listenPort))
            continue;
        yield* runAction(Services.loadBalancerActions.deleteLoadBalancerService({
            id: loadBalancerId,
            listen_port: service.listenPort,
        })).pipe(Effect.catchIf(alreadyGone, () => Effect.void));
    }
    for (const service of desired) {
        const existing = observedByPort.get(service.listenPort);
        if (existing === undefined) {
            yield* runAction(Services.loadBalancerActions.addLoadBalancerService({
                id: loadBalancerId,
                protocol: service.protocol,
                listen_port: service.listenPort,
                destination_port: service.destinationPort,
                proxyprotocol: service.proxyprotocol,
                health_check: toHealthCheckRequest(service.healthCheck),
                http: toHttpRequest(service.http),
            })).pipe(Effect.catchIf((e) => e._tag === "Conflict" || e._tag === "PreconditionFailed", () => Effect.void));
            continue;
        }
        if (serviceFingerprint(existing) === serviceFingerprint(service)) {
            continue;
        }
        yield* runAction(Services.loadBalancerActions.updateLoadBalancerService({
            id: loadBalancerId,
            protocol: service.protocol,
            listen_port: service.listenPort,
            destination_port: service.destinationPort,
            proxyprotocol: service.proxyprotocol,
            health_check: toHealthCheckRequest(service.healthCheck),
            http: toHttpRequest(service.http),
        }));
    }
});
const addTargetRequest = (loadBalancerId, target) => {
    if (target.type === "server") {
        return Services.loadBalancerActions.addLoadBalancerTarget({
            id: loadBalancerId,
            type: "server",
            server: {
                id: target.serverId,
                ...(target.ip !== undefined ? { ip: target.ip } : {}),
            },
            use_private_ip: target.usePrivateIp,
        });
    }
    if (target.type === "label_selector") {
        return Services.loadBalancerActions.addLoadBalancerTarget({
            id: loadBalancerId,
            type: "label_selector",
            label_selector: { selector: target.selector },
            use_private_ip: target.usePrivateIp,
        });
    }
    return Services.loadBalancerActions.addLoadBalancerTarget({
        id: loadBalancerId,
        type: "ip",
        ip: { ip: target.ip },
    });
};
const removeTargetRequest = (loadBalancerId, target) => {
    if (target.type === "server") {
        return Services.loadBalancerActions.removeLoadBalancerTarget({
            id: loadBalancerId,
            type: "server",
            server: {
                id: target.serverId,
                ...(target.ip !== undefined ? { ip: target.ip } : {}),
            },
        });
    }
    if (target.type === "label_selector") {
        return Services.loadBalancerActions.removeLoadBalancerTarget({
            id: loadBalancerId,
            type: "label_selector",
            label_selector: { selector: target.selector },
        });
    }
    return Services.loadBalancerActions.removeLoadBalancerTarget({
        id: loadBalancerId,
        type: "ip",
        ip: { ip: target.ip },
    });
};
const syncTargets = (loadBalancerId, observed, desired) => Effect.gen(function* () {
    const observedKeys = new Set(observed.map(targetKey));
    const desiredKeys = new Set(desired.map(targetKey));
    for (const target of observed) {
        if (desiredKeys.has(targetKey(target)))
            continue;
        yield* runAction(removeTargetRequest(loadBalancerId, target)).pipe(Effect.catchIf(alreadyGone, () => Effect.void));
    }
    for (const target of desired) {
        if (observedKeys.has(targetKey(target)))
            continue;
        yield* addTargetRequest(loadBalancerId, target).pipe(Effect.retry({
            while: (e) => retryable(e) || e._tag === "UnprocessableEntity",
            times: 8,
            schedule: backoff,
        }), Effect.flatMap(({ action }) => waitForAction(action)), Effect.catchIf(alreadyThere, () => Effect.void));
    }
});
const syncNetworks = (loadBalancerId, observed, desired) => Effect.gen(function* () {
    const observedIds = new Set(observed.map((item) => item.networkId));
    const desiredIds = new Set(desired);
    for (const item of observed) {
        if (desiredIds.has(item.networkId))
            continue;
        yield* runAction(Services.loadBalancerActions.detachLoadBalancerFromNetwork({
            id: loadBalancerId,
            network: item.networkId,
        })).pipe(Effect.catchIf(alreadyGone, () => Effect.void));
    }
    for (const networkId of desired) {
        if (observedIds.has(networkId))
            continue;
        yield* runAction(Services.loadBalancerActions.attachLoadBalancerToNetwork({
            id: loadBalancerId,
            network: networkId,
        })).pipe(Effect.catchIf(alreadyThere, () => Effect.void));
    }
});
export const LoadBalancerProvider = () => Provider.succeed(LoadBalancer, {
    stables: ["id", "location", "locationId", "networkZone", "created"],
    list: Effect.fn(function* () {
        const items = yield* Services.loadBalancers.listLoadBalancers
            .items({ label_selector: alchemyStackSelector, per_page: 50 })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
        return items.map(toAttrs);
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!isResolved(news))
            return undefined;
        if (output !== undefined) {
            if (news.location !== undefined && news.location !== output.location) {
                return { action: "replace" };
            }
            if (news.networkZone !== undefined &&
                news.networkZone !== output.networkZone) {
                return { action: "replace" };
            }
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const found = yield* observe({
            id,
            name: olds?.name ?? output?.name,
            outputId: output?.id,
        });
        if (found === undefined)
            return undefined;
        const attrs = toAttrs(found);
        const owned = yield* hasAlchemyLabels(id, tagRecord(found.labels));
        return owned ? attrs : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const name = yield* createLoadBalancerName(id, news.name, output?.name);
        const internalLabels = yield* createInternalLabels(id);
        const desiredLabels = {
            ...toLabels(news.labels),
            ...internalLabels,
        };
        const loadBalancerType = news.loadBalancerType ?? DEFAULT_TYPE;
        const algorithm = news.algorithm ?? DEFAULT_ALGORITHM;
        const location = news.location ??
            (news.networkZone === undefined ? DEFAULT_LOCATION : undefined);
        const networkZone = news.location === undefined ? news.networkZone : undefined;
        const publicInterface = news.publicInterface ?? true;
        const deleteProtection = news.deleteProtection ?? false;
        const services = desiredServices(news.services);
        const targets = desiredTargets(news.targets);
        const networks = desiredNetworkIds(news.networks);
        // Observe by id then desired name only. Do not fall back to
        // ownership labels — a create-first replacement still has the old
        // generation live under the same logical id.
        let current = output?.id !== undefined ? yield* getById(output.id) : undefined;
        if (current === undefined) {
            current = yield* getByName(name);
        }
        if (current !== undefined &&
            !matchesPlacement(current, location, networkZone)) {
            current = undefined;
        }
        if (current === undefined) {
            const created = yield* Services.loadBalancers
                .createLoadBalancer({
                name,
                load_balancer_type: loadBalancerType,
                algorithm: { type: algorithm },
                labels: desiredLabels,
                public_interface: publicInterface,
                ...(location !== undefined ? { location } : {}),
                ...(networkZone !== undefined ? { network_zone: networkZone } : {}),
                ...(networks[0] !== undefined ? { network: networks[0] } : {}),
                ...(services.length > 0
                    ? { services: services.map(toCreateService) }
                    : {}),
            })
                .pipe(Effect.retry(busyRetry), Effect.catchTag("Conflict", () => Effect.succeed(undefined)));
            if (created !== undefined) {
                if (created.action) {
                    yield* waitForAction(created.action);
                }
                current = created.load_balancer;
            }
            else {
                const hit = yield* getByName(name);
                if (hit !== undefined &&
                    matchesPlacement(hit, location, networkZone)) {
                    current = hit;
                }
            }
        }
        if (current === undefined) {
            return yield* new LoadBalancerNotCreated({ name });
        }
        current = yield* syncMetadata({
            current,
            name,
            labels: desiredLabels,
        });
        yield* syncAlgorithm(current, algorithm);
        yield* syncType(current, loadBalancerType);
        const afterType = (yield* getById(current.id)) ?? current;
        yield* syncServices(current.id, observedServices(afterType.services), services);
        const afterServices = (yield* getById(current.id)) ?? afterType;
        yield* syncTargets(current.id, observedTargets(afterServices.targets), targets);
        const afterTargets = (yield* getById(current.id)) ?? afterServices;
        yield* syncNetworks(current.id, observedPrivateNetworks(afterTargets.private_net), networks);
        const afterNetworks = (yield* getById(current.id)) ?? afterTargets;
        yield* syncPublicInterface(afterNetworks, publicInterface);
        const afterPublic = (yield* getById(current.id)) ?? afterNetworks;
        yield* syncProtection(afterPublic, deleteProtection);
        return toAttrs(yield* refresh(current.id));
    }),
    delete: Effect.fn(function* ({ output }) {
        const current = yield* getById(output.id);
        if (current === undefined)
            return;
        if (current.protection.delete) {
            yield* runAction(Services.loadBalancerActions.changeLoadBalancerProtection({
                id: current.id,
                delete: false,
            })).pipe(Effect.catchIf(alreadyGone, () => Effect.void));
        }
        yield* Services.loadBalancers.deleteLoadBalancer({ id: current.id }).pipe(Effect.catchTag("NotFound", () => Effect.void), Effect.retry({
            while: retryable,
            times: 8,
            schedule: backoff,
        }));
    }),
});
//# sourceMappingURL=LoadBalancer.js.map