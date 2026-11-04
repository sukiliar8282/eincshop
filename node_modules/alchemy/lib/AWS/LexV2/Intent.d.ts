import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface IntentProps {
    /**
     * ID of the bot the intent belongs to. Changing it replaces the intent.
     */
    botId: string;
    /**
     * Locale the intent lives under, e.g. `en_US`. Changing it replaces the
     * intent. Pass the `localeId` attribute of a `BotLocale` so the intent
     * depends on the locale.
     */
    localeId: string;
    /**
     * Name of the intent. Mutable — renames update the intent in place
     * (identity is the generated intent ID).
     * @default ${app}-${id}-${stage}-${suffix}
     */
    intentName?: string;
    /**
     * Description of the intent.
     */
    description?: string;
    /**
     * Sample utterances that invoke the intent, e.g. `"I want to order a
     * pizza"`. Utterances may reference slots with `{slotName}`.
     */
    sampleUtterances?: string[];
    /**
     * Signature of a built-in intent to base this intent on, e.g.
     * `AMAZON.HelpIntent`.
     */
    parentIntentSignature?: string;
    /**
     * Invoke the alias's Lambda code hook on every dialog turn of this intent
     * (slot elicitation, validation). Attach the function itself with
     * `LexV2.onCodeHook`.
     * @default false
     */
    dialogCodeHook?: boolean;
    /**
     * Invoke the alias's Lambda code hook to fulfill the intent once all
     * required slots are filled. Attach the function itself with
     * `LexV2.onCodeHook`.
     * @default false
     */
    fulfillmentCodeHook?: boolean;
}
export interface Intent extends Resource<"AWS.LexV2.Intent", IntentProps, {
    /** Unique identifier assigned to the intent. */
    intentId: string;
    /** Name of the intent. */
    intentName: string;
    /** ID of the bot the intent belongs to. */
    botId: string;
    /** Bot version the intent lives on — always `DRAFT`. */
    botVersion: string;
    /** Locale the intent lives under. */
    localeId: string;
}, never, Providers> {
}
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
export declare const Intent: import("../../Resource.ts").ResourceClass<Intent>;
export declare const IntentProvider: () => import("effect/Layer").Layer<Provider.Provider<Intent>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=Intent.d.ts.map