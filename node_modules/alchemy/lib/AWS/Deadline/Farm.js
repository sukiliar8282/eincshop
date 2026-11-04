import * as deadline from "@distilled.cloud/aws/deadline";
import * as Effect from "effect/Effect";
import * as EffectStream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, hasAlchemyTags } from "../../Tags.js";
import { asPlain, deadlineArnOf, fetchDeadlineTags, reapDeadlineLogGroups, reapFarmChildren, retryWhileConflict, syncDeadlineTags, } from "./internal.js";
/**
 * An AWS Deadline Cloud farm — the top-level container for render-farm
 * queues, fleets, storage profiles, and budgets.
 *
 * ### Creating Farms
 * **Example:** Basic Farm
 * ```typescript
 * import * as AWS from "alchemy/AWS";
 *
 * const farm = yield* AWS.Deadline.Farm("RenderFarm", {});
 * ```
 *
 * **Example:** Farm with Description and Cost Scaling
 * ```typescript
 * const farm = yield* AWS.Deadline.Farm("RenderFarm", {
 *   displayName: "studio-renders",
 *   description: "Production render farm",
 *   costScaleFactor: 1.5,
 *   tags: { team: "vfx" },
 * });
 * ```
 *
 * @resource
 */
export const Farm = Resource("AWS.Deadline.Farm");
const createFarmName = (id, props) => props.displayName
    ? Effect.succeed(props.displayName)
    : createPhysicalName({ id, maxLength: 100 });
const readFarmById = Effect.fn(function* (farmId, arnOf) {
    const described = yield* deadline
        .getFarm({ farmId })
        .pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.succeed(undefined)));
    if (!described)
        return undefined;
    const farmArn = arnOf(`farm/${described.farmId}`);
    const state = {
        described,
        attrs: {
            farmId: described.farmId,
            farmArn,
            displayName: described.displayName,
            kmsKeyArn: described.kmsKeyArn,
            costScaleFactor: described.costScaleFactor,
            tags: yield* fetchDeadlineTags(farmArn),
        },
    };
    return state;
});
const findFarmByDisplayName = Effect.fn(function* (displayName, arnOf) {
    const summaries = yield* deadline.listFarms.items({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk)));
    const match = summaries.find((summary) => summary.displayName === displayName);
    if (!match)
        return undefined;
    return yield* readFarmById(match.farmId, arnOf);
});
export const FarmProvider = () => Provider.effect(Farm, Effect.gen(function* () {
    return {
        stables: ["farmId", "farmArn"],
        list: () => Effect.gen(function* () {
            const arnOf = yield* deadlineArnOf;
            const summaries = yield* deadline.listFarms.items({}).pipe(EffectStream.runCollect, Effect.map((chunk) => Array.from(chunk)));
            const states = yield* Effect.forEach(summaries, (summary) => readFarmById(summary.farmId, arnOf), { concurrency: 4 });
            return states
                .filter((state) => state !== undefined)
                .map((state) => state.attrs);
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const arnOf = yield* deadlineArnOf;
            const state = output?.farmId
                ? yield* readFarmById(output.farmId, arnOf)
                : yield* findFarmByDisplayName(yield* createFarmName(id, olds ?? {}), arnOf);
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
            // The KMS key is fixed at creation.
            if ((olds.kmsKeyArn ?? undefined) !== (news.kmsKeyArn ?? undefined)) {
                return { action: "replace" };
            }
        }),
        reconcile: Effect.fn(function* ({ id, news, output, session }) {
            if (news === undefined) {
                return yield* Effect.fail(new Error("AWS.Deadline.Farm requires props"));
            }
            const arnOf = yield* deadlineArnOf;
            const displayName = yield* createFarmName(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...internalTags, ...news.tags };
            // Observe — prefer the cached farmId; fall back to a display-name
            // lookup so a create whose state failed to persist is adopted.
            let state = output?.farmId
                ? yield* readFarmById(output.farmId, arnOf)
                : yield* findFarmByDisplayName(displayName, arnOf);
            // Ensure — create if missing.
            if (state === undefined) {
                const created = yield* deadline.createFarm({
                    displayName,
                    description: news.description,
                    kmsKeyArn: news.kmsKeyArn,
                    costScaleFactor: news.costScaleFactor,
                    tags: desiredTags,
                });
                yield* session.note(`Created farm ${displayName} (${created.farmId})`);
                state = yield* readFarmById(created.farmId, arnOf);
                if (state === undefined) {
                    return yield* Effect.fail(new Error(`failed to read created farm ${displayName}`));
                }
            }
            // Sync mutable settings — only when drifted from OBSERVED state.
            const described = state.described;
            const needsUpdate = displayName !== described.displayName ||
                (news.description !== undefined &&
                    news.description !== (asPlain(described.description) ?? "")) ||
                (news.costScaleFactor !== undefined &&
                    news.costScaleFactor !== described.costScaleFactor);
            if (needsUpdate) {
                yield* deadline.updateFarm({
                    farmId: state.attrs.farmId,
                    displayName,
                    description: news.description,
                    costScaleFactor: news.costScaleFactor,
                });
                yield* session.note(`Updated farm ${displayName}`);
            }
            // Sync tags — diff against observed cloud tags.
            yield* syncDeadlineTags(state.attrs.farmArn, desiredTags);
            yield* session.note(state.attrs.farmArn);
            const final = yield* readFarmById(state.attrs.farmId, arnOf);
            if (!final) {
                return yield* Effect.fail(new Error(`failed to read reconciled farm ${displayName}`));
            }
            return final.attrs;
        }),
        delete: Effect.fn(function* ({ output }) {
            // A farm refuses deletion while ANY child resource exists (storage
            // profiles, queues, fleets, budgets, limits, associations) — and
            // unlike async sub-resource drain, those conflicts never resolve
            // by waiting. A normal stack destroy deletes children first, so
            // this reap observes nothing; an orphan sweep (nuke) or a mid-run
            // crash targets a farm whose children were never enumerated, and
            // without the reap deleteFarm conflicts until the retry budget
            // runs out and the farm leaks.
            yield* reapFarmChildren(output.farmId);
            // Child deletion (queues, fleets) finishes asynchronously; the
            // farm rejects deletion with ConflictException until it settles.
            yield* retryWhileConflict(deadline.deleteFarm({ farmId: output.farmId })).pipe(Effect.catchTag("ResourceNotFoundException", () => Effect.void));
            // Deadline auto-creates log groups under /aws/deadline/{farmId}/
            // (queue job/session logs, fleet worker logs) and deleteFarm does
            // NOT remove them. The farm only deletes once every sub-resource
            // is fully gone, so by this point all of its log groups exist if
            // they ever will — sweep the whole prefix.
            yield* reapDeadlineLogGroups(`/aws/deadline/${output.farmId}`);
        }),
    };
}));
//# sourceMappingURL=Farm.js.map