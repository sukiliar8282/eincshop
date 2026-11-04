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
 * An AWS IoT FleetWise state template — a definition of which signals'
 * last-known state the Edge Agent reports for a {@link Vehicle}
 * (associated via the vehicle's `stateTemplates` prop).
 *
 * Only the description, tracked properties, and extra dimensions are
 * mutable — changing the name or signal catalog replaces the template.
 * AWS IoT FleetWise is allowlist-gated and offered in
 * `us-east-1`/`eu-central-1` only.
 * ### Creating a State Template
 * **Example:** Track Last-Known Speed
 * ```typescript
 * const template = yield* StateTemplate("SpeedState", {
 *   signalCatalogArn: catalog.signalCatalogArn,
 *   stateTemplateProperties: ["Vehicle.Speed"],
 * });
 * ```
 *
 * **Example:** Associate with a Vehicle
 * ```typescript
 * const vehicle = yield* Vehicle("TestVehicle", {
 *   modelManifestArn: model.modelManifestArn,
 *   decoderManifestArn: decoder.decoderManifestArn,
 *   stateTemplates: [
 *     {
 *       identifier: template.stateTemplateName,
 *       stateTemplateUpdateStrategy: { onChange: {} },
 *     },
 *   ],
 * });
 * ```
 *
 * @resource
 */
export const StateTemplate = Resource("AWS.IoTFleetWise.StateTemplate");
export const StateTemplateProvider = () => Provider.effect(StateTemplate, Effect.gen(function* () {
    const toName = (id, props) => props.stateTemplateName
        ? Effect.succeed(props.stateTemplateName)
        : createPhysicalName({ id, maxLength: 100 });
    const readTemplate = Effect.fn(function* (identifier) {
        return yield* iotfleetwise.getStateTemplate({ identifier }).pipe(inFleetWiseRegion, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    const toAttrs = Effect.fn(function* (template) {
        if (template.name === undefined || template.arn === undefined) {
            return yield* Effect.fail(new Error(`StateTemplate '${template.name}' is missing its ARN`));
        }
        return {
            stateTemplateName: template.name,
            stateTemplateArn: template.arn,
            stateTemplateId: template.id,
            signalCatalogArn: template.signalCatalogArn,
            stateTemplateProperties: [
                ...(template.stateTemplateProperties ?? []),
            ],
        };
    });
    return {
        stables: ["stateTemplateName", "stateTemplateArn", "stateTemplateId"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            if ((yield* toName(id, olds)) !== (yield* toName(id, news))) {
                return { action: "replace" };
            }
            // The backing signal catalog is fixed at creation.
            if (olds.signalCatalogArn !== news.signalCatalogArn) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.stateTemplateName ?? (yield* toName(id, olds ?? {}));
            const found = yield* readTemplate(name);
            if (found?.arn === undefined)
                return undefined;
            const attrs = yield* toAttrs(found);
            const tags = yield* readFleetWiseTags(found.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.stateTemplateName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* readTemplate(name);
            // 2. Ensure — create if missing; tolerate the AlreadyExists race.
            if (observed === undefined) {
                yield* iotfleetwise
                    .createStateTemplate({
                    name,
                    description: news.description,
                    signalCatalogArn: news.signalCatalogArn,
                    stateTemplateProperties: news.stateTemplateProperties,
                    dataExtraDimensions: news.dataExtraDimensions,
                    metadataExtraDimensions: news.metadataExtraDimensions,
                    tags: toFleetWiseTagList(desiredTags),
                })
                    .pipe(inFleetWiseRegion, Effect.catchTag("ConflictException", () => Effect.void));
                observed = yield* readTemplate(name).pipe(Effect.flatMap((template) => template === undefined
                    ? Effect.fail(new Error(`StateTemplate '${name}' not found`))
                    : Effect.succeed(template)), retryObservation);
            }
            // 3. Sync mutable aspects against OBSERVED cloud state.
            const observedProperties = observed.stateTemplateProperties ?? [];
            const toAdd = news.stateTemplateProperties.filter((fqn) => !observedProperties.includes(fqn));
            const toRemove = observedProperties.filter((fqn) => !news.stateTemplateProperties.includes(fqn));
            const descriptionChanged = news.description !== undefined &&
                news.description !== observed.description;
            const dataDimensionsChanged = news.dataExtraDimensions !== undefined &&
                !stableEquals(observed.dataExtraDimensions ?? [], news.dataExtraDimensions);
            const metadataDimensionsChanged = news.metadataExtraDimensions !== undefined &&
                !stableEquals(observed.metadataExtraDimensions ?? [], news.metadataExtraDimensions);
            if (toAdd.length > 0 ||
                toRemove.length > 0 ||
                descriptionChanged ||
                dataDimensionsChanged ||
                metadataDimensionsChanged) {
                yield* iotfleetwise
                    .updateStateTemplate({
                    identifier: name,
                    description: descriptionChanged ? news.description : undefined,
                    stateTemplatePropertiesToAdd: toAdd.length > 0 ? toAdd : undefined,
                    stateTemplatePropertiesToRemove: toRemove.length > 0 ? toRemove : undefined,
                    dataExtraDimensions: dataDimensionsChanged
                        ? news.dataExtraDimensions
                        : undefined,
                    metadataExtraDimensions: metadataDimensionsChanged
                        ? news.metadataExtraDimensions
                        : undefined,
                })
                    .pipe(inFleetWiseRegion);
                observed = yield* readTemplate(name).pipe(Effect.flatMap((template) => template === undefined
                    ? Effect.fail(new Error(`StateTemplate '${name}' not found`))
                    : Effect.succeed(template)), retryObservation);
            }
            // 3b. Sync tags against OBSERVED cloud tags.
            const arn = observed.arn;
            if (arn !== undefined) {
                yield* syncFleetWiseTags(arn, desiredTags);
            }
            yield* session.note(name);
            return yield* toAttrs(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // DeleteStateTemplate is idempotent — deleting a missing template
            // succeeds (its error union carries no not-found tag).
            yield* iotfleetwise
                .deleteStateTemplate({ identifier: output.stateTemplateName })
                .pipe(inFleetWiseRegion);
        }),
        list: () => iotfleetwise.listStateTemplates.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((summary) => summary.name !== undefined && summary.arn !== undefined
            ? [
                {
                    stateTemplateName: summary.name,
                    stateTemplateArn: summary.arn,
                    stateTemplateId: summary.id,
                    signalCatalogArn: summary.signalCatalogArn,
                    stateTemplateProperties: [],
                },
            ]
            : [])), inFleetWiseRegion),
    };
}));
//# sourceMappingURL=StateTemplate.js.map