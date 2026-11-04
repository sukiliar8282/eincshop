import * as Provider from "../../Provider.ts";
import { Resource } from "../../Resource.ts";
import type { Providers } from "../Providers.ts";
export interface PhoneNumberProps {
    /**
     * Two-character ISO country code of the requested number, e.g. `US`.
     * Changing it replaces the phone number.
     */
    isoCountryCode: string;
    /**
     * Type of messages sent from the number: `TRANSACTIONAL` for
     * time-sensitive messages or `PROMOTIONAL` for marketing content.
     * Changing it replaces the phone number.
     */
    messageType: "TRANSACTIONAL" | "PROMOTIONAL";
    /**
     * Capabilities the number must support: `SMS`, `VOICE`, and/or `MMS`.
     * Changing them replaces the phone number.
     */
    numberCapabilities: string[];
    /**
     * Type of number to lease: `SIMULATOR`, `LONG_CODE`, `TOLL_FREE`, or
     * `TEN_DLC`. `SIMULATOR` numbers only exchange messages with other
     * simulator destinations and carry the smallest cost — use them for
     * testing. Changing it replaces the phone number.
     */
    numberType: string;
    /**
     * Name of the opt-out list to associate with the number.
     * @default the account's Default opt-out list
     */
    optOutListName?: string;
    /**
     * When `true`, `ReleasePhoneNumber` is rejected until protection is
     * disabled again.
     * @default false
     */
    deletionProtectionEnabled?: boolean;
    /**
     * Tags to apply to the phone number. Merged with internal Alchemy tags.
     */
    tags?: Record<string, string>;
}
export interface PhoneNumber extends Resource<"AWS.PinpointSMSVoiceV2.PhoneNumber", PhoneNumberProps, {
    /**
     * ID of the phone number.
     */
    phoneNumberId: string;
    /**
     * ARN of the phone number.
     */
    phoneNumberArn: string;
    /**
     * The provisioned phone number in E.164 format.
     */
    phoneNumber: string;
    /**
     * Provisioning status (e.g. `PENDING`, `ACTIVE`).
     */
    status: string;
    /**
     * Two-letter ISO country code of the number.
     */
    isoCountryCode: string;
    /**
     * Message type the number is registered for (`TRANSACTIONAL` or
     * `PROMOTIONAL`).
     */
    messageType: string;
    /**
     * Capabilities of the number (`SMS`, `VOICE`, `MMS`).
     */
    numberCapabilities: string[];
    /**
     * Number type (e.g. `LONG_CODE`, `TOLL_FREE`, `TEN_DLC`).
     */
    numberType: string;
    /**
     * Monthly leasing price in USD.
     */
    monthlyLeasingPrice: string;
    /**
     * Opt-out list associated with the number.
     */
    optOutListName: string;
}, never, Providers> {
}
/**
 * An AWS End User Messaging SMS (Pinpoint SMS Voice v2) origination
 * phone number leased into your account.
 *
 * Requesting a number incurs a monthly leasing fee and most number types
 * require account-level entitlement (spending limits, registration).
 * `SIMULATOR` numbers are the cheap, entitlement-free option for testing.
 * ### Requesting Phone Numbers
 * **Example:** Simulator Number
 * ```typescript
 * import * as PinpointSMSVoiceV2 from "alchemy/AWS/PinpointSMSVoiceV2";
 *
 * const number = yield* PinpointSMSVoiceV2.PhoneNumber("TestNumber", {
 *   isoCountryCode: "US",
 *   messageType: "TRANSACTIONAL",
 *   numberCapabilities: ["SMS"],
 *   numberType: "SIMULATOR",
 * });
 * ```
 *
 * **Example:** Toll-Free Number with a Custom Opt-Out List
 * ```typescript
 * const optOuts = yield* PinpointSMSVoiceV2.OptOutList("OptOuts");
 * const number = yield* PinpointSMSVoiceV2.PhoneNumber("Sender", {
 *   isoCountryCode: "US",
 *   messageType: "TRANSACTIONAL",
 *   numberCapabilities: ["SMS", "VOICE"],
 *   numberType: "TOLL_FREE",
 *   optOutListName: optOuts.optOutListName,
 * });
 * ```
 *
 * @resource
 */
export declare const PhoneNumber: import("../../Resource.ts").ResourceClass<PhoneNumber>;
declare const SmsVoicePhoneNumberMissing_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").VoidIfEmpty<{ readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }>) => import("effect/Cause").YieldableError & {
    readonly _tag: "SmsVoicePhoneNumberMissing";
} & Readonly<A>;
/**
 * Raised when a phone number cannot be observed after `RequestPhoneNumber`
 * succeeded, or the API returned a number without its ID.
 */
export declare class SmsVoicePhoneNumberMissing extends SmsVoicePhoneNumberMissing_base<{
    message: string;
}> {
}
export declare const PhoneNumberProvider: () => import("effect/Layer").Layer<Provider.Provider<PhoneNumber>, never, import("@distilled.cloud/aws/Credentials").Credentials | import("effect/unstable/http/HttpClient").HttpClient | import("../../Stack.ts").Stack | import("../../Stage.ts").Stage>;
export {};
//# sourceMappingURL=PhoneNumber.d.ts.map