import * as personalize from "@distilled.cloud/aws/personalize";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readPersonalizeTags, syncPersonalizeTags } from "./internal.js";
/**
 * An Amazon Personalize event tracker — the ingestion endpoint for streaming
 * interaction events into a dataset group's Interactions dataset. Creating a
 * tracker yields a `trackingId` that the {@link PutEvents} data-plane binding
 * uses to record events in real time.
 *
 * ### Creating an Event Tracker
 * **Example:** Track Events for a Dataset Group
 * ```typescript
 * const tracker = yield* Personalize.EventTracker("Tracker", {
 *   datasetGroupArn: group.datasetGroupArn,
 * });
 * ```
 *
 * ### Streaming Events
 * **Example:** Record Click Events from a Lambda
 * ```typescript
 * // init
 * const putEvents = yield* Personalize.PutEvents(tracker);
 *
 * // runtime
 * yield* putEvents({
 *   sessionId: "session-1",
 *   userId: "user-1",
 *   eventList: [{ eventType: "click", itemId: "item-42", sentAt: new Date() }],
 * });
 * ```
 *
 * @resource
 */
export const EventTracker = Resource("AWS.Personalize.EventTracker");
export const EventTrackerProvider = () => Provider.effect(EventTracker, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return props.name ?? (yield* createPhysicalName({ id, maxLength: 63 }));
    });
    const describe = Effect.fn(function* (eventTrackerArn) {
        const response = yield* personalize
            .describeEventTracker({ eventTrackerArn })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.eventTracker;
    });
    /** Poll until the tracker reaches ACTIVE; fail fast on CREATE FAILED. */
    const waitActive = Effect.fn(function* (eventTrackerArn) {
        const tracker = yield* describe(eventTrackerArn).pipe(Effect.repeat({
            schedule: Schedule.max([
                Schedule.fixed("2 seconds"),
                Schedule.recurs(40),
            ]),
            until: (t) => t?.status === "ACTIVE" || (t?.status ?? "").includes("FAILED"),
        }));
        if (tracker?.status !== "ACTIVE") {
            return yield* Effect.fail(new Error(`Personalize event tracker ${eventTrackerArn} did not become ACTIVE (status: ${tracker?.status})`));
        }
        return tracker;
    });
    /** Find an existing tracker's ARN by name within its dataset group. */
    const findArnByName = Effect.fn(function* (name, datasetGroupArn) {
        const pages = yield* personalize.listEventTrackers
            .pages({ datasetGroupArn })
            .pipe(Stream.runCollect);
        return Array.from(pages)
            .flatMap((page) => page.eventTrackers ?? [])
            .find((summary) => summary.name === name)?.eventTrackerArn;
    });
    const toAttrs = (tracker) => ({
        eventTrackerArn: tracker.eventTrackerArn,
        trackingId: tracker.trackingId,
        name: tracker.name,
        status: tracker.status,
        datasetGroupArn: tracker.datasetGroupArn,
    });
    return {
        stables: ["eventTrackerArn", "trackingId", "name"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName ||
                (olds.datasetGroupArn ?? undefined) !==
                    (news.datasetGroupArn ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, output }) {
            if (!output?.eventTrackerArn)
                return undefined;
            const tracker = yield* describe(output.eventTrackerArn);
            if (tracker === undefined)
                return undefined;
            const attrs = toAttrs(tracker);
            const tags = yield* readPersonalizeTags(tracker.eventTrackerArn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative; output is an ARN cache.
            let tracker = output?.eventTrackerArn !== undefined
                ? yield* describe(output.eventTrackerArn)
                : undefined;
            // 2. Ensure — create if missing, then wait for ACTIVE. A crashed
            //    prior run may have left a same-named tracker behind with no
            //    persisted state — adopt it by name and converge.
            if (tracker === undefined) {
                const arn = yield* personalize
                    .createEventTracker({
                    name,
                    datasetGroupArn: news.datasetGroupArn,
                    tags: Object.entries(desiredTags).map(([tagKey, tagValue]) => ({
                        tagKey,
                        tagValue,
                    })),
                })
                    .pipe(Effect.map((created) => created.eventTrackerArn), Effect.catchTag("ResourceAlreadyExistsException", (error) => findArnByName(name, news.datasetGroupArn).pipe(Effect.flatMap((existing) => existing === undefined
                    ? Effect.fail(error)
                    : Effect.succeed(existing)))));
                tracker = yield* waitActive(arn);
            }
            // 3. Sync tags — diff against OBSERVED cloud tags (no-op after a
            //    fresh create; converges an adopted leftover).
            yield* syncPersonalizeTags(tracker.eventTrackerArn, desiredTags);
            yield* session.note(tracker.eventTrackerArn);
            return toAttrs(tracker);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* personalize
                .deleteEventTracker({ eventTrackerArn: output.eventTrackerArn })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void), Effect.retry({
                while: (e) => e._tag === "ResourceInUseException",
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(20),
                ]),
            }));
            // Deletion is asynchronous — wait until the tracker is actually gone
            // so its dataset group can delete without ResourceInUse churn.
            const remaining = yield* describe(output.eventTrackerArn).pipe(Effect.repeat({
                schedule: Schedule.max([
                    Schedule.fixed("3 seconds"),
                    Schedule.recurs(40),
                ]),
                until: (tracker) => tracker === undefined,
            }));
            if (remaining !== undefined) {
                return yield* Effect.fail(new Error(`Personalize event tracker ${output.eventTrackerArn} was not deleted (status: ${remaining.status})`));
            }
        }),
        list: () => personalize.listEventTrackers.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.eventTrackers ?? [])), Effect.flatMap(Effect.forEach((summary) => describe(summary.eventTrackerArn).pipe(Effect.map((t) => (t ? toAttrs(t) : undefined))), { concurrency: 4 })), Effect.map((items) => items.filter((item) => item !== undefined))),
    };
}));
//# sourceMappingURL=EventTracker.js.map