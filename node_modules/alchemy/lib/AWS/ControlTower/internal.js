// Shared scaffolding for AWS Control Tower resources.
// NOT exported from the service index.ts.
import * as controltower from "@distilled.cloud/aws/controltower";
import * as Effect from "effect/Effect";
import { createInternalTags, diffTags } from "../../Tags.js";
/**
 * Reads the observed tags on a Control Tower resource (landing zone,
 * enabled control, or enabled baseline). Tag reads are best-effort — any
 * failure degrades to an empty map so ownership checks and tag syncs never
 * block the main lifecycle flow.
 */
export const observeControlTowerTags = (resourceArn) => controltower.listTagsForResource({ resourceArn }).pipe(Effect.map((r) => {
    const tags = {};
    for (const [key, value] of Object.entries(r.tags ?? {})) {
        if (value !== undefined) {
            tags[key] = value;
        }
    }
    return tags;
}), Effect.catch(() => Effect.succeed({})));
/**
 * Converges the tags on a Control Tower resource to the union of the
 * internal Alchemy ownership tags and the user's desired tags, diffing
 * against OBSERVED cloud tags (never olds/output) so adoption converges.
 */
export const syncControlTowerTags = Effect.fn(function* (resourceArn, id, userTags) {
    const internalTags = yield* createInternalTags(id);
    const observed = yield* observeControlTowerTags(resourceArn);
    const desired = { ...userTags, ...internalTags };
    const { upsert, removed } = diffTags(observed, desired);
    if (upsert.length > 0) {
        yield* controltower.tagResource({
            resourceArn,
            tags: Object.fromEntries(upsert.map((t) => [t.Key, t.Value])),
        });
    }
    if (removed.length > 0) {
        yield* controltower.untagResource({ resourceArn, tagKeys: removed });
    }
});
const sortKeysDeep = (value) => {
    if (Array.isArray(value)) {
        return value.map(sortKeysDeep);
    }
    if (value !== null && typeof value === "object") {
        return Object.fromEntries(Object.entries(value)
            .sort(([l], [r]) => l.localeCompare(r))
            .map(([k, v]) => [k, sortKeysDeep(v)]));
    }
    return value;
};
/**
 * Key-order-insensitive JSON serialization, used to diff manifest and
 * parameter documents that round-trip through the Control Tower API (which
 * may reorder object keys).
 */
export const canonicalJson = (value) => JSON.stringify(sortKeysDeep(value)) ?? "";
/**
 * Canonical comparison form for `{ key, value }` parameter lists: sorted by
 * key, order-insensitive values.
 */
export const canonicalParameters = (parameters) => canonicalJson([...(parameters ?? [])].sort((l, r) => l.key.localeCompare(r.key)));
//# sourceMappingURL=internal.js.map