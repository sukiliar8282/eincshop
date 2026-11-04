import * as Effect from "effect/Effect";
import { Stack } from "./Stack.js";
import { Stage } from "./Stage.js";
export const normalizeTags = (tags) => Array.isArray(tags)
    ? Object.fromEntries(tags.map((tag) => Array.isArray(tag) ? [tag[0], tag[1]] : [tag.Key, tag.Value]))
    : tags;
export const tagRecord = (tags) => Object.fromEntries(Object.entries(normalizeTags(tags ?? {})).filter((entry) => entry[1] !== undefined));
export const hasTags = (expectedTags, tags) => {
    const actualTags = normalizeTags(tags ?? []);
    return Object.entries(normalizeTags(expectedTags)).every(([key, value]) => actualTags[key] === value);
};
export const createTagsList = (tags) => Object.entries(normalizeTags(tags))
    .filter((t) => t[1] !== undefined)
    .map(([Key, Value]) => ({
    Key,
    Value,
}));
export const createInternalTags = Effect.fn(function* (id) {
    const stack = yield* Stack;
    const stage = yield* Stage;
    return {
        "alchemy::stack": stack.name,
        "alchemy::stage": stage,
        "alchemy::id": id,
    };
});
/**
 * Strips the internal `alchemy::*` ownership tags from a tag/label map, leaving
 * only the user-facing entries. Useful when diffing observed cloud state (which
 * carries the internal branding) against the user's desired tags.
 */
export const stripInternalTags = (tags) => Object.fromEntries(Object.entries(tags ?? {}).filter(([key]) => !key.startsWith("alchemy::")));
/**
 * Creates AWS-compatible tag filters for finding resources by alchemy tags.
 * Use with AWS describe APIs that accept Filter parameters.
 */
export const createAlchemyTagFilters = Effect.fn(function* (id) {
    const stack = yield* Stack;
    const stage = yield* Stage;
    return [
        { Name: "tag:alchemy::stack", Values: [stack.name] },
        { Name: "tag:alchemy::stage", Values: [stage] },
        { Name: "tag:alchemy::id", Values: [id] },
    ];
});
/**
 * Checks if a resource has the expected alchemy tags for this app/stage/id.
 */
export const hasAlchemyTags = Effect.fn(function* (id, tags) {
    const stack = yield* Stack;
    const stage = yield* Stage;
    const expectedTags = {
        "alchemy::stack": stack.name,
        "alchemy::stage": stage,
        "alchemy::id": id,
    };
    return hasTags(expectedTags, tags);
});
export const diffTags = (oldTags, newTags) => {
    const removed = [];
    const updated = [];
    const added = [];
    for (const key in oldTags) {
        if (!(key in newTags)) {
            removed.push(key);
        }
        else if (oldTags[key] !== newTags[key]) {
            updated.push({ Key: key, Value: newTags[key] });
        }
    }
    for (const key in newTags) {
        if (!(key in oldTags)) {
            added.push({ Key: key, Value: newTags[key] });
        }
        else if (oldTags[key] !== newTags[key]) {
            updated.push({ Key: key, Value: newTags[key] });
        }
    }
    return {
        added,
        removed,
        updated,
        upsert: [...added, ...updated].filter((tag, index, self) => self.findIndex((t) => t.Key === tag.Key) === index),
    };
};
//# sourceMappingURL=Tags.js.map