import * as Effect from "effect/Effect";
import type { OptOutList } from "./OptOutList.ts";
import type { PhoneNumber } from "./PhoneNumber.ts";
/**
 * Shared scaffolding for AWS End User Messaging SMS (Pinpoint SMS Voice
 * v2) HTTP bindings.
 *
 * NOT exported from `index.ts` — every thin `{Op}Http.ts` in this service
 * is a `Layer.effect(Cap, make…HttpBinding({ … }))` over one of the three
 * builders below. Everything except the operation and the IAM action list
 * is boilerplate: phone-number-scoped bindings inject the bound number's
 * ARN as the request's `OriginationIdentity` and grant `actions` on that
 * ARN; opt-out-list-scoped bindings inject the list's ARN as
 * `OptOutListName`; account-scoped bindings pass the request through and
 * grant `actions` on `*`.
 */
/**
 * Build the impl Effect for an End User Messaging SMS operation scoped to
 * a {@link PhoneNumber} (`SendTextMessage`, `PutKeyword`, …): the
 * deploy-time half grants `actions` on the bound number's ARN, and the
 * runtime half injects the number's ARN into every request as
 * `OriginationIdentity` (the API accepts a phone number ID or ARN there).
 */
export declare const makeSmsVoicePhoneNumberHttpBinding: <I extends {
    OriginationIdentity?: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.PinpointSMSVoiceV2.SendTextMessage`. */
    tag: string;
    /** The distilled operation; `OriginationIdentity` is injected from the number. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the phone number ARN. */
    actions: readonly string[];
}) => Effect.Effect<(phoneNumber: PhoneNumber) => Effect.Effect<(request?: Omit<I, "OriginationIdentity"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an End User Messaging SMS operation scoped to
 * an {@link OptOutList} (`PutOptedOutNumber`, `DescribeOptedOutNumbers`,
 * …): the deploy-time half grants `actions` on the bound list's ARN, and
 * the runtime half injects the list's ARN into every request as
 * `OptOutListName` (the API accepts a list name or ARN there).
 */
export declare const makeSmsVoiceOptOutListHttpBinding: <I extends {
    OptOutListName: string;
}, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.PinpointSMSVoiceV2.PutOptedOutNumber`. */
    tag: string;
    /** The distilled operation; `OptOutListName` is injected from the list. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on the opt-out list ARN. */
    actions: readonly string[];
}) => Effect.Effect<(optOutList: OptOutList) => Effect.Effect<(request?: Omit<I, "OptOutListName"> | undefined) => Effect.Effect<A, E, never>, never, never>, never, R>;
/**
 * Build the impl Effect for an account-level End User Messaging SMS
 * operation (`CarrierLookup`, `PutMessageFeedback`): the deploy-time half
 * grants `actions` on `*` — these operations act on message IDs or raw
 * phone numbers, not on a scopeable resource ARN.
 */
export declare const makeSmsVoiceAccountHttpBinding: <I, A, E, R>(options: {
    /** Fully-qualified binding tag, e.g. `AWS.PinpointSMSVoiceV2.CarrierLookup`. */
    tag: string;
    /** The distilled operation, invoked with the caller's request as-is. */
    operation: Effect.Effect<(input: I) => Effect.Effect<A, E>, never, R>;
    /** IAM actions granted on `*`. */
    actions: readonly string[];
}) => Effect.Effect<() => Effect.Effect<(request: I) => Effect.Effect<A, E, never>, never, never>, never, R>;
//# sourceMappingURL=BindingHttp.d.ts.map