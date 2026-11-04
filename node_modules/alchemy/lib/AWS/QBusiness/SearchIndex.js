import * as qbusiness from "@distilled.cloud/aws/qbusiness";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, } from "../../Tags.js";
/**
 * An Amazon Q Business index — the document store that data sources sync
 * content into and retrievers query.
 *
 * :::caution
 * An index bills hourly per provisioned capacity unit from the moment it
 * becomes `ACTIVE`. Destroy test indexes promptly.
 * :::
 * ### Creating Indexes
 * **Example:** Starter Index
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const index = yield* AWS.QBusiness.Index("Docs", {
 *   applicationId: app.applicationId,
 * });
 * ```
 *
 * **Example:** Enterprise Index with Extra Capacity
 * ```typescript
 * const index = yield* AWS.QBusiness.Index("Docs", {
 *   applicationId: app.applicationId,
 *   type: "ENTERPRISE",
 *   capacityConfiguration: { units: 2 },
 * });
 * ```
 *
 * @resource
 */
export const Index = Resource("AWS.QBusiness.Index");
const createDisplayName = (id, props) => props.displayName
    ? Effect.succeed(props.displayName)
    : createPhysicalName({ id, maxLength: 100 });
const fetchTags = Effect.fn(function* (arn) {
    const response = yield* qbusiness
        .listTagsForResource({ resourceARN: arn })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    return Object.fromEntries((response?.tags ?? []).map((tag) => [tag.key, tag.value]));
});
const readIndexById = Effect.fn(function* (applicationId, indexId) {
    const described = yield* qbusiness
        .getIndex({ applicationId, indexId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!described || described.status === "DELETING")
        return undefined;
    const arn = described.indexArn;
    if (arn === undefined)
        return undefined;
    const state = {
        described,
        attrs: {
            indexId: described.indexId ?? indexId,
            applicationId: described.applicationId ?? applicationId,
            indexArn: arn,
            displayName: described.displayName ?? "",
            type: described.type,
            status: described.status,
            tags: yield* fetchTags(arn),
        },
    };
    return state;
});
const findIndexByName = Effect.fn(function* (applicationId, displayName) {
    const summaries = yield* qbusiness.listIndices.pages({ applicationId }).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.indices ?? [])), 
    // The parent application may itself be gone.
    Effect.catchTag("ResourceNotFoundException", () => Effect.succeed([])));
    const match = summaries.find((summary) => summary.displayName === displayName && summary.status !== "DELETING");
    if (!match?.indexId)
        return undefined;
    return yield* readIndexById(applicationId, match.indexId);
});
/**
 * An index still transitioning toward the awaited status — retried by
 * {@link waitForIndexStatus}'s bounded schedule.
 */
class IndexNotReady extends Data.TaggedError("QBusinessIndexNotReady") {
}
/**
 * An index whose asynchronous provisioning converged to the terminal
 * `FAILED` status.
 */
export class IndexProvisioningFailed extends Data.TaggedError("QBusinessIndexProvisioningFailed") {
}
// Explicitly-typed retry wrapper — an inline `Effect.retry` in provider
// lifecycle code leaks `Retry.Return`'s conditional type into declaration
// emit and widens the provider layer to `unknown` for every consumer of
// `AWS.providers()`.
const retryWhileNotReady = (self) => Effect.retry(self, {
    while: (e) => e._tag === "QBusinessIndexNotReady",
    // Index provisioning takes several minutes; poll every 15s up to ~30 min.
    schedule: Schedule.max([
        Schedule.spaced("15 seconds"),
        Schedule.recurs(120),
    ]),
});
const waitForIndexStatus = (applicationId, indexId, target) => retryWhileNotReady(Effect.gen(function* () {
    const described = yield* qbusiness
        .getIndex({ applicationId, indexId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (target === "DELETED") {
        if (described === undefined)
            return;
        return yield* Effect.fail(new IndexNotReady({ indexId, status: described.status }));
    }
    if (described?.status === "ACTIVE")
        return;
    if (described?.status === "FAILED") {
        return yield* Effect.fail(new IndexProvisioningFailed({
            indexId,
            message: described.error?.errorMessage,
        }));
    }
    return yield* Effect.fail(new IndexNotReady({ indexId, status: described?.status }));
}));
export const IndexProvider = () => Provider.effect(Index, Effect.gen(function* () {
    return {
        stables: ["indexId", "applicationId", "indexArn"],
        // Keyed by a parent application; cannot be enumerated account-wide
        // without iterating every application — treated as a sub-resource per
        // the factory list() convention.
        list: () => Effect.succeed([]),
        read: Effect.fn(function* ({ id, olds, output }) {
            const applicationId = output?.applicationId ?? olds?.applicationId;
            if (applicationId === undefined)
                return undefined;
            const state = output?.indexId
                ? yield* readIndexById(applicationId, output.indexId)
                : yield* findIndexByName(applicationId, yield* createDisplayName(id, olds ?? {}));
            if (!state)
                return undefined;
            return (yield* hasAlchemyTags(id, state.attrs.tags))
                ? state.attrs
                : Unowned(state.attrs);
        }),
        diff: Effect.fn(function* ({ news, olds }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            // The parent application and index tier are fixed at creation.
            if (olds.applicationId !== news.applicationId ||
                (olds.type ?? "STARTER") !== (news.type ?? "STARTER")) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (!news) {
                return yield* Effect.fail(new Error("QBusiness Index requires props"));
            }
            const applicationId = news.applicationId;
            const displayName = yield* createDisplayName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the cached id; fall back to a name lookup so a
            // create whose state failed to persist is adopted, not duplicated.
            let state = output?.indexId
                ? yield* readIndexById(applicationId, output.indexId)
                : yield* findIndexByName(applicationId, displayName);
            // Ensure — create if missing, then wait for ACTIVE.
            if (state === undefined) {
                const created = yield* qbusiness.createIndex({
                    applicationId,
                    displayName,
                    description: news.description,
                    type: news.type,
                    capacityConfiguration: news.capacityConfiguration,
                    tags: Object.entries(desiredTags).map(([key, value]) => ({
                        key,
                        value,
                    })),
                });
                if (!created.indexId) {
                    return yield* Effect.fail(new Error(`CreateIndex for '${displayName}' returned no indexId`));
                }
                yield* session.note(`Creating index ${displayName} (${created.indexId})...`);
                yield* waitForIndexStatus(applicationId, created.indexId, "ACTIVE");
                state = yield* readIndexById(applicationId, created.indexId);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created index ${displayName}`));
                }
            }
            // Sync mutable settings via UpdateIndex — only when drifted.
            const described = state.described;
            const desiredUnits = news.capacityConfiguration?.units;
            const needsUpdate = displayName !== described.displayName ||
                (news.description ?? "") !== (described.description ?? "") ||
                (desiredUnits !== undefined &&
                    desiredUnits !== described.capacityConfiguration?.units) ||
                news.documentAttributeConfigurations !== undefined;
            if (needsUpdate) {
                yield* qbusiness.updateIndex({
                    applicationId,
                    indexId: state.attrs.indexId,
                    displayName,
                    description: news.description,
                    capacityConfiguration: news.capacityConfiguration,
                    documentAttributeConfigurations: news.documentAttributeConfigurations,
                });
                yield* waitForIndexStatus(applicationId, state.attrs.indexId, "ACTIVE");
                yield* session.note(`Updated index ${displayName}`);
            }
            // Sync tags — diff against observed cloud tags.
            const { removed, upsert } = diffTags(state.attrs.tags, desiredTags);
            if (removed.length > 0) {
                yield* qbusiness.untagResource({
                    resourceARN: state.attrs.indexArn,
                    tagKeys: removed,
                });
            }
            if (upsert.length > 0) {
                yield* qbusiness.tagResource({
                    resourceARN: state.attrs.indexArn,
                    tags: upsert.map(({ Key, Value }) => ({
                        key: Key,
                        value: Value,
                    })),
                });
            }
            yield* session.note(state.attrs.indexArn);
            const final = yield* readIndexById(applicationId, state.attrs.indexId);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled index ${displayName}`));
            }
            return final.attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* qbusiness
                .deleteIndex({
                applicationId: output.applicationId,
                indexId: output.indexId,
            })
                .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            yield* waitForIndexStatus(output.applicationId, output.indexId, "DELETED");
        }),
    };
}));
//# sourceMappingURL=SearchIndex.js.map