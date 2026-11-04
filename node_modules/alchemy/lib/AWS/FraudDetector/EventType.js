import * as frauddetector from "@distilled.cloud/aws/frauddetector";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { readFraudDetectorTags, syncFraudDetectorTags } from "./internal.js";
/**
 * An Amazon Fraud Detector event type — the schema of an event (its variables,
 * labels, and entity types) that detectors evaluate. Event types are cheap
 * metadata objects.
 *
 * ### Creating an Event Type
 * **Example:** Basic Event Type
 * ```typescript
 * const purchase = yield* FraudDetector.EventType("purchase", {
 *   eventVariables: ["email", "ip"],
 *   entityTypes: ["customer"],
 *   labels: ["fraud", "legit"],
 * });
 * ```
 *
 * @resource
 */
export const EventType = Resource("AWS.FraudDetector.EventType");
export const EventTypeProvider = () => Provider.effect(EventType, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ??
            (yield* createPhysicalName({ id, maxLength: 64, lowercase: true })));
    });
    const get = Effect.fn(function* (name) {
        const response = yield* frauddetector
            .getEventTypes({ name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.eventTypes?.[0];
    });
    const toAttrs = (eventType) => ({
        name: eventType.name,
        arn: eventType.arn,
    });
    return {
        stables: ["name", "arn"],
        diff: Effect.fn(function* ({ id, olds = {}, news }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const eventType = yield* get(name);
            if (eventType === undefined)
                return undefined;
            const attrs = toAttrs(eventType);
            const tags = yield* readFraudDetectorTags(eventType.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, session }) {
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // putEventType is an idempotent upsert — call it to converge the
            // core configuration whether creating or updating.
            yield* frauddetector.putEventType({
                name,
                description: news.description,
                eventVariables: news.eventVariables,
                labels: news.labels,
                entityTypes: news.entityTypes,
                eventIngestion: news.eventIngestion,
                eventOrchestration: news.eventBridgeEnabled !== undefined
                    ? { eventBridgeEnabled: news.eventBridgeEnabled }
                    : undefined,
            });
            const eventType = yield* get(name);
            // Sync tags — diff against OBSERVED cloud tags.
            yield* syncFraudDetectorTags(eventType.arn, desiredTags);
            yield* session.note(name);
            return toAttrs(eventType);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* frauddetector
                .deleteEventType({ name: output.name })
                .pipe(Effect.catchTag("ValidationException", () => Effect.void));
        }),
        list: () => frauddetector.getEventTypes.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.eventTypes ?? []).map(toAttrs)))),
    };
}));
//# sourceMappingURL=EventType.js.map