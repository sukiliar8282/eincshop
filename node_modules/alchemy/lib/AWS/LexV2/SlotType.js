import * as lexm from "@distilled.cloud/aws/lex-models-v2";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { retryWhileConflict, toLexName } from "./internal.js";
/**
 * A custom slot type on the DRAFT locale of an Amazon Lex V2 bot — the set of
 * values a slot can take, with optional synonyms and resolution strategy.
 *
 * ### Creating Slot Types
 * **Example:** Enumerated Slot Type
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const size = yield* AWS.LexV2.SlotType("Size", {
 *   botId: locale.botId,
 *   localeId: locale.localeId,
 *   slotTypeValues: [
 *     { value: "small", synonyms: ["tiny"] },
 *     { value: "large", synonyms: ["big", "huge"] },
 *   ],
 *   resolutionStrategy: "TopResolution",
 * });
 * ```
 *
 * @resource
 */
export const SlotType = Resource("AWS.LexV2.SlotType");
const createSlotTypeName = (id, props) => Effect.gen(function* () {
    if (props.slotTypeName)
        return props.slotTypeName;
    return toLexName(yield* createPhysicalName({ id, maxLength: 100 }));
});
const describeSlotType = Effect.fn(function* (botId, localeId, slotTypeId) {
    return yield* lexm
        .describeSlotType({ botId, botVersion: "DRAFT", localeId, slotTypeId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
});
/** Find a slot type of the locale by exact name (used when state was lost). */
const findSlotTypeByName = Effect.fn(function* (botId, localeId, slotTypeName) {
    const pages = yield* lexm.listSlotTypes
        .pages({
        botId,
        botVersion: "DRAFT",
        localeId,
        filters: [
            { name: "SlotTypeName", values: [slotTypeName], operator: "EQ" },
        ],
    })
        .pipe(Stream.runCollect, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
    const summary = Array.from(pages)
        .flatMap((page) => page.slotTypeSummaries ?? [])
        .find((slotType) => slotType.slotTypeName === slotTypeName);
    if (summary?.slotTypeId === undefined)
        return undefined;
    return yield* describeSlotType(botId, localeId, summary.slotTypeId);
});
const toWireValues = (values) => values?.map((value) => ({
    sampleValue: { value: value.value },
    synonyms: value.synonyms?.map((synonym) => ({ value: synonym })),
}));
const fromWireValues = (values) => (values ?? []).map((value) => ({
    value: value.sampleValue?.value ?? "",
    synonyms: value.synonyms?.map((synonym) => synonym.value),
}));
const attributesOf = (slotType) => ({
    slotTypeId: slotType.slotTypeId,
    slotTypeName: slotType.slotTypeName,
    botId: slotType.botId,
    botVersion: "DRAFT",
    localeId: slotType.localeId,
});
export const SlotTypeProvider = () => Provider.effect(SlotType, Effect.gen(function* () {
    /** The wire value-selection setting derived from the declared props. */
    const desiredSelection = (news) => news.resolutionStrategy !== undefined ||
        news.slotTypeValues !== undefined
        ? { resolutionStrategy: news.resolutionStrategy ?? "OriginalValue" }
        : undefined;
    return {
        stables: ["slotTypeId", "botId", "botVersion", "localeId"],
        // Sub-resource keyed entirely by its bot locale — nuke reaches it
        // through the parent bot's deletion.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const botId = output?.botId ?? olds?.botId;
            const localeId = output?.localeId ?? olds?.localeId;
            if (botId === undefined || localeId === undefined)
                return undefined;
            const observed = output?.slotTypeId !== undefined
                ? yield* describeSlotType(botId, localeId, output.slotTypeId)
                : yield* findSlotTypeByName(botId, localeId, yield* createSlotTypeName(id, olds ?? {}));
            return observed === undefined ? undefined : attributesOf(observed);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds?.botId !== news.botId || olds?.localeId !== news.localeId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const slotTypeName = yield* createSlotTypeName(id, news);
            const desiredValues = news.slotTypeValues ?? [];
            // 1. OBSERVE — output.slotTypeId is only a cache; fall back to name.
            let observed = output?.slotTypeId !== undefined
                ? yield* describeSlotType(news.botId, news.localeId, output.slotTypeId)
                : undefined;
            if (observed === undefined) {
                observed = yield* findSlotTypeByName(news.botId, news.localeId, slotTypeName);
            }
            // 2. ENSURE — create when missing.
            if (observed === undefined) {
                const created = yield* retryWhileConflict(lexm.createSlotType({
                    botId: news.botId,
                    botVersion: "DRAFT",
                    localeId: news.localeId,
                    slotTypeName,
                    description: news.description,
                    slotTypeValues: toWireValues(news.slotTypeValues),
                    valueSelectionSetting: desiredSelection(news),
                    parentSlotTypeSignature: news.parentSlotTypeSignature,
                }));
                observed = yield* describeSlotType(news.botId, news.localeId, created.slotTypeId);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created Lex slot type ${slotTypeName}`));
                }
            }
            else if (
            // 3. SYNC — UpdateSlotType replaces the declared aspects; skip
            //    the call when nothing drifted.
            observed.slotTypeName !== slotTypeName ||
                (observed.description ?? undefined) !==
                    (news.description ?? undefined) ||
                JSON.stringify(fromWireValues(observed.slotTypeValues)) !==
                    JSON.stringify(desiredValues) ||
                (observed.valueSelectionSetting?.resolutionStrategy ??
                    undefined) !==
                    (desiredSelection(news)?.resolutionStrategy ?? undefined)) {
                yield* retryWhileConflict(lexm.updateSlotType({
                    botId: news.botId,
                    botVersion: "DRAFT",
                    localeId: news.localeId,
                    slotTypeId: observed.slotTypeId,
                    slotTypeName,
                    description: news.description,
                    slotTypeValues: toWireValues(news.slotTypeValues),
                    valueSelectionSetting: desiredSelection(news),
                    parentSlotTypeSignature: news.parentSlotTypeSignature,
                }));
                observed = yield* describeSlotType(news.botId, news.localeId, observed.slotTypeId);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`failed to read updated Lex slot type ${slotTypeName}`));
                }
            }
            yield* session.note(observed.slotTypeId);
            return attributesOf(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Lex reports a missing slot type (or already-deleted parent) as
            // PreconditionFailed.
            yield* retryWhileConflict(lexm.deleteSlotType({
                botId: output.botId,
                botVersion: "DRAFT",
                localeId: output.localeId,
                slotTypeId: output.slotTypeId,
                skipResourceInUseCheck: true,
            })).pipe(Effect.catchTag("PreconditionFailedException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=SlotType.js.map