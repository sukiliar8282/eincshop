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
import { recordsEqual } from "../Util/equal.js";
import { waitForZoneAction } from "./actions.js";
import { alchemyLabelKeys, alchemyStackSelector, createInternalLabels, hasAlchemyLabels, labelSelector, stripInternalLabels, toLabels, } from "./Labels.js";
/**
 * A Hetzner Cloud DNS zone — an apex domain hosted on Hetzner's
 * authoritative nameservers.
 *
 * The zone `name` is the identity: changing it replaces the zone. Default
 * TTL, labels, and delete protection update in place. Resource record sets
 * are a separate resource (`RecordSet`).
 * @see https://docs.hetzner.cloud/reference/cloud#zones
 *
 * ### Creating a Zone
 * **Example:** Primary zone with a default TTL
 * ```typescript
 * const zone = yield* Hetzner.Zone("example", {
 *   name: "example.com",
 *   ttl: 3600,
 * });
 * ```
 *
 * **Example:** Zone with labels and delete protection
 * ```typescript
 * const zone = yield* Hetzner.Zone("example", {
 *   name: "example.com",
 *   labels: { env: "prod" },
 *   deleteProtection: true,
 * });
 * ```
 *
 * @resource
 */
export const Zone = Resource("Hetzner.Zone");
const DEFAULT_MODE = "primary";
const normalizeName = (name) => name.toLowerCase().replace(/\.$/, "");
const generateZoneName = (id) => createPhysicalName({ id, lowercase: true, maxLength: 63 }).pipe(Effect.map((physical) => `${physical}.com`));
const resolveZoneName = (id, news, output) => Effect.gen(function* () {
    if (news.name !== undefined) {
        return normalizeName(news.name);
    }
    if (output?.name !== undefined) {
        return output.name;
    }
    return yield* generateZoneName(id);
});
const desiredLabels = Effect.fn(function* (id, user) {
    return {
        ...toLabels(user),
        ...(yield* createInternalLabels(id)),
    };
});
const toAttrs = (zone) => ({
    zoneId: zone.id,
    name: zone.name,
    mode: zone.mode,
    ttl: zone.ttl,
    labels: stripInternalLabels(tagRecord(zone.labels)),
    deleteProtection: zone.protection.delete,
    status: zone.status,
    recordCount: zone.record_count,
    registrar: zone.registrar,
    created: zone.created,
    assignedNameservers: zone.authoritative_nameservers.assigned,
    delegatedNameservers: zone.authoritative_nameservers.delegated,
    delegationStatus: zone.authoritative_nameservers.delegation_status,
});
const getZoneBy = (idOrName) => Services.zones.getZone({ id_or_name: idOrName }).pipe(Effect.map(({ zone }) => zone), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
class ZoneStillExists extends Data.TaggedError("ZoneStillExists") {
}
const backoff = Schedule.min([
    Schedule.exponential(Duration.millis(500), 1.5),
    Schedule.spaced(Duration.seconds(5)),
]);
const retryLocked = (effect) => effect.pipe(Effect.retry({
    while: (e) => e._tag === "Locked",
    times: 8,
    schedule: backoff,
}));
export const ZoneProvider = () => Provider.succeed(Zone, {
    stables: ["zoneId", "name", "mode"],
    list: Effect.fn(function* () {
        const zones = yield* Services.zones.listZones
            .items({ label_selector: alchemyStackSelector, per_page: 50 })
            .pipe(Stream.runCollect);
        return [...zones].map(toAttrs);
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!isResolved(news))
            return undefined;
        if (!output)
            return undefined;
        if (news.name !== undefined && normalizeName(news.name) !== output.name) {
            return { action: "replace" };
        }
        if ((news.mode ?? DEFAULT_MODE) !== output.mode) {
            return { action: "replace" };
        }
        const desiredProtection = news.deleteProtection ?? false;
        const labelsChanged = !recordsEqual(news.labels ?? {}, output.labels);
        const ttlChanged = news.ttl !== undefined && news.ttl !== output.ttl;
        if (ttlChanged ||
            labelsChanged ||
            desiredProtection !== output.deleteProtection) {
            return { action: "update" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        let zone;
        if (output?.zoneId !== undefined) {
            zone = yield* getZoneBy(String(output.zoneId));
        }
        if (zone === undefined) {
            const name = output?.name ?? olds?.name;
            if (name !== undefined) {
                zone = yield* getZoneBy(normalizeName(name));
            }
        }
        if (zone === undefined) {
            const expected = yield* createInternalLabels(id);
            const selector = labelSelector(expected);
            if (selector.length > 0) {
                zone = yield* Services.zones.listZones
                    .items({
                    label_selector: selector,
                    per_page: 50,
                })
                    .pipe(Stream.take(1), Stream.runHead, Effect.map((option) => option._tag === "Some" ? option.value : undefined));
            }
        }
        if (zone === undefined)
            return undefined;
        const attrs = toAttrs(zone);
        return (yield* hasAlchemyLabels(id, tagRecord(zone.labels)))
            ? attrs
            : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const name = yield* resolveZoneName(id, news, output);
        const mode = news.mode ?? output?.mode ?? DEFAULT_MODE;
        const idOrName = output?.zoneId !== undefined ? String(output.zoneId) : name;
        // 1. Observe
        let current = yield* getZoneBy(idOrName);
        if (current === undefined && output?.zoneId !== undefined) {
            current = yield* getZoneBy(name);
        }
        // 2. Ensure
        if (current === undefined) {
            const labels = yield* desiredLabels(id, news.labels);
            const created = yield* retryLocked(Services.zones
                .createZone({
                name,
                mode,
                ...(news.ttl !== undefined ? { ttl: news.ttl } : {}),
                labels,
            })
                .pipe(Effect.catchTag("Conflict", () => Services.zones
                .getZone({ id_or_name: name })
                .pipe(Effect.map(({ zone }) => ({ zone, action: undefined }))))));
            if (created.action !== undefined) {
                yield* waitForZoneAction(created.action);
            }
            current =
                created.action === undefined
                    ? created.zone
                    : ((yield* getZoneBy(name)) ?? created.zone);
        }
        const zoneRef = String(current.id);
        // 3. Sync — labels (PUT overwrites the full set)
        const labels = yield* desiredLabels(id, news.labels);
        const observedLabels = tagRecord(current.labels);
        if (!recordsEqual(observedLabels, labels)) {
            const updated = yield* retryLocked(Services.zones.updateZone({
                id_or_name: zoneRef,
                labels,
            }));
            current = updated.zone;
        }
        // Sync — default TTL (primary zones only; secondary ignores it)
        if (news.ttl !== undefined &&
            news.ttl !== current.ttl &&
            current.mode === "primary") {
            const { action } = yield* retryLocked(Services.zoneActions.changeZoneTtl({
                id_or_name: zoneRef,
                ttl: news.ttl,
            }));
            yield* waitForZoneAction(action);
            current = (yield* getZoneBy(zoneRef)) ?? current;
        }
        // Sync — delete protection
        const desiredProtection = news.deleteProtection ?? false;
        if (current.protection.delete !== desiredProtection) {
            const { action } = yield* retryLocked(Services.zoneActions.changeZoneProtection({
                id_or_name: zoneRef,
                delete: desiredProtection,
            }));
            yield* waitForZoneAction(action);
            current = (yield* getZoneBy(zoneRef)) ?? current;
        }
        return toAttrs(current);
    }),
    delete: Effect.fn(function* ({ output }) {
        const idOrName = String(output.zoneId);
        const current = yield* getZoneBy(idOrName);
        if (current === undefined)
            return;
        if (current.protection.delete) {
            const { action } = yield* retryLocked(Services.zoneActions.changeZoneProtection({
                id_or_name: idOrName,
                delete: false,
            }));
            yield* waitForZoneAction(action);
        }
        const deleted = yield* retryLocked(Services.zones
            .deleteZone({ id_or_name: idOrName })
            .pipe(Effect.catchTag("NotFound", () => Effect.succeed(undefined))));
        if (deleted !== undefined) {
            yield* waitForZoneAction(deleted.action);
        }
        yield* getZoneBy(idOrName).pipe(Effect.flatMap((zone) => zone === undefined ? Effect.void : new ZoneStillExists({ idOrName })), Effect.retry({
            while: (e) => e._tag === "ZoneStillExists",
            times: 8,
            schedule: backoff,
        }), Effect.catchTag("ZoneStillExists", () => Effect.void));
    }),
});
//# sourceMappingURL=Zone.js.map