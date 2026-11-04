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
import { waitForAction, waitForActions } from "./actions.js";
import { alchemyStackSelector, createInternalLabels, diffLabels, hasAlchemyLabels, labelSelector, stripInternalLabels, toLabels, } from "./Labels.js";
const DEFAULT_LOCATION = "nbg1";
const MIN_SIZE_GB = 10;
const MAX_NAME_LENGTH = 64;
/**
 * A Hetzner Cloud Volume — a network block device that can be attached to
 * a Server in the same Location. Unattached Volumes are valid; pass
 * `server` to attach at create time.
 *
 * Size can grow in place (min 10 GB). Format and location are immutable
 * (changing either replaces the Volume). Hetzner cannot shrink a Volume.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#volumes
 *
 * ### Creating a Volume
 * **Example:** Unattached Volume
 * ```typescript
 * const volume = yield* Hetzner.Volume("data", {
 *   size: 10,
 *   format: "ext4",
 *   location: "nbg1",
 * });
 * ```
 *
 * **Example:** Named Volume with labels
 * ```typescript
 * const volume = yield* Hetzner.Volume("data", {
 *   name: "app-data",
 *   size: 20,
 *   format: "xfs",
 *   location: "nbg1",
 *   labels: { role: "db" },
 * });
 * ```
 *
 * ### Attaching to a Server
 * **Example:** Create-time attach
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cx22",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * const volume = yield* Hetzner.Volume("data", {
 *   size: 10,
 *   format: "ext4",
 *   server,
 *   automount: true,
 * });
 * ```
 *
 * @resource
 */
export const Volume = Resource("Hetzner.Volume");
class VolumePending extends Data.TaggedError("VolumePending") {
}
class VolumeTimeout extends Data.TaggedError("VolumeTimeout") {
}
class VolumeNotCreated extends Data.TaggedError("Hetzner.VolumeNotCreated") {
}
const asFormat = (format) => format === "ext4" || format === "xfs" ? format : undefined;
const userLabels = (labels) => stripInternalLabels(tagRecord(labels));
const toAttrs = (volume) => ({
    id: volume.id,
    name: volume.name,
    size: volume.size,
    format: asFormat(volume.format),
    location: volume.location.name,
    locationId: volume.location.id,
    linuxDevice: volume.linux_device,
    status: volume.status,
    serverId: volume.server,
    created: volume.created,
    labels: userLabels(volume.labels),
});
const retryable = (e) => e._tag === "VolumePending" ||
    e._tag === "TooManyRequests" ||
    e._tag === "ServiceUnavailable" ||
    e._tag === "InternalServerError" ||
    e._tag === "BadGateway" ||
    e._tag === "GatewayTimeout" ||
    e._tag === "Locked";
const backoff = Schedule.min([
    Schedule.exponential(Duration.millis(500), 1.5),
    Schedule.spaced(Duration.seconds(5)),
]);
const createVolumeName = (id, name, existing) => Effect.gen(function* () {
    return (name ??
        existing ??
        (yield* createPhysicalName({ id, maxLength: MAX_NAME_LENGTH })));
});
const getById = (id) => Services.volumes.getVolume({ id }).pipe(Effect.map(({ volume }) => volume), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const getByName = (name) => Services.volumes
    .listVolumes({ name, per_page: 50 })
    .pipe(Effect.map(({ volumes }) => volumes.find((item) => item.name === name)));
const getByLabels = (labels) => Services.volumes
    .listVolumes({
    label_selector: labelSelector(labels),
    per_page: 50,
})
    .pipe(Effect.map(({ volumes }) => volumes[0]));
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
const waitUntilAvailable = (volumeId) => Services.volumes.getVolume({ id: volumeId }).pipe(Effect.flatMap(({ volume }) => volume.status === "available"
    ? Effect.succeed(volume)
    : Effect.fail(new VolumePending({
        volumeId: volume.id,
        status: volume.status,
    }))), Effect.retry({
    while: retryable,
    times: 10,
    schedule: backoff,
}), Effect.catchTag("VolumePending", (e) => new VolumeTimeout({
    volumeId: e.volumeId,
    status: e.status,
})));
const settleAction = (action) => waitForAction(action).pipe(Effect.catchTag("ActionTimeout", () => Effect.void));
const settleActions = (actions) => waitForActions(actions).pipe(Effect.catchTag("ActionTimeout", () => Effect.void));
const waitUntilGone = (volumeId) => Services.volumes.getVolume({ id: volumeId }).pipe(Effect.map(() => false), Effect.catchTag("NotFound", () => Effect.succeed(true)), Effect.repeat({
    schedule: Schedule.spaced(Duration.seconds(1)),
    until: (gone) => gone,
    times: 10,
}));
const serverIdOf = (value) => {
    if (value == null || typeof value !== "object")
        return undefined;
    const id = value.serverId;
    return typeof id === "number" ? id : undefined;
};
export const VolumeProvider = () => Provider.succeed(Volume, {
    stables: ["id", "linuxDevice", "location", "locationId", "created"],
    list: Effect.fn(function* () {
        const items = yield* Services.volumes.listVolumes
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
            if (news.format !== undefined && news.format !== output.format) {
                return { action: "replace" };
            }
            if (news.size < output.size) {
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
        const name = yield* createVolumeName(id, news.name, output?.name);
        const internalLabels = yield* createInternalLabels(id);
        const desiredLabels = {
            ...toLabels(news.labels),
            ...internalLabels,
        };
        const desiredServerId = serverIdOf(news.server);
        const location = news.location ??
            (desiredServerId === undefined ? DEFAULT_LOCATION : undefined);
        // Observe by id then desired name only. Do not fall back to
        // ownership labels — a create-first replacement still has the old
        // generation live under the same logical id.
        let current = output?.id !== undefined ? yield* getById(output.id) : undefined;
        if (current === undefined) {
            current = yield* getByName(name);
        }
        // Ensure — create only when missing. A Conflict is a race with a
        // peer reconciler or a name that just became visible; re-observe.
        if (current === undefined) {
            const created = yield* Services.volumes
                .createVolume({
                name,
                size: Math.max(news.size, MIN_SIZE_GB),
                format: news.format,
                location,
                labels: desiredLabels,
                server: desiredServerId,
                automount: desiredServerId !== undefined ? news.automount : undefined,
            })
                .pipe(Effect.catchTag("Conflict", () => Effect.succeed(undefined)));
            if (created !== undefined) {
                if (created.action) {
                    yield* settleActions([created.action, ...created.next_actions]);
                }
                current = yield* waitUntilAvailable(created.volume.id);
            }
            else {
                const hit = yield* getByName(name);
                if (hit === undefined) {
                    return yield* new VolumeNotCreated({ name });
                }
                current = yield* waitUntilAvailable(hit.id);
            }
        }
        // Sync name + labels against observed cloud labels, not olds.
        // updateVolume overwrites the full label set.
        const observedLabels = tagRecord(current.labels);
        const { upsert, removed } = diffLabels(observedLabels, desiredLabels);
        const needsMeta = current.name !== name || upsert.length > 0 || removed.length > 0;
        if (needsMeta) {
            const updated = yield* Services.volumes.updateVolume({
                id: current.id,
                name,
                labels: desiredLabels,
            });
            current = updated.volume;
        }
        // Sync size — grow only. Shrink is a replacement (handled in diff).
        if (news.size > current.size) {
            const { action } = yield* Services.volumeActions.resizeVolume({
                id: current.id,
                size: news.size,
            });
            yield* settleAction(action);
            current = yield* waitUntilAvailable(current.id);
        }
        // Sync attach — create-time sugar also applies on later updates.
        const observedServerId = current.server ?? undefined;
        if (desiredServerId !== observedServerId) {
            if (observedServerId !== undefined) {
                const { action } = yield* Services.volumeActions.detachVolume({
                    id: current.id,
                });
                yield* settleAction(action);
                current = yield* waitUntilAvailable(current.id);
            }
            if (desiredServerId !== undefined) {
                const { action } = yield* Services.volumeActions.attachVolume({
                    id: current.id,
                    server: desiredServerId,
                    automount: news.automount,
                });
                yield* settleAction(action);
                current = yield* waitUntilAvailable(current.id);
            }
        }
        return toAttrs(current);
    }),
    delete: Effect.fn(function* ({ output }) {
        const current = yield* getById(output.id);
        if (current === undefined)
            return;
        if (current.protection.delete) {
            const { action } = yield* Services.volumeActions.changeVolumeProtection({
                id: current.id,
                delete: false,
            });
            yield* settleAction(action);
        }
        const attached = current.server;
        if (attached !== null) {
            yield* Services.volumeActions.detachVolume({ id: current.id }).pipe(Effect.flatMap(({ action }) => settleAction(action)), 
            // Server delete detaches the Volume first; treat that race as
            // already-detached.
            Effect.catchTag(["NotFound", "UnprocessableEntity"], () => Effect.void));
        }
        yield* Services.volumes.deleteVolume({ id: current.id }).pipe(Effect.catchTag("NotFound", () => Effect.void), Effect.retry({
            while: (e) => retryable(e) || e._tag === "UnprocessableEntity",
            times: 8,
            schedule: backoff,
        }));
        yield* waitUntilGone(current.id);
    }),
});
//# sourceMappingURL=Volume.js.map