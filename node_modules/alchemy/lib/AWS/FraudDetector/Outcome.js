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
 * An Amazon Fraud Detector outcome — the result a rule produces when it matches
 * (e.g. `approve`, `review`, `block`). Detector rules reference outcomes; they
 * are cheap metadata objects.
 *
 * ### Creating an Outcome
 * **Example:** Approve and Review Outcomes
 * ```typescript
 * const approve = yield* FraudDetector.Outcome("approve", {
 *   description: "let the transaction through",
 * });
 * const review = yield* FraudDetector.Outcome("review", {});
 * ```
 *
 * @resource
 */
export const Outcome = Resource("AWS.FraudDetector.Outcome");
export const OutcomeProvider = () => Provider.effect(Outcome, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ??
            (yield* createPhysicalName({ id, maxLength: 64, lowercase: true })));
    });
    /** Look an outcome up by name; typed not-found → undefined. */
    const get = Effect.fn(function* (name) {
        const response = yield* frauddetector
            .getOutcomes({ name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.outcomes?.[0];
    });
    const toAttrs = (outcome) => ({
        name: outcome.name,
        arn: outcome.arn,
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
            const outcome = yield* get(name);
            if (outcome === undefined)
                return undefined;
            const attrs = toAttrs(outcome);
            const tags = yield* readFraudDetectorTags(outcome.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news = {}, session }) {
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // putOutcome is an idempotent upsert — call it to converge whether
            // creating or updating the description.
            yield* frauddetector.putOutcome({
                name,
                description: news.description,
            });
            const outcome = yield* get(name);
            // Sync tags — diff against OBSERVED cloud tags.
            yield* syncFraudDetectorTags(outcome.arn, desiredTags);
            yield* session.note(name);
            return toAttrs(outcome);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* frauddetector.deleteOutcome({ name: output.name }).pipe(
            // Deleting an already-removed outcome is a no-op for us; Fraud
            // Detector surfaces a missing outcome as a validation error.
            Effect.catchTag("ValidationException", () => Effect.void));
        }),
        list: () => frauddetector.getOutcomes.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.outcomes ?? []).map(toAttrs)))),
    };
}));
//# sourceMappingURL=Outcome.js.map