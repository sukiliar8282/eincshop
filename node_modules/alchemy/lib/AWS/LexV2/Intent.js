import * as lexm from "@distilled.cloud/aws/lex-models-v2";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { retryWhileConflict, toLexName } from "./internal.js";
/**
 * An intent on the DRAFT locale of an Amazon Lex V2 bot — an action the user
 * wants to perform, recognized from sample utterances.
 *
 * ### Creating Intents
 * **Example:** Intent with Sample Utterances
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const greet = yield* AWS.LexV2.Intent("Greet", {
 *   botId: locale.botId,
 *   localeId: locale.localeId,
 *   sampleUtterances: ["hello", "hi", "good morning"],
 * });
 * ```
 *
 * **Example:** Built-in Parent Intent
 * ```typescript
 * const help = yield* AWS.LexV2.Intent("Help", {
 *   botId: locale.botId,
 *   localeId: locale.localeId,
 *   parentIntentSignature: "AMAZON.HelpIntent",
 * });
 * ```
 *
 * @resource
 */
export const Intent = Resource("AWS.LexV2.Intent");
const createIntentName = (id, props) => Effect.gen(function* () {
    if (props.intentName)
        return props.intentName;
    return toLexName(yield* createPhysicalName({ id, maxLength: 100 }));
});
const describeIntent = Effect.fn(function* (botId, localeId, intentId) {
    return yield* lexm
        .describeIntent({ botId, botVersion: "DRAFT", localeId, intentId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
});
/** Find an intent of the locale by exact name (used when state was lost). */
const findIntentByName = Effect.fn(function* (botId, localeId, intentName) {
    const pages = yield* lexm.listIntents
        .pages({
        botId,
        botVersion: "DRAFT",
        localeId,
        filters: [{ name: "IntentName", values: [intentName], operator: "EQ" }],
    })
        .pipe(Stream.runCollect, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
    const summary = Array.from(pages)
        .flatMap((page) => page.intentSummaries ?? [])
        .find((intent) => intent.intentName === intentName);
    if (summary?.intentId === undefined)
        return undefined;
    return yield* describeIntent(botId, localeId, summary.intentId);
});
const utterancesOf = (intent) => (intent.sampleUtterances ?? []).map((u) => u.utterance);
const toUtterances = (utterances) => utterances?.map((utterance) => ({ utterance }));
const attributesOf = (intent) => ({
    intentId: intent.intentId,
    intentName: intent.intentName,
    botId: intent.botId,
    botVersion: "DRAFT",
    localeId: intent.localeId,
});
export const IntentProvider = () => Provider.effect(Intent, Effect.gen(function* () {
    return {
        stables: ["intentId", "botId", "botVersion", "localeId"],
        // Sub-resource keyed entirely by its bot locale — nuke reaches it
        // through the parent bot's deletion.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const botId = output?.botId ?? olds?.botId;
            const localeId = output?.localeId ?? olds?.localeId;
            if (botId === undefined || localeId === undefined)
                return undefined;
            const observed = output?.intentId !== undefined
                ? yield* describeIntent(botId, localeId, output.intentId)
                : yield* findIntentByName(botId, localeId, yield* createIntentName(id, olds ?? {}));
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
            const intentName = yield* createIntentName(id, news);
            const desiredUtterances = news.sampleUtterances ?? [];
            const desiredDialogCodeHook = news.dialogCodeHook !== undefined
                ? { enabled: news.dialogCodeHook }
                : undefined;
            const desiredFulfillmentCodeHook = news.fulfillmentCodeHook !== undefined
                ? { enabled: news.fulfillmentCodeHook }
                : undefined;
            // 1. OBSERVE — output.intentId is only a cache; fall back to name.
            let observed = output?.intentId !== undefined
                ? yield* describeIntent(news.botId, news.localeId, output.intentId)
                : undefined;
            if (observed === undefined) {
                observed = yield* findIntentByName(news.botId, news.localeId, intentName);
            }
            // 2. ENSURE — create when missing.
            if (observed === undefined) {
                const created = yield* retryWhileConflict(lexm.createIntent({
                    botId: news.botId,
                    botVersion: "DRAFT",
                    localeId: news.localeId,
                    intentName,
                    description: news.description,
                    sampleUtterances: toUtterances(news.sampleUtterances),
                    parentIntentSignature: news.parentIntentSignature,
                    dialogCodeHook: desiredDialogCodeHook,
                    fulfillmentCodeHook: desiredFulfillmentCodeHook,
                }));
                observed = yield* describeIntent(news.botId, news.localeId, created.intentId);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created Lex intent ${intentName}`));
                }
            }
            else if (
            // 3. SYNC — UpdateIntent replaces the declared aspects; skip the
            //    call when nothing drifted.
            observed.intentName !== intentName ||
                (observed.description ?? undefined) !==
                    (news.description ?? undefined) ||
                JSON.stringify([...utterancesOf(observed)].sort()) !==
                    JSON.stringify([...desiredUtterances].sort()) ||
                (observed.dialogCodeHook?.enabled ?? false) !==
                    (news.dialogCodeHook ?? false) ||
                (observed.fulfillmentCodeHook?.enabled ?? false) !==
                    (news.fulfillmentCodeHook ?? false)) {
                yield* retryWhileConflict(lexm.updateIntent({
                    botId: news.botId,
                    botVersion: "DRAFT",
                    localeId: news.localeId,
                    intentId: observed.intentId,
                    intentName,
                    description: news.description,
                    sampleUtterances: toUtterances(news.sampleUtterances),
                    parentIntentSignature: news.parentIntentSignature,
                    dialogCodeHook: desiredDialogCodeHook,
                    fulfillmentCodeHook: desiredFulfillmentCodeHook,
                }));
                observed = yield* describeIntent(news.botId, news.localeId, observed.intentId);
                if (observed === undefined) {
                    return yield* Effect.fail(new Error(`failed to read updated Lex intent ${intentName}`));
                }
            }
            yield* session.note(observed.intentId);
            return attributesOf(observed);
        }),
        delete: Effect.fn(function* ({ output }) {
            // Lex reports a missing intent (or already-deleted parent) as
            // PreconditionFailed.
            yield* retryWhileConflict(lexm.deleteIntent({
                botId: output.botId,
                botVersion: "DRAFT",
                localeId: output.localeId,
                intentId: output.intentId,
            })).pipe(Effect.catchTag("PreconditionFailedException", () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=Intent.js.map