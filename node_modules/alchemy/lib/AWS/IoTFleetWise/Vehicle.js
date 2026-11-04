import * as iotfleetwise from "@distilled.cloud/aws/iotfleetwise";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { inFleetWiseRegion, readFleetWiseTags, retryObservation, stableEquals, syncFleetWiseTags, toFleetWiseTagList, } from "./internal.js";
/**
 * An AWS IoT FleetWise vehicle — the digital twin of a physical vehicle,
 * created from an `ACTIVE` {@link ModelManifest} and
 * {@link DecoderManifest} pair and backed by an AWS IoT thing.
 * ### Creating a Vehicle
 * **Example:** Vehicle with an Auto-Created IoT Thing
 * ```typescript
 * const vehicle = yield* Vehicle("TestVehicle", {
 *   modelManifestArn: model.modelManifestArn,
 *   decoderManifestArn: decoder.decoderManifestArn,
 * });
 * ```
 *
 * **Example:** Vehicle with Attributes
 * ```typescript
 * const vehicle = yield* Vehicle("TestVehicle", {
 *   modelManifestArn: model.modelManifestArn,
 *   decoderManifestArn: decoder.decoderManifestArn,
 *   attributes: { "Vehicle.VIN": "1HGBH41JXMN109186" },
 *   tags: { plant: "fremont" },
 * });
 * ```
 *
 * @resource
 */
export const Vehicle = Resource("AWS.IoTFleetWise.Vehicle");
const toAttributeRecord = (attributes) => Object.fromEntries(Object.entries(attributes ?? {}).flatMap(([key, value]) => value !== undefined ? [[key, value]] : []));
export const VehicleProvider = () => Provider.effect(Vehicle, Effect.gen(function* () {
    const toName = (id, props) => props.vehicleName
        ? Effect.succeed(props.vehicleName)
        : createPhysicalName({ id, maxLength: 100 });
    const readVehicle = Effect.fn(function* (vehicleName) {
        return yield* iotfleetwise.getVehicle({ vehicleName }).pipe(inFleetWiseRegion, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttrs = Effect.fn(function* (vehicle) {
        if (vehicle.vehicleName === undefined ||
            vehicle.arn === undefined ||
            vehicle.modelManifestArn === undefined ||
            vehicle.decoderManifestArn === undefined) {
            return yield* Effect.fail(new Error(`Vehicle '${vehicle.vehicleName}' is missing required fields`));
        }
        return {
            vehicleName: vehicle.vehicleName,
            vehicleArn: vehicle.arn,
            modelManifestArn: vehicle.modelManifestArn,
            decoderManifestArn: vehicle.decoderManifestArn,
            attributes: toAttributeRecord(vehicle.attributes),
        };
    });
    return {
        stables: ["vehicleName", "vehicleArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
            // The IoT-thing association is decided at creation time.
            if ((news.associationBehavior ?? "CreateIotThing") !==
                (olds.associationBehavior ?? "CreateIotThing")) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.vehicleName ?? (yield* toName(id, olds ?? {}));
            const found = yield* readVehicle(name);
            if (found?.arn === undefined)
                return undefined;
            const attrs = yield* toAttrs(found);
            const tags = yield* readFleetWiseTags(found.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.vehicleName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readVehicle(name);
            // 2. Ensure — create if missing; tolerate the AlreadyExists race.
            if (observed === undefined) {
                yield* iotfleetwise
                    .createVehicle({
                    vehicleName: name,
                    modelManifestArn: news.modelManifestArn,
                    decoderManifestArn: news.decoderManifestArn,
                    attributes: news.attributes,
                    associationBehavior: news.associationBehavior ?? "CreateIotThing",
                    stateTemplates: news.stateTemplates,
                    tags: toFleetWiseTagList(desiredTags),
                })
                    .pipe(inFleetWiseRegion, Effect.catchTag("ConflictException", () => Effect.void));
                observed = yield* readVehicle(name).pipe(Effect.flatMap((vehicle) => vehicle === undefined
                    ? Effect.fail(new Error(`Vehicle '${name}' not found`))
                    : Effect.succeed(vehicle)), retryObservation);
            }
            // 3. Sync manifests + attributes — apply only the observed delta.
            const manifestChanged = observed.modelManifestArn !== news.modelManifestArn ||
                observed.decoderManifestArn !== news.decoderManifestArn;
            const attributesChanged = news.attributes !== undefined &&
                !stableEquals(toAttributeRecord(observed.attributes), news.attributes);
            if (manifestChanged || attributesChanged) {
                yield* iotfleetwise
                    .updateVehicle({
                    vehicleName: name,
                    modelManifestArn: manifestChanged
                        ? news.modelManifestArn
                        : undefined,
                    decoderManifestArn: manifestChanged
                        ? news.decoderManifestArn
                        : undefined,
                    attributes: attributesChanged ? news.attributes : undefined,
                    attributeUpdateMode: attributesChanged
                        ? "Overwrite"
                        : undefined,
                })
                    .pipe(inFleetWiseRegion);
                observed = yield* readVehicle(name).pipe(Effect.flatMap((vehicle) => vehicle === undefined
                    ? Effect.fail(new Error(`Vehicle '${name}' not found`))
                    : Effect.succeed(vehicle)), retryObservation);
            }
            // 3b. Sync state-template associations against OBSERVED state.
            // Associations are keyed by identifier; strategy changes are
            // applied via stateTemplatesToUpdate. Identifiers are matched
            // exactly (pass the same name-or-ARN form consistently).
            if (news.stateTemplates !== undefined) {
                const desired = news.stateTemplates;
                const observedAssociations = observed.stateTemplates ?? [];
                const observedByIdentifier = new Map(observedAssociations.map((a) => [a.identifier, a]));
                const desiredIdentifiers = new Set(desired.map((a) => a.identifier));
                const templatesToAdd = desired.filter((a) => !observedByIdentifier.has(a.identifier));
                const templatesToUpdate = desired.filter((a) => {
                    const current = observedByIdentifier.get(a.identifier);
                    return (current !== undefined &&
                        !stableEquals(current.stateTemplateUpdateStrategy, a.stateTemplateUpdateStrategy));
                });
                const templatesToRemove = observedAssociations
                    .filter((a) => !desiredIdentifiers.has(a.identifier))
                    .map((a) => a.identifier);
                if (templatesToAdd.length > 0 ||
                    templatesToUpdate.length > 0 ||
                    templatesToRemove.length > 0) {
                    yield* iotfleetwise
                        .updateVehicle({
                        vehicleName: name,
                        stateTemplatesToAdd: templatesToAdd.length > 0 ? templatesToAdd : undefined,
                        stateTemplatesToUpdate: templatesToUpdate.length > 0
                            ? templatesToUpdate
                            : undefined,
                        stateTemplatesToRemove: templatesToRemove.length > 0
                            ? templatesToRemove
                            : undefined,
                    })
                        .pipe(inFleetWiseRegion);
                    observed = yield* readVehicle(name).pipe(Effect.flatMap((vehicle) => vehicle === undefined
                        ? Effect.fail(new Error(`Vehicle '${name}' not found`))
                        : Effect.succeed(vehicle)), retryObservation);
                }
            }
            // 3c. Sync tags against OBSERVED cloud tags.
            const arn = observed.arn;
            if (arn !== undefined) {
                yield* syncFleetWiseTags(arn, desiredTags);
            }
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Idempotent: deleting a missing vehicle succeeds. The backing
            // IoT thing (if auto-created) is left in place, matching AWS
            // behavior.
            yield* iotfleetwise
                .deleteVehicle({ vehicleName: output.vehicleName })
                .pipe(inFleetWiseRegion);
        }),
        list: () => iotfleetwise.listVehicles.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).map((summary) => ({
            vehicleName: summary.vehicleName,
            vehicleArn: summary.arn,
            modelManifestArn: summary.modelManifestArn,
            decoderManifestArn: summary.decoderManifestArn,
            attributes: toAttributeRecord(summary.attributes),
        }))), inFleetWiseRegion),
    };
}));
//# sourceMappingURL=Vehicle.js.map