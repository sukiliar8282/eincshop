import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
/** One enumerable value of a custom slot type, with optional synonyms. */
export interface SlotTypeValueSpec {
    /** The canonical value, e.g. `small`. */
    value: string;
    /** Synonyms that resolve to the canonical value, e.g. `["tiny"]`. */
    synonyms?: string[];
}
export interface SlotTypeProps {
    /**
     * ID of the bot the slot type belongs to. Changing it replaces the slot
     * type.
     */
    botId: string;
    /**
     * Locale the slot type lives under, e.g. `en_US`. Changing it replaces the
     * slot type. Pass the `localeId` attribute of a `BotLocale` so the slot
     * type depends on the locale.
     */
    localeId: string;
    /**
     * Name of the slot type. Mutable — renames update the slot type in place
     * (identity is the generated slot type ID).
     * @default ${app}-${id}-${stage}-${suffix}
     */
    slotTypeName?: string;
    /**
     * Description of the slot type.
     */
    description?: string;
    /**
     * The enumerable values the slot type accepts.
     */
    slotTypeValues?: SlotTypeValueSpec[];
    /**
     * How slot values are resolved: `OriginalValue` returns the user's words;
     * `TopResolution` returns the first matching canonical value.
     * @default "OriginalValue" when slotTypeValues are present
     */
    resolutionStrategy?: "OriginalValue" | "TopResolution";
    /**
     * Signature of a built-in slot type to extend, e.g.
     * `AMAZON.AlphaNumeric`.
     */
    parentSlotTypeSignature?: string;
}
export interface SlotType extends Resource<"AWS.LexV2.SlotType", SlotTypeProps, {
    /** Unique identifier assigned to the slot type. */
    slotTypeId: string;
    /** Name of the slot type. */
    slotTypeName: string;
    /** ID of the bot the slot type belongs to. */
    botId: string;
    /** Bot version the slot type lives on — always `DRAFT`. */
    botVersion: string;
    /** Locale the slot type lives under. */
    localeId: string;
}, never, Providers> {
}
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
export declare const SlotType: import("../../Resource.ts").ResourceClass<SlotType>;
export declare const SlotTypeProvider: () => import("effect/Layer").Layer<Provider.Provider<SlotType>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
//# sourceMappingURL=SlotType.d.ts.map