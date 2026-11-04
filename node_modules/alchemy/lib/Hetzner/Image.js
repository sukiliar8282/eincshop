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
import { alchemyLabelKeys, alchemyStackSelector, createInternalLabels, diffLabels, hasAlchemyLabels, labelSelector, stripInternalLabels, toLabels, } from "./Labels.js";
const MAX_DESCRIPTION_LENGTH = 64;
/**
 * A Hetzner Cloud custom Image — a snapshot (or backup) of a Server's
 * disk. Stock system/app Images (`ubuntu-24.04`, …) are Catalog lookups
 * via `Hetzner.findImage`, not this resource.
 *
 * Snapshots are created with `POST /servers/{id}/actions/create_image`
 * and billed per GB. Description, labels, delete protection, and
 * backup→snapshot conversion update in place. Changing the source Server
 * replaces the Image.
 *
 * @see https://docs.hetzner.cloud/reference/cloud#images
 *
 * ### Creating a Snapshot
 * **Example:** Snapshot from a Server
 * ```typescript
 * const server = yield* Hetzner.Server("web", {
 *   serverType: "cx22",
 *   image: "ubuntu-24.04",
 *   location: "nbg1",
 * });
 * const image = yield* Hetzner.Image("golden", {
 *   server,
 *   description: "golden-web",
 *   labels: { role: "golden" },
 * });
 * ```
 *
 * **Example:** Snapshot with generated description
 * ```typescript
 * const image = yield* Hetzner.Image("backup", {
 *   server: { serverId: 42 },
 * });
 * ```
 *
 * ### Updating a Snapshot
 * **Example:** Description, labels, and protection
 * ```typescript
 * const image = yield* Hetzner.Image("golden", {
 *   server,
 *   description: "golden-web-v2",
 *   labels: { role: "golden", env: "prod" },
 *   deleteProtection: true,
 * });
 * ```
 *
 * @resource
 */
export const Image = Resource("Hetzner.Image");
class ImagePending extends Data.TaggedError("ImagePending") {
}
class ImageTimeout extends Data.TaggedError("ImageTimeout") {
}
class ImageNotResolved extends Data.TaggedError("Hetzner.ImageNotResolved") {
}
class ImageServerRequired extends Data.TaggedError("Hetzner.ImageServerRequired") {
}
const DEFAULT_TYPE = "snapshot";
const asType = (type) => type === "backup" ? "backup" : "snapshot";
const asStatus = (status) => status === "creating" || status === "unavailable" ? status : "available";
const asArchitecture = (architecture) => architecture === "arm" ? "arm" : "x86";
const asOsFlavor = (flavor) => {
    switch (flavor) {
        case "ubuntu":
        case "centos":
        case "debian":
        case "fedora":
        case "rocky":
        case "alma":
        case "opensuse":
        case "unknown":
            return flavor;
        default:
            return "unknown";
    }
};
const userLabels = (labels) => stripInternalLabels(tagRecord(labels));
const toAttrs = (image) => ({
    id: image.id,
    type: asType(image.type),
    status: asStatus(image.status),
    name: image.name,
    description: image.description,
    imageSize: image.image_size,
    diskSize: image.disk_size,
    created: image.created,
    createdFromId: image.created_from?.id ?? null,
    createdFromName: image.created_from?.name ?? null,
    boundTo: image.bound_to,
    osFlavor: asOsFlavor(image.os_flavor),
    osVersion: image.os_version,
    rapidDeploy: image.rapid_deploy,
    deleteProtection: image.protection.delete,
    deprecated: image.deprecated,
    architecture: asArchitecture(image.architecture),
    labels: userLabels(image.labels),
});
const retryable = (e) => e._tag === "ImagePending" ||
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
const toDescription = (id, description, existing) => Effect.gen(function* () {
    return (description ??
        existing ??
        (yield* createPhysicalName({ id, maxLength: MAX_DESCRIPTION_LENGTH })));
});
const getById = (id) => Services.images.getImage({ id }).pipe(Effect.map(({ image }) => image), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const getByLabels = (labels) => Services.images
    .listImages({
    type: ["snapshot", "backup"],
    label_selector: labelSelector(labels),
    per_page: 50,
})
    .pipe(Effect.map(({ images }) => images[0]));
const observe = Effect.fn(function* ({ id, outputId, }) {
    if (outputId !== undefined) {
        const byId = yield* getById(outputId);
        if (byId !== undefined)
            return byId;
    }
    const internal = yield* createInternalLabels(id);
    return yield* getByLabels(internal);
});
const waitUntilAvailable = (imageId) => getById(imageId).pipe(Effect.flatMap((image) => image !== undefined && image.status === "available"
    ? Effect.succeed(image)
    : Effect.fail(new ImagePending({
        imageId,
        status: image?.status ?? "missing",
    }))), Effect.retry({
    while: retryable,
    times: 10,
    schedule: Schedule.spaced(Duration.seconds(5)),
}), Effect.catchTag("ImagePending", (e) => new ImageTimeout({
    imageId: e.imageId,
    status: e.status,
})));
const waitUntilGone = (imageId) => Services.images.getImage({ id: imageId }).pipe(Effect.map(() => false), Effect.catchTag("NotFound", () => Effect.succeed(true)), Effect.repeat({
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
const disableProtection = (id) => Services.imageActions
    .changeImageProtection({ id, delete: false })
    .pipe(Effect.flatMap(({ action }) => waitForAction(action)));
export const ImageProvider = () => Provider.succeed(Image, {
    stables: [
        "id",
        "created",
        "createdFromId",
        "architecture",
        "diskSize",
        "osFlavor",
    ],
    list: Effect.fn(function* () {
        const items = yield* Services.images.listImages
            .items({
            type: ["snapshot", "backup"],
            label_selector: alchemyStackSelector,
            per_page: 50,
        })
            .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)));
        return items.map(toAttrs);
    }),
    diff: Effect.fn(function* ({ news, output }) {
        if (!isResolved(news))
            return undefined;
        if (output !== undefined) {
            const nextServerId = serverIdOf(news.server);
            if (nextServerId !== undefined &&
                output.createdFromId !== null &&
                nextServerId !== output.createdFromId) {
                return { action: "replace" };
            }
            const nextType = news.type ?? DEFAULT_TYPE;
            if (nextType === "backup" && output.type === "snapshot") {
                return { action: "replace" };
            }
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, output }) {
        const found = yield* observe({
            id,
            outputId: output?.id,
        });
        if (found === undefined)
            return undefined;
        const attrs = toAttrs(found);
        const owned = yield* hasAlchemyLabels(id, tagRecord(found.labels));
        return owned ? attrs : Unowned(attrs);
    }),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const description = yield* toDescription(id, news.description, output?.description);
        const internalLabels = yield* createInternalLabels(id);
        const desiredLabels = {
            ...toLabels(news.labels),
            ...internalLabels,
        };
        const desiredType = news.type ?? DEFAULT_TYPE;
        const desiredProtection = news.deleteProtection ?? false;
        const desiredServerId = serverIdOf(news.server);
        // Observe by id only. Do not fall back to ownership labels — a
        // create-first replacement still has the old generation live under
        // the same logical id, and snapshots are not uniquely named.
        let current = output?.id !== undefined ? yield* getById(output.id) : undefined;
        if (current === undefined) {
            if (desiredServerId === undefined) {
                return yield* new ImageServerRequired({ description });
            }
            const created = yield* Services.serverActions.createServerImage({
                id: desiredServerId,
                description,
                type: desiredType,
                labels: desiredLabels,
            });
            const imageId = created.image?.id ??
                created.action?.resources.find((resource) => resource.type === "image")?.id;
            if (imageId === undefined) {
                return yield* new ImageNotResolved({
                    serverId: desiredServerId,
                    description,
                });
            }
            if (created.action) {
                yield* waitForAction(created.action).pipe(Effect.catchTag("ActionTimeout", () => Effect.void));
            }
            current = yield* waitUntilAvailable(imageId);
        }
        const observedLabels = tagRecord(current.labels);
        const { upsert, removed } = diffLabels(observedLabels, desiredLabels);
        const labelsChanged = upsert.length > 0 || removed.length > 0;
        const convertToSnapshot = current.type === "backup" && desiredType === "snapshot";
        const descriptionChanged = current.description !== description;
        if (descriptionChanged || labelsChanged || convertToSnapshot) {
            const updated = yield* Services.images.updateImage({
                id: current.id,
                description: descriptionChanged ? description : undefined,
                type: convertToSnapshot ? "snapshot" : undefined,
                labels: labelsChanged ? desiredLabels : undefined,
            });
            current = updated.image ?? (yield* waitUntilAvailable(current.id));
        }
        if (current.protection.delete !== desiredProtection) {
            const { action } = yield* Services.imageActions.changeImageProtection({
                id: current.id,
                delete: desiredProtection,
            });
            yield* waitForAction(action);
            current = (yield* getById(current.id)) ?? current;
        }
        return toAttrs(current);
    }),
    delete: Effect.fn(function* ({ output }) {
        const current = yield* getById(output.id);
        if (current === undefined)
            return;
        if (current.protection.delete) {
            yield* disableProtection(current.id);
        }
        yield* Services.images.deleteImage({ id: current.id }).pipe(Effect.catchTag("NotFound", () => Effect.void), Effect.retry({
            while: retryable,
            times: 8,
            schedule: backoff,
        }));
        yield* waitUntilGone(current.id);
    }),
});
//# sourceMappingURL=Image.js.map