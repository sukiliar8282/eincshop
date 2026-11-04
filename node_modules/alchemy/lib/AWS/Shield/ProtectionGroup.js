import * as shield from "@distilled.cloud/aws/shield";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { Unowned } from "../../AdoptPolicy.js";
import { isResolved } from "../../Diff.js";
import { createPhysicalName } from "../../PhysicalName.js";
import * as Provider from "../../Provider.js";
import { Resource } from "../../Resource.js";
import { createInternalTags, diffTags, hasAlchemyTags, tagRecord, } from "../../Tags.js";
/**
 * An AWS Shield Advanced Protection Group — a collective of protected
 * resources whose traffic Shield Advanced monitors as a unit, improving
 * detection accuracy and reducing false positives.
 *
 * Requires an active Shield Advanced subscription ($3,000/month with a 1-year
 * commitment); without one every call fails with the typed
 * `SubscriptionNotFound` error.
 *
 * ### Grouping Protections
 * **Example:** Group All Protected Resources
 * ```typescript
 * const group = yield* Shield.ProtectionGroup("AllResources", {
 *   aggregation: "SUM",
 *   pattern: "ALL",
 * });
 * ```
 *
 * **Example:** Group by Resource Type
 * ```typescript
 * const group = yield* Shield.ProtectionGroup("Distributions", {
 *   aggregation: "MAX",
 *   pattern: "BY_RESOURCE_TYPE",
 *   resourceType: "CLOUDFRONT_DISTRIBUTION",
 * });
 * ```
 *
 * **Example:** Arbitrary Member List
 * ```typescript
 * const group = yield* Shield.ProtectionGroup("Fleet", {
 *   aggregation: "MEAN",
 *   pattern: "ARBITRARY",
 *   members: [distribution.distributionArn],
 *   tags: { team: "platform" },
 * });
 * ```
 */
export const ProtectionGroup = Resource("AWS.Shield.ProtectionGroup");
const observeGroup = (protectionGroupId) => shield.describeProtectionGroup({ ProtectionGroupId: protectionGroupId }).pipe(Effect.map((r) => r.ProtectionGroup), Effect.catchTag(["ResourceNotFoundException", "SubscriptionNotFound"], () => Effect.succeed(undefined)));
const toTagRecord = (tags) => tagRecord((tags ?? []).flatMap((t) => t.Key !== undefined && t.Value !== undefined
    ? [{ Key: t.Key, Value: t.Value }]
    : []));
const readGroupTags = (protectionGroupArn) => shield.listTagsForResource({ ResourceARN: protectionGroupArn }).pipe(Effect.map((r) => toTagRecord(r.Tags)), Effect.catch(() => Effect.succeed({})));
const buildAttrs = (group, tags) => ({
    protectionGroupId: group.ProtectionGroupId,
    protectionGroupArn: group.ProtectionGroupArn,
    aggregation: group.Aggregation,
    pattern: group.Pattern,
    resourceType: group.ResourceType,
    members: [...group.Members],
    tags,
});
const sameMembers = (a, b) => a.length === b.length && [...a].sort().join(",") === [...b].sort().join(",");
export const ProtectionGroupProvider = () => Provider.effect(ProtectionGroup, Effect.gen(function* () {
    const toGroupId = (id, props) => props.protectionGroupId
        ? Effect.succeed(props.protectionGroupId)
        : createPhysicalName({ id, maxLength: 36 });
    const syncTags = Effect.fn(function* (protectionGroupArn, desiredTags) {
        const observedTags = yield* readGroupTags(protectionGroupArn);
        const { upsert, removed } = diffTags(observedTags, desiredTags);
        if (upsert.length > 0) {
            yield* shield.tagResource({
                ResourceARN: protectionGroupArn,
                Tags: upsert,
            });
        }
        if (removed.length > 0) {
            yield* shield.untagResource({
                ResourceARN: protectionGroupArn,
                TagKeys: removed,
            });
        }
    });
    return {
        stables: ["protectionGroupId", "protectionGroupArn"],
        diff: Effect.fn(function* ({ id, olds, news }) {
            if (!isResolved(news))
                return;
            if (olds === undefined)
                return;
            if ((yield* toGroupId(id, olds)) !== (yield* toGroupId(id, news))) {
                return { action: "replace" };
            }
        }),
        read: Effect.fn(function* ({ id, olds, output }) {
            const groupId = output?.protectionGroupId ?? (yield* toGroupId(id, olds ?? {}));
            const group = yield* observeGroup(groupId);
            if (!group?.ProtectionGroupArn)
                return undefined;
            const tags = yield* readGroupTags(group.ProtectionGroupArn);
            const attrs = buildAttrs(group, tags);
            return (yield* hasAlchemyTags(id, tags)) ? attrs : Unowned(attrs);
        }),
        reconcile: Effect.fn(function* ({ id, news, session }) {
            const groupId = yield* toGroupId(id, news);
            const internalTags = yield* createInternalTags(id);
            const desiredTags = { ...news.tags, ...internalTags };
            // 1. OBSERVE — cloud state is authoritative.
            let group = yield* observeGroup(groupId);
            // 2. ENSURE — create if missing; tolerate the AlreadyExists race.
            if (!group) {
                yield* shield
                    .createProtectionGroup({
                    ProtectionGroupId: groupId,
                    Aggregation: news.aggregation,
                    Pattern: news.pattern,
                    ResourceType: news.resourceType,
                    Members: news.members,
                    Tags: Object.entries(desiredTags).map(([Key, Value]) => ({
                        Key,
                        Value,
                    })),
                })
                    .pipe(Effect.catchTag("ResourceAlreadyExistsException", () => Effect.void));
                group = yield* observeGroup(groupId);
                if (!group?.ProtectionGroupArn) {
                    return yield* Effect.fail(new Error(`Failed to create or read Shield protection group ${groupId}`));
                }
            }
            else {
                // 3. SYNC settings — diff observed against desired; update only
                //    on an actual delta.
                const changed = group.Aggregation !== news.aggregation ||
                    group.Pattern !== news.pattern ||
                    (group.ResourceType ?? undefined) !==
                        (news.resourceType ?? undefined) ||
                    !sameMembers(group.Members ?? [], news.members ?? []);
                if (changed) {
                    yield* shield.updateProtectionGroup({
                        ProtectionGroupId: groupId,
                        Aggregation: news.aggregation,
                        Pattern: news.pattern,
                        ResourceType: news.resourceType,
                        Members: news.members,
                    });
                    group = yield* observeGroup(groupId);
                }
            }
            // 3b. SYNC tags — diff against OBSERVED cloud tags.
            yield* syncTags(group.ProtectionGroupArn, desiredTags);
            // 4. RETURN fresh attributes.
            yield* session.note(group.ProtectionGroupArn);
            return buildAttrs(group, desiredTags);
        }),
        // Enumerate every protection group in the account. Without a Shield
        // Advanced subscription the account cannot have any groups.
        list: () => Effect.gen(function* () {
            const groups = yield* shield.listProtectionGroups.pages({}).pipe(Stream.runCollect, Effect.map((chunk) => Array.from(chunk).flatMap((page) => page.ProtectionGroups ?? [])), Effect.catchTag("SubscriptionNotFound", () => Effect.succeed([])));
            return yield* Effect.forEach(groups.filter((g) => g.ProtectionGroupArn != null), (group) => Effect.gen(function* () {
                const tags = yield* readGroupTags(group.ProtectionGroupArn);
                return buildAttrs(group, tags);
            }), { concurrency: 5 });
        }),
        delete: Effect.fn(function* ({ output }) {
            yield* shield
                .deleteProtectionGroup({
                ProtectionGroupId: output.protectionGroupId,
            })
                .pipe(Effect.catchTag(["ResourceNotFoundException", "SubscriptionNotFound"], () => Effect.void));
        }),
    };
}));
//# sourceMappingURL=ProtectionGroup.js.map