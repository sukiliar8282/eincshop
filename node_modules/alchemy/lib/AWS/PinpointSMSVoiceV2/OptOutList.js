import * as smsvoice from "@distilled.cloud/aws/pinpoint-sms-voice-v2";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readSmsVoiceTags, retrySmsVoiceThrottled, syncSmsVoiceTags, toTagList, } from "./internal.js";
/**
 * An AWS End User Messaging SMS (Pinpoint SMS Voice v2) opt-out list — a
 * list of destination phone numbers that opted out of receiving your SMS
 * or voice messages.
 *
 * When an end user replies with a supported opt-out keyword (STOP,
 * CANCEL, OPTOUT, ...), their number is added to the list automatically
 * and further messages to it are suppressed.
 * ### Creating Opt-Out Lists
 * **Example:** Basic Opt-Out List
 * ```typescript
 * import * as PinpointSMSVoiceV2 from "alchemy/AWS/PinpointSMSVoiceV2";
 *
 * const optOuts = yield* PinpointSMSVoiceV2.OptOutList("OptOuts");
 * ```
 *
 * **Example:** Named Opt-Out List with Tags
 * ```typescript
 * const optOuts = yield* PinpointSMSVoiceV2.OptOutList("OptOuts", {
 *   optOutListName: "marketing-opt-outs",
 *   tags: { team: "growth" },
 * });
 * ```
 *
 * @resource
 */
export const OptOutList = Resource("AWS.PinpointSMSVoiceV2.OptOutList");
/**
 * Raised when an opt-out list cannot be observed immediately after it
 * was created — the create call succeeded (or raced a peer) but the
 * follow-up describe found nothing.
 */
export class SmsVoiceOptOutListMissing extends Data.TaggedError("SmsVoiceOptOutListMissing") {
}
export const OptOutListProvider = () => Provider.effect(OptOutList, Effect.gen(function* () {
    const toName = (id, props) => props.optOutListName
        ? Effect.succeed(props.optOutListName)
        : createPhysicalName({ id, maxLength: 64 });
    /**
     * Observe an opt-out list by name. `DescribeOptOutLists` raises a
     * typed `ResourceNotFoundException` for an unknown name.
     */
    const getByName = Effect.fn(function* (name) {
        const result = yield* smsvoice
            .describeOptOutLists({ OptOutListNames: [name] })
            .pipe(retrySmsVoiceThrottled, Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return result?.OptOutLists?.find((l) => l.OptOutListName === name);
    });
    return {
        stables: ["optOutListName", "optOutListArn"],
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.optOutListName ?? (yield* toName(id, olds ?? {}));
            const observed = yield* getByName(name);
            if (observed === undefined)
                return undefined;
            const attrs = {
                optOutListName: observed.OptOutListName,
                optOutListArn: observed.OptOutListArn,
            };
            const tags = yield* readSmsVoiceTags(observed.OptOutListArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* toName(id, olds ?? {});
            const newName = yield* toName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.optOutListName ?? (yield* toName(id, news));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. Observe — cloud state is authoritative.
            let observed = yield* getByName(name);
            // 2. Ensure — create if missing; a ConflictException is a race
            // with a peer reconciler, so fall through to re-observe.
            if (observed === undefined) {
                yield* smsvoice
                    .createOptOutList({
                    OptOutListName: name,
                    Tags: toTagList(desiredTags),
                })
                    .pipe(retrySmsVoiceThrottled, Effect.catchTag("ConflictException", () => Effect.void), Effect.asVoid);
                observed = yield* getByName(name);
            }
            if (observed === undefined) {
                return yield* Effect.fail(new SmsVoiceOptOutListMissing({
                    message: `opt-out list '${name}' not observable after create`,
                }));
            }
            // 3. Sync tags — diff against OBSERVED cloud tags.
            yield* syncSmsVoiceTags(observed.OptOutListArn, desiredTags);
            yield* session.note(observed.OptOutListArn);
            return {
                optOutListName: observed.OptOutListName,
                optOutListArn: observed.OptOutListArn,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* smsvoice
                .deleteOptOutList({ OptOutListName: output.optOutListName })
                .pipe(retrySmsVoiceThrottled, Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.asVoid);
        }),
        list: () => smsvoice.describeOptOutLists.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk)
            // The `Default` opt-out list is service-managed: End User
            // Messaging recreates it automatically and then rejects
            // DeleteOptOutList with ConflictException
            // RESOURCE_MODIFICATION_NOT_ALLOWED (verified live) — keep
            // it out of enumeration for account-wide teardown (nuke).
            .filter((l) => l.OptOutListName !== "Default")
            .map((l) => ({
            optOutListName: l.OptOutListName,
            optOutListArn: l.OptOutListArn,
        })))),
    };
}));
//# sourceMappingURL=OptOutList.js.map