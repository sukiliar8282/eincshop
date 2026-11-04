import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface BotLocaleProps {
    /**
     * ID of the bot the locale belongs to. Changing it replaces the locale.
     */
    botId: string;
    /**
     * The language/locale the bot converses in, e.g. `en_US`. Changing it
     * replaces the locale.
     */
    localeId: string;
    /**
     * Confidence threshold (0 to 1) below which Amazon Lex inserts
     * `AMAZON.FallbackIntent` into the possible-intents list.
     * @default 0.4
     */
    nluIntentConfidenceThreshold?: number;
    /**
     * Description of the locale.
     */
    description?: string;
    /**
     * Amazon Polly voice used for spoken interaction with the user.
     */
    voiceSettings?: {
        /** Amazon Polly voice ID, e.g. `Ivy`. */
        voiceId: string;
        /**
         * Polly engine to use.
         * @default "standard"
         */
        engine?: "standard" | "neural" | "long-form" | "generative";
    };
}
export interface BotLocale extends Resource<"AWS.LexV2.BotLocale", BotLocaleProps, {
    /** ID of the bot the locale belongs to. */
    botId: string;
    /** Bot version the locale lives on — always `DRAFT`. */
    botVersion: string;
    /** The locale ID, e.g. `en_US`. */
    localeId: string;
    /** Human-readable locale name, e.g. `English (US)`. */
    localeName: string | undefined;
    /** Current status of the locale (e.g. `NotBuilt`, `Built`). */
    botLocaleStatus: string;
}, never, Providers> {
}
/**
 * A language/locale on the DRAFT version of an Amazon Lex V2 bot. Intents and
 * slot types live under a locale; a locale must exist before either can be
 * created.
 *
 * ### Creating a Locale
 * **Example:** US English Locale
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const locale = yield* AWS.LexV2.BotLocale("En", {
 *   botId: bot.botId,
 *   localeId: "en_US",
 * });
 * ```
 *
 * **Example:** Locale with Voice and Threshold
 * ```typescript
 * const locale = yield* AWS.LexV2.BotLocale("En", {
 *   botId: bot.botId,
 *   localeId: "en_US",
 *   nluIntentConfidenceThreshold: 0.7,
 *   voiceSettings: { voiceId: "Ivy", engine: "neural" },
 * });
 * ```
 *
 * @resource
 */
export declare const BotLocale: import("../../Resource.ts").ResourceClass<BotLocale>;
export declare const BotLocaleProvider: () => import("effect/Layer").Layer<Provider.Provider<BotLocale>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient>;
//# sourceMappingURL=BotLocale.d.ts.map