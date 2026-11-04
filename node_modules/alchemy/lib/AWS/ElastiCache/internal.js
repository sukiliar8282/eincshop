import * as elasticache from "@distilled.cloud/aws/elasticache";
import * as Effect from "effect/Effect";
export const toTagRecord = (tags) => Object.fromEntries((tags ?? [])
    .filter((tag) => tag.Key !== undefined && tag.Value !== undefined)
    .map((tag) => [tag.Key, tag.Value]));
/** Read tags after a resource has reached an observable state. */
export const readElastiCacheTags = Effect.fn(function* (arn) {
    const response = yield* elasticache
        .listTagsForResource({ ResourceName: arn })
        .pipe(Effect.catch(() => Effect.succeed(undefined)));
    return toTagRecord(response?.TagList);
});
export const sameStringSet = (a, b) => {
    const left = [...new Set(a ?? [])].sort();
    const right = [...new Set(b ?? [])].sort();
    return (left.length === right.length && left.every((value, i) => value === right[i]));
};
export const tagsToWire = (tags) => Object.entries(tags).map(([Key, Value]) => ({ Key, Value }));
//# sourceMappingURL=internal.js.map