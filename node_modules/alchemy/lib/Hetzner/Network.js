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
export class NetworkNotCreated extends Data.TaggedError("Hetzner.NetworkNotCreated") {
}
/**
 * A Hetzner Cloud private Network — an isolated IPv4 range that Cloud
 * Servers and Load Balancers attach to. Subnets, routes, delete protection,
 * and labels are synced on the Network itself; `network_actions` are not
 * modeled as their own resources.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#networks
 *
 * ### Creating a Network
 * **Example:** Basic Network
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 * });
 * ```
 *
 * **Example:** Network with a cloud subnet
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   subnets: [
 *     { type: "cloud", ipRange: "10.0.1.0/24", networkZone: "eu-central" },
 *   ],
 * });
 * ```
 *
 * ### Routes and protection
 * **Example:** Static route and delete protection
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   subnets: [
 *     { type: "cloud", ipRange: "10.0.1.0/24", networkZone: "eu-central" },
 *   ],
 *   routes: [{ destination: "10.10.0.0/24", gateway: "10.0.1.2" }],
 *   deleteProtection: true,
 * });
 * ```
 *
 * ### Labels
 * **Example:** User labels
 * ```typescript
 * const network = yield* Hetzner.Network("vpc", {
 *   ipRange: "10.0.0.0/16",
 *   labels: { env: "prod", role: "vpc" },
 * });
 * ```
 *
 * @resource
 */
export const Network = Resource("Hetzner.Network");
const busy = (e) => e._tag === "Locked" || e._tag === "Conflict";
const busyRetry = {
    while: busy,
    times: 8,
    schedule: Schedule.min([
        Schedule.exponential(Duration.millis(500), 1.5),
        Schedule.spaced(Duration.seconds(5)),
    ]),
};
const alreadyThere = (e) => e._tag === "Conflict" || e._tag === "UnprocessableEntity";
const alreadyGone = (e) => e._tag === "NotFound" || e._tag === "UnprocessableEntity";
const createNetworkName = (id, name) => Effect.gen(function* () {
    return (name ??
        (yield* createPhysicalName({
            id,
            maxLength: 63,
            lowercase: true,
        })));
});
const desiredLabelsOf = Effect.fn(function* (id, labels) {
    return {
        ...toLabels(labels),
        ...(yield* createInternalLabels(id)),
    };
});
const subnetKey = (subnet) => `${subnet.type}|${subnet.ipRange ?? ""}|${subnet.networkZone}|${subnet.vswitchId ?? ""}`;
const routeKey = (route) => `${route.destination}|${route.gateway}`;
const toSubnetAttr = (subnet) => ({
    type: subnet.type,
    ipRange: subnet.ip_range,
    networkZone: subnet.network_zone,
    gateway: subnet.gateway,
    vswitchId: subnet.vswitch_id ?? undefined,
});
const toAttrs = (network) => ({
    networkId: network.id,
    name: network.name,
    ipRange: network.ip_range,
    subnets: network.subnets.map(toSubnetAttr),
    routes: network.routes.map((route) => ({
        destination: route.destination,
        gateway: route.gateway,
    })),
    servers: [...network.servers],
    loadBalancers: [...(network.load_balancers ?? [])],
    deleteProtection: network.protection.delete,
    exposeRoutesToVswitch: network.expose_routes_to_vswitch,
    labels: stripInternalLabels(tagRecord(network.labels)),
    created: network.created,
});
const parseCidr = (cidr) => {
    const [addr, prefixRaw] = cidr.split("/");
    if (addr === undefined || prefixRaw === undefined)
        return undefined;
    const parts = addr.split(".").map(Number);
    if (parts.length !== 4 ||
        parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
        return undefined;
    }
    const prefix = Number(prefixRaw);
    if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32)
        return undefined;
    const ip = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>>
        0;
    return { ip, prefix };
};
/** True when `outer` is equal to or a supernet of `inner`. */
const cidrContains = (outer, inner) => {
    const a = parseCidr(outer);
    const b = parseCidr(inner);
    if (a === undefined || b === undefined)
        return false;
    if (a.prefix > b.prefix)
        return false;
    const mask = a.prefix === 0 ? 0 : (0xffffffff << (32 - a.prefix)) >>> 0;
    return (a.ip & mask) === (b.ip & mask);
};
const getById = (id) => Services.networks.getNetwork({ id }).pipe(Effect.map(({ network }) => network), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const findByName = (name) => Services.networks
    .listNetworks({ name, per_page: 50 })
    .pipe(Effect.map(({ networks }) => networks.find((item) => item.name === name)));
const findByLabels = (labels) => Services.networks
    .listNetworks({
    label_selector: labelSelector(labels),
    per_page: 50,
})
    .pipe(Effect.map(({ networks }) => networks[0]));
const observe = (networkId, name, id) => Effect.gen(function* () {
    if (networkId !== undefined) {
        const byId = yield* getById(networkId);
        if (byId)
            return byId;
    }
    const byLabels = yield* findByLabels(yield* createInternalLabels(id));
    if (byLabels)
        return byLabels;
    return yield* findByName(name);
});
const runAction = (effect) => effect.pipe(Effect.retry(busyRetry), Effect.flatMap(({ action }) => waitForAction(action)));
const syncIpRange = (networkId, observed, desired) => Effect.gen(function* () {
    if (observed === desired)
        return;
    yield* runAction(Services.networkActions.changeNetworkIpRange({
        id: networkId,
        ip_range: desired,
    }));
});
const syncMetadata = (args) => Effect.gen(function* () {
    const observedLabels = tagRecord(args.observed.labels);
    const { removed, upsert } = diffLabels(observedLabels, args.labels);
    const labelsChanged = removed.length > 0 || upsert.length > 0;
    const nameChanged = args.observed.name !== args.name;
    const exposeChanged = args.observed.expose_routes_to_vswitch !== args.exposeRoutesToVswitch;
    if (!labelsChanged && !nameChanged && !exposeChanged)
        return;
    yield* Services.networks
        .updateNetwork({
        id: args.networkId,
        name: nameChanged ? args.name : undefined,
        expose_routes_to_vswitch: exposeChanged
            ? args.exposeRoutesToVswitch
            : undefined,
        labels: labelsChanged ? args.labels : undefined,
    })
        .pipe(Effect.retry(busyRetry));
});
const syncSubnets = (networkId, observed, desired) => Effect.gen(function* () {
    const observedMapped = observed.map((subnet) => ({
        type: subnet.type,
        ipRange: subnet.ip_range,
        networkZone: subnet.network_zone,
        vswitchId: subnet.vswitch_id ?? undefined,
    }));
    const observedKeys = new Set(observedMapped.map(subnetKey));
    const desiredKeys = new Set(desired.map(subnetKey));
    for (const subnet of observedMapped) {
        if (desiredKeys.has(subnetKey(subnet)))
            continue;
        if (subnet.ipRange === undefined)
            continue;
        yield* runAction(Services.networkActions.deleteNetworkSubnet({
            id: networkId,
            ip_range: subnet.ipRange,
        })).pipe(Effect.catchIf(alreadyGone, () => Effect.void));
    }
    for (const subnet of desired) {
        if (observedKeys.has(subnetKey(subnet)))
            continue;
        yield* runAction(Services.networkActions.addNetworkSubnet({
            id: networkId,
            type: subnet.type,
            ip_range: subnet.ipRange,
            network_zone: subnet.networkZone,
            vswitch_id: subnet.vswitchId,
        })).pipe(Effect.catchIf(alreadyThere, () => Effect.void));
    }
});
const syncRoutes = (networkId, observed, desired) => Effect.gen(function* () {
    const observedKeys = new Set(observed.map(routeKey));
    const desiredKeys = new Set(desired.map(routeKey));
    for (const route of observed) {
        if (desiredKeys.has(routeKey(route)))
            continue;
        yield* runAction(Services.networkActions.deleteNetworkRoute({
            id: networkId,
            destination: route.destination,
            gateway: route.gateway,
        })).pipe(Effect.catchIf(alreadyGone, () => Effect.void));
    }
    for (const route of desired) {
        if (observedKeys.has(routeKey(route)))
            continue;
        yield* runAction(Services.networkActions.addNetworkRoute({
            id: networkId,
            destination: route.destination,
            gateway: route.gateway,
        })).pipe(Effect.catchIf(alreadyThere, () => Effect.void));
    }
});
const syncProtection = (networkId, observed, desired) => Effect.gen(function* () {
    if (observed === desired)
        return;
    yield* runAction(Services.networkActions.changeNetworkProtection({
        id: networkId,
        delete: desired,
    }));
});
export const NetworkProvider = () => Provider.succeed(Network, {
    stables: ["networkId", "created"],
    list: Effect.fn(function* () {
        return yield* Services.networks.listNetworks
            .items({ label_selector: alchemyStackSelector, per_page: 50 })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk, toAttrs)));
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!isResolved(news))
            return undefined;
        if (output !== undefined &&
            news.ipRange !== output.ipRange &&
            !cidrContains(news.ipRange, output.ipRange)) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const name = yield* createNetworkName(id, olds?.name ?? output?.name);
        const observed = yield* observe(output?.networkId, name, id);
        if (observed === undefined)
            return undefined;
        const attrs = toAttrs(observed);
        return (yield* hasAlchemyLabels(id, tagRecord(observed.labels)))
            ? attrs
            : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const name = yield* createNetworkName(id, news.name ?? (output === undefined ? undefined : output.name));
        const desiredLabels = yield* desiredLabelsOf(id, news.labels);
        const desiredSubnets = news.subnets ?? [];
        const desiredRoutes = news.routes ?? [];
        const exposeRoutesToVswitch = news.exposeRoutesToVswitch ?? false;
        const deleteProtection = news.deleteProtection ?? false;
        // Observe — cached `output.networkId` is a hint. Fall back to
        // ownership labels, then the deterministic name.
        let current = yield* observe(output?.networkId, name, id);
        // A replacement create shares the logical id (and thus ownership
        // labels) with the outgoing generation. If the observed row cannot
        // accept the desired `ipRange` (Hetzner can only extend a range),
        // do not reuse it — create a new Network and let the engine delete
        // the old generation.
        if (current !== undefined &&
            current.ip_range !== news.ipRange &&
            !cidrContains(news.ipRange, current.ip_range)) {
            current = undefined;
        }
        // Ensure — create when missing. A name-collision race is treated as
        // the peer winning; we pick that row up and continue into sync.
        if (current === undefined) {
            const created = yield* Services.networks
                .createNetwork({
                name,
                ip_range: news.ipRange,
                labels: desiredLabels,
                subnets: desiredSubnets.map((subnet) => ({
                    type: subnet.type,
                    ip_range: subnet.ipRange,
                    network_zone: subnet.networkZone,
                    vswitch_id: subnet.vswitchId,
                })),
                routes: desiredRoutes.map((route) => ({
                    destination: route.destination,
                    gateway: route.gateway,
                })),
                expose_routes_to_vswitch: exposeRoutesToVswitch,
            })
                .pipe(Effect.retry(busyRetry), Effect.map((response) => response.network), Effect.catchIf(alreadyThere, () => findByName(name)));
            current = created;
        }
        if (current === undefined) {
            return yield* new NetworkNotCreated({ name });
        }
        // Sync each mutable aspect from observed cloud state, not `olds`.
        yield* syncIpRange(current.id, current.ip_range, news.ipRange);
        yield* syncMetadata({
            networkId: current.id,
            observed: current,
            name,
            exposeRoutesToVswitch,
            labels: desiredLabels,
        });
        const afterMeta = (yield* getById(current.id)) ?? current;
        yield* syncSubnets(current.id, afterMeta.subnets, desiredSubnets);
        const afterSubnets = (yield* getById(current.id)) ?? afterMeta;
        yield* syncRoutes(current.id, afterSubnets.routes, desiredRoutes);
        const afterRoutes = (yield* getById(current.id)) ?? afterSubnets;
        yield* syncProtection(current.id, afterRoutes.protection.delete, deleteProtection);
        const fresh = yield* getById(current.id);
        return toAttrs(fresh ?? afterRoutes);
    }),
    delete: Effect.fn(function* ({ output }) {
        if (output.deleteProtection) {
            yield* runAction(Services.networkActions.changeNetworkProtection({
                id: output.networkId,
                delete: false,
            })).pipe(Effect.catchIf(alreadyGone, () => Effect.void));
        }
        yield* Services.networks.deleteNetwork({ id: output.networkId }).pipe(Effect.retry(busyRetry), Effect.catchTag("NotFound", () => Effect.void));
    }),
});
//# sourceMappingURL=Network.js.map