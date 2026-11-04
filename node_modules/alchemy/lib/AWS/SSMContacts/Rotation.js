import * as contacts from "@distilled.cloud/aws/ssm-contacts";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, createTagsList, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
import { AWSEnvironment } from "../Environment.js";
/**
 * An Incident Manager on-call rotation — a recurring schedule that rotates
 * engagement duty between contacts. Attach rotations to an
 * `ONCALL_SCHEDULE` contact via its engagement plan's `RotationIds`.
 *
 * ### Creating Rotations
 * **Example:** Daily hand-off rotation
 * ```typescript
 * const rotation = yield* SSMContacts.Rotation("Primary", {
 *   contactIds: [alice.contactArn, bob.contactArn],
 *   timeZoneId: "America/Los_Angeles",
 *   startTime: "2026-01-01T00:00:00Z",
 *   recurrence: {
 *     NumberOfOnCalls: 1,
 *     RecurrenceMultiplier: 1,
 *     DailySettings: [{ HourOfDay: 9, MinuteOfHour: 0 }],
 *   },
 * });
 * ```
 */
const RotationResource = Resource("AWS.SSMContacts.Rotation");
export { RotationResource as Rotation };
const normalize = (value) => {
    if (Array.isArray(value))
        return value.map(normalize);
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value)
            .filter(([, v]) => v !== undefined)
            .sort(([l], [r]) => l.localeCompare(r))
            .map(([k, v]) => [k, normalize(v)]));
    }
    return value;
};
const same = (l, r) => JSON.stringify(normalize(l)) === JSON.stringify(normalize(r));
export const RotationProvider = () => Provider.effect(RotationResource, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ?? (yield* createPhysicalName({ id, maxLength: 200 })));
    });
    const rotationArn = Effect.fn(function* (name) {
        const { accountId, region } = yield* AWSEnvironment.current;
        return `arn:aws:ssm-contacts:${region}:${accountId}:rotation/${name}`;
    });
    const getRotation = (arn) => contacts.getRotation({ RotationId: arn }).pipe(
    // A rotation ARN that does not resolve surfaces as either a plain
    // ResourceNotFoundException or the "Invalid resource Arn"
    // ValidationException (typed as InvalidRotationArn) — both mean
    // "missing" to the reconciler.
    Effect.catchTag(["ResourceNotFoundException", "InvalidRotationArn"], () => Effect.succeed(undefined)));
    const readTags = (arn) => contacts.listTagsForResource({ ResourceARN: arn }).pipe(
    // Distilled Tag has optional Key/Value; narrow to defined pairs
    // before handing off to the shared tagRecord helper.
    Effect.map((r) => tagRecord((r.Tags ?? []).flatMap((t) => t.Key !== undefined && t.Value !== undefined
        ? [{ Key: t.Key, Value: t.Value }]
        : []))), Effect.catch(() => Effect.succeed({})));
    const buildAttrs = (rotation) => ({
        rotationArn: rotation.RotationArn,
        name: rotation.Name,
        startTime: rotation.StartTime.toISOString(),
    });
    return RotationResource.Provider.of({
        stables: ["rotationArn", "name"],
        list: () => contacts.listRotations.items({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).map((rotation) => ({
            rotationArn: rotation.RotationArn,
            name: rotation.Name,
            startTime: rotation.StartTime?.toISOString(),
        })))),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const arn = output?.rotationArn ?? (yield* rotationArn(name));
            const rotation = yield* getRotation(arn);
            if (rotation === undefined)
                return undefined;
            const attrs = buildAttrs(rotation);
            const tags = yield* readTags(rotation.RotationArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        // The name is create-only (updateRotation cannot rename); contacts,
        // start time, time zone, and recurrence update in place.
        diff: Effect.fn(function* ({ id, news, olds }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName)
                return { action: "replace" };
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = output?.name ?? (yield* createName(id, news));
            const arn = output?.rotationArn ?? (yield* rotationArn(name));
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            const desiredStart = news.startTime !== undefined ? new Date(news.startTime) : undefined;
            // 1. OBSERVE
            let rotation = yield* getRotation(arn);
            // 2. ENSURE — create if missing; tolerate the already-exists race.
            if (rotation === undefined) {
                yield* session.note(`creating rotation ${name}`);
                yield* contacts
                    .createRotation({
                    Name: name,
                    ContactIds: news.contactIds,
                    StartTime: desiredStart,
                    TimeZoneId: news.timeZoneId,
                    Recurrence: news.recurrence,
                    Tags: createTagsList(desiredTags),
                })
                    .pipe(Effect.asVoid, Effect.catchTag("ConflictException", () => Effect.void));
                rotation = (yield* getRotation(arn));
            }
            // 3. SYNC contacts / start time / time zone / recurrence —
            //    observed vs desired (epoch-second granularity for the start
            //    time, matching the wire format).
            const contactsDelta = !same(rotation.ContactIds, news.contactIds);
            const timeZoneDelta = rotation.TimeZoneId !== news.timeZoneId;
            const startDelta = desiredStart !== undefined &&
                Math.floor(rotation.StartTime.getTime() / 1000) !==
                    Math.floor(desiredStart.getTime() / 1000);
            const recurrenceDelta = !same({
                MonthlySettings: rotation.Recurrence.MonthlySettings ?? [],
                WeeklySettings: rotation.Recurrence.WeeklySettings ?? [],
                DailySettings: rotation.Recurrence.DailySettings ?? [],
                NumberOfOnCalls: rotation.Recurrence.NumberOfOnCalls,
                ShiftCoverages: rotation.Recurrence.ShiftCoverages ?? {},
                RecurrenceMultiplier: rotation.Recurrence.RecurrenceMultiplier,
            }, {
                MonthlySettings: news.recurrence.MonthlySettings ?? [],
                WeeklySettings: news.recurrence.WeeklySettings ?? [],
                DailySettings: news.recurrence.DailySettings ?? [],
                NumberOfOnCalls: news.recurrence.NumberOfOnCalls,
                ShiftCoverages: news.recurrence.ShiftCoverages ?? {},
                RecurrenceMultiplier: news.recurrence.RecurrenceMultiplier,
            });
            if (contactsDelta || timeZoneDelta || startDelta || recurrenceDelta) {
                yield* contacts.updateRotation({
                    RotationId: rotation.RotationArn,
                    ContactIds: news.contactIds,
                    StartTime: desiredStart,
                    TimeZoneId: news.timeZoneId,
                    Recurrence: news.recurrence,
                });
            }
            // 3b. SYNC tags — diff against OBSERVED cloud tags.
            const currentTags = yield* readTags(rotation.RotationArn);
            const { upsert, removed } = diffTags(currentTags, desiredTags);
            if (upsert.length > 0) {
                yield* contacts.tagResource({
                    ResourceARN: rotation.RotationArn,
                    Tags: upsert,
                });
            }
            if (removed.length > 0) {
                yield* contacts.untagResource({
                    ResourceARN: rotation.RotationArn,
                    TagKeys: removed,
                });
            }
            // 4. RETURN fresh attributes.
            const final = (yield* getRotation(rotation.RotationArn));
            yield* session.note(final.RotationArn);
            return buildAttrs(final);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* contacts
                .deleteRotation({ RotationId: output.rotationArn })
                .pipe(Effect.asVoid, Effect.catchTag("ResourceNotFoundException", () => Effect.void));
        }),
    });
}));
//# sourceMappingURL=Rotation.js.map