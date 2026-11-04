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
import { findLocation } from "./Catalog.js";
import { alchemyStackSelector, createInternalLabels, diffLabels, hasAlchemyLabels, stripInternalLabels, toLabels, } from "./Labels.js";
/**
 * An unassigned Hetzner Cloud Primary IP. Provide `type` and either a
 * `location` or a `datacenter`; Alchemy generates a unique name unless
 * you set `name`. Assignee wiring is a later resource.
 *
 * `type`, `location`, and `datacenter` are immutable — changing any of
 * them replaces the Primary IP (new address). `name`, `autoDelete`,
 * `labels`, and `deleteProtection` update in place.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#primary-ips
 *
 * ### Creating a Primary IP
 * **Example:** IPv6 in Nuremberg
 * ```typescript
 * const ip = yield* Hetzner.PrimaryIp("web-ipv6", {
 *   type: "ipv6",
 *   location: "nbg1",
 * });
 * ```
 *
 * **Example:** IPv4 placed by datacenter
 * ```typescript
 * const ip = yield* Hetzner.PrimaryIp("web-ipv4", {
 *   type: "ipv4",
 *   datacenter: "nbg1-dc3",
 * });
 * ```
 *
 * ### Labels and auto-delete
 * **Example:** Named IP with labels
 * ```typescript
 * const ip = yield* Hetzner.PrimaryIp("mail", {
 *   name: "mail-ipv4",
 *   type: "ipv4",
 *   location: "fsn1",
 *   autoDelete: false,
 *   labels: { role: "mail" },
 * });
 * ```
 *
 * @resource
 */
export const PrimaryIp = Resource("Hetzner.PrimaryIp");
export class PrimaryIpPlacementRequired extends Data.TaggedError("Hetzner.PrimaryIpPlacementRequired") {
}
const asType = (type) => type === "ipv6" ? "ipv6" : "ipv4";
const userLabels = (labels) => stripInternalLabels(tagRecord(labels));
/**
 * Hetzner datacenter names are `{location}-dc{n}` (e.g. `nbg1-dc3`).
 * Numeric ids are passed through — Locations use a different id space.
 */
export const locationFromDatacenter = (datacenter) => {
    if (typeof datacenter === "number")
        return datacenter;
    const match = /^([a-z0-9]+)-dc\d+$/i.exec(datacenter);
    return match ? match[1].toLowerCase() : datacenter;
};
const resolvePlacement = (props) => {
    if (props.location !== undefined)
        return props.location;
    if (props.datacenter !== undefined) {
        return locationFromDatacenter(props.datacenter);
    }
    return undefined;
};
const samePlacement = (news, attrs) => {
    const desired = resolvePlacement(news);
    if (desired === undefined)
        return true;
    return (desired === attrs.location ||
        desired === attrs.locationId ||
        String(desired) === String(attrs.locationId));
};
const toAttrs = (ip, extras) => ({
    id: ip.id,
    name: ip.name,
    type: asType(ip.type),
    ip: ip.ip,
    location: ip.location.name,
    locationId: ip.location.id,
    datacenter: extras?.datacenter !== undefined ? String(extras.datacenter) : undefined,
    blocked: ip.blocked,
    autoDelete: ip.auto_delete,
    assigneeId: ip.assignee_id,
    assigneeType: ip.assignee_type,
    created: ip.created,
    labels: userLabels(ip.labels),
    deleteProtection: ip.protection.delete,
});
const createPrimaryIpName = (id, name, existing) => Effect.gen(function* () {
    return (name ?? existing ?? (yield* createPhysicalName({ id, maxLength: 63 })));
});
const getById = (id) => Services.primaryIps.getPrimaryIp({ id }).pipe(Effect.map(({ primary_ip }) => primary_ip), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const getByName = (name) => Services.primaryIps
    .listPrimaryIps({ name, per_page: 50 })
    .pipe(Effect.map(({ primary_ips }) => primary_ips[0]));
const observe = Effect.fn(function* ({ name, outputId, }) {
    // Identity is the numeric id (cached on `output`) or the unique
    // project-scoped name. Do NOT fall back to alchemy.* labels: a
    // replacement shares the logical id with the old generation, so a
    // label lookup would adopt the IP we are replacing.
    if (outputId !== undefined) {
        const byId = yield* getById(outputId);
        if (byId !== undefined)
            return byId;
    }
    if (name !== undefined) {
        return yield* getByName(name);
    }
    return undefined;
});
const refresh = (id) => Services.primaryIps.getPrimaryIp({ id }).pipe(Effect.map(({ primary_ip }) => primary_ip), Effect.retry({
    while: (e) => e._tag === "NotFound",
    times: 5,
    schedule: Schedule.min([
        Schedule.exponential(Duration.millis(200), 1.5),
        Schedule.spaced(Duration.seconds(2)),
    ]),
}));
const disableProtection = (id) => Services.primaryIpActions
    .changePrimaryIpProtection({ id, delete: false })
    .pipe(Effect.flatMap(({ action }) => waitForAction(action)));
export const PrimaryIpProvider = () => Provider.succeed(PrimaryIp, {
    stables: ["id", "ip", "type", "location", "locationId", "created"],
    nuke: { dependsOn: ["Hetzner.Server"] },
    list: Effect.fn(function* () {
        const items = yield* Services.primaryIps.listPrimaryIps
            .items({ label_selector: alchemyStackSelector, per_page: 50 })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
        return items.map((ip) => toAttrs(ip));
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!isResolved(news))
            return undefined;
        if (output !== undefined) {
            if (news.type !== output.type) {
                return { action: "replace" };
            }
            if (!samePlacement(news, output)) {
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
        const attrs = toAttrs(found, {
            datacenter: olds?.datacenter ?? output?.datacenter,
        });
        const owned = yield* hasAlchemyLabels(id, tagRecord(found.labels));
        return owned ? attrs : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const name = yield* createPrimaryIpName(id, news.name, output?.name);
        const internalLabels = yield* createInternalLabels(id);
        const desiredLabels = {
            ...toLabels(news.labels),
            ...internalLabels,
        };
        const desiredAutoDelete = news.autoDelete ?? false;
        const desiredProtection = news.deleteProtection ?? false;
        // Observe — cloud state is authoritative. `output.id` is a cache
        // for the stable identifier; if the IP is gone, we recreate.
        let current = yield* observe({
            id,
            name,
            outputId: output?.id,
        });
        // Ensure — create only when missing. A Conflict is a race with a
        // peer reconciler or a name that just became visible; re-observe.
        if (current === undefined) {
            const placement = resolvePlacement(news);
            if (placement === undefined) {
                return yield* new PrimaryIpPlacementRequired({
                    message: "PrimaryIp requires `location` or `datacenter` when creating",
                });
            }
            const location = yield* findLocation(placement);
            const created = yield* Services.primaryIps
                .createPrimaryIp({
                name,
                type: news.type,
                location: location.name,
                labels: desiredLabels,
                auto_delete: desiredAutoDelete,
            })
                .pipe(Effect.catchTag("Conflict", () => observe({ id, name }).pipe(Effect.flatMap((hit) => hit !== undefined
                ? Effect.succeed({ primary_ip: hit, action: undefined })
                : Services.primaryIps.createPrimaryIp({
                    name,
                    type: news.type,
                    location: location.name,
                    labels: desiredLabels,
                    auto_delete: desiredAutoDelete,
                })))));
            if (created.action) {
                yield* waitForAction(created.action);
            }
            current = created.primary_ip;
        }
        // Sync — name / auto_delete / labels via PUT (labels overwrite the
        // full set). Protection is a separate Action.
        const observedLabels = tagRecord(current.labels);
        const { upsert, removed } = diffLabels(observedLabels, desiredLabels);
        const needsUpdate = current.name !== name ||
            current.auto_delete !== desiredAutoDelete ||
            upsert.length > 0 ||
            removed.length > 0;
        if (needsUpdate) {
            const updated = yield* Services.primaryIps.updatePrimaryIp({
                id: current.id,
                name,
                auto_delete: desiredAutoDelete,
                labels: desiredLabels,
            });
            current = updated.primary_ip;
        }
        if (current.protection.delete !== desiredProtection) {
            const { action } = yield* Services.primaryIpActions.changePrimaryIpProtection({
                id: current.id,
                delete: desiredProtection,
            });
            yield* waitForAction(action);
        }
        return toAttrs(yield* refresh(current.id), {
            datacenter: news.datacenter,
        });
    }),
    delete: Effect.fn(function* ({ output }) {
        const current = yield* getById(output.id);
        if (current === undefined)
            return;
        if (current.protection.delete) {
            yield* disableProtection(current.id);
        }
        if (current.assignee_id !== null) {
            const { action } = yield* Services.primaryIpActions.unassignPrimaryIp({
                id: current.id,
            });
            yield* waitForAction(action);
        }
        yield* Services.primaryIps
            .deletePrimaryIp({ id: current.id })
            .pipe(Effect.catchTag("NotFound", () => Effect.void));
    }),
});
//# sourceMappingURL=PrimaryIp.js.map