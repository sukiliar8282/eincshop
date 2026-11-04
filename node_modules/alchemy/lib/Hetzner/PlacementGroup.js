import { Services } from "@distilled.cloud/hetzner";
import * as Data from "effect/Data";
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
/**
 * A Hetzner Cloud Placement Group. Spread groups keep member Servers on
 * distinct physical hosts so a single hardware failure cannot take them
 * all down. Type is `spread` (the only type Hetzner currently offers)
 * and is immutable — changing it replaces the group. Name and labels
 * update in place.
 *
 * Servers are attached from the Server resource (not here).
 *
 * @see https://docs.hetzner.cloud/reference/cloud#placement-groups
 *
 * ### Creating a Placement Group
 * **Example:** Basic spread group
 * ```typescript
 * const group = yield* Hetzner.PlacementGroup("web");
 * ```
 *
 * **Example:** Named group with labels
 * ```typescript
 * const group = yield* Hetzner.PlacementGroup("web", {
 *   name: "web-spread",
 *   type: "spread",
 *   labels: { role: "web" },
 * });
 * ```
 *
 * @resource
 */
export const PlacementGroup = Resource("Hetzner.PlacementGroup");
export class PlacementGroupNotResolved extends Data.TaggedError("Hetzner.PlacementGroupNotResolved") {
}
const DEFAULT_TYPE = "spread";
const userLabels = (labels) => stripInternalLabels(tagRecord(labels));
const toName = (id, name, existing) => Effect.gen(function* () {
    return (name ?? existing ?? (yield* createPhysicalName({ id, maxLength: 64 })));
});
const toAttrs = (group) => ({
    id: group.id,
    name: group.name,
    type: group.type,
    labels: userLabels(group.labels),
    created: group.created,
    servers: group.servers,
});
const getById = (id) => Services.placementGroups.getPlacementGroup({ id }).pipe(Effect.map(({ placement_group }) => placement_group), Effect.catchTag("NotFound", () => Effect.succeed(undefined)));
const findByName = (name) => Services.placementGroups
    .listPlacementGroups({ name, per_page: 50 })
    .pipe(Effect.map(({ placement_groups }) => placement_groups.find((group) => group.name === name)));
const findByAlchemyLabels = (id) => Effect.gen(function* () {
    const internal = yield* createInternalLabels(id);
    const { placement_groups } = yield* Services.placementGroups.listPlacementGroups({
        label_selector: labelSelector(internal),
        per_page: 50,
    });
    return placement_groups.find((group) => {
        const labels = tagRecord(group.labels);
        return Object.entries(internal).every(([key, value]) => labels[key] === value);
    });
});
const observe = Effect.fn(function* (input) {
    if (input.id !== undefined) {
        const byId = yield* getById(input.id);
        if (byId !== undefined)
            return byId;
    }
    if (input.name !== undefined) {
        const byName = yield* findByName(input.name);
        if (byName !== undefined)
            return byName;
    }
    return yield* findByAlchemyLabels(input.logicalId);
});
/**
 * Poll `getPlacementGroup` until it returns the typed `NotFound` tag.
 * Bounded to 10 attempts at 1s spacing.
 */
export const waitUntilPlacementGroupGone = (id) => Services.placementGroups.getPlacementGroup({ id }).pipe(Effect.as("found"), Effect.catchTag("NotFound", () => Effect.succeed("gone")), Effect.repeat({
    schedule: Schedule.spaced("1 second"),
    until: (status) => status === "gone",
    times: 10,
}));
export const PlacementGroupProvider = () => Provider.succeed(PlacementGroup, {
    stables: ["id", "type", "created"],
    diff: Effect.fn(function* ({ news, output }) {
        if (!isResolved(news))
            return undefined;
        const nextType = news.type ?? DEFAULT_TYPE;
        if (output !== undefined && nextType !== output.type) {
            return { action: "replace" };
        }
        return undefined;
    }),
    read: Effect.fn(function* ({ id, olds, output }) {
        const name = yield* toName(id, olds?.name, output?.name);
        const existing = yield* observe({
            id: output?.id,
            name,
            logicalId: id,
        });
        if (existing === undefined)
            return undefined;
        const attrs = toAttrs(existing);
        return (yield* hasAlchemyLabels(id, tagRecord(existing.labels)))
            ? attrs
            : Unowned(attrs);
    }),
    list: () => Services.placementGroups.listPlacementGroups
        .items({ label_selector: alchemyStackSelector, per_page: 50 })
        .pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk, toAttrs))),
    reconcile: Effect.fn(function* ({ id, news, output }) {
        const type = news.type ?? DEFAULT_TYPE;
        const name = yield* toName(id, news.name, output?.name);
        const desired = {
            ...toLabels(news.labels),
            ...(yield* createInternalLabels(id)),
        };
        let current = yield* observe({
            id: output?.id,
            name,
            logicalId: id,
        });
        if (current === undefined) {
            const created = yield* Services.placementGroups
                .createPlacementGroup({
                name,
                type,
                labels: desired,
            })
                .pipe(Effect.catchTag("Conflict", () => Effect.succeed(undefined)));
            if (created?.action != null) {
                yield* waitForAction(created.action.id);
            }
            current =
                created?.placement_group ?? (yield* observe({ name, logicalId: id }));
        }
        if (current === undefined) {
            return yield* new PlacementGroupNotResolved({ name });
        }
        const observedLabels = tagRecord(current.labels);
        const { upsert, removed } = diffLabels(observedLabels, desired);
        const nameChanged = current.name !== name;
        const labelsChanged = upsert.length > 0 || removed.length > 0;
        if (nameChanged || labelsChanged) {
            const updated = yield* Services.placementGroups.updatePlacementGroup({
                id: current.id,
                name: nameChanged ? name : undefined,
                labels: labelsChanged ? desired : undefined,
            });
            current = updated.placement_group;
        }
        return toAttrs(current);
    }),
    delete: Effect.fn(function* ({ output }) {
        yield* Services.placementGroups
            .deletePlacementGroup({ id: output.id })
            .pipe(Effect.catchTag("NotFound", () => Effect.void));
    }),
});
//# sourceMappingURL=PlacementGroup.js.map