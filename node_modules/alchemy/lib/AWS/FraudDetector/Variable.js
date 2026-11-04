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
 * An Amazon Fraud Detector variable — a named input to fraud-detection models
 * and rules, typed and sourced from event data or model scores. Variables are
 * cheap metadata objects.
 *
 * ### Creating a Variable
 * **Example:** Event Variable
 * ```typescript
 * const email = yield* FraudDetector.Variable("email", {
 *   dataType: "STRING",
 *   dataSource: "EVENT",
 *   defaultValue: "unknown",
 *   variableType: "EMAIL_ADDRESS",
 * });
 * ```
 *
 * @resource
 */
export const Variable = Resource("AWS.FraudDetector.Variable");
export const VariableProvider = () => Provider.effect(Variable, Effect.gen(function* () {
    const createName = Effect.fn(function* (id, props) {
        return (props.name ??
            (yield* createPhysicalName({ id, maxLength: 64, lowercase: true })));
    });
    /** Look a variable up by name; typed not-found → undefined. */
    const get = Effect.fn(function* (name) {
        const response = yield* frauddetector
            .getVariables({ name })
            .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
        return response?.variables?.[0];
    });
    const toAttrs = (variable) => ({
        name: variable.name,
        arn: variable.arn,
        dataType: variable.dataType,
        dataSource: variable.dataSource,
    });
    return {
        stables: ["name", "arn"],
        diff: Effect.fn(function* ({ id, olds = {}, news }) {
            if (!isResolved(news))
                return undefined;
            const oldName = yield* createName(id, olds);
            const newName = yield* createName(id, news);
            if (oldName !== newName ||
                (olds.dataType ?? undefined) !== (news.dataType ?? undefined) ||
                (olds.dataSource ?? undefined) !== (news.dataSource ?? undefined)) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const name = output?.name ?? (yield* createName(id, olds ?? {}));
            const variable = yield* get(name);
            if (variable === undefined)
                return undefined;
            const attrs = toAttrs(variable);
            const tags = yield* readFraudDetectorTags(variable.arn);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, session }) {
            const name = yield* createName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // 1. Observe — cloud state is authoritative.
            let variable = yield* get(name);
            // 2. Ensure — create if missing (createVariable rejects duplicates
            //    with ValidationException; tolerate the race by re-reading).
            if (variable === undefined) {
                yield* frauddetector
                    .createVariable({
                    name,
                    dataType: news.dataType,
                    dataSource: news.dataSource,
                    defaultValue: news.defaultValue,
                    description: news.description,
                    variableType: news.variableType,
                    tags: Object.entries(desiredTags).map(([key, value]) => ({
                        key,
                        value,
                    })),
                })
                    .pipe(Effect.catchTag("ValidationException", () => Effect.void));
                variable = yield* get(name);
            }
            else {
                // 3. Sync mutable aspects — update on drift.
                const defaultDrift = (variable.defaultValue ?? undefined) !==
                    (news.defaultValue ?? undefined);
                const descriptionDrift = news.description !== undefined &&
                    (variable.description ?? undefined) !== news.description;
                const typeDrift = news.variableType !== undefined &&
                    (variable.variableType ?? undefined) !== news.variableType;
                if (defaultDrift || descriptionDrift || typeDrift) {
                    yield* frauddetector.updateVariable({
                        name,
                        defaultValue: news.defaultValue,
                        description: news.description,
                        variableType: news.variableType,
                    });
                }
                // 3b. Sync tags — diff against OBSERVED cloud tags.
                yield* syncFraudDetectorTags(variable.arn, desiredTags);
            }
            yield* session.note(name);
            return toAttrs(variable);
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* frauddetector.deleteVariable({ name: output.name }).pipe(
            // Deleting an already-removed variable is a no-op for us; Fraud
            // Detector surfaces a missing variable as a validation error.
            Effect.catchTag("ValidationException", () => Effect.void));
        }),
        list: () => frauddetector.getVariables.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => (page.variables ?? []).map(toAttrs)))),
    };
}));
//# sourceMappingURL=Variable.js.map