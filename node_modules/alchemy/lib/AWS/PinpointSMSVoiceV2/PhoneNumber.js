import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readSmsVoiceTags, retrySmsVoiceThrottled, syncSmsVoiceTags, toTagList, } from "./internal.js";
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
export const PhoneNumber = Resource("AWS.PinpointSMSVoiceV2.PhoneNumber");
/**
 * Raised when a phone number cannot be observed after `RequestPhoneNumber`
 * succeeded, or the API returned a number without its ID.
 */
export class SmsVoicePhoneNumberMissing extends Data.TaggedError("SmsVoicePhoneNumberMissing") {
}
/**
 * Poll a freshly-requested number out of `PENDING` on a bounded schedule
 * (extracted so declaration emit keeps the provider layer type narrow).
 */
const untilNotPending = (self) => Effect.repeat(self, {
    until: (p) => p === undefined || p.Status !== "PENDING",
    schedule: Schedule.max([Schedule.fixed("3 seconds"), Schedule.recurs(20)]),
});
const toAttrs = (info) => Effect.gen(function* () {
    if (info.PhoneNumberId === undefined) {
        return yield* Effect.fail(new SmsVoicePhoneNumberMissing({
            message: `phone number '${info.PhoneNumberArn}' is missing its ID`,
        }));
    }
    return {
        phoneNumberId: info.PhoneNumberId,
        phoneNumberArn: info.PhoneNumberArn,
        phoneNumber: info.PhoneNumber,
        status: info.Status,
        isoCountryCode: info.IsoCountryCode,
        messageType: info.MessageType,
        numberCapabilities: [...info.NumberCapabilities],
        numberType: info.NumberType,
        monthlyLeasingPrice: info.MonthlyLeasingPrice,
        optOutListName: info.OptOutListName,
    };
});
const sameCapabilities = (left, right) => {
    const l = [...left].sort();
    const r = [...right].sort();
    return l.length === r.length && l.every((v, i) => v === r[i]);
};
export const PhoneNumberProvider = () => Provider.effect(PhoneNumber, Effect.gen(function* () {
    const getById = Effect.fn(function* (phoneNumberId) {
        const result = yield* smsvoice
            .describePhoneNumbers({ PhoneNumberIds: [phoneNumberId] })
            .pipe(retrySmsVoiceThrottled, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return result?.PhoneNumbers?.find((p) => p.PhoneNumberId === phoneNumberId);
    });
    return {
        stables: [
            "phoneNumberId",
            "phoneNumberArn",
            "phoneNumber",
            "isoCountryCode",
            "numberType",
        ],
        read: Effect.fn(function* ({ id, output }) {
            // Phone number IDs are assigned by AWS — without a cached output
            // there is no deterministic identity to look up.
            if (output?.phoneNumberId === undefined)
                return undefined;
            const observed = yield* getById(output.phoneNumberId);
            if (observed === undefined)
                return undefined;
            const attrs = yield* toAttrs(observed);
            const tags = yield* readSmsVoiceTags(observed.PhoneNumberArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            if (olds === undefined)
                return undefined;
            if (olds.isoCountryCode !== news.isoCountryCode ||
                olds.messageType !== news.messageType ||
                olds.numberType !== news.numberType ||
                !sameCapabilities(olds.numberCapabilities ?? [], news.numberCapabilities)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. Observe — the ID cache in `output` is the only identity.
            let observed = output?.phoneNumberId === undefined
                ? undefined
                : yield* getById(output.phoneNumberId);
            // 2. Ensure — request a number if missing, then wait out PENDING.
            if (observed === undefined) {
                const requested = yield* smsvoice
                    .requestPhoneNumber({
                    IsoCountryCode: news.isoCountryCode,
                    MessageType: news.messageType,
                    NumberCapabilities: news.numberCapabilities,
                    NumberType: news.numberType,
                    OptOutListName: news.optOutListName,
                    DeletionProtectionEnabled: news.deletionProtectionEnabled,
                    Tags: toTagList(desiredTags),
                })
                    .pipe(retrySmsVoiceThrottled);
                if (requested.PhoneNumberId === undefined) {
                    return yield* Effect.fail(new SmsVoicePhoneNumberMissing({
                        message: "RequestPhoneNumber returned no PhoneNumberId",
                    }));
                }
                observed = yield* getById(requested.PhoneNumberId).pipe(untilNotPending);
            }
            if (observed === undefined || observed.PhoneNumberId === undefined) {
                return yield* Effect.fail(new SmsVoicePhoneNumberMissing({
                    message: "phone number not observable after request",
                }));
            }
            const phoneNumberId = observed.PhoneNumberId;
            // 3. Sync — apply a single update carrying only the drifted
            // aspects (opt-out list, deletion protection). Fields the API
            // couples to unmodeled features (e.g. self-managed opt-outs
            // require a two-way channel) are never sent.
            const desiredProtection = news.deletionProtectionEnabled ?? false;
            const optOutDrift = news.optOutListName !== undefined &&
                observed.OptOutListName !== news.optOutListName;
            const protectionDrift = observed.DeletionProtectionEnabled !== desiredProtection;
            if (optOutDrift || protectionDrift) {
                yield* smsvoice
                    .updatePhoneNumber({
                    PhoneNumberId: phoneNumberId,
                    OptOutListName: optOutDrift ? news.optOutListName : undefined,
                    DeletionProtectionEnabled: protectionDrift
                        ? desiredProtection
                        : undefined,
                })
                    .pipe(retrySmsVoiceThrottled);
            }
            // 3b. Sync tags — diff against OBSERVED cloud tags.
            yield* syncSmsVoiceTags(observed.PhoneNumberArn, desiredTags);
            // 4. Return fresh attributes.
            const final = yield* getById(phoneNumberId);
            if (final === undefined) {
                return yield* Effect.fail(new SmsVoicePhoneNumberMissing({
                    message: `phone number '${phoneNumberId}' vanished during reconcile`,
                }));
            }
            yield* session.note(final.PhoneNumberArn);
            return yield* toAttrs(final);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* smsvoice
                .releasePhoneNumber({ PhoneNumberId: output.phoneNumberId })
                .pipe(retrySmsVoiceThrottled, Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.asVoid);
        }),
        list: () => smsvoice.describePhoneNumbers.items({}).pipe(Stream.runCollect, Effect.flatMap(Effect.forEach((info) => toAttrs(info).pipe(
        // Tolerate a number missing its ID — drop it.
        Effect.catchTag("SmsVoicePhoneNumberMissing", () => Effect.succeed(undefined))), { concurrency: 5 })), Effect.map((items) => items.filter((item) => item !== undefined))),
    };
}));
//# sourceMappingURL=PhoneNumber.js.map