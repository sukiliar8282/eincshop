import * as dataexchange from "@distilled.cloud/aws/dataexchange";
import * as Effect from "effect/Effect";
import * as Result from "effect/Result";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readDataExchangeTags, syncDataExchangeTags } from "./internal.js";
/**
 * An AWS Data Exchange event action — an auto-export rule that copies every
 * newly published revision of an ENTITLED data set into your S3 bucket the
 * moment the provider publishes it. This is the subscriber-side automation
 * primitive: subscribe to a product (or accept a data grant), attach an
 * event action, and fresh data lands in your bucket with no polling.
 *
 * Event actions require an entitled data set — creating one against an
 * owned data set fails with a `ValidationException`.
 *
 * ### Auto-Exporting Entitled Data
 * **Example:** Export new revisions to S3
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const landing = yield* AWS.S3.Bucket("Landing", {});
 *
 * const autoExport = yield* AWS.DataExchange.EventAction("AutoExport", {
 *   dataSetId: entitledDataSetId,
 *   exportRevisionToS3: { bucket: landing.bucketName },
 * });
 * ```
 *
 * **Example:** Encrypted export with a key pattern
 * ```typescript
 * const autoExport = yield* AWS.DataExchange.EventAction("AutoExport", {
 *   dataSetId: entitledDataSetId,
 *   exportRevisionToS3: {
 *     bucket: landing.bucketName,
 *     keyPattern: "prices/${Revision.CreatedAt}/${Asset.Name}",
 *     encryption: { type: "aws:kms", kmsKeyArn: key.keyArn },
 *   },
 * });
 * ```
 *
 * @resource
 */
export const EventAction = Resource("AWS.DataExchange.EventAction");
const toWireAction = (props) => ({
    ExportRevisionToS3: {
        RevisionDestination: {
            Bucket: props.exportRevisionToS3.bucket,
            KeyPattern: props.exportRevisionToS3.keyPattern,
        },
        Encryption: props.exportRevisionToS3.encryption
            ? {
                Type: props.exportRevisionToS3.encryption.type,
                KmsKeyArn: props.exportRevisionToS3.encryption.kmsKeyArn,
            }
            : undefined,
    },
});
const sameAction = (observed, desired) => {
    const a = observed?.ExportRevisionToS3;
    const b = desired.ExportRevisionToS3;
    return (a !== undefined &&
        b !== undefined &&
        a.RevisionDestination.Bucket === b.RevisionDestination.Bucket &&
        (a.RevisionDestination.KeyPattern ?? undefined) ===
            (b.RevisionDestination.KeyPattern ?? undefined) &&
        (a.Encryption?.Type ?? undefined) === (b.Encryption?.Type ?? undefined) &&
        (a.Encryption?.KmsKeyArn ?? undefined) ===
            (b.Encryption?.KmsKeyArn ?? undefined));
};
export const EventActionProvider = () => Provider.effect(EventAction, Effect.gen(function* () {
    /** Get an event action by id; typed not-found → undefined. */
    const getById = Effect.fn(function* (eventActionId) {
        return yield* dataexchange
            .getEventAction({ EventActionId: eventActionId })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    /**
     * Scan the data set's event actions for one carrying our ownership
     * tags. Event action ids are server-generated, so recovery from a
     * lost output (state-persistence failure) goes through per-action tag
     * inspection.
     */
    const findByTags = Effect.fn(function* (id, dataSetId) {
        return yield* dataexchange.listEventActions
            .items({ EventSourceId: dataSetId })
            .pipe(Stream.mapEffect(Effect.fn(function* (entry) {
            const tags = yield* readDataExchangeTags(entry.Arn);
            return (yield* hasAlchemyTags(id, tags)) ? entry : undefined;
        })), Stream.filter((entry) => entry !== undefined), Stream.runHead, Effect.map((head) => head._tag === "Some" ? head.value : undefined), Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    });
    return {
        stables: ["eventActionId", "eventActionArn", "dataSetId"],
        read: Effect.fn(function* ({ id, olds, output }) {
            const dataSetId = output?.dataSetId ?? olds?.dataSetId;
            const eventAction = output?.eventActionId
                ? yield* getById(output.eventActionId)
                : dataSetId !== undefined
                    ? yield* findByTags(id, dataSetId)
                    : undefined;
            if (eventAction === undefined)
                return undefined;
            const attrs = {
                eventActionId: eventAction.Id,
                eventActionArn: eventAction.Arn,
                dataSetId: eventAction.Event?.RevisionPublished?.DataSetId ?? dataSetId,
            };
            const tags = yield* readDataExchangeTags(attrs.eventActionArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return undefined;
            // The watched data set is the event action's identity.
            if (news.dataSetId !== olds.dataSetId) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const dataSetId = news.dataSetId;
            const desiredAction = toWireAction(news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. Observe — output ids are only a cache; fall back to a
            //    tag-ownership scan of the data set's event actions.
            let eventAction = output?.eventActionId
                ? yield* getById(output.eventActionId)
                : undefined;
            if (eventAction === undefined) {
                eventAction = yield* findByTags(id, dataSetId);
            }
            // 2. Ensure — create when missing.
            if (eventAction === undefined) {
                eventAction = yield* dataexchange.createEventAction({
                    Action: desiredAction,
                    Event: { RevisionPublished: { DataSetId: dataSetId } },
                    Tags: desiredTags,
                });
            }
            // 3. Sync — the export destination is mutable in place. Only call
            //    the API on an actual delta.
            if (!sameAction(eventAction.Action, desiredAction)) {
                eventAction = yield* dataexchange.updateEventAction({
                    EventActionId: eventAction.Id,
                    Action: desiredAction,
                });
            }
            // 3b. Sync tags against OBSERVED cloud tags (adoption-safe).
            yield* syncDataExchangeTags(eventAction.Arn, desiredTags);
            yield* session.note(eventAction.Arn);
            return {
                eventActionId: eventAction.Id,
                eventActionArn: eventAction.Arn,
                dataSetId,
            };
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* dataexchange
                .deleteEventAction({ EventActionId: output.eventActionId })
                .pipe(
            // Deletion is idempotent — a missing event action is success.
            Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.retry({
                while: (e) => e._tag === "ThrottlingException",
                schedule: Schedule.max([
                    Schedule.fixed("2 seconds"),
                    Schedule.recurs(5),
                ]),
            }));
        }),
        list: () => dataexchange.listEventActions.items({}).pipe(
        // RevisionPublished is the only event type Data Exchange supports;
        // entries without it carry no data set identity, so skip them
        // rather than fabricate a dataSetId.
        Stream.filterMap((entry) => entry.Event.RevisionPublished !== undefined
            ? Result.succeed({
                eventActionId: entry.Id,
                eventActionArn: entry.Arn,
                dataSetId: entry.Event.RevisionPublished.DataSetId,
            })
            : Result.failVoid), Stream.runCollect, Effect.map((chunk) => Array.from(chunk))),
    };
}));
//# sourceMappingURL=EventAction.js.map