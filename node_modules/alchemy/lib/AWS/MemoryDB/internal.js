import * as memorydb from "@distilled.cloud/aws/memorydb";
import * as Effect from "effect/Effect";
/**
 * Convert MemoryDB's `[{ Key, Value }]` tag list into a plain record,
 * dropping any entry missing a key or value.
 */
export const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => typeof tag.Key === "string" && typeof tag.Value === "string")
    .map((tag) => [tag.Key, tag.Value]));
/**
 * Read the observed tags for a MemoryDB resource by ARN. A resource that has
 * just been created (or is mid-transition) can transiently reject `listTags`;
 * treat any failure as "no observed tags" so tag reconciliation still runs.
 */
export const readMemoryDbTags = Effect.fn(function* (arn) {
    const response = yield* memorydb
        .listTags({ ResourceArn: arn })
        .pipe(Effect.catch(() => Effect.succeed(undefined)));
    return toTagRecord(response?.TagList);
});
/** True when two string sets are equal ignoring order and duplicates. */
export const sameStringSet = (a, b) => {
    const left = [...new Set(a ?? [])].sort();
    const right = [...new Set(b ?? [])].sort();
    return left.length === right.length && left.every((v, i) => v === right[i]);
};
//# sourceMappingURL=internal.js.map